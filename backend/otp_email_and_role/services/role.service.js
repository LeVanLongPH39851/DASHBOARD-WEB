const { rolePool } = require("../config/db");
const {
  ROLES,
  ADMIN_ROLE_CODES,
  HIGH_ADMIN_ROLE_CODES,
  GROUP_MANAGER_ROLE_CODES,
  hasAnyRole,
  getPermissionsForRoles,
  createHttpError,
} = require("../config/roles.config");
const { AUDIT_ACTIONS, logAudit } = require("./audit.service");

/**
 * Kiểm tra xem user có phải là System Admin (admin_ami) trong bảng user_global_roles hay không.
 */
async function isGlobalSystemUser(userId) {
  const { rows } = await rolePool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM user_global_roles ugr
        JOIN roles r ON r.id = ugr.role_id
        WHERE ugr.superset_user_id = $1
          AND r.role_code = $2
      ) AS is_system
    `,
    [userId, ROLES.ADMIN_AMI],
  );
  return Boolean(rows[0]?.is_system);
}

/**
 * Lấy danh sách roles Global của user từ bảng user_global_roles,
 * ánh xạ sang permissions cố định theo role_code, kèm require_otp và can_change_password.
 */
async function getUserRoles(userId) {
  const { rows } = await rolePool.query(
    `
      WITH assigned_roles AS (
        SELECT ugr.role_id, ugr.require_otp, ugr.can_change_password, r.role_code::text AS role_code
        FROM user_global_roles ugr
        JOIN roles r ON r.id = ugr.role_id
        WHERE ugr.superset_user_id = $1
      )
      SELECT
        COALESCE(
          (SELECT ARRAY_AGG(DISTINCT role_code ORDER BY role_code) FROM assigned_roles),
          ARRAY[]::text[]
        ) AS roles,
        COALESCE(
          (SELECT BOOL_AND(require_otp) FROM assigned_roles),
          TRUE
        ) AS require_otp,
        COALESCE(
          (SELECT BOOL_AND(can_change_password) FROM assigned_roles),
          TRUE
        ) AS can_change_password
    `,
    [userId],
  );

  const row = rows[0] || {};
  const roles = row.roles || [];
  const permissions = getPermissionsForRoles(roles);

  return {
    roles,
    permissions,
    global_roles: roles,
    global_permissions: permissions,
    require_otp:
      row.require_otp !== undefined ? Boolean(row.require_otp) : true,
    can_change_password:
      row.can_change_password !== undefined
        ? Boolean(row.can_change_password)
        : true,
  };
}

/**
 * Lấy role_code và quyền của user đối với 1 Group cụ thể (groupId):
 * - Nếu là admin_ami ở Global: toàn quyền hệ thống.
 * - Nếu không: lấy role_code trực tiếp tại groupId (distance = 0) hoặc kế thừa từ Group cha
 *   nếu ở Group cha user có role_code thuộc HIGH_ADMIN_ROLE_CODES (super_admin / admin_ami).
 */
async function getUserGroupRoleAndPermissions(userId, groupId) {
  const isSystem = await isGlobalSystemUser(userId);
  if (isSystem) {
    const sysInfo = await getUserRoles(userId);
    const sysRoles =
      sysInfo.global_roles.length > 0
        ? sysInfo.global_roles
        : [ROLES.ADMIN_AMI];
    return {
      isSystem: true,
      distance: 0,
      roles: sysRoles,
      permissions: getPermissionsForRoles(sysRoles),
    };
  }

  const { rows } = await rolePool.query(
    `
      WITH RECURSIVE lineage_up AS (
        SELECT id, parent_group_id, 0 AS distance
        FROM groups
        WHERE id = $2 AND is_active = TRUE
        UNION ALL
        SELECT g.id, g.parent_group_id, lu.distance + 1
        FROM groups g
        JOIN lineage_up lu ON g.id = lu.parent_group_id
        WHERE g.is_active = TRUE
      ),
      effective_role AS (
        SELECT
          gm.role_id,
          r.role_code::text AS role_code,
          lu.distance
        FROM lineage_up lu
        JOIN group_members gm
          ON gm.group_id = lu.id AND gm.superset_user_id = $1
        JOIN roles r
          ON r.id = gm.role_id
        WHERE lu.distance = 0
           OR r.role_code = ANY($3::text[])
        ORDER BY lu.distance ASC
        LIMIT 1
      )
      SELECT
        COALESCE((SELECT distance FROM effective_role), -1) AS distance,
        COALESCE(
          (SELECT ARRAY[role_code] FROM effective_role),
          ARRAY[]::text[]
        ) AS roles
    `,
    [userId, groupId, HIGH_ADMIN_ROLE_CODES],
  );

  const roles = rows[0]?.roles || [];
  return {
    isSystem: false,
    distance: Number(rows[0]?.distance ?? -1),
    roles,
    permissions: getPermissionsForRoles(roles),
  };
}

/**
 * Lấy danh sách Dashboard mà user được phép truy cập dựa theo role_code:
 * - admin_ami ở Global: xem tất cả Dashboard (canViewAll = true).
 * - super_admin / group_admin trong Group: xem toàn bộ Dashboard của Group đó
 *   (và nếu là super_admin thì kế thừa xem toàn bộ Dashboard của các Group con).
 * - group_member: xem các Dashboard được gán riêng trong member_dashboards.
 */
async function getUserAccessibleDashboards(userId) {
  const { rows } = await rolePool.query(
    `
      WITH RECURSIVE has_system_role AS (
        SELECT EXISTS (
          SELECT 1
          FROM user_global_roles ugr
          JOIN roles r ON r.id = ugr.role_id
          WHERE ugr.superset_user_id = $1
            AND r.role_code = $2
        ) AS can_view_all
      ),
      managed_groups AS (
        SELECT
          g.id,
          (r.role_code = ANY($3::text[])) AS can_manage_children
        FROM groups g
        JOIN group_members gm
          ON gm.group_id = g.id AND gm.superset_user_id = $1
        JOIN roles r
          ON r.id = gm.role_id
        WHERE g.is_active = TRUE
          AND r.role_code = ANY($4::text[])

        UNION

        SELECT
          child.id,
          mg.can_manage_children
        FROM groups child
        JOIN managed_groups mg ON child.parent_group_id = mg.id
        WHERE child.is_active = TRUE
          AND mg.can_manage_children = TRUE
      ),
      accessible_dashboards AS (
        SELECT gd.dashboard_id
        FROM group_dashboards gd
        JOIN managed_groups mg ON mg.id = gd.group_id

        UNION

        SELECT md.dashboard_id
        FROM member_dashboards md
        JOIN groups g ON g.id = md.group_id
        JOIN group_dashboards gd
          ON gd.group_id = md.group_id
         AND gd.dashboard_id = md.dashboard_id
        WHERE md.superset_user_id = $1
          AND g.is_active = TRUE
      )
      SELECT
        (SELECT can_view_all FROM has_system_role) AS "canViewAll",
        COALESCE(
          (SELECT ARRAY_AGG(DISTINCT dashboard_id ORDER BY dashboard_id) FROM accessible_dashboards),
          ARRAY[]::bigint[]
        ) AS "dashboardIds"
    `,
    [
      userId,
      ROLES.ADMIN_AMI,
      HIGH_ADMIN_ROLE_CODES,
      GROUP_MANAGER_ROLE_CODES,
    ],
  );

  const row = rows[0] || {};
  return {
    canViewAll: Boolean(row.canViewAll),
    dashboardIds: (row.dashboardIds || []).map(Number),
  };
}

/**
 * Lấy cây danh sách Group mà user quản lý (trang Role & Permission) dựa theo role_code.
 */
async function getManagedGroups(userId) {
  const roleInfo = await getUserRoles(userId);
  const globalRoles = roleInfo.global_roles || [];
  const globalPermissions = roleInfo.global_permissions || [];

  // Chỉ 3 Admin (admin_ami, super_admin, group_admin) mới được vào trang Role & Permission
  if (!hasAnyRole(globalRoles, ADMIN_ROLE_CODES)) {
    throw createHttpError(
      403,
      "Chỉ có Quản trị viên (Admin) mới được phép truy cập trang Role & Permission",
    );
  }

  const canManageSystem = hasAnyRole(globalRoles, [ROLES.ADMIN_AMI]);
  let groupRows = [];

  if (canManageSystem) {
    const { rows } = await rolePool.query(
      `
        SELECT
          id,
          group_name,
          description,
          parent_group_id,
          created_by,
          is_active,
          created_at,
          updated_at
        FROM groups
        WHERE is_active = TRUE
        ORDER BY id ASC
      `,
    );
    groupRows = rows.map((r) => ({
      ...r,
      my_group_roles: globalRoles,
      my_group_permissions: globalPermissions,
    }));
  } else {
    const { rows } = await rolePool.query(
      `
        WITH RECURSIVE managed_tree AS (
          SELECT
            g.id,
            g.group_name,
            g.description,
            g.parent_group_id,
            g.created_by,
            g.is_active,
            g.created_at,
            g.updated_at,
            r.role_code::text AS effective_role_code,
            (r.role_code = ANY($2::text[])) AS can_manage_children,
            0 AS tree_depth
          FROM groups g
          JOIN group_members gm
            ON gm.group_id = g.id AND gm.superset_user_id = $1
          JOIN roles r
            ON r.id = gm.role_id
          WHERE g.is_active = TRUE
            AND r.role_code = ANY($3::text[])

          UNION ALL

          SELECT
            child.id,
            child.group_name,
            child.description,
            child.parent_group_id,
            child.created_by,
            child.is_active,
            child.created_at,
            child.updated_at,
            mt.effective_role_code,
            mt.can_manage_children,
            mt.tree_depth + 1 AS tree_depth
          FROM groups child
          JOIN managed_tree mt ON child.parent_group_id = mt.id
          WHERE child.is_active = TRUE
            AND mt.can_manage_children = TRUE
        )
        SELECT DISTINCT ON (id)
          id,
          group_name,
          description,
          parent_group_id,
          created_by,
          is_active,
          created_at,
          updated_at,
          ARRAY[effective_role_code] AS my_group_roles
        FROM managed_tree
        ORDER BY id ASC, tree_depth ASC
      `,
      [userId, HIGH_ADMIN_ROLE_CODES, GROUP_MANAGER_ROLE_CODES],
    );

    groupRows = rows.map((r) => ({
      ...r,
      my_group_roles: r.my_group_roles || [],
      my_group_permissions: getPermissionsForRoles(r.my_group_roles || []),
    }));
  }

  if (groupRows.length === 0) {
    return {
      global_roles: globalRoles,
      global_permissions: globalPermissions,
      roles: globalRoles,
      permissions: globalPermissions,
      groups: [],
    };
  }

  const groupIds = groupRows.map((g) => Number(g.id));

  const [dashRes, memberRes] = await Promise.all([
    rolePool.query(
      `
        SELECT group_id, dashboard_id, assigned_by, created_at
        FROM group_dashboards
        WHERE group_id = ANY($1::bigint[])
        ORDER BY dashboard_id ASC
      `,
      [groupIds],
    ),
    rolePool.query(
      `
        SELECT group_id, COUNT(*)::int AS member_count
        FROM group_members
        WHERE group_id = ANY($1::bigint[])
        GROUP BY group_id
      `,
      [groupIds],
    ),
  ]);

  const dashboardMap = new Map();
  dashRes.rows.forEach((row) => {
    const gId = Number(row.group_id);
    if (!dashboardMap.has(gId)) {
      dashboardMap.set(gId, []);
    }
    dashboardMap.get(gId).push({
      dashboard_id: Number(row.dashboard_id),
      assigned_by: Number(row.assigned_by),
      created_at: row.created_at,
    });
  });

  const memberCountMap = new Map();
  memberRes.rows.forEach((row) => {
    memberCountMap.set(Number(row.group_id), Number(row.member_count));
  });

  const nodeMap = new Map();
  groupRows.forEach((g) => {
    const id = Number(g.id);
    nodeMap.set(id, {
      id,
      group_name: g.group_name,
      description: g.description || "",
      parent_group_id: g.parent_group_id ? Number(g.parent_group_id) : null,
      created_by: Number(g.created_by),
      created_at: g.created_at,
      updated_at: g.updated_at,
      member_count: memberCountMap.get(id) || 0,
      dashboards: dashboardMap.get(id) || [],
      my_group_roles: g.my_group_roles || [],
      my_group_permissions: g.my_group_permissions || [],
      children: [],
    });
  });

  const rootGroups = [];
  nodeMap.forEach((node) => {
    if (node.parent_group_id && nodeMap.has(node.parent_group_id)) {
      nodeMap.get(node.parent_group_id).children.push(node);
    } else {
      rootGroups.push(node);
    }
  });

  return {
    roles: globalRoles,
    permissions: globalPermissions,
    global_roles: globalRoles,
    global_permissions: globalPermissions,
    groups: rootGroups,
  };
}

/**
 * Tạo Group mới:
 * - Root Group (không có parentGroupId): chỉ admin_ami được tạo.
 * - Group con (có parentGroupId): admin_ami hoặc user có role super_admin trong Group cha được tạo.
 */
async function createManagedGroup({
  userId,
  groupName,
  description,
  parentGroupId,
}) {
  const isSystem = await isGlobalSystemUser(userId);
  let canCreate = isSystem;

  if (!canCreate && parentGroupId) {
    const groupRoleInfo = await getUserGroupRoleAndPermissions(
      userId,
      Number(parentGroupId),
    );
    canCreate = hasAnyRole(groupRoleInfo.roles, HIGH_ADMIN_ROLE_CODES);
  }

  if (!canCreate) {
    throw createHttpError(403, "Bạn không có quyền tạo Group");
  }

  const client = await rolePool.connect();
  try {
    await client.query("BEGIN");

    if (parentGroupId) {
      // 1. Giới hạn tối đa 10 Group con cho mỗi Group cha
      const childCountRes = await client.query(
        `
          SELECT COUNT(*)::int AS count
          FROM groups
          WHERE parent_group_id = $1 AND is_active = TRUE
        `,
        [parentGroupId],
      );
      const childCount = childCountRes.rows[0]?.count || 0;
      if (childCount >= 10) {
        throw createHttpError(
          400,
          "Mỗi Group cha chỉ được phép có tối đa 10 Group con. Group này đã đạt giới hạn 10 Group con.",
        );
      }

      // 2. Giới hạn tối đa 5 cấp trên một nhánh Group
      const levelRes = await client.query(
        `
          WITH RECURSIVE ancestors AS (
            SELECT id, parent_group_id, 1 AS level
            FROM groups
            WHERE id = $1
            UNION ALL
            SELECT g.id, g.parent_group_id, a.level + 1
            FROM groups g
            JOIN ancestors a ON a.parent_group_id = g.id
          )
          SELECT MAX(level)::int AS current_level FROM ancestors
        `,
        [parentGroupId],
      );
      const currentLevel = levelRes.rows[0]?.current_level || 1;
      if (currentLevel >= 5) {
        throw createHttpError(
          400,
          "Một nhánh Group chỉ được phép tồn tại tối đa 5 cấp (từ Cấp 1 đến Cấp 5). Không thể tạo thêm Group con cho cấp này.",
        );
      }
    }

    const cleanGroupName = String(groupName || "").trim();
    const dupRes = await client.query(
      `SELECT id FROM groups WHERE LOWER(group_name) = LOWER($1) LIMIT 1`,
      [cleanGroupName],
    );
    if (dupRes.rows[0]) {
      throw createHttpError(
        409,
        `Tên nhóm "${cleanGroupName}" đã tồn tại trong hệ thống. Vui lòng chọn tên khác.`,
      );
    }

    const { rows } = await client.query(
      `
        INSERT INTO groups (group_name, description, parent_group_id, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING id, group_name, description, parent_group_id, created_by, created_at, updated_at
      `,
      [
        cleanGroupName,
        description ? description.trim() : null,
        parentGroupId ? Number(parentGroupId) : null,
        userId,
      ],
    );

    const newGroup = rows[0];
    await client.query("COMMIT");

    await logAudit({
      userId,
      action: AUDIT_ACTIONS.GROUP_CREATE,
      targetType: "GROUP",
      targetId: newGroup.id,
      description: `Tạo Group "${newGroup.group_name}"${newGroup.parent_group_id ? ` (thuộc Group cha #${newGroup.parent_group_id})` : " (Group gốc)"}`,
      metadata: {
        group_id: Number(newGroup.id),
        group_name: newGroup.group_name,
        description: newGroup.description,
        parent_group_id: newGroup.parent_group_id
          ? Number(newGroup.parent_group_id)
          : null,
      },
    });

    return newGroup;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (error.code === "23505") {
      throw createHttpError(
        409,
        `Tên nhóm "${String(groupName || "").trim()}" đã tồn tại trong hệ thống. Vui lòng chọn tên khác.`,
      );
    }
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Cập nhật thông tin Group (tên group & description):
 * - Chỉ admin_ami hoặc người tạo ra group (created_by === userId) mới có quyền sửa.
 */
async function updateManagedGroup({ userId, groupId, groupName, description }) {
  const isSystem = await isGlobalSystemUser(userId);

  const groupCheck = await rolePool.query(
    `SELECT id, group_name, description, created_by, parent_group_id FROM groups WHERE id = $1 AND is_active = TRUE LIMIT 1`,
    [groupId],
  );
  if (!groupCheck.rows[0]) {
    throw createHttpError(404, "Group không tồn tại");
  }

  const targetGroup = groupCheck.rows[0];
  const isCreator = Number(targetGroup.created_by) === Number(userId);

  if (!isSystem && !isCreator) {
    throw createHttpError(
      403,
      "Chỉ admin_ami hoặc người tạo ra Group mới có quyền sửa tên và mô tả",
    );
  }

  const cleanGroupName = String(groupName || "").trim();
  if (!cleanGroupName) {
    throw createHttpError(400, "Tên Group không được để trống");
  }

  // Kiểm tra trùng tên với các group khác
  const dupRes = await rolePool.query(
    `SELECT id FROM groups WHERE LOWER(group_name) = LOWER($1) AND id <> $2 LIMIT 1`,
    [cleanGroupName, groupId],
  );
  if (dupRes.rows[0]) {
    throw createHttpError(
      409,
      `Tên nhóm "${cleanGroupName}" đã tồn tại trong hệ thống. Vui lòng chọn tên khác.`,
    );
  }

  const client = await rolePool.connect();
  try {
    await client.query("BEGIN");

    const cleanDescription =
      description !== undefined ? (description ? String(description).trim() : null) : targetGroup.description;

    const { rows } = await client.query(
      `
        UPDATE groups
        SET group_name = $1,
            description = $2,
            updated_at = NOW()
        WHERE id = $3
        RETURNING id, group_name, description, parent_group_id, created_by, created_at, updated_at
      `,
      [cleanGroupName, cleanDescription, groupId],
    );

    const updatedGroup = rows[0];
    await client.query("COMMIT");

    await logAudit({
      userId,
      action: AUDIT_ACTIONS.GROUP_UPDATE,
      targetType: "GROUP",
      targetId: updatedGroup.id,
      description: `Cập nhật Group "${updatedGroup.group_name}"`,
      metadata: {
        group_id: Number(updatedGroup.id),
        old_name: targetGroup.group_name,
        new_name: updatedGroup.group_name,
        old_description: targetGroup.description,
        new_description: updatedGroup.description,
      },
    });

    return updatedGroup;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    if (error.code === "23505") {
      throw createHttpError(
        409,
        `Tên nhóm "${cleanGroupName}" đã tồn tại trong hệ thống. Vui lòng chọn tên khác.`,
      );
    }
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Cập nhật danh sách Dashboard cấp cho Group:
 * - admin_ami: được sửa mọi Group.
 * - super_admin: chỉ được sửa ở các Group con bên dưới (distance > 0), không được sửa ở Group gốc mình quản lý (distance === 0).
 */
async function updateGroupDashboards({ userId, groupId, dashboardIds }) {
  const groupRoleInfo = await getUserGroupRoleAndPermissions(userId, groupId);
  const groupRoles = groupRoleInfo.roles || [];

  const canAssign =
    groupRoleInfo.isSystem ||
    hasAnyRole(groupRoles, [ROLES.ADMIN_AMI]) ||
    (groupRoleInfo.distance > 0 && hasAnyRole(groupRoles, [ROLES.SUPER_ADMIN]));

  if (!canAssign) {
    throw createHttpError(
      403,
      "Bạn không có quyền chỉnh sửa danh sách Dashboard của Group cấp cao nhất do bạn quản lý",
    );
  }

  const client = await rolePool.connect();
  try {
    await client.query("BEGIN");

    const groupRes = await client.query(
      `
        SELECT id, group_name, parent_group_id
        FROM groups
        WHERE id = $1 AND is_active = TRUE
        LIMIT 1
      `,
      [groupId],
    );

    if (!groupRes.rows[0]) {
      throw createHttpError(404, "Group không tồn tại");
    }

    const targetGroup = groupRes.rows[0];
    const parentGroupId = targetGroup.parent_group_id
      ? Number(targetGroup.parent_group_id)
      : null;

    const cleanIds = Array.from(
      new Set(
        (Array.isArray(dashboardIds) ? dashboardIds : [])
          .map(Number)
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    );

    // Group con chỉ được phép gán các Dashboard đang có trong Group cha
    if (parentGroupId && cleanIds.length > 0) {
      const parentDashRes = await client.query(
        `SELECT dashboard_id FROM group_dashboards WHERE group_id = $1`,
        [parentGroupId],
      );
      const parentAllowedSet = new Set(
        parentDashRes.rows.map((r) => Number(r.dashboard_id)),
      );

      const invalidIds = cleanIds.filter((id) => !parentAllowedSet.has(id));
      if (invalidIds.length > 0) {
        throw createHttpError(
          400,
          "Group con chỉ được phép gán các Dashboard đã có trong Group cha",
        );
      }
    }

    if (cleanIds.length === 0) {
      await client.query(
        `
          WITH RECURSIVE sub_groups AS (
            SELECT id FROM groups WHERE id = $1
            UNION
            SELECT g.id FROM groups g JOIN sub_groups sg ON g.parent_group_id = sg.id
          )
          DELETE FROM member_dashboards
          WHERE group_id IN (SELECT id FROM sub_groups)
        `,
        [groupId],
      );

      await client.query(
        `
          WITH RECURSIVE sub_groups AS (
            SELECT id FROM groups WHERE id = $1
            UNION
            SELECT g.id FROM groups g JOIN sub_groups sg ON g.parent_group_id = sg.id
          )
          DELETE FROM group_dashboards
          WHERE group_id IN (SELECT id FROM sub_groups)
        `,
        [groupId],
      );
    } else {
      await client.query(
        `
          WITH RECURSIVE sub_groups AS (
            SELECT id FROM groups WHERE id = $1
            UNION
            SELECT g.id FROM groups g JOIN sub_groups sg ON g.parent_group_id = sg.id
          )
          DELETE FROM member_dashboards
          WHERE group_id IN (SELECT id FROM sub_groups)
            AND NOT (dashboard_id = ANY($2::bigint[]))
        `,
        [groupId, cleanIds],
      );

      await client.query(
        `
          WITH RECURSIVE sub_groups AS (
            SELECT id FROM groups WHERE id = $1
            UNION
            SELECT g.id FROM groups g JOIN sub_groups sg ON g.parent_group_id = sg.id
          )
          DELETE FROM group_dashboards
          WHERE group_id IN (SELECT id FROM sub_groups)
            AND NOT (dashboard_id = ANY($2::bigint[]))
        `,
        [groupId, cleanIds],
      );

      for (const dashId of cleanIds) {
        await client.query(
          `
            INSERT INTO group_dashboards (group_id, dashboard_id, assigned_by)
            VALUES ($1, $2, $3)
            ON CONFLICT (group_id, dashboard_id) DO NOTHING
          `,
          [groupId, dashId, userId],
        );
      }
    }

    await client.query("COMMIT");

    await logAudit({
      userId,
      action: AUDIT_ACTIONS.GROUP_DASHBOARDS_UPDATE,
      targetType: "GROUP",
      targetId: groupId,
      description: `Cập nhật danh sách Dashboard cho Group "${targetGroup.group_name}" (#${groupId})`,
      metadata: {
        group_id: Number(groupId),
        group_name: targetGroup.group_name,
        dashboard_ids: cleanIds,
      },
    });

    return { groupId: Number(groupId), dashboardIds: cleanIds };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Xóa Group và các Group con trực thuộc:
 * - admin_ami: được xóa mọi Group.
 * - super_admin: chỉ được xóa Group do chính mình tạo ra.
 */
