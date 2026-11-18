const { rolePool, supersetPool } = require("../config/db");
const {
  ROLES,
  HIGH_ADMIN_ROLE_CODES,
  GROUP_MANAGER_ROLE_CODES,
  getRoleRank,
  isSystemRole,
  isAdminRole,
  hasAnyRole,
  createHttpError,
} = require("../config/roles.config");
const { hashPassword, verifyPassword } = require("../utils/password.util");
const roleService = require("./role.service");
const { AUDIT_ACTIONS, logAudit } = require("./audit.service");

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
  const isActive =
    row.active !== undefined
      ? Boolean(row.active)
      : row.is_active !== undefined
        ? Boolean(row.is_active)
        : true;

  return {
    id,
    username: row.username || row.user_name || `user_${id}`,
    first_name: firstName,
    last_name: lastName,
    full_name: fullName || row.username || row.user_name || `User #${id}`,
    email: row.email || "",
    active: isActive,
    status: isActive ? "Active" : "Inactive",
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
        .map(Number)
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
 * Lấy danh sách users có trong bảng user_global_roles để gán vào Group:
 * - Loại bỏ các user có role admin_ami (vì system không được gán vào Group).
 * - Nếu truyền groupId: loại bỏ các user đã thuộc bất kỳ Group cha/ông hoặc con/cháu trên cùng nhánh.
 * - Nếu người gọi là admin_ami: lấy tất cả user hợp lệ.
 * - Nếu không phải admin_ami: chỉ lấy các user do chính người gọi tạo ra.
 */
async function getAssignableUsers(actorUserId, groupId = null) {
  const isSystemActor = await roleService.isGlobalSystemUser(actorUserId);

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

  // Nếu có truyền groupId -> tìm chính group đó kèm toàn bộ các group cha/ông và con/cháu cùng nhánh
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
  const supersetUserMap = await getSupersetUsersByIds(allUserIdsInGlobalTable);

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
    if (isSystemRole(row.role_code)) {
      entry.has_system_role = true;
    }
  });

  const result = [];
  userRecordMap.forEach((entry, uid) => {
    if (Number(uid) === Number(actorUserId)) return;
    if (entry.has_system_role) return;

    const memberGroupIds = userGroupIdsMap.get(uid) || [];
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

    if (isSystemActor || isCreatedByActor) {
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
          highestGlobalRole?.role_code || ROLES.GROUP_MEMBER,
        highest_global_role_name: highestGlobalRole?.role_name || "Thành viên",
      });
    }
  });

  return result;
}

/**
 * Lấy danh sách thành viên trong 1 Group cụ thể kèm các Dashboard được gán cho từng thành viên.
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
    const cur = globalRoleMap.get(uid);
    if (!cur || rank > cur.maxRank) {
      globalRoleMap.set(uid, {
        maxRank: rank,
        roleCode: r.role_code,
        roleName: r.role_name,
      });
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
      roleCode: ROLES.GROUP_MEMBER,
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
 * Kiểm tra quyền sở hữu / gán thành viên trong Group đối với các Admin không phải admin_ami
 */
async function assertActorOwnsGroupMember(actorUserId, targetUserId, existingMember) {
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

  return isCreatedByActor && isAssignedToGroupByActor;
}

/**
 * Gán user làm Quản trị (super_admin / group_admin) hoặc Thành viên (group_member) cho Group dựa theo role_code.
 */
