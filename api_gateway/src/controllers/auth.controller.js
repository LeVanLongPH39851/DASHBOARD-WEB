const authService = require("../services/auth.service");
const supersetService = require("../services/superset.service");
const backendService = require("../services/backend.service");
const {
  DASHBOARD_ROUTES,
  MAPPED_DASHBOARD_IDS,
  resolveDashboardTarget,
} = require("../config/dashboards");
const {
  HIGH_ADMIN_ROLES,
  hasAllowedRole,
  getPermissionsForRoles,
} = require("../config/roles");

// Kiểm tra kết nối có an toàn (HTTPS) hay không
function isRequestSecure(req) {
  if (process.env.COOKIE_SECURE !== undefined) {
    return process.env.COOKIE_SECURE === "true";
  }

  // Tự động nhận diện HTTPS từ req hoặc qua header reverse proxy (Nginx, Traefik, ALB, Cloudflare...)
  if (req) {
    return Boolean(
      req.secure ||
        req.headers["x-forwarded-proto"] === "https" ||
        req.headers["x-forwarded-protocol"] === "https",
    );
  }

  return false;
}

// Lưu sessionCookie từ Superset vào HttpOnly Cookie trên trình duyệt
function setSessionHttpOnlyCookies(res, sessionCookie, req = null) {
  if (!sessionCookie) return;

  const isSecure = isRequestSecure(req);
  const cookies = sessionCookie
    .split(";")
    .map((c) => c.trim())
    .filter(Boolean);

  cookies.forEach((item) => {
    const index = item.indexOf("=");
    if (index > 0) {
      const name = item.substring(0, index).trim();
      const value = item.substring(index + 1).trim();

      res.cookie(name, value, {
        httpOnly: true,
        sameSite: "lax",
        secure: isSecure,
        path: "/",
        encode: (val) => val,
      });
    }
  });
}

// Helper trả lỗi chuẩn hóa từ các Controller
function sendGatewayError(res, error, fallbackMessage, defaultStatus = 500) {
  const status =
    error.response?.status || error.statusCode || error.status || defaultStatus;
  const message =
    error.response?.data?.message || error.message || fallbackMessage;
  const fieldErrors = error.response?.data?.fieldErrors || error.fieldErrors;

  return res.status(status).json({
    status: "error",
    message,
    ...(fieldErrors ? { fieldErrors } : {}),
  });
}

// -------------------------------------------------------------
// 1. Xác thực & Phiên đăng nhập (Authentication & OTP)
// -------------------------------------------------------------
async function loginController(req, res, next) {
  try {
    const { username, password } = req.body || {};

    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username và password là bắt buộc",
      });
    }

    const result = await authService.login(username, password);

    if (result.otpRequired === false) {
      setSessionHttpOnlyCookies(res, result.sessionCookie, req);

      return res.status(200).json({
        status: "success",
        message: "Đăng nhập thành công",
        data: {
          user: result.user,
        },
      });
    }

    return res.status(202).json({
      status: "otp_required",
      message: "OTP đã được gửi đến email",
      data: result,
    });
  } catch (error) {
    if (error.statusCode || error.status) {
      return sendGatewayError(res, error, "Đăng nhập thất bại");
    }
    return next(error);
  }
}

async function resendOtpController(req, res, next) {
  try {
    const { challengeId } = req.body || {};

    if (!challengeId) {
      return res.status(400).json({
        status: "error",
        message: "Thiếu challengeId",
      });
    }

    const result = await authService.resendOtp(challengeId);

    return res.status(200).json({
      success: true,
      message: "Gửi lại OTP thành công",
      data: result,
    });
  } catch (error) {
    return next(error);
  }
}

