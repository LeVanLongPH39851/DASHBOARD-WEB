/**
 * QUẢN LÝ USER (Users Management Service)
 * ------------------------------------------------------------
 * Phối hợp giữa 2 database:
 *  - Superset DB:
 *      + public.ab_user (lưu metadata user, password đã băm bằng scrypt)
 *      + public.ab_user_role (lưu role_id cố định = 6)
 *  - Custom Role DB:
 *      + user_global_roles (lưu role_id người dùng chọn trên UI, assigned_by = người tạo)
 *
 * Phân quyền:
 *  - Chỉ 3 admin (admin_ami, super_admin, group_admin) mới được truy cập.
 *  - Admin system (admin_ami hoặc có quyền system.manage): quản lý toàn bộ User.
 *  - Admin thường: chỉ quản lý User do chính mình tạo (user_global_roles.assigned_by = actorUserId).
 *  - Khi gán role: chỉ được chọn role có cấp bậc thấp hơn role của mình (admin system chọn được hết).
 */
const crypto = require("crypto");
const { rolePool, supersetPool } = require("./user.service");

// role_id cố định trong bảng ab_role của Superset cho mọi user tạo từ hệ thống
const SUPERSET_FIXED_ROLE_ID = 6;

// Tham số scrypt tương thích Werkzeug (Python generate_password_hash)
const SCRYPT_N = 32768;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const SCRYPT_KEYLEN = 64;
const SALT_CHARS =
  "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

const ROLE_RANK = {
  group_member: 1,
  group_admin: 2,
  super_admin: 3,
  admin_ami: 4,
};
const ADMIN_ROLE_CODES = ["admin_ami", "super_admin", "group_admin"];

const USERNAME_REGEX = /^[A-Za-z0-9._@-]{3,64}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function getRoleRank(roleCode) {
  return ROLE_RANK[String(roleCode || "").toLowerCase()] || 1;
}

function httpError(status, message, fieldErrors) {
  const err = new Error(message);
  err.status = status;
  if (fieldErrors) err.fieldErrors = fieldErrors;
  return err;
}

// Kết nối pool có retry và thông báo lỗi rõ ràng khi timeout
async function acquireClientWithRetry(pool, name = "database", maxRetries = 2) {
  let lastError = null;
  for (let attempt = 1; attempt <= maxRetries; attempt += 1) {
    try {
      return await pool.connect();
    } catch (err) {
      lastError = err;
      console.warn(
        `[User Management] Kết nối ${name} thất bại (lần thử ${attempt}/${maxRetries}):`,
        err.message,
      );
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 800));
      }
    }
  }
  const isTimeout =
    lastError?.message?.includes("timeout") ||
    lastError?.cause?.message?.includes("timeout") ||
    lastError?.code === "ETIMEDOUT";
  if (isTimeout) {
    throw httpError(
      504,
      `Không thể kết nối đến cơ sở dữ liệu ${name} do quá thời gian chờ (timeout). Vui lòng thử lại.`,
    );
  }
  throw lastError;
}

// ------------------------------------------------------------------
// Mã hóa mật khẩu chuẩn Werkzeug scrypt:32768:8:1$<salt>$<hex_hash>
// ------------------------------------------------------------------
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

// ------------------------------------------------------------------
// Helpers DB
// ------------------------------------------------------------------

// Lấy id tiếp theo cho bảng Superset (ưu tiên sequence, fallback MAX(id)+1)
async function nextSupersetId(client, tableName) {
  const seqName = `public.${tableName}_id_seq`;
  try {
    const { rows } = await client.query(
      `SELECT to_regclass($1) IS NOT NULL AS has_seq`,
      [seqName],
    );
    if (rows[0]?.has_seq) {
      const res = await client.query(`SELECT nextval($1::regclass) AS id`, [
        seqName,
      ]);
      return Number(res.rows[0].id);
    }
  } catch (_) {
    /* fallback to MAX+1 */
  }

  await client.query(`LOCK TABLE public.${tableName} IN EXCLUSIVE MODE`);
  const res = await client.query(
    `SELECT COALESCE(MAX(id), 0) + 1 AS id FROM public.${tableName}`,
  );
  return Number(res.rows[0].id);
}

