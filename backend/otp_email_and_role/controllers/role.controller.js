const roleService = require("../services/role.service");
const userService = require("../services/user.service");
const { logAudit } = require("../services/audit.service");

function parsePositiveInt(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
}

function handleControllerError(err, res) {
  console.error("[Role Controller Error]", err.message);

  if (err.code === "23505") {
    return res.status(409).json({
      status: "error",
      message: "Dữ liệu đã tồn tại trong hệ thống (trùng lặp thông tin)",
    });
  }

  const status = err.statusCode || err.status || 500;
  return res.status(status).json({
    status: "error",
    message: err.message || "Lỗi xử lý tại máy chủ Backend",
    fieldErrors: err.fieldErrors || undefined,
  });
}

async function checkRoles(req, res, next) {
  const userId = parsePositiveInt(req.body?.userId ?? req.query?.userId);
  const groupId = parsePositiveInt(req.body?.groupId ?? req.query?.groupId);

  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "userId phải là số nguyên dương",
    });
  }

  try {
    if (groupId) {
      const [globalInfo, groupInfo] = await Promise.all([
        roleService.getUserRoles(userId),
        roleService.getUserGroupRoleAndPermissions(userId, groupId),
      ]);

      return res.status(200).json({
        status: "success",
        ...globalInfo,
        is_system: groupInfo.isSystem,
        distance: groupInfo.distance,
        group_roles: groupInfo.roles,
        group_permissions: groupInfo.permissions,
        roles: groupInfo.roles,
        permissions: groupInfo.permissions,
      });
    }

    const user = await roleService.getUserRoles(userId);
    return res.status(200).json({
      status: "success",
      ...user,
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
}

async function getAccessibleDashboards(req, res, next) {
  const userId = parsePositiveInt(req.body?.userId ?? req.query?.userId);
  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "userId phải là số nguyên dương",
    });
  }

  try {
    const result = await roleService.getUserAccessibleDashboards(userId);
    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
}

async function getManagedGroups(req, res, next) {
  const userId = parsePositiveInt(req.body?.userId ?? req.query?.userId);
  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "userId phải là số nguyên dương",
    });
  }

  try {
    const result = await roleService.getManagedGroups(userId);
    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
}

async function createManagedGroup(req, res, next) {
  const { groupName, description, parentGroupId } = req.body || {};
  const userId = parsePositiveInt(req.body?.userId);

  if (!userId) {
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
      userId,
      groupName: String(groupName),
      description,
      parentGroupId,
    });

    return res.status(201).json({
      status: "success",
      group,
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
}

async function updateGroupDashboards(req, res, next) {
  const userId = parsePositiveInt(req.body?.userId);
  const groupId = parsePositiveInt(req.body?.groupId);
  const { dashboardIds } = req.body || {};

  if (!userId || !groupId) {
    return res.status(400).json({
      status: "error",
      message: "userId và groupId không hợp lệ",
    });
  }

  try {
    const result = await roleService.updateGroupDashboards({
      userId,
      groupId,
      dashboardIds,
    });

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
}

async function deleteManagedGroup(req, res, next) {
  const userId = parsePositiveInt(req.body?.userId ?? req.query?.userId);
  const groupId = parsePositiveInt(req.body?.groupId ?? req.query?.groupId);

  if (!userId || !groupId) {
    return res.status(400).json({
      status: "error",
      message: "userId và groupId không hợp lệ",
    });
  }

  try {
    const result = await roleService.deleteManagedGroup({ userId, groupId });
    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
}

async function getAssignableUsers(req, res, next) {
  const userId = parsePositiveInt(req.body?.userId ?? req.query?.userId);
  const groupId = parsePositiveInt(req.body?.groupId ?? req.query?.groupId);

  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "userId phải là số nguyên dương",
    });
  }

  try {
    const users = await userService.getAssignableUsers(userId, groupId);
    return res.status(200).json({
      status: "success",
      users,
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
}

async function getUsersInfo(req, res, next) {
  const userId = parsePositiveInt(req.body?.userId ?? req.query?.userId);
  if (!userId) {
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
    return handleControllerError(error, res, next);
  }
}

async function getGroupMembers(req, res, next) {
  const userId = parsePositiveInt(req.body?.userId ?? req.query?.userId);
  const groupId = parsePositiveInt(req.body?.groupId ?? req.query?.groupId);

  if (!userId || !groupId) {
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
    return handleControllerError(error, res, next);
  }
}

async function assignGroupMember(req, res, next) {
  const actorUserId = parsePositiveInt(req.body?.userId);
  const groupId = parsePositiveInt(req.body?.groupId);
  const targetUserId = parsePositiveInt(req.body?.targetUserId);
  const { roleCode, dashboardIds } = req.body || {};

  if (!actorUserId || !groupId || !targetUserId) {
    return res.status(400).json({
      status: "error",
      message: "Thông tin gán thành viên không hợp lệ",
    });
  }

  try {
    const result = await userService.assignUserToGroup({
      actorUserId,
      groupId,
      targetUserId,
      roleCode,
      dashboardIds,
    });

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
}

async function removeGroupMember(req, res, next) {
  const actorUserId = parsePositiveInt(req.body?.userId ?? req.query?.userId);
  const groupId = parsePositiveInt(req.body?.groupId ?? req.query?.groupId);
  const targetUserId = parsePositiveInt(
    req.body?.targetUserId ?? req.query?.targetUserId,
  );

  if (!actorUserId || !groupId || !targetUserId) {
    return res.status(400).json({
      status: "error",
      message: "Thông tin xóa thành viên không hợp lệ",
    });
  }

  try {
    const result = await userService.removeUserFromGroup({
      actorUserId,
      groupId,
      targetUserId,
    });

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
}

async function updateUserProfile(req, res, next) {
  const userId = parsePositiveInt(req.body?.userId ?? req.query?.userId);
  const { first_name, last_name, email } = req.body || {};

  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "userId phải là số nguyên dương",
    });
  }

  try {
    const user = await userService.updateUserProfile(userId, {
      first_name,
      last_name,
      email,
    });

    return res.status(200).json({
      status: "success",
      message: "Cập nhật thông tin thành công",
      user,
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
}

async function changeUserPassword(req, res, next) {
  const userId = parsePositiveInt(req.body?.userId ?? req.query?.userId);
  const { old_password, new_password, confirm_new_password } = req.body || {};

  if (!userId) {
    return res.status(400).json({
      status: "error",
      message: "userId phải là số nguyên dương",
    });
  }

  try {
    const result = await userService.changeUserPassword(userId, {
      old_password,
      new_password,
      confirm_new_password,
    });

    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
}

async function createAuditLog(req, res, next) {
  try {
    const {
      userId,
      action,
      targetType,
      targetId,
      description,
      metadata,
    } = req.body || {};

    if (!action) {
      return res.status(400).json({
        status: "error",
        message: "action là bắt buộc",
      });
    }

    const logEntry = await logAudit({
      userId: parsePositiveInt(userId),
      action,
      targetType,
      targetId,
      description,
      metadata,
    });

    return res.status(201).json({
      status: "success",
      log: logEntry,
    });
  } catch (error) {
    return handleControllerError(error, res, next);
  }
}

module.exports = {
  checkRoles,
  getAccessibleDashboards,
  getManagedGroups,
  createManagedGroup,
  updateGroupDashboards,
  deleteManagedGroup,
  getAssignableUsers,
  getUsersInfo,
  updateUserProfile,
  changeUserPassword,
  getGroupMembers,
  assignGroupMember,
  removeGroupMember,
  createAuditLog,
};
