const { Pool } = require("pg");
const roleService = require("./role.service");

// Pool kết nối tới Custom Role DB (init.sql)
const rolePool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT || 5433),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  connectionTimeoutMillis: 5000,
});

rolePool.on("error", (error) => {
  console.error("[User Service - Role DB Pool Error]", error.message);
});

// Pool kết nối tới Superset Metadata DB (100.100.10.3:15430)
const supersetPool = new Pool({
  host: process.env.SUPERSET_PG_HOST || "100.100.10.3",
  port: Number(process.env.SUPERSET_PG_PORT || 15430),
  user: process.env.SUPERSET_PG_USER || "superset",
  password: process.env.SUPERSET_PG_PASSWORD || "superset",
  database: process.env.SUPERSET_PG_DB || "superset",
  connectionTimeoutMillis: 5000,
});

supersetPool.on("error", (error) => {
  console.error("[User Service - Superset DB Pool Error]", error.message);
});

let cachedSupersetUserTable = null;

// Tự động nhận diện bảng users hoặc ab_user trong Superset DB
async function resolveSupersetUserTable() {
  if (cachedSupersetUserTable) return cachedSupersetUserTable;

  const { rows } = await supersetPool.query(`
    SELECT
      to_regclass('public.users') IS NOT NULL AS has_users,
      to_regclass('public.ab_user') IS NOT NULL AS has_ab_user
  `);

  if (rows[0]?.has_users) {
    cachedSupersetUserTable = "public.users";
  } else if (rows[0]?.has_ab_user) {
    cachedSupersetUserTable = "public.ab_user";
  } else {
    cachedSupersetUserTable = "public.ab_user";
  }

  return cachedSupersetUserTable;
}

function normalizeSupersetUser(row) {
  const id = Number(row.id);
  const firstName = (row.first_name || "").trim();
  const lastName = (row.last_name || "").trim();
  const fullName = `${firstName} ${lastName}`.trim();

  return {
    id,
    username: row.username || row.user_name || `user_${id}`,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName || row.username || row.user_name || `User #${id}`,
    email: row.email || "",
    active:
      row.active !== undefined
        ? Boolean(row.active)
        : row.is_active !== undefined
          ? Boolean(row.is_active)
          : true,
    status:
      (row.active !== undefined ? Boolean(row.active) : Boolean(row.is_active ?? true))
        ? "Active"
        : "Inactive",
    created_on: row.created_on || row.created_at || null,
    changed_on: row.changed_on || row.updated_at || null,
    last_login: row.last_login || null,
    login_count: Number(row.login_count || 0),
    created_by_fk: row.created_by_fk
      ? Number(row.created_by_fk)
      : row.created_by
        ? Number(row.created_by)
        : null,
  };
}

// Lấy thông tin metadata của danh sách userIds từ Superset DB
async function getSupersetUsersByIds(userIds = []) {
  const cleanIds = Array.from(
    new Set(
      (Array.isArray(userIds) ? userIds : [])
        .map((id) => Number(id))
        .filter((id) => Number.isInteger(id) && id > 0),
    ),
  );

  if (cleanIds.length === 0) {
    return new Map();
  }

  try {
    const tableName = await resolveSupersetUserTable();
    const { rows } = await supersetPool.query(
      `SELECT * FROM ${tableName} WHERE id = ANY($1::bigint[]) ORDER BY id ASC`,
      [cleanIds],
    );

    const map = new Map();
    rows.forEach((row) => {
      const normalized = normalizeSupersetUser(row);
      map.set(normalized.id, normalized);
    });
    return map;
  } catch (error) {
    console.error("[Superset DB Query Error]", error.message);
    return new Map();
  }
}

/**
 * Lấy danh sách users có id trong bảng user_global_roles (init.sql:L124)
 * - Nếu người gọi có quyền system.manage: lấy tất cả user trong user_global_roles
 * - Nếu không có system.manage: chỉ lấy các user do chính người gọi tạo ra
 *   (assigned_by = actorUserId trong user_global_roles hoặc created_by_fk = actorUserId trong Superset DB)
 */
