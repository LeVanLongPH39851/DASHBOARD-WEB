const authService = require("../services/auth.service");
const supersetService = require("../services/superset.service");
const backendService = require("../services/backend.service");
const {
  DASHBOARD_ROUTES,
  MAPPED_DASHBOARD_IDS,
  resolveDashboardTarget,
} = require("../config/dashboards");

// Hàm hỗ trợ lưu sessionCookie từ Superset vào HttpOnly Cookie trên trình duyệt
function setSessionHttpOnlyCookies(res, sessionCookie) {
  if (!sessionCookie) return;

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
        secure: process.env.NODE_ENV === "production",
        path: "/",
        encode: (val) => val,
      });
    }
  });
}

// Đăng nhập và gửi OTP
async function loginController(req, res, next) {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        status: "error",
        message: "Username và password là bắt buộc",
      });
    }

    const result = await authService.login(username, password);

    if (result.otpRequired === false) {
      setSessionHttpOnlyCookies(res, result.sessionCookie);

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
      return res.status(error.statusCode || error.status).json({
        status: "error",
        message: error.message,
      });
    }
    next(error);
  }
}

// Gửi lại OTP
async function resendOtpController(req, res, next) {
  try {
    const { challengeId } = req.body;

    if (!challengeId) {
      return res.status(400).json({
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
    next(error);
  }
}

// Xác minh OTP
async function verifyOtpController(req, res, next) {
  try {
    const { challengeId, otp } = req.body;

    if (!challengeId || !otp) {
      return res.status(400).json({
        status: "error",
        message: "Challenge ID và OTP là bắt buộc",
      });
    }

    const result = await authService.verifyOtp(challengeId, otp);

    setSessionHttpOnlyCookies(res, result.sessionCookie);

    return res.status(200).json({
      status: "success",
      message: "Đăng nhập thành công",
      data: {
        user: result.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

// Lấy thông tin user
async function meController(req, res) {
  try {
    const userId = req.user?.profile?.id;
    if (userId) {
      const permData = await backendService.getUserPermissions(userId);
      req.user.roles = permData?.roles || [];
      req.user.permissions = permData?.permissions || [];
      req.user.global_roles = permData?.global_roles || [];
      req.user.global_permissions = permData?.global_permissions || [];
    }
  } catch (err) {
    console.warn("[Me Controller Role Lookup Warning]", err.message);
  }

  return res.json({
    status: "success",
    user: req.user,
  });
}

// Logout
async function logoutController(req, res, next) {
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
      secure: process.env.NODE_ENV === "production",
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

// Lấy thông tin user và quyền
async function roleController(req, res) {
  try {
    const userId = req.user.profile.id;

    // Lấy Role và Permission từ Backend Custom
    const user = await backendService.getUserPermissions(userId);

    // Lưu vào request
    req.user.roles = user.roles || [];
    req.user.permissions = user.permissions || [];

    return res.json({
      status: "success",
      user: req.user,
    });
  } catch (error) {
    console.error("[Role Controller Error]", error.message);

    return res.status(error.response?.status || 503).json({
      status: "error",
      message: "Unable to retrieve user permissions",
    });
  }
}

// Lấy danh sách dashboard mà user được phép xem (chỉ trong danh sách map)
async function getDashboardsController(req, res) {
  try {
    const userId = req.user.profile.id;
    const sessionCookie = req.sessionCookie || req.headers.cookie;

    // 1. Kiểm tra danh sách dashboard được phép xem từ Custom Backend
    const accessInfo = await backendService.getUserDashboards(userId);
    const canViewAll = Boolean(accessInfo?.canViewAll);
    const dbIds = Array.isArray(accessInfo?.dashboardIds)
      ? accessInfo.dashboardIds.map((id) => Number(id))
      : [];

    // Chỉ giữ các dashboard nằm trong danh sách map (58, 67, 64, 62, 80, 75)
    const allowedIds = canViewAll
      ? MAPPED_DASHBOARD_IDS
      : dbIds.filter((id) => Boolean(DASHBOARD_ROUTES[id]));

    // Nếu không có dashboard nào được phép xem -> không cần gọi Superset
    if (allowedIds.length === 0) {
      return res.status(200).json({
        status: "success",
        count: 0,
        dashboards: [],
      });
    }

    // 2. Gọi API Superset lấy danh sách dashboard
    const supersetDashboards =
      await supersetService.getDashboards(sessionCookie);

    // 3. Chỉ lọc các dashboard nằm trong allowedIds và gắn path tương ứng
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

    return res.status(error.response?.status || 503).json({
      status: "error",
      message: "Không thể lấy danh sách dashboard",
    });
  }
}

// Kiểm tra quyền truy cập vào 1 dashboard cụ thể theo slug (/dashboard/spot) hoặc id (/dashboard/62)
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
      ? accessInfo.dashboardIds.map((id) => Number(id))
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

// Bổ sung tên Dashboard và đường dẫn cho từng Group và các Group con (đệ quy)
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

// Lấy danh sách Group quản lý (cho tab Role & Permission)
async function getManagedGroupsController(req, res) {
  try {
    const userId = req.user.profile.id;
    const sessionCookie = req.sessionCookie || req.headers.cookie;

    const groupData = await backendService.getManagedGroups(userId);
    const rawGroups = groupData?.groups || [];
    const roles = groupData?.roles || [];
    const permissions = groupData?.permissions || [];
    const globalRoles = groupData?.global_roles || [];
    const globalPermissions = groupData?.global_permissions || [];

    const titleMap = new Map();
    let availableDashboards = [];

    const canAssignOrCreate =
      permissions.includes("system.manage") ||
      permissions.includes("group_dashboard.assign") ||
      permissions.includes("group.create");

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

    return res.status(error.response?.status || 503).json({
      status: "error",
      message:
        error.response?.data?.message || "Không thể lấy danh sách Group quản lý",
    });
  }
}

// Tạo Group mới
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

    return res.status(error.response?.status || 500).json({
      status: "error",
      message: error.response?.data?.message || "Không thể tạo Group mới",
    });
  }
}

// Cập nhật danh sách Dashboard cấp phát cho Group
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

    return res.status(error.response?.status || 500).json({
      status: "error",
      message:
        error.response?.data?.message ||
        "Không thể cập nhật danh sách Dashboard cho Group",
    });
  }
}

// Lấy danh sách user có thể gán vào Group (từ bảng user_global_roles + Superset DB)
async function getAssignableUsersController(req, res) {
  try {
    const userId = req.user.profile.id;
    const groupId = req.query?.groupId ? Number(req.query.groupId) : null;
    const result = await backendService.getAssignableUsers(userId, groupId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Get Assignable Users Error]", error.message);
    return res.status(error.response?.status || 500).json({
      status: "error",
      message:
        error.response?.data?.message ||
        "Không thể lấy danh sách user có thể gán",
    });
  }
}

// Lấy thông tin chi tiết cho trang User Info (của chính user đang đăng nhập)
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

    const enrichedUser = {
      ...rawUser,
      dashboards,
    };

    return res.status(200).json({
      status: "success",
      user: enrichedUser,
    });
  } catch (error) {
    console.error("[Get Users Info Error]", error.message);
    return res.status(error.response?.status || 500).json({
      status: "error",
      message:
        error.response?.data?.message || "Không thể lấy thông tin User Info",
    });
  }
}

// Cập nhật thông tin cá nhân (first_name, last_name, email) của chính user
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
    return res.status(error.response?.status || 500).json({
      status: "error",
      message:
        error.response?.data?.message || "Không thể cập nhật thông tin cá nhân",
    });
  }
}

// Đổi mật khẩu của chính user (old_password, new_password, confirm_new_password)
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
    return res.status(error.response?.status || 500).json({
      status: "error",
      message:
        error.response?.data?.message || "Không thể thay đổi mật khẩu",
    });
  }
}