// Thông tin quyền và cấp bậc của người đang thao tác
async function getActorContext(actorUserId) {
  const { rows } = await rolePool.query(
    `
      SELECT
        r.role_code,
        EXISTS (
          SELECT 1
          FROM role_permissions rp
          JOIN permissions p ON p.id = rp.permission_id
          WHERE rp.role_id = r.id AND p.permission_code = 'system.manage'
        ) AS is_system_role
      FROM user_global_roles ugr
      JOIN roles r ON r.id = ugr.role_id
      WHERE ugr.superset_user_id = $1
    `,
    [actorUserId],
  );

  const roleCodes = rows.map((r) => String(r.role_code || "").toLowerCase());
  const isSystem = rows.some(
    (r) => Boolean(r.is_system_role) || r.role_code === "admin_ami",
  );
  const maxRank = roleCodes.length
    ? Math.max(...roleCodes.map((c) => getRoleRank(c)))
    : 0;
  const isAdmin =
    isSystem || roleCodes.some((c) => ADMIN_ROLE_CODES.includes(c));

  return { actorUserId, isSystem, maxRank, isAdmin, roleCodes };
}

function ensureAdmin(actor) {
  if (!actor.isAdmin) {
    throw httpError(
      403,
      "Chỉ admin_ami, super_admin hoặc group_admin mới được quyền truy cập quản lý User",
    );
  }
}

// Danh sách role mà actor được phép gán (chỉ role có rank < actor.maxRank, trừ system admin)
async function getAssignableRolesForActor(actor) {
  const { rows } = await rolePool.query(
    `SELECT id, role_code, role_name, scope, description FROM roles ORDER BY id ASC`,
  );
  return rows
    .map((r) => ({
      id: Number(r.id),
      role_code: r.role_code,
      role_name: r.role_name,
      scope: r.scope,
      description: r.description,
      rank: getRoleRank(r.role_code),
    }))
    .filter((r) => actor.isSystem || r.rank < actor.maxRank)
    .sort((a, b) => b.rank - a.rank);
}

// Lấy global roles của danh sách user từ Custom Role DB
async function getGlobalRolesMap(userIds) {
  const map = new Map();
  if (!userIds || userIds.length === 0) return map;

  const { rows } = await rolePool.query(
    `
      SELECT ugr.superset_user_id, ugr.assigned_by, ugr.assigned_at,
             r.id AS role_id, r.role_code, r.role_name,
             EXISTS (
               SELECT 1
               FROM role_permissions rp
               JOIN permissions p ON p.id = rp.permission_id
               WHERE rp.role_id = r.id AND p.permission_code = 'system.manage'
             ) AS is_system_role
      FROM user_global_roles ugr
      JOIN roles r ON r.id = ugr.role_id
      WHERE ugr.superset_user_id = ANY($1::bigint[])
      ORDER BY r.id ASC
    `,
    [userIds],
  );

  rows.forEach((r) => {
    const uid = Number(r.superset_user_id);
    if (!map.has(uid)) {
      map.set(uid, { roles: [], assigned_by: null, assigned_at: null });
    }
    const entry = map.get(uid);
    entry.roles.push({
      role_id: Number(r.role_id),
      role_code: r.role_code,
      role_name: r.role_name,
      rank: getRoleRank(r.role_code),
      is_system_role: Boolean(r.is_system_role),
    });
    if (r.assigned_by && !entry.assigned_by) {
      entry.assigned_by = Number(r.assigned_by);
    }
    if (!entry.assigned_at) entry.assigned_at = r.assigned_at;
  });

  return map;
}

