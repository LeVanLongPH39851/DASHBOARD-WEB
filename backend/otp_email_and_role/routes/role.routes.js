const express = require("express");
const router = express.Router();

const roleController = require("../controllers/role.controller");
const userManagementController = require("../controllers/user-management.controller");

router
  .route("/check-roles")
  .get(roleController.checkRoles)
  .post(roleController.checkRoles);

router
  .route("/dashboards")
  .get(roleController.getAccessibleDashboards)
  .post(roleController.getAccessibleDashboards);

router
  .route("/groups")
  .get(roleController.getManagedGroups)
  .post(roleController.createManagedGroup)
  .delete(roleController.deleteManagedGroup);

router
  .route("/groups/dashboards")
  .put(roleController.updateGroupDashboards)
  .post(roleController.updateGroupDashboards);

router
  .route("/users/assignable")
  .get(roleController.getAssignableUsers)
  .post(roleController.getAssignableUsers);

router
  .route("/users/info")
  .get(roleController.getUsersInfo)
  .post(roleController.getUsersInfo);

router
  .route("/groups/members")
  .get(roleController.getGroupMembers)
  .post(roleController.assignGroupMember)
  .delete(roleController.removeGroupMember);

// Quản lý Users (3 admin: admin_ami, super_admin, group_admin)
router
  .route("/manage/users")
  .get(userManagementController.listUsers)
  .post(userManagementController.createUser)
  .put(userManagementController.updateUser)
  .delete(userManagementController.deleteUser);

router
  .route("/manage/users/detail")
  .get(userManagementController.getUserDetail);

router
  .route("/manage/roles")
  .get(userManagementController.getRoleOptions);

module.exports = router;
