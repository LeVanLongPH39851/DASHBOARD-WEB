const express = require("express");

const router = express.Router();

const authenticate = require("../middleware/authenticate");

const authorize = require("../middleware/authorize");

const forwardRequest = require("../services/proxy.service");

const services = require("../config/services");

const authController = require("../controllers/auth.controller");

const { loginRateLimit } = require("../middleware/rate-limit");

router.post("/auth/login", loginRateLimit, authController.loginController);

// Gửi lại OTP
router.post("/auth/resend-otp", authController.resendOtpController);

// Xác minh OTP
router.post("/auth/verify-otp", authController.verifyOtpController);

// Lấy thông tin user
router.get("/auth/me", authenticate, authController.meController);

// Logout
router.post("/auth/logout", authenticate, authController.logoutController);

router.get("/auth/permissions", authenticate, authController.roleController);

// Lấy danh sách dashboard user được phép xem
router.get(
  "/dashboards",
  authenticate,
  authorize("dashboard.view"),
  authController.getDashboardsController,
);
router.get(
  "/auth/dashboards",
  authenticate,
  authorize("dashboard.view"),
  authController.getDashboardsController,
);

// Kiểm tra quyền truy cập vào 1 dashboard cụ thể (theo slug hoặc id)
router.get(
  "/dashboards/check-access/:target",
  authenticate,
  authorize("dashboard.view"),
  authController.checkDashboardAccessController,
);
router.get(
  "/auth/dashboards/check-access/:target",
  authenticate,
  authorize("dashboard.view"),
  authController.checkDashboardAccessController,
);

// Quản lý Group và danh sách Dashboard cấp phát cho Group (Role & Permission)
router.get(
  "/groups",
  authenticate,
  authorize("group.view"),
  authController.getManagedGroupsController,
);
router.post(
  "/groups",
  authenticate,
  authorize("group.create"),
  authController.createManagedGroupController,
);
router.put(
  "/groups/:groupId/dashboards",
  authenticate,
  authorize("group_dashboard.assign"),
  authController.updateGroupDashboardsController,
);

// Quản lý thành viên trong Group & thông tin User Info
router.get(
  "/users/info",
  authenticate,
  authorize("dashboard.view"),
  authController.getUsersInfoController,
);
router.get(
  "/users/assignable",
  authenticate,
  authorize(["member.create", "member.view", "group_admin.assign"]),
  authController.getAssignableUsersController,
);
router.get(
  "/groups/:groupId/members",
  authenticate,
  authorize(["member.view", "group.view"]),
  authController.getGroupMembersController,
);
router.post(
  "/groups/:groupId/members",
  authenticate,
  authorize(["member.create", "member.update", "group_admin.assign", "member_dashboard.assign"]),
  authController.assignGroupMemberController,
);
router.delete(
  "/groups/:groupId/members/:targetUserId",
  authenticate,
  authorize("system.manage"),
  authController.removeGroupMemberController,
);

router.use("/backend", authenticate, (req, res) => {
  forwardRequest(req, res, services.backend);
});

module.exports = router;