async function getAssignableUsers(actorUserId) {
  const roleInfo = await roleService.getUserRoles(actorUserId);
  const permissions = roleInfo?.permissions || [];
  const hasSystemManage = permissions.includes("system.manage");

  // 1. Lấy tất cả các bản ghi trong bảng user_global_roles (init.sql:L124)
  const { rows: globalRoleRows } = await rolePool.query(
    `
      SELECT
        ugr.superset_user_id,
        ugr.role_id,
        ugr.assigned_by,
        ugr.assigned_at,
        r.role_code,
        r.role_name
      FROM user_global_roles ugr
      JOIN roles r ON r.id = ugr.role_id
      ORDER BY ugr.superset_user_id ASC
    `,
  );

  if (globalRoleRows.length === 0) {
    return [];
  }

  const allUserIdsInGlobalTable = Array.from(
    new Set(globalRoleRows.map((r) => Number(r.superset_user_id))),
  );

  // 2. Lấy metadata từ bảng users (ab_user) của Superset DB
  const supersetUserMap = await getSupersetUsersByIds(allUserIdsInGlobalTable);

  // 3. Gom thông tin theo từng superset_user_id trong bảng user_global_roles
  const userRecordMap = new Map();
  globalRoleRows.forEach((row) => {
    const uid = Number(row.superset_user_id);
    if (!userRecordMap.has(uid)) {
      userRecordMap.set(uid, {
        superset_user_id: uid,
        assigned_by: row.assigned_by ? Number(row.assigned_by) : null,
        assigned_at: row.assigned_at,
        global_roles: [],
      });
    }
    const entry = userRecordMap.get(uid);
    if (!entry.assigned_by && row.assigned_by) {
      entry.assigned_by = Number(row.assigned_by);
    }
    entry.global_roles.push({
      role_id: Number(row.role_id),
      role_code: row.role_code,
      role_name: row.role_name,
    });
  });

  // 4. Lọc theo quyền:
  // - Luôn loại bỏ chính user đang thao tác (không thể tự gán chính mình vào group / làm quản trị)
  // - Có system.manage -> lấy toàn bộ các user khác trong user_global_roles
  // - Không có system.manage -> chỉ lấy các user khác do chính quản trị viên đó tạo ra
  const result = [];
  userRecordMap.forEach((entry, uid) => {
    if (Number(uid) === Number(actorUserId)) {
      return;
    }

    const meta = supersetUserMap.get(uid) || {
      id: uid,
      username: `user_${uid}`,
      first_name: "",
      last_name: "",
      full_name: `User #${uid}`,
      email: "",
      active: true,
      status: "Active",
      created_on: entry.assigned_at,
      created_by_fk: entry.assigned_by,
    };

    const isCreatedByActor =
      Number(entry.assigned_by) === Number(actorUserId) ||
      Number(meta.created_by_fk) === Number(actorUserId);

    if (hasSystemManage || isCreatedByActor) {
      result.push({
        ...meta,
        assigned_by: entry.assigned_by || meta.created_by_fk || null,
        assigned_at: entry.assigned_at,
        global_roles: entry.global_roles,
      });
    }
  });

  return result;
}

/**
 * Lấy danh sách thành viên trong 1 Group cụ thể kèm các Dashboard được gán cho từng thành viên
 */
async function getGroupMembersDetail(actorUserId, groupId) {
  const { rows: memberRows } = await rolePool.query(
    `
      SELECT
        gm.id,
        gm.group_id,
        gm.superset_user_id,
        gm.role_id,
        gm.created_by,
        gm.created_at,
        r.role_code,
        r.role_name
      FROM group_members gm
      JOIN roles r ON r.id = gm.role_id
      WHERE gm.group_id = $1
      ORDER BY gm.id ASC
    `,
    [groupId],
  );

  const { rows: memberDashRows } = await rolePool.query(
    `
      SELECT superset_user_id, dashboard_id
      FROM member_dashboards
      WHERE group_id = $1
      ORDER BY dashboard_id ASC
    `,
    [groupId],
  );

  const memberDashMap = new Map();
  memberDashRows.forEach((r) => {
    const uid = Number(r.superset_user_id);
    if (!memberDashMap.has(uid)) {
      memberDashMap.set(uid, []);
    }
    memberDashMap.get(uid).push(Number(r.dashboard_id));
  });

  const userIds = memberRows.map((m) => Number(m.superset_user_id));
  const supersetUserMap = await getSupersetUsersByIds(userIds);

  return memberRows.map((m) => {
    const uid = Number(m.superset_user_id);
    const meta = supersetUserMap.get(uid) || {
      id: uid,
      username: `user_${uid}`,
      full_name: `User #${uid}`,
      email: "",
      status: "Active",
      created_on: m.created_at,
    };

    return {
      ...meta,
      group_id: Number(m.group_id),
      role_id: Number(m.role_id),
      role_code: m.role_code,
      role_name: m.role_name,
      joined_at: m.created_at,
      created_by: m.created_by ? Number(m.created_by) : null,
      member_dashboard_ids: memberDashMap.get(uid) || [],
    };
  });
}