// Kiểm tra quyền quản lý đối tượng targetUserId (chỉ quản lý những user có trong user_global_roles)
async function assertCanManageTarget(actor, targetUserId) {
  if (Number(targetUserId) === Number(actor.actorUserId)) {
    throw httpError(
      400,
      "Không thể tự sửa hoặc xóa tài khoản của chính mình tại trang quản lý này",
    );
  }

  const roleMap = await getGlobalRolesMap([Number(targetUserId)]);
  const entry = roleMap.get(Number(targetUserId)) || null;

  if (!entry || !entry.roles || entry.roles.length === 0) {
    throw httpError(
      404,
      "Chỉ được quản lý những người dùng có trong bảng user_global_roles",
    );
  }

  const targetIsAdminAmi = entry.roles.some(
    (r) =>
      r.role_code === "admin_ami" ||
      r.rank >= 4 ||
      Boolean(r.is_system_role),
  );
  const actorIsAdminAmi =
    actor.isSystem ||
    actor.maxRank >= 4 ||
    actor.roleCodes?.includes("admin_ami");

  // Ràng buộc nghiệp vụ: Các Admin AMI không thể quản trị (chỉnh sửa hoặc xóa) lẫn nhau
  if (actorIsAdminAmi && targetIsAdminAmi) {
    throw httpError(
      403,
      "Các Admin AMI không thể quản trị (chỉnh sửa hoặc xóa) lẫn nhau",
    );
  }

  if (actor.isSystem) return entry;

  if (Number(entry.assigned_by) !== Number(actor.actorUserId)) {
    throw httpError(
      403,
      "Bạn chỉ được quyền quản lý các User do chính bạn tạo ra",
    );
  }

  const targetMaxRank = Math.max(...entry.roles.map((r) => r.rank), 0);
  if (targetMaxRank >= actor.maxRank) {
    throw httpError(
      403,
      "Không thể quản lý User có cấp bậc bằng hoặc cao hơn bạn",
    );
  }

  return entry;
}

// Lấy map username theo userIds từ Superset DB
async function getUsernameMap(ids) {
  const clean = Array.from(
    new Set(
      (ids || [])
        .map(Number)
        .filter((n) => Number.isInteger(n) && n > 0),
    ),
  );
  const map = new Map();
  if (clean.length === 0) return map;

  try {
    const { rows } = await supersetPool.query(
      `SELECT id, username, first_name, last_name FROM public.ab_user WHERE id = ANY($1::int[])`,
      [clean],
    );
    rows.forEach((r) => {
      const fn = `${r.first_name || ""} ${r.last_name || ""}`.trim();
      map.set(Number(r.id), {
        username: r.username,
        full_name: fn || r.username,
      });
    });
  } catch (err) {
    console.warn("[UserManagement getUsernameMap Warning]", err.message);
  }
  return map;
}