// Lấy danh sách thành viên trong 1 Group
async function getGroupMembersController(req, res) {
  try {
    const userId = req.user.profile.id;
    const groupId = Number(req.params.groupId);
    const result = await backendService.getGroupMembers(userId, groupId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Get Group Members Error]", error.message);
    return res.status(error.response?.status || 500).json({
      status: "error",
      message:
        error.response?.data?.message ||
        "Không thể lấy danh sách thành viên của Group",
    });
  }
}

// Gán user làm Quản trị hoặc Thành viên của Group kèm Dashboard
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
    return res.status(error.response?.status || 500).json({
      status: "error",
      message:
        error.response?.data?.message || "Không thể gán thành viên vào Group",
    });
  }
}

// Xóa thành viên khỏi Group
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
    return res.status(error.response?.status || 500).json({
      status: "error",
      message:
        error.response?.data?.message || "Không thể xóa thành viên khỏi Group",
    });
  }
}

// Xóa Group và toàn bộ dữ liệu liên quan
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

    return res.status(error.response?.status || 500).json({
      status: "error",
      message: error.response?.data?.message || "Không thể xóa Group",
    });
  }
}

// -------------------------------------------------------------
// Users Management Controllers
// -------------------------------------------------------------
async function getManagedUsersController(req, res) {
  try {
    const userId = req.user.profile.id;
    const result = await backendService.getManagedUsers(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Get Managed Users Error]", error.message);
    return res.status(error.response?.status || 500).json({
      status: "error",
      message: error.response?.data?.message || "Không thể lấy danh sách người dùng",
      fieldErrors: error.response?.data?.fieldErrors,
    });
  }
}

