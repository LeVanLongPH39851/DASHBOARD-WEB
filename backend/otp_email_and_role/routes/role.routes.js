const express = require("express");
const router = express.Router();

const roleController = require("../controllers/role.controller");

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
  .post(roleController.createManagedGroup);

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

module.exports = router;