function mapSupersetRow(row, roleEntry, creatorMap, actor, includeAll = false) {
  const roles = roleEntry?.roles || [];
  const topRole = roles.slice().sort((a, b) => b.rank - a.rank)[0] || null;
  const assignedBy = roleEntry?.assigned_by ?? null;
  const targetMaxRank = topRole ? topRole.rank : 0;
  const isTargetAdminAmi =
    targetMaxRank >= 4 ||
    roles.some(
      (r) =>
        r.role_code === "admin_ami" ||
        r.rank >= 4 ||
        Boolean(r.is_system_role),
    );
  const isActorAdminAmi =
    actor.isSystem ||
    actor.maxRank >= 4 ||
    actor.roleCodes?.includes("admin_ami");

  const isSelf = Number(row.id) === Number(actor.actorUserId);
  const isBothAdminAmi = isActorAdminAmi && isTargetAdminAmi;

  // Các Admin AMI không thể quản trị được nhau (sửa, xóa)
  // Và không thể quản trị chính mình trên trang quản lý này
  const canManage =
    !isSelf &&
    !isBothAdminAmi &&
    (actor.isSystem ||
      (Number(assignedBy) === Number(actor.actorUserId) &&
        targetMaxRank < actor.maxRank));

  const cannotManageReason = isSelf
    ? "self"
    : isBothAdminAmi
      ? "admin_ami_peer"
      : targetMaxRank >= actor.maxRank
        ? "higher_or_equal_rank"
        : null;

  const creatorObj = assignedBy ? creatorMap.get(Number(assignedBy)) : null;

  const base = {
    id: Number(row.id),
    first_name: row.first_name || "",
    last_name: row.last_name || "",
    full_name: `${row.first_name || ""} ${row.last_name || ""}`.trim(),
    username: row.username,
    email: row.email,
    active: Boolean(row.active),
    role_id: topRole?.role_id ?? null,
    role_code: topRole?.role_code ?? null,
    role_name: topRole?.role_name ?? null,
    roles,
    created_on: row.created_on,
    assigned_by: assignedBy,
    assigned_by_username: creatorObj?.username || (assignedBy ? `#${assignedBy}` : null),
    created_by_name: creatorObj?.full_name || creatorObj?.username || null,
    can_manage: canManage,
    cannot_manage_reason: cannotManageReason,
    is_admin_ami: isTargetAdminAmi,
  };

  if (!includeAll) return base;

  const createdByObj = row.created_by_fk
    ? creatorMap.get(Number(row.created_by_fk))
    : null;
  const changedByObj = row.changed_by_fk
    ? creatorMap.get(Number(row.changed_by_fk))
    : null;

  return {
    ...base,
    created_by_name:
      creatorObj?.full_name ||
      createdByObj?.full_name ||
      creatorObj?.username ||
      createdByObj?.username ||
      null,
    last_login: row.last_login,
    login_count: Number(row.login_count || 0),
    fail_login_count: Number(row.fail_login_count || 0),
    changed_on: row.changed_on,
    created_by_fk: row.created_by_fk ? Number(row.created_by_fk) : null,
    changed_by_fk: row.changed_by_fk ? Number(row.changed_by_fk) : null,
    created_by_username:
      createdByObj?.username || (row.created_by_fk ? `#${row.created_by_fk}` : null),
    changed_by_username:
      changedByObj?.username || (row.changed_by_fk ? `#${row.changed_by_fk}` : null),
    assigned_at: roleEntry?.assigned_at || null,
  };
}

// ------------------------------------------------------------------
// Validate dữ liệu Form
// ------------------------------------------------------------------
function normalizePayload(raw = {}) {
  return {
    first_name: String(raw.first_name ?? raw.firstName ?? "").trim(),
    last_name: String(raw.last_name ?? raw.lastName ?? "").trim(),
    username: String(raw.username ?? raw.user_name ?? "").trim(),
    email: String(raw.email ?? "").trim().toLowerCase(),
    active:
      raw.active === undefined || raw.active === null
        ? true
        : raw.active === true || raw.active === "true" || raw.active === 1,
    role_id: Number(raw.role_id ?? raw.roleId),
    password: raw.password === undefined ? undefined : String(raw.password),
    confirm_password:
      raw.confirm_password === undefined && raw.confirmPassword === undefined
        ? undefined
        : String(raw.confirm_password ?? raw.confirmPassword),
  };
}

function validatePayload(data, { requirePassword }) {
  const errors = {};

  if (!data.first_name) errors.first_name = "First name không được để trống";
  else if (data.first_name.length > 64)
    errors.first_name = "First name tối đa 64 ký tự";

  if (!data.last_name) errors.last_name = "Last name không được để trống";
  else if (data.last_name.length > 64)
    errors.last_name = "Last name tối đa 64 ký tự";

  if (!data.username) errors.username = "Username không được để trống";
  else if (!USERNAME_REGEX.test(data.username))
    errors.username =
      "Username 3-64 ký tự, chỉ gồm chữ, số và các ký tự . _ @ -";

  if (!data.email) errors.email = "Email không được để trống";
  else if (data.email.length > 320) errors.email = "Email tối đa 320 ký tự";
  else if (!EMAIL_REGEX.test(data.email)) errors.email = "Email không đúng định dạng";

  if (!Number.isSafeInteger(data.role_id) || data.role_id <= 0)
    errors.role_id = "Vui lòng chọn Role cho User";

  if (requirePassword) {
    const pw = data.password || "";
    if (!pw) errors.password = "Mật khẩu không được để trống";
    else if (pw.length < 8 || pw.length > 128)
      errors.password = "Mật khẩu phải từ 8 đến 128 ký tự";
    else if (!/[a-z]/.test(pw) || !/[A-Z]/.test(pw) || !/[0-9]/.test(pw))
      errors.password =
        "Mật khẩu phải có ít nhất 1 chữ thường, 1 chữ hoa và 1 chữ số";

    if (!data.confirm_password)
      errors.confirm_password = "Vui lòng nhập xác nhận mật khẩu";
    else if (data.confirm_password !== pw)
      errors.confirm_password = "Xác nhận mật khẩu không khớp";
  }

  if (Object.keys(errors).length > 0) {
    throw httpError(400, "Dữ liệu nhập không hợp lệ", errors);
  }
}