async function deleteManagedGroup({ userId, groupId }) {
  const isSystem = await isGlobalSystemUser(userId);

  const groupCheck = await rolePool.query(
    `SELECT id, group_name, created_by, parent_group_id FROM groups WHERE id = $1 AND is_active = TRUE LIMIT 1`,
    [groupId],
  );
  if (!groupCheck.rows[0]) {
    throw createHttpError(404, "Group không tồn tại");
  }

  const targetGroup = groupCheck.rows[0];
  const isCreator = Number(targetGroup.created_by) === Number(userId);

  if (!isSystem) {
    if (!isCreator) {
      throw createHttpError(
        403,
        "Bạn chỉ có thể xóa Group do chính bạn tạo ra",
      );
    }

    const groupRoleInfo = await getUserGroupRoleAndPermissions(userId, groupId);
    if (!hasAnyRole(groupRoleInfo.roles, HIGH_ADMIN_ROLE_CODES)) {
      throw createHttpError(403, "Bạn không có quyền xóa Group này");
    }
  }

  const client = await rolePool.connect();
  try {
    await client.query("BEGIN");

    const subGroupsRes = await client.query(
      `
        WITH RECURSIVE sub_groups AS (
          SELECT id FROM groups WHERE id = $1
          UNION
          SELECT g.id FROM groups g JOIN sub_groups sg ON g.parent_group_id = sg.id
        )
        SELECT id FROM sub_groups
      `,
      [groupId],
    );
    const targetGroupIds = subGroupsRes.rows.map((r) => Number(r.id));

    await client.query(
      `DELETE FROM member_dashboards WHERE group_id = ANY($1::bigint[])`,
      [targetGroupIds],
    );
    await client.query(
      `DELETE FROM group_dashboards WHERE group_id = ANY($1::bigint[])`,
      [targetGroupIds],
    );
    await client.query(
      `DELETE FROM group_members WHERE group_id = ANY($1::bigint[])`,
      [targetGroupIds],
    );
    await client.query(
      `UPDATE groups SET parent_group_id = NULL WHERE id = ANY($1::bigint[])`,
      [targetGroupIds],
    );
    await client.query(`DELETE FROM groups WHERE id = ANY($1::bigint[])`, [
      targetGroupIds,
    ]);

    await client.query("COMMIT");

    await logAudit({
      userId,
      action: AUDIT_ACTIONS.GROUP_DELETE,
      targetType: "GROUP",
      targetId: groupId,
      description: `Xóa Group "${targetGroup.group_name}" (#${groupId}) và ${targetGroupIds.length - 1} Group con trực thuộc`,
      metadata: {
        deleted_group_id: Number(groupId),
        group_name: targetGroup.group_name,
        deleted_group_ids: targetGroupIds,
      },
    });

    return {
      deletedGroupId: Number(groupId),
      deletedGroupIds: targetGroupIds,
    };
  } catch (error) {
    await client.query("ROLLBACK").catch(() => {});
    throw error;
  } finally {
    client.release();
  }
}

module.exports = {
  isGlobalSystemUser,
  getUserRoles,
  getUserGroupRoleAndPermissions,
  getUserAccessibleDashboards,
  getManagedGroups,
  createManagedGroup,
  updateManagedGroup,
  updateGroupDashboards,
  deleteManagedGroup,
};
