const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "postgres",
  port: Number(process.env.POSTGRES_PORT || 5432),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  connectionTimeoutMillis: 50000,
});

pool.on("error", (error) => {
  console.error("[Role Database Pool Error]", error.message);
});

/**
 * Kiểm tra xem user có phải là System Admin trong bảng user_global_roles hay không.
 * Role ở global CHỈ dùng để check xem có phải là system (admin_ami / system.manage) hay không.
 */
async function isGlobalSystemUser(userId) {
  const { rows } = await pool.query(
    `
      SELECT EXISTS (
        SELECT 1
        FROM user_global_roles ugr
        JOIN roles r ON r.id = ugr.role_id
        LEFT JOIN role_permissions rp ON rp.role_id = r.id
        LEFT JOIN permissions p ON p.id = rp.permission_id
        WHERE ugr.superset_user_id = $1
          AND (r.role_code = 'admin_ami' OR p.permission_code = 'system.manage')
      ) AS is_system
    `,
    [userId],
  );
  return Boolean(rows[0]?.is_system);
}

/**
 * Lấy danh sách roles và permissions Global của user từ bảng user_global_roles,
 * kèm cấu hình require_otp và can_change_password
 */
async function getUserRoles(userId) {
  const { rows } = await pool.query(
    `
      WITH assigned_roles AS (
        SELECT role_id, require_otp, can_change_password
        FROM user_global_roles
        WHERE superset_user_id = $1
      ),
      role_list AS (
        SELECT DISTINCT r.role_code::text AS role_code
        FROM assigned_roles ar
        JOIN roles r ON r.id = ar.role_id
      ),
      permission_list AS (
        SELECT DISTINCT p.permission_code::text AS permission_code
        FROM assigned_roles ar
        JOIN role_permissions rp ON rp.role_id = ar.role_id
        JOIN permissions p ON p.id = rp.permission_id
      )
      SELECT
        COALESCE(
          (SELECT ARRAY_AGG(role_code ORDER BY role_code) FROM role_list),
          ARRAY[]::text[]
        ) AS roles,
        COALESCE(
          (SELECT ARRAY_AGG(permission_code ORDER BY permission_code) FROM permission_list),
          ARRAY[]::text[]
        ) AS permissions,
        COALESCE(
          (SELECT bool_and(require_otp) FROM assigned_roles),
          TRUE
        ) AS require_otp,
        COALESCE(
          (SELECT bool_and(can_change_password) FROM assigned_roles),
          TRUE
        ) AS can_change_password
    `,
    [userId],
  );

  const row = rows[0] || {
    roles: [],
    permissions: [],
    require_otp: true,
    can_change_password: true,
  };
  return {
    roles: row.roles || [],
    permissions: row.permissions || [],
    global_roles: row.roles || [],
    global_permissions: row.permissions || [],
    require_otp:
      row.require_otp !== undefined ? Boolean(row.require_otp) : true,
    can_change_password:
      row.can_change_password !== undefined
        ? Boolean(row.can_change_password)
        : true,
  };
}

/**
 * Lấy role và permission của user đối với 1 Group cụ thể (groupId):
 * - Ở global: chỉ check xem có phải là system hay không.
 * - Ở group: chỉ lấy role và permission của user trong chính groupId đó (hoặc kế thừa từ group cha nếu chưa có role trực tiếp ở group con và ở group cha có quyền quản lý cấp cao).
 */