async function assertRoleAllowed(actor, roleId) {
  const allowed = await getAssignableRolesForActor(actor);
  const role = allowed.find((r) => r.id === Number(roleId));
  if (!role) {
    throw httpError(
      400,
      "Role không hợp lệ hoặc bạn không có quyền gán Role này",
      {
        role_id: "Chỉ được chọn Role có cấp bậc thấp hơn Role của bạn",
      },
    );
  }
  return role;
}

// Kiểm tra trùng email và username trong database Superset
async function assertUniqueInSuperset(client, { email, username }, excludeId = null) {
  const { rows } = await client.query(
    `
      SELECT id, LOWER(email) AS email, LOWER(username) AS username
      FROM public.ab_user
      WHERE (LOWER(email) = LOWER($1) OR LOWER(username) = LOWER($2))
        AND ($3::int IS NULL OR id <> $3::int)
    `,
    [email, username, excludeId],
  );

  const errors = {};
  rows.forEach((r) => {
    if (r.email === email.toLowerCase())
      errors.email = "Email đã tồn tại trong database Superset";
    if (r.username === username.toLowerCase())
      errors.username = "Username đã tồn tại trong database Superset";
  });

  if (Object.keys(errors).length > 0) {
    throw httpError(409, "Thông tin bị trùng trong hệ thống", errors);
  }
}

async function rollbackQuietly(client) {
  try {
    await client.query("ROLLBACK");
  } catch (_) {
    /* ignore */
  }
}

// ------------------------------------------------------------------
// Main Service Functions
// ------------------------------------------------------------------

// Lấy danh sách Role mà user hiện tại được phép gán
async function getRoleOptions(actorUserId) {
  const actor = await getActorContext(actorUserId);
  ensureAdmin(actor);
  const roles = await getAssignableRolesForActor(actor);
  return { roles, is_system: actor.isSystem };
}

// Lấy danh sách User (chỉ thông tin cơ bản của những user có trong user_global_roles)
async function listManagedUsers(actorUserId) {
  const actor = await getActorContext(actorUserId);
  ensureAdmin(actor);

  let targetUserIds = [];
  if (actor.isSystem) {
    // Admin system: tất cả user có trong user_global_roles (trừ chính mình)
    const { rows } = await rolePool.query(
      `
        SELECT DISTINCT superset_user_id
        FROM user_global_roles
        WHERE superset_user_id <> $1
      `,
      [actor.actorUserId],
    );
    targetUserIds = rows.map((r) => Number(r.superset_user_id)).filter(Boolean);
  } else {
    // Admin thường: chỉ các user do chính mình tạo có trong user_global_roles
    const { rows: ownRows } = await rolePool.query(
      `
        SELECT DISTINCT superset_user_id
        FROM user_global_roles
        WHERE assigned_by = $1 AND superset_user_id <> $1
      `,
      [actor.actorUserId],
    );
    targetUserIds = ownRows.map((r) => Number(r.superset_user_id)).filter(Boolean);
  }

  let supersetRows = [];
  if (targetUserIds.length > 0) {
    const { rows } = await supersetPool.query(
      `
        SELECT id, first_name, last_name, username, email, active, created_on
        FROM public.ab_user
        WHERE id = ANY($1::int[])
        ORDER BY id DESC
      `,
      [targetUserIds],
    );
    supersetRows = rows;
  }

  const userIds = supersetRows.map((r) => Number(r.id));
  const roleMap = await getGlobalRolesMap(userIds);
  const creatorIds = Array.from(roleMap.values())
    .map((e) => e.assigned_by)
    .filter(Boolean);
  const creatorMap = await getUsernameMap(creatorIds);

  const users = supersetRows.map((row) =>
    mapSupersetRow(row, roleMap.get(Number(row.id)), creatorMap, actor, false),
  );

  return {
    users,
    is_system: actor.isSystem,
    actor_id: actor.actorUserId,
    is_admin_ami:
      actor.isSystem ||
      actor.maxRank >= 4 ||
      actor.roleCodes?.includes("admin_ami"),
    total: users.length,
  };
}

