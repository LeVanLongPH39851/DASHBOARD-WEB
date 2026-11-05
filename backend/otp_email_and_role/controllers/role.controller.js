const roleService = require("../services/role.service");
const userService = require("../services/user.service");

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

async function getAssignableUsers(req, res, next) {
  const userId = Number(req.body?.userId ?? req.query?.userId);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(400).json({
      status: "error",
      message: "userId phải là số nguyên dương",
    });
  }

  try {
    const users = await userService.getAssignableUsers(userId);
    return res.status(200).json({
      status: "success",
      users,
    });
  } catch (error) {
    next(error);
  }
}

async function getUsersInfo(req, res, next) {
  const userId = Number(req.body?.userId ?? req.query?.userId);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(400).json({
      status: "error",
      message: "userId phải là số nguyên dương",
    });
  }

  try {
    const result = await userService.getUsersInfoList(userId);
    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

async function getGroupMembers(req, res, next) {
  const userId = Number(req.body?.userId ?? req.query?.userId);
  const groupId = Number(req.body?.groupId ?? req.query?.groupId);

  if (
    !Number.isSafeInteger(userId) ||
    userId <= 0 ||
    !Number.isSafeInteger(groupId) ||
    groupId <= 0
  ) {
    return res.status(400).json({
      status: "error",
      message: "userId và groupId không hợp lệ",
    });
  }

  try {
    const members = await userService.getGroupMembersDetail(userId, groupId);
    return res.status(200).json({
      status: "success",
      members,
    });
  } catch (error) {
    next(error);
  }
}

async function assignGroupMember(req, res, next) {
  const { userId, groupId, targetUserId, roleCode, dashboardIds } =
    req.body || {};

  const actorId = Number(userId);
  const gId = Number(groupId);
  const targetId = Number(targetUserId);

  if (
    !Number.isSafeInteger(actorId) ||
    actorId <= 0 ||
    !Number.isSafeInteger(gId) ||
    gId <= 0 ||
    !Number.isSafeInteger(targetId) ||
    targetId <= 0
  ) {
    return res.status(400).json({
      status: "error",
      message: "Thông tin gán thành viên không hợp lệ",
    });
  }

  try {
    const result = await userService.assignUserToGroup({
      actorUserId: actorId,
      groupId: gId,
      targetUserId: targetId,
      roleCode,
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

async function removeGroupMember(req, res, next) {
  const userId = Number(req.body?.userId ?? req.query?.userId);
  const groupId = Number(req.body?.groupId ?? req.query?.groupId);
  const targetUserId = Number(
    req.body?.targetUserId ?? req.query?.targetUserId,
  );

  if (
    !Number.isSafeInteger(userId) ||
    userId <= 0 ||
    !Number.isSafeInteger(groupId) ||
    groupId <= 0 ||
    !Number.isSafeInteger(targetUserId) ||
    targetUserId <= 0
  ) {
    return res.status(400).json({
      status: "error",
      message: "Thông tin xóa thành viên không hợp lệ",
    });
  }

  try {
    const result = await userService.removeUserFromGroup({
      actorUserId: userId,
      groupId,
      targetUserId,
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
  getAssignableUsers,
  getUsersInfo,
  getGroupMembers,
  assignGroupMember,
  removeGroupMember,
};