async function getUserGroupRoleAndPermissions(userId, groupId) {
  const isSystem = await isGlobalSystemUser(userId);
  if (isSystem) {
    const sysInfo = await getUserRoles(userId);
    return {
      isSystem: true,
      roles: sysInfo?.global_roles || ["admin_ami"],
      permissions: sysInfo?.global_permissions || ["system.manage"],
    };
  }

  const { rows } = await pool.query(
    `
      WITH RECURSIVE lineage_up AS (
        SELECT id, parent_group_id, created_by, 0 AS distance
        FROM groups
        WHERE id = $2 AND is_active = TRUE
        UNION ALL
        SELECT g.id, g.parent_group_id, g.created_by, lu.distance + 1
        FROM groups g
        JOIN lineage_up lu ON g.id = lu.parent_group_id
        WHERE g.is_active = TRUE
      ),
      matched_group_roles AS (
        SELECT
          gm.role_id,
          r.role_code,
          lu.distance,
          BOOL_OR(p.permission_code IN (
            'group.create',
            'group_admin.assign',
            'group_dashboard.assign'
          )) AS is_high_admin
        FROM lineage_up lu
        JOIN group_members gm ON gm.group_id = lu.id AND gm.superset_user_id = $1
        JOIN roles r ON r.id = gm.role_id
        LEFT JOIN role_permissions rp ON rp.role_id = r.id
        LEFT JOIN permissions p ON p.id = rp.permission_id
        GROUP BY gm.role_id, r.role_code, lu.distance
      ),
      effective_roles AS (
        SELECT role_id, role_code, distance
        FROM matched_group_roles
        WHERE distance = 0 OR is_high_admin = TRUE
        ORDER BY distance ASC
        LIMIT 1
      )
      SELECT
        COALESCE((SELECT MIN(distance) FROM effective_roles), -1) AS distance,
        COALESCE(
          (SELECT ARRAY_AGG(DISTINCT role_code::text) FROM effective_roles),
          ARRAY[]::text[]
        ) AS roles,
        COALESCE(
          (
            SELECT ARRAY_AGG(DISTINCT p.permission_code::text)
            FROM effective_roles er
            JOIN role_permissions rp ON rp.role_id = er.role_id
            JOIN permissions p ON p.id = rp.permission_id
          ),
          ARRAY[]::text[]
        ) AS permissions
    `,
    [userId, groupId],
  );

  return {
    isSystem: false,
    distance: Number(rows[0]?.distance ?? -1),
    roles: rows[0]?.roles || [],
    permissions: rows[0]?.permissions || [],
  };
}

async function getUserAccessibleDashboards(userId) {
  const { rows } = await pool.query(
    `
      WITH RECURSIVE has_system_manage AS (
        -- Role ở global chỉ check xem có phải là system (admin_ami / system.manage) hay không
        SELECT EXISTS (
          SELECT 1
          FROM user_global_roles ugr
          JOIN roles r ON r.id = ugr.role_id
          LEFT JOIN role_permissions rp ON rp.role_id = r.id
          LEFT JOIN permissions p ON p.id = rp.permission_id
          WHERE ugr.superset_user_id = $1
            AND (r.role_code = 'admin_ami' OR p.permission_code = 'system.manage')
        ) AS can_view_all
      ),
      -- Phân loại quyền trên từng role trong group
      role_capabilities AS (
        SELECT
          r.id AS role_id,
          BOOL_OR(p.permission_code IN (
            'group.create',
            'group_admin.assign',
            'group_dashboard.assign'
          )) AS is_high_admin,
          BOOL_OR(p.permission_code IN (
            'member_dashboard.assign',
            'member_dashboard.revoke',
            'member.create',
            'member.update',
            'member.delete'
          )) AS is_group_admin
        FROM roles r
        JOIN role_permissions rp ON rp.role_id = r.id
        JOIN permissions p ON p.id = rp.permission_id
        GROUP BY r.id
      ),
      managed_groups AS (
        -- Các group mà user có quyền quản lý trong group_members
        SELECT
          g.id,
          COALESCE(rc.is_high_admin, FALSE) AS can_manage_children
        FROM groups g
        JOIN group_members gm
          ON gm.group_id = g.id AND gm.superset_user_id = $1
        JOIN role_capabilities rc
          ON rc.role_id = gm.role_id
        WHERE g.is_active = TRUE
          AND (
            COALESCE(rc.is_high_admin, FALSE)
            OR COALESCE(rc.is_group_admin, FALSE)
          )

        UNION

        -- Đệ quy xuống các group con nếu ở group cha user có quyền quản lý cấp cao (can_manage_children = TRUE)
        SELECT
          child.id,
          mg.can_manage_children
        FROM groups child
        JOIN managed_groups mg ON child.parent_group_id = mg.id
        WHERE child.is_active = TRUE
          AND mg.can_manage_children = TRUE
      ),
      accessible_dashboards AS (
        -- Dashboard thuộc các group mà user quản lý
        SELECT gd.dashboard_id
        FROM group_dashboards gd
        JOIN managed_groups mg ON mg.id = gd.group_id

        UNION

        -- Dashboard mà thành viên được phân quyền xem trong member_dashboards
        SELECT md.dashboard_id
        FROM member_dashboards md
        JOIN groups g ON g.id = md.group_id
        WHERE md.superset_user_id = $1
          AND g.is_active = TRUE
      )
      SELECT
        (SELECT can_view_all FROM has_system_manage) AS "canViewAll",
        COALESCE(
          (SELECT ARRAY_AGG(DISTINCT dashboard_id ORDER BY dashboard_id) FROM accessible_dashboards),
          ARRAY[]::bigint[]
        ) AS "dashboardIds"
    `,
    [userId],
  );

  const row = rows[0] || {};
  return {
    canViewAll: Boolean(row.canViewAll),
    dashboardIds: (row.dashboardIds || []).map((id) => Number(id)),
  };
}