// Lấy chi tiết toàn bộ metadata của 1 user (chỉ những user có trong user_global_roles)
async function getManagedUserDetail(actorUserId, targetUserId) {
  const actor = await getActorContext(actorUserId);
  ensureAdmin(actor);

  const tid = Number(targetUserId);
  const roleMap = await getGlobalRolesMap([tid]);
  const entry = roleMap.get(tid);

  if (!entry || !entry.roles || entry.roles.length === 0) {
    throw httpError(
      404,
      "Chỉ được xem thông tin những người dùng có trong bảng user_global_roles",
    );
  }

  const isSelf = Number(tid) === Number(actor.actorUserId);
  const isCreator = Number(entry?.assigned_by) === Number(actor.actorUserId);

  if (!actor.isSystem && !isSelf && !isCreator) {
    throw httpError(403, "Bạn chỉ được xem các User do chính bạn tạo ra");
  }

  const { rows } = await supersetPool.query(
    `
      SELECT id, first_name, last_name, username, active, email, last_login,
             login_count, fail_login_count, created_on, changed_on,
             created_by_fk, changed_by_fk
      FROM public.ab_user
      WHERE id = $1
    `,
    [tid],
  );
  if (!rows[0]) throw httpError(404, "Không tìm thấy User trong Superset");

  const { rows: groupRows } = await rolePool.query(
    `
      SELECT g.id, g.group_name, r.role_code, r.role_name
      FROM group_members gm
      JOIN groups g ON g.id = gm.group_id
      JOIN roles r ON r.id = gm.role_id
      WHERE gm.superset_user_id = $1
      ORDER BY g.id ASC
    `,
    [tid],
  );

  const creatorMap = await getUsernameMap([
    entry?.assigned_by,
    rows[0].created_by_fk,
    rows[0].changed_by_fk,
  ]);

  return {
    ...mapSupersetRow(rows[0], entry, creatorMap, actor, true),
    groups: groupRows.map((g) => ({
      group_id: Number(g.id),
      group_name: g.group_name,
      role_code: g.role_code,
      role_name: g.role_name,
    })),
  };
}