async function verifyOtpController(req, res, next) {
  try {
    const { challengeId, otp } = req.body || {};

    if (!challengeId || !otp) {
      return res.status(400).json({
        status: "error",
        message: "Challenge ID và OTP là bắt buộc",
      });
    }

    const result = await authService.verifyOtp(challengeId, otp);
    setSessionHttpOnlyCookies(res, result.sessionCookie, req);

    return res.status(200).json({
      status: "success",
      message: "Đăng nhập thành công",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    return next(error);
  }
}

async function meController(req, res) {
  try {
    const userId = req.user?.profile?.id;
    if (userId) {
      const permData = await backendService.getUserPermissions(userId);
      const roles = permData?.roles || [];
      const globalRoles = permData?.global_roles || roles;

      req.user.roles = roles;
      req.user.permissions =
        permData?.permissions || getPermissionsForRoles(roles);
      req.user.global_roles = globalRoles;
      req.user.global_permissions =
        permData?.global_permissions || getPermissionsForRoles(globalRoles);
    }
  } catch (err) {
    console.warn("[Me Controller Role Lookup Warning]", err.message);
  }

  return res.json({
    status: "success",
    user: req.user,
  });
}

async function logoutController(req, res) {
  try {
    const sessionCookie = req.headers.cookie;

    if (!sessionCookie) {
      return res.status(401).json({
        status: "error",
        message: "Chưa đăng nhập",
      });
    }

    await supersetService.logout(sessionCookie);

    res.clearCookie("session", {
      httpOnly: true,
      sameSite: "lax",
      secure: isRequestSecure(req),
      path: "/",
    });

    return res.status(200).json({
      status: "success",
      message: "Đăng xuất thành công",
    });
  } catch (error) {
    console.error("[Logout Error]", error.message);
    return res.status(500).json({
      status: "error",
      message: "Đăng xuất thất bại",
    });
  }
}

async function roleController(req, res) {
  try {
    const userId = req.user.profile.id;
    const user = await backendService.getUserPermissions(userId);
    const roles = user.roles || [];
    const globalRoles = user.global_roles || roles;

    req.user.roles = roles;
    req.user.permissions =
      user.permissions || getPermissionsForRoles(roles);
    req.user.global_roles = globalRoles;
    req.user.global_permissions =
      user.global_permissions || getPermissionsForRoles(globalRoles);

    return res.json({
      status: "success",
      user: req.user,
    });
  } catch (error) {
    console.error("[Role Controller Error]", error.message);
    return sendGatewayError(
      res,
      error,
      "Unable to retrieve user permissions",
      503,
    );
  }
}

// -------------------------------------------------------------
// 2. Truy cập Dashboard
// -------------------------------------------------------------
async function getDashboardsController(req, res) {
  try {
    const userId = req.user.profile.id;
    const sessionCookie = req.sessionCookie || req.headers.cookie;

    const accessInfo = await backendService.getUserDashboards(userId);
    const canViewAll = Boolean(accessInfo?.canViewAll);
    const dbIds = Array.isArray(accessInfo?.dashboardIds)
      ? accessInfo.dashboardIds.map(Number)
      : [];

    const allowedIds = canViewAll
      ? MAPPED_DASHBOARD_IDS
      : dbIds.filter((id) => Boolean(DASHBOARD_ROUTES[id]));

    if (allowedIds.length === 0) {
      return res.status(200).json({
        status: "success",
        count: 0,
        dashboards: [],
      });
    }

    const supersetDashboards =
      await supersetService.getDashboards(sessionCookie);

    const allowedSet = new Set(allowedIds);
    const dashboards = supersetDashboards
      .filter((item) => allowedSet.has(Number(item.id)))
      .map((item) => {
        const routeInfo = DASHBOARD_ROUTES[Number(item.id)];
        return {
          id: Number(item.id),
          dashboard_title: item.dashboard_title,
          slug: routeInfo.slug,
          path: routeInfo.path,
        };
      });

    return res.status(200).json({
      status: "success",
      count: dashboards.length,
      dashboards,
    });
  } catch (error) {
    console.error("[Get Dashboards Error]", error.message);
    return sendGatewayError(
      res,
      error,
      "Không thể lấy danh sách dashboard",
      503,
    );
  }
}

async function checkDashboardAccessController(req, res) {
  try {
    const { target } = req.params;
    const dashboardInfo = resolveDashboardTarget(target);

    if (!dashboardInfo) {
      return res.status(404).json({
        status: "error",
        allowed: false,
        message: "Dashboard không tồn tại trong hệ thống",
      });
    }

    const userId = req.user.profile.id;
    const accessInfo = await backendService.getUserDashboards(userId);
    const canViewAll = Boolean(accessInfo?.canViewAll);
    const allowedIds = Array.isArray(accessInfo?.dashboardIds)
      ? accessInfo.dashboardIds.map(Number)
      : [];

    const isAllowed = canViewAll || allowedIds.includes(dashboardInfo.id);

    if (!isAllowed) {
      return res.status(403).json({
        status: "error",
        allowed: false,
        message: "Bạn không có quyền truy cập Dashboard này",
      });
    }

    return res.status(200).json({
      status: "success",
      allowed: true,
      dashboard: dashboardInfo,
    });
  } catch (error) {
    console.error("[Check Dashboard Access Error]", error.message);
    return res.status(error.response?.status || 503).json({
      status: "error",
      allowed: false,
      message: "Không thể kiểm tra quyền truy cập Dashboard",
    });
  }
}

// -------------------------------------------------------------
// 3. Quản lý Group & Thành viên trong Group (Role & Permission)
// -------------------------------------------------------------
function enrichGroupTreeWithDashboards(groups, titleMap) {
  return (Array.isArray(groups) ? groups : []).map((group) => {
    const enrichedDashboards = (group.dashboards || [])
      .filter((d) => Boolean(DASHBOARD_ROUTES[Number(d.dashboard_id)]))
      .map((d) => {
        const id = Number(d.dashboard_id);
        const routeInfo = DASHBOARD_ROUTES[id];
        return {
          id,
          dashboard_title: titleMap.get(id) || `Dashboard #${id}`,
          path: routeInfo?.path || `/dashboard/${id}`,
          slug: routeInfo?.slug || String(id),
          created_at: d.created_at,
          assigned_by: d.assigned_by,
        };
      });

    return {
      ...group,
      dashboards: enrichedDashboards,
      children: enrichGroupTreeWithDashboards(group.children || [], titleMap),
    };
  });
}

async function getManagedGroupsController(req, res) {
  try {
    const userId = req.user.profile.id;
    const sessionCookie = req.sessionCookie || req.headers.cookie;

    const groupData = await backendService.getManagedGroups(userId);
    const rawGroups = groupData?.groups || [];
    const roles = groupData?.roles || [];
    const globalRoles = groupData?.global_roles || roles;
    const permissions =
      groupData?.permissions || getPermissionsForRoles(roles);
    const globalPermissions =
      groupData?.global_permissions || getPermissionsForRoles(globalRoles);

    const titleMap = new Map();
    let availableDashboards = [];

    const canAssignOrCreate = hasAllowedRole(globalRoles, HIGH_ADMIN_ROLES);

    if (rawGroups.length > 0 || canAssignOrCreate) {
      try {
        const supersetDashboards =
          await supersetService.getDashboards(sessionCookie);
        supersetDashboards.forEach((d) => {
          titleMap.set(Number(d.id), d.dashboard_title);
        });

        availableDashboards = supersetDashboards
          .filter((d) => Boolean(DASHBOARD_ROUTES[Number(d.id)]))
          .map((d) => ({
            id: Number(d.id),
            dashboard_title: d.dashboard_title,
            path: DASHBOARD_ROUTES[Number(d.id)].path,
          }));
      } catch (err) {
        console.warn("[Superset Dashboard Title Lookup Warning]", err.message);
      }
    }

    const groups = enrichGroupTreeWithDashboards(rawGroups, titleMap);

    return res.status(200).json({
      status: "success",
      roles,
      permissions,
      global_roles: globalRoles,
      global_permissions: globalPermissions,
      groups,
      availableDashboards,
    });
  } catch (error) {
    console.error("[Get Managed Groups Error]", error.message);
    return sendGatewayError(
      res,
      error,
      "Không thể lấy danh sách Group quản lý",
      503,
    );
  }
}

async function createManagedGroupController(req, res) {
  try {
    const userId = req.user.profile.id;
    const { groupName, description, parentGroupId } = req.body || {};

    const result = await backendService.createManagedGroup({
      userId,
      groupName,
      description,
      parentGroupId,
    });

    return res.status(201).json(result);
  } catch (error) {
    console.error("[Create Group Error]", error.message);
    return sendGatewayError(res, error, "Không thể tạo Group mới");
  }
}

async function updateGroupDashboardsController(req, res) {
  try {
    const userId = req.user.profile.id;
    const groupId = Number(req.params.groupId);
    const { dashboardIds } = req.body || {};

    const result = await backendService.updateGroupDashboards({
      userId,
      groupId,
      dashboardIds,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("[Update Group Dashboards Error]", error.message);
    return sendGatewayError(
      res,
      error,
      "Không thể cập nhật danh sách Dashboard cho Group",
    );
  }
}

async function deleteManagedGroupController(req, res) {
  try {
    const userId = req.user.profile.id;
    const groupId = Number(req.params.groupId);

    const result = await backendService.deleteManagedGroup({
      userId,
      groupId,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("[Delete Group Error]", error.message);
    return sendGatewayError(res, error, "Không thể xóa Group");
  }
}

async function getAssignableUsersController(req, res) {
  try {
    const userId = req.user.profile.id;
    const groupId = req.query?.groupId ? Number(req.query.groupId) : null;
    const result = await backendService.getAssignableUsers(userId, groupId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Get Assignable Users Error]", error.message);
    return sendGatewayError(
      res,
      error,
      "Không thể lấy danh sách user có thể gán",
    );
  }
}

async function getGroupMembersController(req, res) {
  try {
    const userId = req.user.profile.id;
    const groupId = Number(req.params.groupId);
    const result = await backendService.getGroupMembers(userId, groupId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Get Group Members Error]", error.message);
    return sendGatewayError(
      res,
      error,
      "Không thể lấy danh sách thành viên của Group",
    );
  }
}

async function assignGroupMemberController(req, res) {
  try {
    const userId = req.user.profile.id;
    const groupId = Number(req.params.groupId);
    const { targetUserId, roleCode, dashboardIds } = req.body || {};

    const result = await backendService.assignGroupMember({
      userId,
      groupId,
      targetUserId,
      roleCode,
      dashboardIds,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("[Assign Group Member Error]", error.message);
    return sendGatewayError(res, error, "Không thể gán thành viên vào Group");
  }
}

async function removeGroupMemberController(req, res) {
  try {
    const userId = req.user.profile.id;
    const groupId = Number(req.params.groupId);
    const targetUserId = Number(req.params.targetUserId);

    const result = await backendService.removeGroupMember({
      userId,
      groupId,
      targetUserId,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("[Remove Group Member Error]", error.message);
    return sendGatewayError(
      res,
      error,
      "Không thể xóa thành viên khỏi Group",
    );
  }
}

// -------------------------------------------------------------
// 4. Thông tin cá nhân (User Info, Profile & Đổi mật khẩu)
// -------------------------------------------------------------
async function getUsersInfoController(req, res) {
  try {
    const userId = req.user.profile.id;
    const sessionCookie = req.sessionCookie || req.headers.cookie;

    const infoData = await backendService.getUsersInfo(userId);
    const rawUser =
      infoData?.user ||
      (Array.isArray(infoData?.users) ? infoData.users[0] : null);

    if (!rawUser) {
      return res.status(404).json({
        status: "error",
        message: "Không tìm thấy thông tin User",
      });
    }

    const titleMap = new Map();
    try {
      const supersetDashboards =
        await supersetService.getDashboards(sessionCookie);
      supersetDashboards.forEach((d) => {
        titleMap.set(Number(d.id), d.dashboard_title);
      });
    } catch (err) {
      console.warn("[UsersInfo Superset Lookup Warning]", err.message);
    }

    const rawIds = rawUser.can_view_all_dashboards
      ? MAPPED_DASHBOARD_IDS
      : (rawUser.dashboard_ids || []).filter((id) =>
          Boolean(DASHBOARD_ROUTES[Number(id)]),
        );

    const dashboards = rawIds.map((id) => {
      const numId = Number(id);
      return {
        id: numId,
        dashboard_title: titleMap.get(numId) || `Dashboard #${numId}`,
        path: DASHBOARD_ROUTES[numId]?.path || `/dashboard/${numId}`,
      };
    });

    return res.status(200).json({
      status: "success",
      user: {
        ...rawUser,
        dashboards,
      },
    });
  } catch (error) {
    console.error("[Get Users Info Error]", error.message);
    return sendGatewayError(res, error, "Không thể lấy thông tin User Info");
  }
}

async function updateUserProfileController(req, res) {
  try {
    const userId = req.user.profile.id;
    const { first_name, last_name, email } = req.body || {};
    const result = await backendService.updateUserProfile(userId, {
      first_name,
      last_name,
      email,
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Update User Profile Error]", error.message);
    return sendGatewayError(
      res,
      error,
      "Không thể cập nhật thông tin cá nhân",
    );
  }
}

async function changeUserPasswordController(req, res) {
  try {
    const userId = req.user.profile.id;
    const { old_password, new_password, confirm_new_password } = req.body || {};
    const result = await backendService.changeUserPassword(userId, {
      old_password,
      new_password,
      confirm_new_password,
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Change User Password Error]", error.message);
    return sendGatewayError(res, error, "Không thể thay đổi mật khẩu");
  }
}

// -------------------------------------------------------------
// 5. Quản lý Users (Dành cho 3 Admin: admin_ami, super_admin, group_admin)
// -------------------------------------------------------------
async function getManagedUsersController(req, res) {
  try {
    const userId = req.user.profile.id;
    const result = await backendService.getManagedUsers(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Get Managed Users Error]", error.message);
    return sendGatewayError(res, error, "Không thể lấy danh sách người dùng");
  }
}

async function getRoleOptionsController(req, res) {
  try {
    const userId = req.user.profile.id;
    const result = await backendService.getRoleOptions(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Get Role Options Error]", error.message);
    return sendGatewayError(res, error, "Không thể lấy danh sách role");
  }
}

async function getManagedUserDetailController(req, res) {
  try {
    const userId = req.user.profile.id;
    const targetUserId = req.query?.targetUserId || req.params?.id;
    const result = await backendService.getManagedUserDetail(
      userId,
      targetUserId,
    );
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Get Managed User Detail Error]", error.message);
    return sendGatewayError(res, error, "Không thể lấy chi tiết người dùng");
  }
}

async function createManagedUserController(req, res) {
  try {
    const userId = req.user.profile.id;
    const result = await backendService.createManagedUser({
      ...req.body,
      userId,
    });
    return res.status(201).json(result);
  } catch (error) {
    console.error("[Create Managed User Error]", error.message);
    return sendGatewayError(res, error, "Không thể tạo người dùng mới");
  }
}

async function updateManagedUserController(req, res) {
  try {
    const userId = req.user.profile.id;
    const targetUserId =
      req.params?.id || req.body?.targetUserId || req.body?.id;
    const result = await backendService.updateManagedUser({
      ...req.body,
      userId,
      targetUserId,
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Update Managed User Error]", error.message);
    return sendGatewayError(res, error, "Không thể cập nhật người dùng");
  }
}

async function deleteManagedUserController(req, res) {
  try {
    const userId = req.user.profile.id;
    const targetUserId =
      req.params?.id || req.body?.targetUserId || req.body?.id;
    const result = await backendService.deleteManagedUser({
      userId,
      targetUserId,
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Delete Managed User Error]", error.message);
    return sendGatewayError(res, error, "Không thể xóa người dùng");
  }
}

module.exports = {
  loginController,
  resendOtpController,
  verifyOtpController,
  meController,
  logoutController,
  roleController,
  getDashboardsController,
  checkDashboardAccessController,
  getManagedGroupsController,
  createManagedGroupController,
  updateGroupDashboardsController,
  deleteManagedGroupController,
  getAssignableUsersController,
  getUsersInfoController,
  updateUserProfileController,
  changeUserPasswordController,
  getGroupMembersController,
  assignGroupMemberController,
  removeGroupMemberController,
  getManagedUsersController,
  getRoleOptionsController,
  getManagedUserDetailController,
  createManagedUserController,
  updateManagedUserController,
  deleteManagedUserController,
};