/**
 * Gán user (từ bảng user_global_roles) làm Quản trị (group_admin / super_admin) hoặc Thành viên (group_member) cho Group
 * Ràng buộc:
 * - User phải tồn tại trong user_global_roles
 * - Nếu người gán không có quyền system.manage thì chỉ được thao tác với user do chính mình tạo ra
 * - Dashboard cấp cho thành viên trong member_dashboards chỉ được nằm trong group_dashboards của Group đó
 */
async function assignUserToGroup({
  actorUserId,
  groupId,
  targetUserId,
  roleCode,
  dashboardIds = [],
}) {
  const roleInfo = await roleService.getUserRoles(actorUserId);
  const permissions = roleInfo?.permissions || [];

  const hasSystemManage = permissions.includes("system.manage");
  const canAssignAdmin =
    hasSystemManage || permissions.includes("group_admin.assign");
  const canAssignMember =
    hasSystemManage ||
    canAssignAdmin ||
    permissions.includes("member.create") ||
    permissions.includes("member.update") ||
    permissions.includes("member_dashboard.assign");

  if (!canAssignMember) {
    const err = new Error("Bạn không có quyền gán người dùng vào Group");
    err.statusCode = 403;
    throw err;
  }

  // Không cho phép tự gán chính mình vào Group hoặc làm quản trị
  if (Number(targetUserId) === Number(actorUserId)) {
    const err = new Error(
      "Bạn không thể tự gán chính mình vào Group hoặc làm quản trị",
    );
    err.statusCode = 403;
    throw err;
  }

  // Kiểm tra user mục tiêu có nằm trong danh sách assignableUsers của người gán không
  const assignableUsers = await getAssignableUsers(actorUserId);
  const targetUser = assignableUsers.find(
    (u) => Number(u.id) === Number(targetUserId),
  );

  if (!targetUser) {
    const err = new Error(
      "User không tồn tại trong bảng phân quyền hoặc không phải do bạn tạo ra",
    );
    err.statusCode = 403;
    throw err;
  }

  const client = await rolePool.connect();
  try {
    await client.query("BEGIN");

    // Kiểm tra xem user đã được gán trong Group này chưa
    const existingMemberRes = await client.query(
      `
        SELECT id
        FROM group_members
        WHERE group_id = $1 AND superset_user_id = $2
        LIMIT 1
      `,
      [groupId, targetUserId],
    );

    // Các user admin không có quyền system.manage chỉ được gán mới user do nó tạo ra, không thể sửa user trong hệ thống
    if (existingMemberRes.rows[0] && !hasSystemManage) {
      const err = new Error(
        "Bạn chỉ được phép gán user do mình tạo ra vào Group, không có quyền sửa user trong hệ thống",
      );
      err.statusCode = 403;
      throw err;
    }

    // Tìm role theo roleCode (hoặc mặc định group_member)
    const desiredRoleCode = roleCode || "group_member";
    const { rows: roleRows } = await client.query(
      `
        SELECT r.id, r.role_code, r.role_name,
          BOOL_OR(p.permission_code IN ('member.create', 'member_dashboard.assign', 'group_dashboard.assign')) AS is_admin_role
        FROM roles r
        LEFT JOIN role_permissions rp ON rp.role_id = r.id
        LEFT JOIN permissions p ON p.id = rp.permission_id
        WHERE r.role_code = $1
        GROUP BY r.id, r.role_code, r.role_name
        LIMIT 1
      `,
      [desiredRoleCode],
    );

    if (!roleRows[0]) {
      const err = new Error("Vai trò (Role) không hợp lệ");
      err.statusCode = 400;
      throw err;
    }

    const selectedRole = roleRows[0];

    // Nếu gán quyền quản trị group mà không có quyền group_admin.assign / system.manage -> chặn
    if (selectedRole.is_admin_role && !canAssignAdmin) {
      const err = new Error(
        "Bạn chỉ có quyền thêm thành viên xem Dashboard, không có quyền gán Quản trị Group",
      );
      err.statusCode = 403;
      throw err;
    }

    // Thêm hoặc cập nhật role của user trong group_members
    await client.query(
      `
        INSERT INTO group_members (group_id, superset_user_id, role_id, created_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (group_id, superset_user_id)
        DO UPDATE SET role_id = EXCLUDED.role_id
      `,
      [groupId, targetUserId, selectedRole.id, actorUserId],
    );

    // Nếu có truyền dashboardIds cho thành viên -> kiểm tra phải thuộc group_dashboards của Group đó
    const cleanDashIds = Array.from(
      new Set(
        (Array.isArray(dashboardIds) ? dashboardIds : [])
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    );

    const { rows: groupDashRows } = await client.query(
      `SELECT dashboard_id FROM group_dashboards WHERE group_id = $1`,
      [groupId],
    );
    const groupDashSet = new Set(
      groupDashRows.map((r) => Number(r.dashboard_id)),
    );

    const validMemberDashIds = cleanDashIds.filter((id) => groupDashSet.has(id));

    await client.query(
      `DELETE FROM member_dashboards WHERE group_id = $1 AND superset_user_id = $2`,
      [groupId, targetUserId],
    );

    for (const dashId of validMemberDashIds) {
      await client.query(
        `
          INSERT INTO member_dashboards (group_id, superset_user_id, dashboard_id, assigned_by)
          VALUES ($1, $2, $3, $4)
          ON CONFLICT (group_id, superset_user_id, dashboard_id) DO NOTHING
        `,
        [groupId, targetUserId, dashId, actorUserId],
      );
    }

    await client.query("COMMIT");
    return {
      groupId: Number(groupId),
      userId: Number(targetUserId),
      roleCode: selectedRole.role_code,
      dashboardIds: validMemberDashIds,
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Xóa thành viên khỏi Group (Chỉ dành cho admin có quyền system.manage; admin không có quyền system không được xóa user)
 */
async function removeUserFromGroup({ actorUserId, groupId, targetUserId }) {
  const roleInfo = await roleService.getUserRoles(actorUserId);
  const permissions = roleInfo?.permissions || [];

  const hasSystemManage = permissions.includes("system.manage");

  if (!hasSystemManage) {
    const err = new Error(
      "Bạn không có quyền xóa user đã tạo trong hệ thống",
    );
    err.statusCode = 403;
    throw err;
  }

  if (Number(targetUserId) === Number(actorUserId)) {
    const err = new Error("Bạn không thể tự xóa chính mình");
    err.statusCode = 403;
    throw err;
  }

  await rolePool.query(
    `DELETE FROM group_members WHERE group_id = $1 AND superset_user_id = $2`,
    [groupId, targetUserId],
  );

  return { groupId: Number(groupId), userId: Number(targetUserId) };
}

/**
 * Lấy thông tin chi tiết của chính User đang đăng nhập cho trang "User Info":
 * - user name, full name, email, status, ngày tạo
 * - group name, vai trò trong group
 * - danh sách các dashboard được xem
 */
async function getUsersInfoList(actorUserId) {
  const uid = Number(actorUserId);

  const [globalRes, groupMemberRes, supersetUserMap, dashAccess] =
    await Promise.all([
      rolePool.query(
        `
          SELECT ugr.superset_user_id, ugr.assigned_at, r.role_code, r.role_name
          FROM user_global_roles ugr
          JOIN roles r ON r.id = ugr.role_id
          WHERE ugr.superset_user_id = $1
          ORDER BY r.id ASC
        `,
        [uid],
      ),
      rolePool.query(
        `
          SELECT
            gm.group_id,
            g.group_name,
            r.role_code,
            r.role_name,
            gm.created_at
          FROM group_members gm
          JOIN groups g ON g.id = gm.group_id
          JOIN roles r ON r.id = gm.role_id
          WHERE gm.superset_user_id = $1
            AND g.is_active = TRUE
          ORDER BY g.id ASC
        `,
        [uid],
      ),
      getSupersetUsersByIds([uid]),
      roleService.getUserAccessibleDashboards(uid),
    ]);

  const meta = supersetUserMap.get(uid) || {
    id: uid,
    username: `user_${uid}`,
    first_name: "",
    last_name: "",
    full_name: `User #${uid}`,
    email: "",
    active: true,
    status: "Active",
    created_on: null,
  };

  const globalRoles = globalRes.rows.map((r) => ({
    role_code: r.role_code,
    role_name: r.role_name,
  }));

  const assignedAt = globalRes.rows[0]?.assigned_at || null;

  const userGroups = groupMemberRes.rows.map((r) => ({
    group_id: Number(r.group_id),
    group_name: r.group_name,
    role_code: r.role_code,
    role_name: r.role_name,
    joined_at: r.created_at,
  }));

  const userDetail = {
    id: uid,
    username: meta.username,
    full_name: meta.full_name,
    email: meta.email,
    active: meta.active,
    status: meta.status,
    created_at: meta.created_on || assignedAt || null,
    global_roles: globalRoles,
    groups: userGroups,
    can_view_all_dashboards: dashAccess.canViewAll,
    dashboard_ids: dashAccess.dashboardIds,
  };

  return {
    user: userDetail,
  };
}

module.exports = {
  getSupersetUsersByIds,
  getAssignableUsers,
  getGroupMembersDetail,
  assignUserToGroup,
  removeUserFromGroup,
  getUsersInfoList,
};