// Thêm User mới (lưu đồng bộ ab_user + ab_user_role ở Superset, user_global_roles ở Backend)
async function createManagedUser(actorUserId, rawPayload) {
  const actor = await getActorContext(actorUserId);
  ensureAdmin(actor);

  const data = normalizePayload(rawPayload);
  validatePayload(data, { requirePassword: true });
  await assertRoleAllowed(actor, data.role_id);

  const hashed = await hashPassword(data.password);

  const ssClient = await acquireClientWithRetry(supersetPool, "Superset Metadata DB");
  const rcClient = await acquireClientWithRetry(rolePool, "Backend Role DB");
  let supersetCommitted = false;
  let newUserId = null;

  try {
    await ssClient.query("BEGIN");
    await rcClient.query("BEGIN");

    await assertUniqueInSuperset(ssClient, data);

    // 1. Lưu metadata vào bảng public.ab_user của Superset
    newUserId = await nextSupersetId(ssClient, "ab_user");
    await ssClient.query(
      `
        INSERT INTO public.ab_user (
          id, first_name, last_name, username, password, active, email,
          login_count, fail_login_count, created_on, changed_on,
          created_by_fk, changed_by_fk
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, NOW(), NOW(), $8, $8)
      `,
      [
        newUserId,
        data.first_name,
        data.last_name,
        data.username,
        hashed,
        data.active,
        data.email,
        actor.actorUserId,
      ],
    );

    // 2. Lưu vào bảng public.ab_user_role của Superset (role_id cố định = 6)
    const userRoleId = await nextSupersetId(ssClient, "ab_user_role");
    await ssClient.query(
      `INSERT INTO public.ab_user_role (id, user_id, role_id) VALUES ($1, $2, $3)`,
      [userRoleId, newUserId, SUPERSET_FIXED_ROLE_ID],
    );

    // 3. Lưu vào bảng user_global_roles của Database Backend
    await rcClient.query(
      `
        INSERT INTO user_global_roles (superset_user_id, role_id, assigned_by)
        VALUES ($1, $2, $3)
      `,
      [newUserId, data.role_id, actor.actorUserId],
    );

    // Commit Superset DB trước, nếu Role DB lỗi thì rollback / bù trừ
    await ssClient.query("COMMIT");
    supersetCommitted = true;
    await rcClient.query("COMMIT");
  } catch (error) {
    await rollbackQuietly(rcClient);
    if (!supersetCommitted) {
      await rollbackQuietly(ssClient);
    } else if (newUserId) {
      // Bù trừ: xóa user vừa thêm trong Superset nếu lưu Backend bị lỗi
      try {
        await ssClient.query(
          `DELETE FROM public.ab_user_role WHERE user_id = $1`,
          [newUserId],
        );
        await ssClient.query(`DELETE FROM public.ab_user WHERE id = $1`, [
          newUserId,
        ]);
      } catch (compErr) {
        console.error("[User Create Compensation Error]", compErr.message);
      }
    }
    if (error.code === "23505") {
      throw httpError(409, "Username hoặc Email đã tồn tại trong database Superset");
    }
    throw error;
  } finally {
    ssClient.release();
    rcClient.release();
  }

  return getManagedUserDetail(actorUserId, newUserId);
}

// Sửa thông tin User (không sửa password)
async function updateManagedUser(actorUserId, targetUserId, rawPayload) {
  const actor = await getActorContext(actorUserId);
  ensureAdmin(actor);

  const tid = Number(targetUserId);
  if (!Number.isSafeInteger(tid) || tid <= 0) {
    throw httpError(400, "targetUserId không hợp lệ");
  }

  const currentEntry = await assertCanManageTarget(actor, tid);

  const data = normalizePayload(rawPayload);
  validatePayload(data, { requirePassword: false });
  await assertRoleAllowed(actor, data.role_id);

  const ssClient = await acquireClientWithRetry(supersetPool, "Superset Metadata DB");
  const rcClient = await acquireClientWithRetry(rolePool, "Backend Role DB");

  try {
    await ssClient.query("BEGIN");
    await rcClient.query("BEGIN");

    const exists = await ssClient.query(
      `SELECT id FROM public.ab_user WHERE id = $1 FOR UPDATE`,
      [tid],
    );
    if (!exists.rows[0]) {
      throw httpError(404, "Không tìm thấy User trong Superset");
    }

    await assertUniqueInSuperset(ssClient, data, tid);

    // 1. Cập nhật metadata trong public.ab_user của Superset
    await ssClient.query(
      `
        UPDATE public.ab_user
        SET first_name = $2, last_name = $3, username = $4, active = $5,
            email = $6, changed_on = NOW(), changed_by_fk = $7
        WHERE id = $1
      `,
      [
        tid,
        data.first_name,
        data.last_name,
        data.username,
        data.active,
        data.email,
        actor.actorUserId,
      ],
    );

    // 2. Đảm bảo ab_user_role của Superset luôn có role_id = 6
    const hasRole = await ssClient.query(
      `SELECT 1 FROM public.ab_user_role WHERE user_id = $1 AND role_id = $2`,
      [tid, SUPERSET_FIXED_ROLE_ID],
    );
    if (hasRole.rowCount === 0) {
      const userRoleId = await nextSupersetId(ssClient, "ab_user_role");
      await ssClient.query(
        `INSERT INTO public.ab_user_role (id, user_id, role_id) VALUES ($1, $2, $3)`,
        [userRoleId, tid, SUPERSET_FIXED_ROLE_ID],
      );
    }

    // 3. Cập nhật role_id trong user_global_roles của Database Backend
    const assignedBy = currentEntry?.assigned_by || actor.actorUserId;
    await rcClient.query(
      `DELETE FROM user_global_roles WHERE superset_user_id = $1`,
      [tid],
    );
    await rcClient.query(
      `
        INSERT INTO user_global_roles (superset_user_id, role_id, assigned_by)
        VALUES ($1, $2, $3)
      `,
      [tid, data.role_id, assignedBy],
    );

    await rcClient.query("COMMIT");
    try {
      await ssClient.query("COMMIT");
    } catch (ssErr) {
      // Bù trừ khôi phục lại role cũ nếu Superset commit lỗi
      try {
        await rolePool.query(
          `DELETE FROM user_global_roles WHERE superset_user_id = $1`,
          [tid],
        );
        for (const r of currentEntry?.roles || []) {
          await rolePool.query(
            `INSERT INTO user_global_roles (superset_user_id, role_id, assigned_by) VALUES ($1, $2, $3)`,
            [tid, r.role_id, currentEntry.assigned_by],
          );
        }
      } catch (compErr) {
        console.error("[User Update Compensation Error]", compErr.message);
      }
      throw ssErr;
    }
  } catch (error) {
    await rollbackQuietly(rcClient);
    await rollbackQuietly(ssClient);
    if (error.code === "23505") {
      throw httpError(409, "Username hoặc Email đã tồn tại trong database Superset");
    }
    throw error;
  } finally {
    ssClient.release();
    rcClient.release();
  }

  return getManagedUserDetail(actorUserId, tid);
}