async function getRoleOptionsController(req, res) {
  try {
    const userId = req.user.profile.id;
    const result = await backendService.getRoleOptions(userId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Get Role Options Error]", error.message);
    return res.status(error.response?.status || 500).json({
      status: "error",
      message: error.response?.data?.message || "Không thể lấy danh sách role",
    });
  }
}

async function getManagedUserDetailController(req, res) {
  try {
    const userId = req.user.profile.id;
    const targetUserId = req.query?.targetUserId || req.params?.id;
    const result = await backendService.getManagedUserDetail(userId, targetUserId);
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Get Managed User Detail Error]", error.message);
    return res.status(error.response?.status || 500).json({
      status: "error",
      message: error.response?.data?.message || "Không thể lấy chi tiết người dùng",
    });
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
    return res.status(error.response?.status || 500).json({
      status: "error",
      message: error.response?.data?.message || "Không thể tạo người dùng mới",
      fieldErrors: error.response?.data?.fieldErrors,
    });
  }
}

async function updateManagedUserController(req, res) {
  try {
    const userId = req.user.profile.id;
    const targetUserId = req.params?.id || req.body?.targetUserId || req.body?.id;
    const result = await backendService.updateManagedUser({
      ...req.body,
      userId,
      targetUserId,
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Update Managed User Error]", error.message);
    return res.status(error.response?.status || 500).json({
      status: "error",
      message: error.response?.data?.message || "Không thể cập nhật người dùng",
      fieldErrors: error.response?.data?.fieldErrors,
    });
  }
}

async function deleteManagedUserController(req, res) {
  try {
    const userId = req.user.profile.id;
    const targetUserId = req.params?.id || req.body?.targetUserId || req.body?.id;
    const result = await backendService.deleteManagedUser({
      userId,
      targetUserId,
    });
    return res.status(200).json(result);
  } catch (error) {
    console.error("[Delete Managed User Error]", error.message);
    return res.status(error.response?.status || 500).json({
      status: "error",
      message: error.response?.data?.message || "Không thể xóa người dùng",
    });
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
