const { Pool } = require("pg");
const crypto = require("crypto");
const roleService = require("./role.service");

// Pool kết nối tới Custom Role DB (init.sql)
const rolePool = new Pool({
  host: process.env.POSTGRES_HOST || "postgres",
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  connectionTimeoutMillis: 10000,
  idleTimeoutMillis: 30000,
  keepAlive: true,
  max: 20,
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
  connectionTimeoutMillis: Number(process.env.SUPERSET_PG_TIMEOUT_MS || 15000),
  idleTimeoutMillis: 30000,
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
  max: 15,
});

supersetPool.on("error", (error) => {
  console.error("[User Service - Superset DB Pool Error]", error.message);
});

let cachedSupersetUserTable = null;

// Thứ tự cấp bậc Role từ thấp đến cao
const ROLE_RANK = {
  group_member: 1,
  group_admin: 2,
  super_admin: 3,
  admin_ami: 4,
};

function getRoleRank(roleCode) {
  return ROLE_RANK[String(roleCode || "").toLowerCase()] || 1;
}

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
    status: (
      row.active !== undefined
        ? Boolean(row.active)
        : Boolean(row.is_active ?? true)
    )
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
 * - Không bao giờ lấy các user có quyền system (admin_ami / system.manage) vì system không được gán vào Group
 * - Nếu truyền groupId: loại bỏ các user đã thuộc bất kỳ Group cha / ông hoặc con / cháu trên cùng nhánh với groupId
 * - Nếu người gọi có quyền system.manage: lấy tất cả user hợp lệ trong user_global_roles
 * - Nếu không có system.manage: chỉ lấy các user do chính người gọi tạo ra
 */
