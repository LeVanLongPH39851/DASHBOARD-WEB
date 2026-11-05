const roleService = require("../services/role.service");

async function checkRoles(req, res, next) {
  const userId = req.body?.userId ?? req.query?.userId;
  const userIdNumber = Number(userId);

  if (
    userId === undefined ||
    userId === null ||
    userId === "" ||
    !Number.isSafeInteger(userIdNumber) ||
    userIdNumber <= 0
  ) {
    return res.status(400).json({
      status: "error",
      message: "userId phải là số nguyên dương",
    });
  }

  try {
    const user = await roleService.getUserRoles(userIdNumber);

    return res.status(200).json({
      status: "success",
      ...user,
    });
  } catch (error) {
    next(error);
  }
}

async function getAccessibleDashboards(req, res, next) {
  const userId = req.body?.userId ?? req.query?.userId;
  const userIdNumber = Number(userId);

  if (
    userId === undefined ||
    userId === null ||
    userId === "" ||
    !Number.isSafeInteger(userIdNumber) ||
    userIdNumber <= 0
  ) {
    return res.status(400).json({
      status: "error",
      message: "userId phải là số nguyên dương",
    });
  }

  try {
    const result = await roleService.getUserAccessibleDashboards(userIdNumber);

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

async function getManagedGroups(req, res, next) {
  const userId = req.body?.userId ?? req.query?.userId;
  const userIdNumber = Number(userId);

  if (
    userId === undefined ||
    userId === null ||
    userId === "" ||
    !Number.isSafeInteger(userIdNumber) ||
    userIdNumber <= 0
  ) {
    return res.status(400).json({
      status: "error",
      message: "userId phải là số nguyên dương",
    });
  }

  try {
    const result = await roleService.getManagedGroups(userIdNumber);

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

async function createManagedGroup(req, res, next) {
  const { userId, groupName, description, parentGroupId } = req.body || {};
  const userIdNumber = Number(userId);

  if (!Number.isSafeInteger(userIdNumber) || userIdNumber <= 0) {
    return res.status(400).json({
      status: "error",
      message: "userId không hợp lệ",
    });
  }

  if (!groupName || !String(groupName).trim()) {
    return res.status(400).json({
      status: "error",
      message: "Tên Group là bắt buộc",
    });
  }

  try {
    const group = await roleService.createManagedGroup({
      userId: userIdNumber,
      groupName: String(groupName),
      description,
      parentGroupId,
    });

    return res.status(201).json({
      status: "success",
      group,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }
    next(error);
  }
}

async function updateGroupDashboards(req, res, next) {
  const { userId, groupId, dashboardIds } = req.body || {};
  const userIdNumber = Number(userId);
  const groupIdNumber = Number(groupId);

  if (
    !Number.isSafeInteger(userIdNumber) ||
    userIdNumber <= 0 ||
    !Number.isSafeInteger(groupIdNumber) ||
    groupIdNumber <= 0
  ) {
    return res.status(400).json({
      status: "error",
      message: "userId và groupId không hợp lệ",
    });
  }

  try {
    const result = await roleService.updateGroupDashboards({
      userId: userIdNumber,
      groupId: groupIdNumber,
      dashboardIds,
    });

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        status: "error",
        message: error.message,
      });
    }
    next(error);
  }
}

module.exports = {
  checkRoles,
  getAccessibleDashboards,
  getManagedGroups,
  createManagedGroup,
  updateGroupDashboards,
};
