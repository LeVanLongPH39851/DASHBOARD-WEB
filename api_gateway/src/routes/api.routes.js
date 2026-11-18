const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authenticate");
const authorize = require("../middleware/authorize");
const {
  ALL_ROLES,
  ADMIN_ROLES,
  HIGH_ADMIN_ROLES,
} = require("../config/roles");
const authController = require("../controllers/auth.controller");
const { loginRateLimit } = require("../middleware/rate-limit");

// -------------------------------------------------------------
// 1. Xác thực & Phiên đăng nhập (Authentication & OTP)
// -------------------------------------------------------------
router.post("/auth/login", loginRateLimit, authController.loginController);
router.post("/auth/resend-otp", authController.resendOtpController);
router.post("/auth/verify-otp", authController.verifyOtpController);
router.get("/auth/me", authenticate, authController.meController);
router.post("/auth/logout", authenticate, authController.logoutController);
router.get("/auth/permissions", authenticate, authController.roleController);

// -------------------------------------------------------------
// 2. Truy cập Dashboard (Dành cho tất cả các role hợp lệ)
// -------------------------------------------------------------
router.get(
  "/dashboards",
  authenticate,
  authorize(ALL_ROLES),
  authController.getDashboardsController,
);
router.get(
  "/auth/dashboards",
  authenticate,
  authorize(ALL_ROLES),
  authController.getDashboardsController,
);
router.get(
  "/dashboards/check-access/:target",
  authenticate,
  authorize(ALL_ROLES),
  authController.checkDashboardAccessController,
);
router.get(
  "/auth/dashboards/check-access/:target",
  authenticate,
  authorize(ALL_ROLES),
  authController.checkDashboardAccessController,
);

// -------------------------------------------------------------
// 3. Thông tin cá nhân (User Info, Profile & Đổi mật khẩu)
// -------------------------------------------------------------
router.get(
  "/users/info",
  authenticate,
  authorize(ALL_ROLES),
  authController.getUsersInfoController,
);
router.put(
  "/users/profile",
  authenticate,
  authController.updateUserProfileController,
);
router.put(
  "/users/change-password",
  authenticate,
  authController.changeUserPasswordController,
);

// -------------------------------------------------------------
// 4. Quản lý Group, Dashboard của Group & Thành viên (Role & Permission)
// -------------------------------------------------------------
router.get(
  "/groups",
  authenticate,
  authorize(ADMIN_ROLES),
  authController.getManagedGroupsController,
);
router.post(
  "/groups",
  authenticate,
  authorize(HIGH_ADMIN_ROLES),
  authController.createManagedGroupController,
);
router.put(
  "/groups/:groupId/dashboards",
  authenticate,
  authorize(HIGH_ADMIN_ROLES),
  authController.updateGroupDashboardsController,
);
router.delete(
  "/groups/:groupId",
  authenticate,
  authorize(HIGH_ADMIN_ROLES),
  authController.deleteManagedGroupController,
);

router.get(
  "/users/assignable",
  authenticate,
  authorize(ADMIN_ROLES),
  authController.getAssignableUsersController,
);
router.get(
  "/groups/:groupId/members",
  authenticate,
  authorize(ADMIN_ROLES),
  authController.getGroupMembersController,
);
router.post(
  "/groups/:groupId/members",
  authenticate,
  authorize(ADMIN_ROLES),
  authController.assignGroupMemberController,
);
router.delete(
  "/groups/:groupId/members/:targetUserId",
  authenticate,
  authorize(ADMIN_ROLES),
  authController.removeGroupMemberController,
);

// -------------------------------------------------------------
// 5. Quản lý Users (Dành cho 3 Admin: admin_ami, super_admin, group_admin)
// -------------------------------------------------------------
router.get(
  "/manage/users",
  authenticate,
  authorize(ADMIN_ROLES),
  authController.getManagedUsersController,
);
router.get(
  "/manage/roles",
  authenticate,
  authorize(ADMIN_ROLES),
  authController.getRoleOptionsController,
);
router.get(
  "/manage/users/detail",
  authenticate,
  authorize(ADMIN_ROLES),
  authController.getManagedUserDetailController,
);
router.post(
  "/manage/users",
  authenticate,
  authorize(ADMIN_ROLES),
  authController.createManagedUserController,
);
router.put(
  "/manage/users/:id",
  authenticate,
  authorize(ADMIN_ROLES),
  authController.updateManagedUserController,
);
router.put(
  "/manage/users",
  authenticate,
  authorize(ADMIN_ROLES),
  authController.updateManagedUserController,
);
router.delete(
  "/manage/users/:id",
  authenticate,
  authorize(ADMIN_ROLES),
  authController.deleteManagedUserController,
);
router.delete(
  "/manage/users",
  authenticate,
  authorize(ADMIN_ROLES),
  authController.deleteManagedUserController,
);

module.exports = router;