async function getAssignableUsers(actorUserId, groupId = null) {
  // Role ở global chỉ check xem có phải là system hay không
  const hasSystemManage = await roleService.isGlobalSystemUser(actorUserId);

  // 1. Lấy tất cả các bản ghi trong bảng user_global_roles kèm kiểm tra xem có phải là system không
  const { rows: globalRoleRows } = await rolePool.query(
    `
      SELECT
        ugr.superset_user_id,
        ugr.role_id,
        ugr.assigned_by,
        ugr.assigned_at,
        r.role_code,
        r.role_name,
        EXISTS (
          SELECT 1
          FROM role_permissions rp
          JOIN permissions p ON p.id = rp.permission_id
          WHERE rp.role_id = r.id
            AND p.permission_code = 'system.manage'
        ) AS is_system_role
      FROM user_global_roles ugr
      JOIN roles r ON r.id = ugr.role_id
      ORDER BY ugr.superset_user_id ASC
    `,
  );

  if (globalRoleRows.length === 0) {
    return [];
  }

  // Lấy danh sách các group mà từng user đang tham gia (để kiểm tra nhánh cha - con - cháu)
  const { rows: allMemberRows } = await rolePool.query(
    `
      SELECT gm.superset_user_id, gm.group_id
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      WHERE g.is_active = TRUE
    `,
  );
  const userGroupIdsMap = new Map();
  allMemberRows.forEach((r) => {
    const uid = Number(r.superset_user_id);
    if (!userGroupIdsMap.has(uid)) {
      userGroupIdsMap.set(uid, []);
    }
    userGroupIdsMap.get(uid).push(Number(r.group_id));
  });

  // Nếu có truyền groupId -> tìm chính group đó kèm toàn bộ các group cha/ông (ancestors) và con/cháu (descendants) cùng nhánh
  let sameLineageGroupSet = new Set();
  const targetGId = Number(groupId);
  if (Number.isInteger(targetGId) && targetGId > 0) {
    const { rows: lineageRows } = await rolePool.query(
      `
        WITH RECURSIVE ancestors AS (
          SELECT parent_group_id AS id
          FROM groups
          WHERE id = $1 AND parent_group_id IS NOT NULL
          UNION
          SELECT g.parent_group_id AS id
          FROM groups g
          JOIN ancestors a ON g.id = a.id
          WHERE g.parent_group_id IS NOT NULL
        ),
        descendants AS (
          SELECT id
          FROM groups
          WHERE parent_group_id = $1
          UNION
          SELECT g.id
          FROM groups g
          JOIN descendants d ON g.parent_group_id = d.id
        )
        SELECT $1::bigint AS id
        UNION
        SELECT id FROM ancestors
        UNION
        SELECT id FROM descendants
      `,
      [targetGId],
    );
    sameLineageGroupSet = new Set(lineageRows.map((r) => Number(r.id)));
  }

  const allUserIdsInGlobalTable = Array.from(
    new Set(globalRoleRows.map((r) => Number(r.superset_user_id))),
  );

  // 2. Lấy metadata từ bảng users (ab_user) của Superset DB
  const supersetUserMap = await getSupersetUsersByIds(allUserIdsInGlobalTable);

  // 3. Gom thông tin theo từng superset_user_id trong bảng user_global_roles (chỉ check xem có phải là system không)
  const userRecordMap = new Map();
  globalRoleRows.forEach((row) => {
    const uid = Number(row.superset_user_id);
    if (!userRecordMap.has(uid)) {
      userRecordMap.set(uid, {
        superset_user_id: uid,
        assigned_by: row.assigned_by ? Number(row.assigned_by) : null,
        assigned_at: row.assigned_at,
        has_system_role: false,
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
      rank: getRoleRank(row.role_code),
    });
    if (
      Boolean(row.is_system_role) ||
      String(row.role_code || "").toLowerCase() === "admin_ami"
    ) {
      entry.has_system_role = true;
    }
  });

  // 4. Lọc theo quyền:
  // - Luôn loại bỏ chính user đang thao tác (không thể tự gán chính mình)
  // - Luôn loại bỏ các user có quyền system ở global vì system không được gán vào Group
  // - Nếu có groupId: loại bỏ user đã có chức vụ trong Group hoặc trong nhánh cha/ông - con/cháu của Group đó
  // - Có system ở global -> lấy toàn bộ các user hợp lệ khác
  // - Không phải system ở global -> chỉ lấy các user hợp lệ khác do chính quản trị viên đó tạo ra
  const result = [];
  userRecordMap.forEach((entry, uid) => {
    if (Number(uid) === Number(actorUserId)) {
      return;
    }

    // Không cho phép gán các admin system vào bất kỳ Group nào
    if (entry.has_system_role) {
      return;
    }

    const memberGroupIds = userGroupIdsMap.get(uid) || [];

    // Nếu user đã có chức vụ trong Group hoặc trên cùng nhánh cha - con - cháu với groupId -> loại bỏ
    if (
      sameLineageGroupSet.size > 0 &&
      memberGroupIds.some((gId) => sameLineageGroupSet.has(Number(gId)))
    ) {
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
      const globalRanks = (entry.global_roles || []).map((r) => r.rank || 1);
      const maxGlobalRank =
        globalRanks.length > 0 ? Math.max(...globalRanks) : 1;
      const highestGlobalRole =
        entry.global_roles.find((r) => r.rank === maxGlobalRank) || null;

      result.push({
        ...meta,
        assigned_by: entry.assigned_by || meta.created_by_fk || null,
        created_by_fk: meta.created_by_fk || entry.assigned_by || null,
        assigned_at: entry.assigned_at,
        member_group_ids: memberGroupIds,
        global_roles: entry.global_roles,
        max_global_role_rank: maxGlobalRank,
        highest_global_role_code:
          highestGlobalRole?.role_code || "group_member",
        highest_global_role_name: highestGlobalRole?.role_name || "Thành viên",
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
  const [supersetUserMap, globalAssignedRes] = await Promise.all([
    getSupersetUsersByIds(userIds),
    userIds.length > 0
      ? rolePool.query(
          `
            SELECT ugr.superset_user_id, ugr.assigned_by, r.role_code, r.role_name
            FROM user_global_roles ugr
            LEFT JOIN roles r ON r.id = ugr.role_id
            WHERE ugr.superset_user_id = ANY($1::bigint[])
          `,
          [userIds],
        )
      : Promise.resolve({ rows: [] }),
  ]);

  const assignedByMap = new Map();
  const globalRoleMap = new Map();
  globalAssignedRes.rows.forEach((r) => {
    const uid = Number(r.superset_user_id);
    if (r.assigned_by && !assignedByMap.has(uid)) {
      assignedByMap.set(uid, Number(r.assigned_by));
    }
    const rank = getRoleRank(r.role_code);
    if (!globalRoleMap.has(uid)) {
      globalRoleMap.set(uid, {
        maxRank: rank,
        roleCode: r.role_code,
        roleName: r.role_name,
      });
    } else {
      const cur = globalRoleMap.get(uid);
      if (rank > cur.maxRank) {
        globalRoleMap.set(uid, {
          maxRank: rank,
          roleCode: r.role_code,
          roleName: r.role_name,
        });
      }
    }
  });

  return memberRows.map((m) => {
    const uid = Number(m.superset_user_id);
    const meta = supersetUserMap.get(uid) || {
      id: uid,
      username: `user_${uid}`,
      full_name: `User #${uid}`,
      email: "",
      status: "Active",
      created_on: m.created_at,
      created_by_fk: null,
    };

    const assignedBy = assignedByMap.get(uid) || null;
    const gRole = globalRoleMap.get(uid) || {
      maxRank: 1,
      roleCode: "group_member",
      roleName: "Thành viên",
    };

    return {
      ...meta,
      group_id: Number(m.group_id),
      role_id: Number(m.role_id),
      role_code: m.role_code,
      role_name: m.role_name,
      joined_at: m.created_at,
      created_by: m.created_by ? Number(m.created_by) : null,
      assigned_by: assignedBy || meta.created_by_fk || null,
      created_by_fk: meta.created_by_fk || assignedBy || null,
      member_dashboard_ids: memberDashMap.get(uid) || [],
      max_global_role_rank: gRole.maxRank,
      highest_global_role_code: gRole.roleCode,
      highest_global_role_name: gRole.roleName,
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
  // Chỉ check ở global xem có phải là system không, còn lại chỉ check role & permission của người gán ở trong chính Group đó
  const groupRoleInfo = await roleService.getUserGroupRoleAndPermissions(
    actorUserId,
    groupId,
  );
  const hasSystemManage = Boolean(groupRoleInfo?.isSystem);
  const groupPermissions = groupRoleInfo?.permissions || [];
  const actorGroupRoles = groupRoleInfo?.roles || [];

  const canAssignAdmin =
    hasSystemManage || groupPermissions.includes("group_admin.assign");
  const canAssignMember =
    hasSystemManage ||
    canAssignAdmin ||
    groupPermissions.includes("member.create") ||
    groupPermissions.includes("member.update") ||
    groupPermissions.includes("member_dashboard.assign");

  if (!canAssignMember) {
    const err = new Error("Bạn không có quyền gán người dùng vào Group này");
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

  // Ở global chỉ check xem targetUserId có phải là system không -> system không được gán vào Group
  const isTargetSystem = await roleService.isGlobalSystemUser(targetUserId);
  if (isTargetSystem) {
    const err = new Error(
      "User có quyền quản trị hệ thống (system) không được phép gán vào Group",
    );
    err.statusCode = 403;
    throw err;
  }

  // Kiểm tra xem user đã là thành viên trong Group này chưa (trường hợp Sửa thành viên)
  const existingMemberCheck = await rolePool.query(
    `
      SELECT id, created_by
      FROM group_members
      WHERE group_id = $1 AND superset_user_id = $2
      LIMIT 1
    `,
    [groupId, targetUserId],
  );
  const existingMember = existingMemberCheck.rows[0] || null;

  if (existingMember) {
    // Trường hợp SỬA thành viên đã có trong Group:
    // Trừ system, mặc dù user đó do mình tạo ra nhưng nếu không phải chính mình gán vào Group này (existingMember.created_by) thì không được sửa
    if (!hasSystemManage) {
      const [ugrRes, supersetMap] = await Promise.all([
        rolePool.query(
          `SELECT assigned_by FROM user_global_roles WHERE superset_user_id = $1`,
          [targetUserId],
        ),
        getSupersetUsersByIds([Number(targetUserId)]),
      ]);
      const meta = supersetMap.get(Number(targetUserId));
      const isCreatedByActor =
        Number(meta?.created_by_fk) === Number(actorUserId) ||
        ugrRes.rows.some((r) => Number(r.assigned_by) === Number(actorUserId));
      const isAssignedToGroupByActor =
        Number(existingMember.created_by) === Number(actorUserId);

      if (!isCreatedByActor || !isAssignedToGroupByActor) {
        const err = new Error(
          "Bạn không thể sửa thành viên không phải do bạn gán vào Group này",
        );
        err.statusCode = 403;
        throw err;
      }
    }
  } else {
    // Trường hợp GÁN MỚI user vào Group: kiểm tra user mục tiêu có nằm trong danh sách assignableUsers của người gán không
    const assignableUsers = await getAssignableUsers(actorUserId, groupId);
    const targetUser = assignableUsers.find(
      (u) => Number(u.id) === Number(targetUserId),
    );

    if (!targetUser) {
      const err = new Error(
        "User không tồn tại, không phải do bạn tạo ra hoặc đã có chức vụ trong nhánh Group này",
      );
      err.statusCode = 403;
      throw err;
    }
  }

  const client = await rolePool.connect();
  try {
    await client.query("BEGIN");

    // Kiểm tra xem user đã có vai trò ở bất kỳ Group cha/ông hoặc con/cháu trên cùng nhánh với groupId chưa
    const lineageConflictRes = await client.query(
      `
        WITH RECURSIVE ancestors AS (
          SELECT parent_group_id AS id
          FROM groups
          WHERE id = $1 AND parent_group_id IS NOT NULL
          UNION
          SELECT g.parent_group_id AS id
          FROM groups g
          JOIN ancestors a ON g.id = a.id
          WHERE g.parent_group_id IS NOT NULL
        ),
        descendants AS (
          SELECT id
          FROM groups
          WHERE parent_group_id = $1
          UNION
          SELECT g.id
          FROM groups g
          JOIN descendants d ON g.parent_group_id = d.id
        ),
        same_lineage_groups AS (
          SELECT id FROM ancestors
          UNION
          SELECT id FROM descendants
        )
        SELECT gm.group_id, g.group_name, r.role_code, r.role_name
        FROM group_members gm
        JOIN same_lineage_groups slg ON slg.id = gm.group_id
        JOIN groups g ON g.id = gm.group_id
        JOIN roles r ON r.id = gm.role_id
        WHERE gm.superset_user_id = $2
          AND g.is_active = TRUE
        LIMIT 1
      `,
      [groupId, targetUserId],
    );

    if (lineageConflictRes.rows[0]) {
      const conflict = lineageConflictRes.rows[0];
      const err = new Error(
        `User này đã có vai trò (${conflict.role_name}) trong Group "${conflict.group_name}" thuộc cùng nhánh cha - con - cháu, không thể gán vào nhiều Group trên cùng một nhánh`,
      );
      err.statusCode = 400;
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
    const desiredRoleRank = getRoleRank(selectedRole.role_code);

    // Không cho phép gán role system vào Group
    if (desiredRoleRank >= 4 || selectedRole.role_code === "admin_ami") {
      const err = new Error("Không thể gán vai trò system vào Group");
      err.statusCode = 400;
      throw err;
    }

    // Role của thành viên trong Group không được cao hơn role global của chính user đó
    const { rows: targetGlobalRows } = await client.query(
      `
        SELECT r.role_code, r.role_name
        FROM user_global_roles ugr
        JOIN roles r ON r.id = ugr.role_id
        WHERE ugr.superset_user_id = $1
      `,
      [targetUserId],
    );

    const targetGlobalRanks = targetGlobalRows.map((r) =>
      getRoleRank(r.role_code),
    );
    const targetMaxGlobalRank =
      targetGlobalRanks.length > 0 ? Math.max(...targetGlobalRanks) : 1;
    const targetHighestRole = targetGlobalRows.find(
      (r) => getRoleRank(r.role_code) === targetMaxGlobalRank,
    );
    const targetRoleName =
      targetHighestRole?.role_name || "Thành viên (group_member)";

    if (desiredRoleRank > targetMaxGlobalRank) {
      const err = new Error(
        `Không thể gán vai trò "${selectedRole.role_name}" trong Group vì người dùng này chỉ có vai trò toàn cục là "${targetRoleName}". Vai trò của thành viên trong Group không được cao hơn vai trò toàn cục.`,
      );
      err.statusCode = 400;
      throw err;
    }

    // Chỉ check theo role & permission của người gán ở trong chính Group đó (nếu không phải system ở global)
    if (!hasSystemManage) {
      const actorGroupRanks = actorGroupRoles.map((r) => getRoleRank(r));
      const actorMaxGroupRank =
        actorGroupRanks.length > 0 ? Math.max(...actorGroupRanks) : 1;

      if (desiredRoleRank > actorMaxGroupRank) {
        const err = new Error(
          `Bạn không thể gán vai trò trong Group (${selectedRole.role_name}) cao hơn vai trò của bạn trong Group này`,
        );
        err.statusCode = 403;
        throw err;
      }
    }

    // Nếu gán quyền quản trị group mà không có quyền group_admin.assign trong Group này (hoặc system ở global) -> chặn
    if (selectedRole.is_admin_role && !canAssignAdmin) {
      const err = new Error(
        "Bạn chỉ có quyền thêm thành viên xem Dashboard trong Group này, không có quyền gán Quản trị Group",
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

    const validMemberDashIds = cleanDashIds.filter((id) =>
      groupDashSet.has(id),
    );

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
 * Xóa thành viên khỏi Group:
 * - Nếu là system: được xóa tất cả thành viên khác trong Group
 * - Nếu không phải system: mặc dù user đó do mình tạo ra nhưng nếu không phải chính mình gán vào Group này thì không thể xóa
 */
async function removeUserFromGroup({ actorUserId, groupId, targetUserId }) {
  if (Number(targetUserId) === Number(actorUserId)) {
    const err = new Error("Bạn không thể tự xóa chính mình");
    err.statusCode = 403;
    throw err;
  }

  const groupRoleInfo = await roleService.getUserGroupRoleAndPermissions(
    actorUserId,
    groupId,
  );
  const hasSystemManage = Boolean(groupRoleInfo?.isSystem);
  const groupPermissions = groupRoleInfo?.permissions || [];

  const canManageGroupMembers =
    hasSystemManage ||
    groupPermissions.includes("system.manage") ||
    groupPermissions.includes("group_admin.assign") ||
    groupPermissions.includes("member.delete") ||
    groupPermissions.includes("member.update") ||
    groupPermissions.includes("member.create");

  if (!canManageGroupMembers) {
    const err = new Error(
      "Bạn không có quyền quản lý thành viên trong Group này",
    );
    err.statusCode = 403;
    throw err;
  }

  const existingMemberRes = await rolePool.query(
    `
      SELECT id, created_by
      FROM group_members
      WHERE group_id = $1 AND superset_user_id = $2
      LIMIT 1
    `,
    [groupId, targetUserId],
  );
  const existingMember = existingMemberRes.rows[0];
  if (!existingMember) {
    const err = new Error("Thành viên không tồn tại trong Group này");
    err.statusCode = 404;
    throw err;
  }

  if (!hasSystemManage) {
    const [ugrRes, supersetMap] = await Promise.all([
      rolePool.query(
        `SELECT assigned_by FROM user_global_roles WHERE superset_user_id = $1`,
        [targetUserId],
      ),
      getSupersetUsersByIds([Number(targetUserId)]),
    ]);
    const meta = supersetMap.get(Number(targetUserId));
    const isCreatedByActor =
      Number(meta?.created_by_fk) === Number(actorUserId) ||
      ugrRes.rows.some((r) => Number(r.assigned_by) === Number(actorUserId));
    const isAssignedToGroupByActor =
      Number(existingMember.created_by) === Number(actorUserId);

    if (!isCreatedByActor || !isAssignedToGroupByActor) {
      const err = new Error(
        "Bạn không thể xóa thành viên không phải do bạn gán vào Group này",
      );
      err.statusCode = 403;
      throw err;
    }
  }

  await rolePool.query(
    `DELETE FROM member_dashboards WHERE group_id = $1 AND superset_user_id = $2`,
    [groupId, targetUserId],
  );
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
          SELECT
            ugr.superset_user_id,
            ugr.assigned_at,
            ugr.require_otp,
            ugr.can_change_password,
            r.role_code,
            r.role_name,
            EXISTS (
              SELECT 1
              FROM role_permissions rp
              JOIN permissions p ON p.id = rp.permission_id
              WHERE rp.role_id = r.id
                AND p.permission_code = 'system.manage'
            ) AS is_system_role
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

  const isSystemUser = globalRes.rows.some(
    (r) =>
      Boolean(r.is_system_role) ||
      String(r.role_code || "").toLowerCase() === "admin_ami",
  );

  const assignedAt = globalRes.rows[0]?.assigned_at || null;

  let userGroups = [];
  if (isSystemUser) {
    // Với tài khoản system: chỉ hiển thị các nhánh Group cha cao nhất (parent_group_id IS NULL)
    const sysRoleRow =
      globalRes.rows.find(
        (r) =>
          Boolean(r.is_system_role) ||
          String(r.role_code || "").toLowerCase() === "admin_ami",
      ) || globalRes.rows[0];
    const allGroupsRes = await rolePool.query(
      `
        SELECT id AS group_id, group_name, created_at
        FROM groups
        WHERE is_active = TRUE
          AND parent_group_id IS NULL
        ORDER BY id ASC
      `,
    );
    userGroups = allGroupsRes.rows.map((g) => ({
      group_id: Number(g.group_id),
      group_name: g.group_name,
      role_code: sysRoleRow?.role_code || "admin_ami",
      role_name: sysRoleRow?.role_name || "Admin AMI",
      joined_at: g.created_at,
    }));
  } else {
    userGroups = groupMemberRes.rows.map((r) => ({
      group_id: Number(r.group_id),
      group_name: r.group_name,
      role_code: r.role_code,
      role_name: r.role_name,
      joined_at: r.created_at,
    }));
  }

  const userDetail = {
    id: uid,
    username: meta.username,
    first_name: meta.first_name || "",
    last_name: meta.last_name || "",
    full_name: meta.full_name,
    email: meta.email,
    active: meta.active,
    status: meta.status,
    created_at: meta.created_on || assignedAt || null,
    require_otp:
      globalRes.rows[0]?.require_otp !== undefined
        ? Boolean(globalRes.rows[0].require_otp)
        : true,
    can_change_password:
      globalRes.rows[0]?.can_change_password !== undefined
        ? Boolean(globalRes.rows[0].can_change_password)
        : true,
    global_roles: globalRoles,
    groups: userGroups,
    can_view_all_dashboards: dashAccess.canViewAll,
    dashboard_ids: dashAccess.dashboardIds,
  };

  return {
    user: userDetail,
  };
}

// -------------------------------------------------------------
// Werkzeug scrypt hashing & verification cho Superset ab_user
// -------------------------------------------------------------
const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 64;
const SALT_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateSalt(length = 16) {
  const bytes = crypto.randomBytes(length);
  let salt = "";
  for (let i = 0; i < length; i += 1) {
    salt += SALT_CHARS[bytes[i] % SALT_CHARS.length];
  }
  return salt;
}

function hashPassword(password) {
  const salt = generateSalt(16);
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password,
      salt,
      SCRYPT_KEYLEN,
      {
        N: SCRYPT_N,
        r: SCRYPT_R,
        p: SCRYPT_P,
        maxmem: 132 * SCRYPT_N * SCRYPT_R * SCRYPT_P,
      },
      (err, derivedKey) => {
        if (err) return reject(err);
        return resolve(
          `scrypt:${SCRYPT_N}:${SCRYPT_R}:${SCRYPT_P}$${salt}$${derivedKey.toString("hex")}`,
        );
      },
    );
  });
}

async function verifyPassword(password, storedHash) {
  if (!storedHash || typeof storedHash !== "string") return false;
  const parts = storedHash.split("$");
  if (parts.length < 3) return false;
  const methodSpec = parts[0];
  const salt = parts[1];
  const expectedHash = parts[2];
  const methodParts = methodSpec.split(":");
  const method = methodParts[0].toLowerCase();

  if (method === "scrypt") {
    const N = Number(methodParts[1]) || 32768;
    const r = Number(methodParts[2]) || 8;
    const p = Number(methodParts[3]) || 1;
    const keylen = Buffer.from(expectedHash, "hex").length || 64;

    return new Promise((resolve) => {
      crypto.scrypt(
        password,
        salt,
        keylen,
        {
          N,
          r,
          p,
          maxmem: 132 * N * r * p,
        },
        (err, derivedKey) => {
          if (err) return resolve(false);
          const computedHex = derivedKey.toString("hex");
          try {
            const bufA = Buffer.from(computedHex, "utf8");
            const bufB = Buffer.from(expectedHash, "utf8");
            if (bufA.length !== bufB.length) return resolve(false);
            return resolve(crypto.timingSafeEqual(bufA, bufB));
          } catch {
            return resolve(false);
          }
        },
      );
    });
  } else if (method === "pbkdf2") {
    const digest = methodParts[1] || "sha256";
    const iterations = Number(methodParts[2]) || 260000;
    const keylen = Buffer.from(expectedHash, "hex").length || 32;

    return new Promise((resolve) => {
      crypto.pbkdf2(
        password,
        salt,
        iterations,
        keylen,
        digest,
        (err, derivedKey) => {
          if (err) return resolve(false);
          const computedHex = derivedKey.toString("hex");
          try {
            const bufA = Buffer.from(computedHex, "utf8");
            const bufB = Buffer.from(expectedHash, "utf8");
            if (bufA.length !== bufB.length) return resolve(false);
            return resolve(crypto.timingSafeEqual(bufA, bufB));
          } catch {
            return resolve(false);
          }
        },
      );
    });
  }
  return false;
}

// -------------------------------------------------------------
// Cập nhật thông tin cá nhân (first_name, last_name, email)
// -------------------------------------------------------------
async function updateUserProfile(userId, { first_name, last_name, email }) {
  const uid = Number(userId);
  if (!Number.isSafeInteger(uid) || uid <= 0) {
    const err = new Error("userId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  const cleanFirstName = String(first_name ?? "").trim();
  const cleanLastName = String(last_name ?? "").trim();
  const cleanEmail = String(email ?? "").trim();

  if (!cleanEmail) {
    const err = new Error("Email không được để trống");
    err.statusCode = 400;
    throw err;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    const err = new Error("Định dạng email không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  if (cleanFirstName.length > 100 || cleanLastName.length > 100) {
    const err = new Error("Họ hoặc tên không được vượt quá 100 ký tự");
    err.statusCode = 400;
    throw err;
  }

  const userTable = await resolveSupersetUserTable();

  // Kiểm tra trùng email (ngoại trừ chính user hiện tại)
  const dupCheck = await supersetPool.query(
    `SELECT id, username FROM ${userTable} WHERE LOWER(email) = LOWER($1) AND id <> $2 LIMIT 1`,
    [cleanEmail, uid],
  );

  if (dupCheck.rows.length > 0) {
    const err = new Error(
      `Email "${cleanEmail}" đã được sử dụng bởi tài khoản khác (${dupCheck.rows[0].username}). Vui lòng nhập email khác.`,
    );
    err.statusCode = 409;
    throw err;
  }

  // Cập nhật thông tin trong bảng user của Superset
  const updateRes = await supersetPool.query(
    `
      UPDATE ${userTable}
      SET first_name = $1,
          last_name = $2,
          email = $3,
          changed_on = NOW(),
          changed_by_fk = $4
      WHERE id = $4
      RETURNING id, username, first_name, last_name, email
    `,
    [cleanFirstName, cleanLastName, cleanEmail, uid],
  );

  if (updateRes.rows.length === 0) {
    const err = new Error("Không tìm thấy tài khoản người dùng để cập nhật");
    err.statusCode = 404;
    throw err;
  }

  const updated = updateRes.rows[0];
  const fullName =
    `${updated.first_name || ""} ${updated.last_name || ""}`.trim() ||
    updated.username;

  return {
    id: Number(updated.id),
    username: updated.username,
    first_name: updated.first_name || "",
    last_name: updated.last_name || "",
    full_name: fullName,
    email: updated.email,
  };
}

// -------------------------------------------------------------
// Đổi mật khẩu cá nhân (old_password, new_password, confirm_new_password)
// -------------------------------------------------------------
async function changeUserPassword(
  userId,
  { old_password, new_password, confirm_new_password },
) {
  const uid = Number(userId);
  if (!Number.isSafeInteger(uid) || uid <= 0) {
    const err = new Error("userId không hợp lệ");
    err.statusCode = 400;
    throw err;
  }

  const oldPwd = String(old_password || "");
  const newPwd = String(new_password || "");
  const confirmPwd = String(confirm_new_password || "");

  // Kiểm tra quyền đổi mật khẩu trong bảng user_global_roles
  const permCheck = await rolePool.query(
    `SELECT can_change_password FROM user_global_roles WHERE superset_user_id = $1 LIMIT 1`,
    [uid],
  );
  if (
    permCheck.rows.length > 0 &&
    permCheck.rows[0].can_change_password === false
  ) {
    const err = new Error(
      "Tài khoản của bạn không được phép đổi mật khẩu. Vui lòng liên hệ quản trị viên.",
    );
    err.statusCode = 403;
    throw err;
  }

  if (!oldPwd) {
    const err = new Error("Vui lòng nhập mật khẩu hiện tại");
    err.statusCode = 400;
    throw err;
  }

  if (!newPwd) {
    const err = new Error("Vui lòng nhập mật khẩu mới");
    err.statusCode = 400;
    throw err;
  }

  if (newPwd.length < 8) {
    const err = new Error("Mật khẩu mới phải có tối thiểu 8 ký tự");
    err.statusCode = 400;
    throw err;
  }

  if (newPwd !== confirmPwd) {
    const err = new Error("Mật khẩu mới và xác nhận mật khẩu không khớp");
    err.statusCode = 400;
    throw err;
  }

  if (oldPwd === newPwd) {
    const err = new Error(
      "Mật khẩu mới không được trùng với mật khẩu hiện tại",
    );
    err.statusCode = 400;
    throw err;
  }

  const userTable = await resolveSupersetUserTable();
  const userRes = await supersetPool.query(
    `SELECT id, username, password FROM ${userTable} WHERE id = $1 LIMIT 1`,
    [uid],
  );

  if (userRes.rows.length === 0) {
    const err = new Error("Không tìm thấy tài khoản người dùng");
    err.statusCode = 404;
    throw err;
  }

  const currentHashed = userRes.rows[0].password;
  const isMatch = await verifyPassword(oldPwd, currentHashed);
  if (!isMatch) {
    const err = new Error("Mật khẩu cũ không chính xác");
    err.statusCode = 400;
    throw err;
  }

  const hashedNew = await hashPassword(newPwd);

  await supersetPool.query(
    `
      UPDATE ${userTable}
      SET password = $1,
          changed_on = NOW(),
          changed_by_fk = $2
      WHERE id = $2
    `,
    [hashedNew, uid],
  );

  return {
    success: true,
    message: "Đổi mật khẩu thành công",
  };
}

module.exports = {
  getSupersetUsersByIds,
  getAssignableUsers,
  getGroupMembersDetail,
  assignUserToGroup,
  removeUserFromGroup,
  getUsersInfoList,
  updateUserProfile,
  changeUserPassword,
  rolePool,
  supersetPool,
};
