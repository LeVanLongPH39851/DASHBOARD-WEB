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

module.exports = router;