// Xóa User (xóa dữ liệu liên quan ở cả 2 database)
async function deleteManagedUser(actorUserId, targetUserId) {
  const actor = await getActorContext(actorUserId);
  ensureAdmin(actor);

  const tid = Number(targetUserId);
  if (!Number.isSafeInteger(tid) || tid <= 0) {
    throw httpError(400, "targetUserId không hợp lệ");
  }

  await assertCanManageTarget(actor, tid);

  const ssClient = await acquireClientWithRetry(supersetPool, "Superset Metadata DB");
  const rcClient = await acquireClientWithRetry(rolePool, "Backend Role DB");

  try {
    await ssClient.query("BEGIN");
    await rcClient.query("BEGIN");

    // 1. Xóa toàn bộ dữ liệu phân quyền liên quan trong Database Backend
    await rcClient.query(
      `DELETE FROM member_dashboards WHERE superset_user_id = $1`,
      [tid],
    );
    await rcClient.query(
      `DELETE FROM group_members WHERE superset_user_id = $1`,
      [tid],
    );
    await rcClient.query(
      `DELETE FROM user_global_roles WHERE superset_user_id = $1`,
      [tid],
    );

    // 2. Xóa bảng ab_user_role và ab_user trong Superset DB
    await ssClient.query(
      `DELETE FROM public.ab_user_role WHERE user_id = $1`,
      [tid],
    );
    const del = await ssClient.query(
      `DELETE FROM public.ab_user WHERE id = $1`,
      [tid],
    );
    if (del.rowCount === 0) {
      throw httpError(404, "Không tìm thấy User trong Superset");
    }

    await ssClient.query("COMMIT");
    await rcClient.query("COMMIT");
  } catch (error) {
    await rollbackQuietly(ssClient);
    await rollbackQuietly(rcClient);
    if (error.code === "23503") {
      throw httpError(
        409,
        "User này đang có dữ liệu liên kết trong Superset (Dashboard, Chart, Slice, ...) nên không thể xóa trực tiếp. Vui lòng chuyển trạng thái sang Inactive.",
      );
    }
    throw error;
  } finally {
    ssClient.release();
    rcClient.release();
  }

  return { deleted_user_id: tid };
}

module.exports = {
  hashPassword,
  getRoleOptions,
  listManagedUsers,
  getManagedUserDetail,
  createManagedUser,
  updateManagedUser,
  deleteManagedUser,
};