async function getManagedGroups(userId) {
  const roleInfo = await getUserRoles(userId);
  const globalRoles = roleInfo?.global_roles || [];
  const globalPermissions = roleInfo?.global_permissions || [];
  const roles = roleInfo?.roles || [];
  const permissions = roleInfo?.permissions || [];

  // Kiểm tra quyền Global: chỉ có 3 admin (admin_ami, super_admin, group_admin) mới được vào trang phân quyền
  const isGlobalAdmin = globalRoles.some((r) =>
    ["admin_ami", "super_admin", "group_admin"].includes(
      String(r || "").toLowerCase(),
    ),
  );
  if (!isGlobalAdmin) {
    const err = new Error(
      "Chỉ có Quản trị viên (Admin) mới được phép truy cập trang Role & Permission",
    );
    err.statusCode = 403;
    throw err;
  }

  // Role ở global chỉ check xem có phải là system (system.manage) hay không để lấy toàn bộ group
  const canManageSystem = await isGlobalSystemUser(userId);

  let groupRows = [];

  if (canManageSystem) {
    // Có quyền system ở global: Xem tất cả các group và các group con
    const { rows } = await pool.query(
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
    // Không phải system ở global -> chỉ lấy các group mà user có role & permission quản lý ở trong group_members
    // Mỗi group lấy độc lập đúng role & permission của user tại group đó (hoặc kế thừa từ group cha nếu là group con của group mà user làm super_admin)
    const { rows } = await pool.query(
      `
        WITH RECURSIVE role_capabilities AS (
          SELECT
            r.id AS role_id,
            r.role_code::text AS role_code,
            ARRAY_AGG(DISTINCT p.permission_code::text) AS role_perms,
            BOOL_OR(p.permission_code IN (
              'group.create',
              'group_admin.assign',
              'group_dashboard.assign'
            )) AS is_high_admin,
            BOOL_OR(p.permission_code IN (
              'member_dashboard.assign',
              'member_dashboard.revoke',
              'member.create',
              'member.update',
              'member.delete'
            )) AS is_group_admin
          FROM roles r
          JOIN role_permissions rp ON rp.role_id = r.id
          JOIN permissions p ON p.id = rp.permission_id
          GROUP BY r.id, r.role_code
        ),
        managed_tree AS (
          SELECT
            g.id,
            g.group_name,
            g.description,
            g.parent_group_id,
            g.created_by,
            g.is_active,
            g.created_at,
            g.updated_at,
            rc.role_code AS effective_role_code,
            rc.role_perms AS effective_permissions,
            COALESCE(rc.is_high_admin, FALSE) AS can_manage_children,
            0 AS tree_depth
          FROM groups g
          JOIN group_members gm
            ON gm.group_id = g.id AND gm.superset_user_id = $1
          JOIN role_capabilities rc
            ON rc.role_id = gm.role_id
          WHERE g.is_active = TRUE
            AND (
              COALESCE(rc.is_high_admin, FALSE)
              OR COALESCE(rc.is_group_admin, FALSE)
            )

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
            mt.effective_permissions,
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
          ARRAY[effective_role_code] AS my_group_roles,
          effective_permissions AS my_group_permissions
        FROM managed_tree
        ORDER BY id ASC, tree_depth ASC
      `,
      [userId],
    );
    groupRows = rows;
  }

  if (groupRows.length === 0) {
    return {
      global_roles: globalRoles,
      global_permissions: globalPermissions,
      roles,
      permissions,
      groups: [],
    };
  }

  const groupIds = groupRows.map((g) => Number(g.id));

  const [dashRes, memberRes] = await Promise.all([
    pool.query(
      `
        SELECT group_id, dashboard_id, assigned_by, created_at
        FROM group_dashboards
        WHERE group_id = ANY($1::bigint[])
        ORDER BY dashboard_id ASC
      `,
      [groupIds],
    ),
    pool.query(
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
    roles,
    permissions,
    global_roles: globalRoles,
    global_permissions: globalPermissions,
    groups: rootGroups,
  };
}

async function createManagedGroup({
  userId,
  groupName,
  description,
  parentGroupId,
}) {
  const isSystem = await isGlobalSystemUser(userId);
  let canCreate = isSystem;

  if (!canCreate) {
    if (parentGroupId) {
      // Tạo group con: chỉ check permission group.create ở trong chính group cha đó
      const groupRoleInfo = await getUserGroupRoleAndPermissions(
        userId,
        Number(parentGroupId),
      );
      canCreate = (groupRoleInfo?.permissions || []).includes("group.create");
    } else {
      // Tạo group gốc (Root Group): chỉ admin system mới được tạo group gốc không có cha
      canCreate = false;
    }
  }

  if (!canCreate) {
    const err = new Error("Bạn không có quyền tạo Group");
    err.statusCode = 403;
    throw err;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    if (parentGroupId) {
      // 1. Kiểm tra giới hạn: Mỗi một group cha chỉ tồn tại tối đa 10 group con
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
        const err = new Error(
          "Mỗi Group cha chỉ được phép có tối đa 10 Group con. Group này đã đạt giới hạn 10 Group con.",
        );
        err.statusCode = 400;
        throw err;
      }

      // 2. Kiểm tra giới hạn: 1 nhánh chỉ được phép tồn tại tối đa 5 cấp
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
        const err = new Error(
          "Một nhánh Group chỉ được phép tồn tại tối đa 5 cấp (từ Cấp 1 đến Cấp 5). Không thể tạo thêm Group con cho cấp này.",
        );
        err.statusCode = 400;
        throw err;
      }
    }

    const { rows } = await client.query(
      `
        INSERT INTO groups (group_name, description, parent_group_id, created_by)
        VALUES ($1, $2, $3, $4)
        RETURNING id, group_name, description, parent_group_id, created_by, created_at, updated_at
      `,
      [
        groupName.trim(),
        description ? description.trim() : null,
        parentGroupId ? Number(parentGroupId) : null,
        userId,
      ],
    );

    const newGroup = rows[0];

    await client.query("COMMIT");
    return newGroup;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function updateGroupDashboards({ userId, groupId, dashboardIds }) {
  // Chỉ check xem ở global có phải là system không, nếu không thì chỉ check permission trong chính groupId đó
  const groupRoleInfo = await getUserGroupRoleAndPermissions(userId, groupId);
  const groupPermissions = groupRoleInfo?.permissions || [];

  // super_admin không thể sửa Edit Dashboard list ở Group cấp cao nhất do nó quản lý (distance === 0), chỉ được sửa ở các Group con bên dưới (distance > 0)
  const canAssign =
    groupRoleInfo?.isSystem ||
    groupPermissions.includes("system.manage") ||
    (groupRoleInfo?.distance > 0 &&
      groupPermissions.includes("group_dashboard.assign"));

  if (!canAssign) {
    const err = new Error(
      "Bạn không có quyền chỉnh sửa danh sách Dashboard của Group cấp cao nhất do bạn quản lý",
    );
    err.statusCode = 403;
    throw err;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Kiểm tra thông tin group hiện tại (có phải là group con của group cha không)
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
      const err = new Error("Group không tồn tại");
      err.statusCode = 404;
      throw err;
    }

    const targetGroup = groupRes.rows[0];
    const parentGroupId = targetGroup.parent_group_id
      ? Number(targetGroup.parent_group_id)
      : null;

    const cleanIds = Array.from(
      new Set(
        (Array.isArray(dashboardIds) ? dashboardIds : [])
          .map((id) => Number(id))
          .filter((id) => Number.isInteger(id) && id > 0),
      ),
    );

    // Kể cả có quyền system.manage, nếu là Group con thì chỉ được gán các Dashboard đang có trong Group cha
    if (parentGroupId && cleanIds.length > 0) {
      const parentDashRes = await client.query(
        `
          SELECT dashboard_id
          FROM group_dashboards
          WHERE group_id = $1
        `,
        [parentGroupId],
      );

      const parentAllowedSet = new Set(
        parentDashRes.rows.map((r) => Number(r.dashboard_id)),
      );

      const invalidIds = cleanIds.filter((id) => !parentAllowedSet.has(id));
      if (invalidIds.length > 0) {
        const err = new Error(
          "Group con chỉ được phép gán các Dashboard đã có trong Group cha",
        );
        err.statusCode = 400;
        throw err;
      }
    }

    if (cleanIds.length === 0) {
      // Xóa toàn bộ dashboard của group này và của tất cả các group con trực thuộc
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
      // Xóa các dashboard không còn nằm trong cleanIds khỏi group hiện tại và toàn bộ các group con trực thuộc
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
    return { groupId: Number(groupId), dashboardIds: cleanIds };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

async function deleteManagedGroup({ userId, groupId }) {
  const isSystem = await isGlobalSystemUser(userId);

  const groupCheck = await pool.query(
    `SELECT id, group_name, created_by, parent_group_id FROM groups WHERE id = $1 AND is_active = TRUE LIMIT 1`,
    [groupId],
  );
  if (!groupCheck.rows[0]) {
    const err = new Error("Group không tồn tại");
    err.statusCode = 404;
    throw err;
  }

  const targetGroup = groupCheck.rows[0];
  const isCreator = Number(targetGroup.created_by) === Number(userId);

  // Quy định: Chỉ có group nào do chính user đó tạo ra mới có thể xóa group, còn admin ami (isSystem) được xóa hết
  if (!isSystem) {
    if (!isCreator) {
      const err = new Error("Bạn chỉ có thể xóa Group do chính bạn tạo ra");
      err.statusCode = 403;
      throw err;
    }

    const groupRoleInfo = await getUserGroupRoleAndPermissions(userId, groupId);
    const groupPermissions = groupRoleInfo?.permissions || [];
    const hasGroupDeletePerm =
      groupPermissions.includes("group.delete") ||
      groupPermissions.includes("system.manage");

    if (!hasGroupDeletePerm) {
      const err = new Error("Bạn không có quyền xóa Group này");
      err.statusCode = 403;
      throw err;
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Tìm toàn bộ ID của Group này và các Group con/cháu trực thuộc
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

    // Xóa toàn bộ dữ liệu liên quan trong member_dashboards, group_dashboards, group_members và groups
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
    // Gỡ liên kết parent_group_id trong nhánh trước khi xóa để không bị vướng ON DELETE RESTRICT
    await client.query(
      `UPDATE groups SET parent_group_id = NULL WHERE id = ANY($1::bigint[])`,
      [targetGroupIds],
    );
    await client.query(`DELETE FROM groups WHERE id = ANY($1::bigint[])`, [
      targetGroupIds,
    ]);

    await client.query("COMMIT");
    return {
      deletedGroupId: Number(groupId),
      deletedGroupIds: targetGroupIds,
    };
  } catch (error) {
    await client.query("ROLLBACK");
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
  updateGroupDashboards,
  deleteManagedGroup,
};
