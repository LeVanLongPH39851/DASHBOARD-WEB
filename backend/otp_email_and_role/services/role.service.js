const { Pool } = require("pg");

const pool = new Pool({
  host: process.env.POSTGRES_HOST || "localhost",
  port: Number(process.env.POSTGRES_PORT || 5433),
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  connectionTimeoutMillis: 5000,
});

pool.on("error", (error) => {
  console.error("[Role Database Pool Error]", error.message);
});

async function getUserRoles(userId) {
  const { rows } = await pool.query(
    `
      WITH assigned_roles AS (
        SELECT role_id
        FROM user_global_roles
        WHERE superset_user_id = $1

        UNION

        SELECT gm.role_id
        FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.superset_user_id = $1
          AND g.is_active = TRUE
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
        ) AS permissions
    `,
    [userId],
  );

  return rows[0];
}

async function getUserAccessibleDashboards(userId) {
  const { rows } = await pool.query(
    `
      WITH RECURSIVE assigned_roles AS (
        SELECT role_id
        FROM user_global_roles
        WHERE superset_user_id = $1

        UNION

        SELECT gm.role_id
        FROM group_members gm
        JOIN groups g ON g.id = gm.group_id
        WHERE gm.superset_user_id = $1
          AND g.is_active = TRUE
      ),
      user_permissions AS (
        SELECT DISTINCT p.permission_code
        FROM assigned_roles ar
        JOIN role_permissions rp ON rp.role_id = ar.role_id
        JOIN permissions p ON p.id = rp.permission_id
      ),
      has_system_manage AS (
        SELECT EXISTS (
          SELECT 1
          FROM user_permissions
          WHERE permission_code = 'system.manage'
        ) AS can_view_all
      ),
      -- Phân loại quyền trên từng role (quản lý cấp cao vs quản lý cấp group)
      role_capabilities AS (
        SELECT
          r.id AS role_id,
          BOOL_OR(p.permission_code IN (
            'system.manage',
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
        -- Các group mà user có quyền quản lý cấp cao hoặc quản lý cấp group (hoặc là người tạo group)
        SELECT
          g.id,
          (COALESCE(rc.is_high_admin, FALSE) OR g.created_by = $1) AS can_manage_children
        FROM groups g
        LEFT JOIN group_members gm
          ON gm.group_id = g.id AND gm.superset_user_id = $1
        LEFT JOIN role_capabilities rc
          ON rc.role_id = gm.role_id
        WHERE g.is_active = TRUE
          AND (
            COALESCE(rc.is_high_admin, FALSE)
            OR COALESCE(rc.is_group_admin, FALSE)
            OR g.created_by = $1
          )

        UNION

        -- Đệ quy xuống các group con nếu ở group cha user có quyền quản lý cấp cao (can_manage_children = TRUE)
        SELECT
          child.id,
          mg.can_manage_children
        FROM groups child
        JOIN managed_groups mg ON child.parent_group_id = mg.id
        WHERE child.is_active = TRUE
          AND (mg.can_manage_children = TRUE OR child.created_by = $1)
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
  const roles = roleInfo?.roles || [];
  const permissions = roleInfo?.permissions || [];

  // Kiểm tra hoàn toàn theo permissions
  const canManageSystem = permissions.includes("system.manage");
  const isHighLevelAdmin =
    !canManageSystem &&
    (permissions.includes("group.create") ||
      permissions.includes("group_admin.assign") ||
      permissions.includes("group_dashboard.assign"));
  const isLowLevelGroupAdmin =
    !canManageSystem &&
    !isHighLevelAdmin &&
    (permissions.includes("member_dashboard.assign") ||
      permissions.includes("member_dashboard.revoke") ||
      permissions.includes("member.create") ||
      permissions.includes("member.update") ||
      permissions.includes("member.delete"));

  let groupRows = [];

  if (canManageSystem) {
    // Có quyền system.manage: Xem tất cả các group và các group con
    const { rows } = await pool.query(
      `
        SELECT id, group_name, description, parent_group_id, created_by, is_active, created_at, updated_at
        FROM groups
        WHERE is_active = TRUE
        ORDER BY id ASC
      `,
    );
    groupRows = rows;
  } else if (isHighLevelAdmin) {
    // Có quyền quản lý cấp cao (group.create / group_admin.assign / group_dashboard.assign):
    // Xem các group mình quản lý và đệ quy toàn bộ các group con của các group đó
    const { rows } = await pool.query(
      `
        WITH RECURSIVE role_capabilities AS (
          SELECT
            r.id AS role_id,
            BOOL_OR(p.permission_code IN (
              'system.manage',
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
            (COALESCE(rc.is_high_admin, FALSE) OR g.created_by = $1) AS can_manage_children
          FROM groups g
          LEFT JOIN group_members gm
            ON gm.group_id = g.id AND gm.superset_user_id = $1
          LEFT JOIN role_capabilities rc
            ON rc.role_id = gm.role_id
          WHERE g.is_active = TRUE
            AND (
              COALESCE(rc.is_high_admin, FALSE)
              OR COALESCE(rc.is_group_admin, FALSE)
              OR g.created_by = $1
            )

          UNION

          SELECT
            child.id,
            child.group_name,
            child.description,
            child.parent_group_id,
            child.created_by,
            child.is_active,
            child.created_at,
            child.updated_at,
            mt.can_manage_children
          FROM groups child
          JOIN managed_tree mt ON child.parent_group_id = mt.id
          WHERE child.is_active = TRUE
            AND (mt.can_manage_children = TRUE OR child.created_by = $1)
        )
        SELECT DISTINCT id, group_name, description, parent_group_id, created_by, is_active, created_at, updated_at
        FROM managed_tree
        ORDER BY id ASC
      `,
      [userId],
    );
    groupRows = rows;
  } else if (isLowLevelGroupAdmin) {
    // Có quyền quản lý cấp group (member_dashboard.assign / member.*):
    // Chỉ xem đúng group mình được cấp phát quản lý
    const { rows } = await pool.query(
      `
        SELECT DISTINCT g.id, g.group_name, g.description, g.parent_group_id, g.created_by, g.is_active, g.created_at, g.updated_at
        FROM groups g
        JOIN group_members gm ON gm.group_id = g.id
        JOIN role_permissions rp ON rp.role_id = gm.role_id
        JOIN permissions p ON p.id = rp.permission_id
        WHERE gm.superset_user_id = $1
          AND g.is_active = TRUE
          AND p.permission_code IN (
            'member_dashboard.assign',
            'member_dashboard.revoke',
            'member.create',
            'member.update',
            'member.delete'
          )
        ORDER BY g.id ASC
      `,
      [userId],
    );
    groupRows = rows;
  }

  if (groupRows.length === 0) {
    return {
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
      children: [],
    });
  });

  const rootGroups = [];
  nodeMap.forEach((node) => {
    // Nếu là admin cấp thấp thì hiển thị thẳng group được cấp phát; nếu là admin cấp cao thì dựng cây cha - con
    if (
      !isLowLevelGroupAdmin &&
      node.parent_group_id &&
      nodeMap.has(node.parent_group_id)
    ) {
      nodeMap.get(node.parent_group_id).children.push(node);
    } else {
      rootGroups.push(node);
    }
  });

  return {
    roles,
    permissions,
    groups: rootGroups,
  };
}

async function createManagedGroup({
  userId,
  groupName,
  description,
  parentGroupId,
}) {
  const roleInfo = await getUserRoles(userId);
  const permissions = roleInfo?.permissions || [];

  const canCreate =
    permissions.includes("system.manage") ||
    permissions.includes("group.create");

  if (!canCreate) {
    const err = new Error("Bạn không có quyền tạo Group");
    err.statusCode = 403;
    throw err;
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

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

    // Nếu người tạo không có system.manage mà có quyền group.create, tự động gán họ vào group_members với role có quyền group.create
    if (!permissions.includes("system.manage")) {
      const roleRes = await client.query(
        `
          SELECT r.id
          FROM roles r
          JOIN role_permissions rp ON rp.role_id = r.id
          JOIN permissions p ON p.id = rp.permission_id
          WHERE p.permission_code IN ('group.create', 'group_dashboard.assign', 'group_admin.assign')
            AND NOT EXISTS (
              SELECT 1
              FROM role_permissions rp2
              JOIN permissions p2 ON p2.id = rp2.permission_id
              WHERE rp2.role_id = r.id AND p2.permission_code = 'system.manage'
            )
          ORDER BY r.id ASC
          LIMIT 1
        `,
      );
      if (roleRes.rows[0]) {
        await client.query(
          `
            INSERT INTO group_members (group_id, superset_user_id, role_id, created_by)
            VALUES ($1, $2, $3, $2)
            ON CONFLICT (group_id, superset_user_id) DO NOTHING
          `,
          [newGroup.id, userId, roleRes.rows[0].id],
        );
      }
    }

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
  const roleInfo = await getUserRoles(userId);
  const permissions = roleInfo?.permissions || [];

  const canAssign =
    permissions.includes("system.manage") ||
    permissions.includes("group_dashboard.assign");

  if (!canAssign) {
    const err = new Error("Bạn không có quyền chỉnh sửa Dashboard của Group");
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

module.exports = {
  getUserRoles,
  getUserAccessibleDashboards,
  getManagedGroups,
  createManagedGroup,
  updateGroupDashboards,
};