async function assignUserToGroup({
  actorUserId,
  groupId,
  targetUserId,
  roleCode,
  dashboardIds = [],
}) {
  const groupRoleInfo = await roleService.getUserGroupRoleAndPermissions(
    actorUserId,
    groupId,
  );
  const isSystemActor = Boolean(groupRoleInfo.isSystem);
  const actorGroupRoles = groupRoleInfo.roles || [];

  const canAssignAdmin =
    isSystemActor || hasAnyRole(actorGroupRoles, HIGH_ADMIN_ROLE_CODES);
  const canAssignMember =
    isSystemActor || hasAnyRole(actorGroupRoles, GROUP_MANAGER_ROLE_CODES);

  if (!canAssignMember) {
    throw createHttpError(
      403,
      "Bạn không có quyền gán người dùng vào Group này",
    );
  }

  if (Number(targetUserId) === Number(actorUserId)) {
    throw createHttpError(
      403,
      "Bạn không thể tự gán chính mình vào Group hoặc làm quản trị",
    );
  }

  const isTargetSystem = await roleService.isGlobalSystemUser(targetUserId);
  if (isTargetSystem) {
    throw createHttpError(
      403,
      "User có quyền quản trị hệ thống (admin_ami) không được phép gán vào Group",
    );
  }

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
    if (!isSystemActor) {
      const canEdit = await assertActorOwnsGroupMember(
        actorUserId,
        targetUserId,
        existingMember,
      );
      if (!canEdit) {
        throw createHttpError(
          403,
          "Bạn không thể sửa thành viên không phải do bạn gán vào Group này",
        );
      }
    }
  } else {
    const assignableUsers = await getAssignableUsers(actorUserId, groupId);
    const targetUser = assignableUsers.find(
      (u) => Number(u.id) === Number(targetUserId),
    );

    if (!targetUser) {
      throw createHttpError(
        403,
        "User không tồn tại, không phải do bạn tạo ra hoặc đã có chức vụ trong nhánh Group này",
      );
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
      throw createHttpError(
        400,
        `User này đã có vai trò (${conflict.role_name}) trong Group "${conflict.group_name}" thuộc cùng nhánh cha - con - cháu, không thể gán vào nhiều Group trên cùng một nhánh`,
      );
    }

    const desiredRoleCode = roleCode || ROLES.GROUP_MEMBER;
    const { rows: roleRows } = await client.query(
      `
        SELECT id, role_code, role_name
        FROM roles
        WHERE role_code = $1
        LIMIT 1
      `,
      [desiredRoleCode],
    );

    if (!roleRows[0]) {
      throw createHttpError(400, "Vai trò (Role) không hợp lệ");
    }

    const selectedRole = roleRows[0];
    const desiredRoleRank = getRoleRank(selectedRole.role_code);

    if (isSystemRole(selectedRole.role_code) || desiredRoleRank >= 4) {
      throw createHttpError(400, "Không thể gán vai trò system vào Group");
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
      throw createHttpError(
        400,
        `Không thể gán vai trò "${selectedRole.role_name}" trong Group vì người dùng này chỉ có vai trò toàn cục là "${targetRoleName}". Vai trò của thành viên trong Group không được cao hơn vai trò toàn cục.`,
      );
    }

    if (!isSystemActor) {
      const actorGroupRanks = actorGroupRoles.map((r) => getRoleRank(r));
      const actorMaxGroupRank =
        actorGroupRanks.length > 0 ? Math.max(...actorGroupRanks) : 1;

      if (desiredRoleRank > actorMaxGroupRank) {
        throw createHttpError(
          403,
          `Bạn không thể gán vai trò trong Group (${selectedRole.role_name}) cao hơn vai trò của bạn trong Group này`,
        );
      }
    }

    if (isAdminRole(selectedRole.role_code) && !canAssignAdmin) {
      throw createHttpError(
        403,
        "Bạn chỉ có quyền thêm thành viên xem Dashboard trong Group này, không có quyền gán Quản trị Group",
      );
    }

    await client.query(
      `
        INSERT INTO group_members (group_id, superset_user_id, role_id, created_by)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (group_id, superset_user_id)
        DO UPDATE SET role_id = EXCLUDED.role_id
      `,
      [groupId, targetUserId, selectedRole.id, actorUserId],
    );

    const cleanDashIds = Array.from(
      new Set(
        (Array.isArray(dashboardIds) ? dashboardIds : [])
          .map(Number)
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

    await logAudit(
      {
        userId: actorUserId,
        action: existingMember
          ? AUDIT_ACTIONS.GROUP_MEMBER_UPDATE
          : AUDIT_ACTIONS.GROUP_MEMBER_ASSIGN,
        targetType: "GROUP_MEMBER",
        targetId: `${groupId}:${targetUserId}`,
        description: `${existingMember ? "Cập nhật" : "Gán"} thành viên #${targetUserId} trong Group #${groupId} với vai trò "${selectedRole.role_code}"`,
        metadata: {
          group_id: Number(groupId),
          target_user_id: Number(targetUserId),
          role_code: selectedRole.role_code,
          dashboard_ids: validMemberDashIds,
          is_update: Boolean(existingMember),
        },
      },
      client,
    );

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
 * Xóa thành viên khỏi Group dựa theo role_code.
 */
async function removeUserFromGroup({ actorUserId, groupId, targetUserId }) {
  if (Number(targetUserId) === Number(actorUserId)) {
    throw createHttpError(403, "Bạn không thể tự xóa chính mình");
  }

  const groupRoleInfo = await roleService.getUserGroupRoleAndPermissions(
    actorUserId,
    groupId,
  );
  const isSystemActor = Boolean(groupRoleInfo.isSystem);
  const actorGroupRoles = groupRoleInfo.roles || [];

  const canManageGroupMembers =
    isSystemActor || hasAnyRole(actorGroupRoles, GROUP_MANAGER_ROLE_CODES);

  if (!canManageGroupMembers) {
    throw createHttpError(
      403,
      "Bạn không có quyền quản lý thành viên trong Group này",
    );
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
    throw createHttpError(404, "Thành viên không tồn tại trong Group này");
  }

  if (!isSystemActor) {
    const canRemove = await assertActorOwnsGroupMember(
      actorUserId,
      targetUserId,
      existingMember,
    );
    if (!canRemove) {
      throw createHttpError(
        403,
        "Bạn không thể xóa thành viên không phải do bạn gán vào Group này",
      );
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

  await logAudit({
    userId: actorUserId,
    action: AUDIT_ACTIONS.GROUP_MEMBER_REMOVE,
    targetType: "GROUP_MEMBER",
    targetId: `${groupId}:${targetUserId}`,
    description: `Xóa thành viên #${targetUserId} khỏi Group #${groupId}`,
    metadata: {
      group_id: Number(groupId),
      target_user_id: Number(targetUserId),
    },
  });

  return { groupId: Number(groupId), userId: Number(targetUserId) };
}

/**
 * Lấy thông tin chi tiết của chính User đang đăng nhập cho trang "User Info".
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
            r.role_name
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

  const isSystemUser = globalRes.rows.some((r) => isSystemRole(r.role_code));
  const assignedAt = globalRes.rows[0]?.assigned_at || null;

  let userGroups = [];
  if (isSystemUser) {
    const sysRoleRow =
      globalRes.rows.find((r) => isSystemRole(r.role_code)) ||
      globalRes.rows[0];
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
      role_code: sysRoleRow?.role_code || ROLES.ADMIN_AMI,
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

  return {
    user: {
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
    },
  };
}

/**
 * Cập nhật thông tin cá nhân (first_name, last_name, email)
 */
async function updateUserProfile(userId, { first_name, last_name, email }) {
  const uid = Number(userId);
  if (!Number.isSafeInteger(uid) || uid <= 0) {
    throw createHttpError(400, "userId không hợp lệ");
  }

  const cleanFirstName = String(first_name ?? "").trim();
  const cleanLastName = String(last_name ?? "").trim();
  const cleanEmail = String(email ?? "").trim();

  if (!cleanEmail) {
    throw createHttpError(400, "Email không được để trống");
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    throw createHttpError(400, "Định dạng email không hợp lệ");
  }

  if (cleanFirstName.length > 100 || cleanLastName.length > 100) {
    throw createHttpError(400, "Họ hoặc tên không được vượt quá 100 ký tự");
  }

  const userTable = await resolveSupersetUserTable();

  const dupCheck = await supersetPool.query(
    `SELECT id, username FROM ${userTable} WHERE LOWER(email) = LOWER($1) AND id <> $2 LIMIT 1`,
    [cleanEmail, uid],
  );

  if (dupCheck.rows.length > 0) {
    throw createHttpError(
      409,
      `Email "${cleanEmail}" đã được sử dụng bởi tài khoản khác (${dupCheck.rows[0].username}). Vui lòng nhập email khác.`,
    );
  }

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
    throw createHttpError(404, "Không tìm thấy tài khoản người dùng để cập nhật");
  }

  const updated = updateRes.rows[0];
  const fullName =
    `${updated.first_name || ""} ${updated.last_name || ""}`.trim() ||
    updated.username;

  await logAudit({
    userId: uid,
    action: AUDIT_ACTIONS.USER_PROFILE_UPDATE,
    targetType: "USER",
    targetId: uid,
    description: `Cập nhật thông tin cá nhân tài khoản "${updated.username}"`,
    metadata: {
      user_id: uid,
      username: updated.username,
      first_name: updated.first_name || "",
      last_name: updated.last_name || "",
      email: updated.email,
    },
  });

  return {
    id: Number(updated.id),
    username: updated.username,
    first_name: updated.first_name || "",
    last_name: updated.last_name || "",
    full_name: fullName,
    email: updated.email,
  };
}

/**
 * Đổi mật khẩu cá nhân (old_password, new_password, confirm_new_password)
 */
async function changeUserPassword(
  userId,
  { old_password, new_password, confirm_new_password },
) {
  const uid = Number(userId);
  if (!Number.isSafeInteger(uid) || uid <= 0) {
    throw createHttpError(400, "userId không hợp lệ");
  }

  const oldPwd = String(old_password || "");
  const newPwd = String(new_password || "");
  const confirmPwd = String(confirm_new_password || "");

  const permCheck = await rolePool.query(
    `SELECT can_change_password FROM user_global_roles WHERE superset_user_id = $1 LIMIT 1`,
    [uid],
  );
  if (
    permCheck.rows.length > 0 &&
    permCheck.rows[0].can_change_password === false
  ) {
    throw createHttpError(
      403,
      "Tài khoản của bạn không được phép đổi mật khẩu. Vui lòng liên hệ quản trị viên.",
    );
  }

  if (!oldPwd) {
    throw createHttpError(400, "Vui lòng nhập mật khẩu hiện tại");
  }

  if (!newPwd) {
    throw createHttpError(400, "Vui lòng nhập mật khẩu mới");
  }

  if (newPwd.length < 8) {
    throw createHttpError(400, "Mật khẩu mới phải có tối thiểu 8 ký tự");
  }

  if (newPwd !== confirmPwd) {
    throw createHttpError(
      400,
      "Mật khẩu mới và xác nhận mật khẩu không khớp",
    );
  }

  if (oldPwd === newPwd) {
    throw createHttpError(
      400,
      "Mật khẩu mới không được trùng với mật khẩu hiện tại",
    );
  }

  const userTable = await resolveSupersetUserTable();
  const userRes = await supersetPool.query(
    `SELECT id, username, password FROM ${userTable} WHERE id = $1 LIMIT 1`,
    [uid],
  );

  if (userRes.rows.length === 0) {
    throw createHttpError(404, "Không tìm thấy tài khoản người dùng");
  }

  const isMatch = await verifyPassword(oldPwd, userRes.rows[0].password);
  if (!isMatch) {
    throw createHttpError(400, "Mật khẩu cũ không chính xác");
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

  await logAudit({
    userId: uid,
    action: AUDIT_ACTIONS.USER_PASSWORD_CHANGE,
    targetType: "USER",
    targetId: uid,
    description: `Đổi mật khẩu cá nhân tài khoản "${userRes.rows[0].username}"`,
    metadata: {
      user_id: uid,
      username: userRes.rows[0].username,
    },
  });

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
