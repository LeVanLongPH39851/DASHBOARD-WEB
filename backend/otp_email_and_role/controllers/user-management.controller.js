const userManagementService = require("../services/user-management.service");

function parseUserId(value) {
  if (value === undefined || value === null || value === "") return null;
  const num = Number(value);
  return Number.isSafeInteger(num) && num > 0 ? num : null;
}

function handleControllerError(err, res, next, defaultMsg) {
  const status = err.status || err.statusCode;
  if (status && status >= 400 && status < 600) {
    return res.status(status).json({
      status: "error",
      message: err.message || defaultMsg,
      fieldErrors: err.fieldErrors || undefined,
    });
  }
  return next(err);
}

async function listUsers(req, res, next) {
  const actorUserId = parseUserId(
    req.body?.actorUserId ?? req.query?.actorUserId ?? req.body?.userId ?? req.query?.userId,
  );
  if (!actorUserId) {
    return res.status(400).json({
      status: "error",
      message: "actorUserId phải là số nguyên dương hợp lệ",
    });
  }

  try {
    const result = await userManagementService.listManagedUsers(actorUserId);
    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    return handleControllerError(error, res, next, "Không thể lấy danh sách người dùng");
  }
}

async function getRoleOptions(req, res, next) {
  const actorUserId = parseUserId(
    req.body?.actorUserId ?? req.query?.actorUserId ?? req.body?.userId ?? req.query?.userId,
  );
  if (!actorUserId) {
    return res.status(400).json({
      status: "error",
      message: "actorUserId phải là số nguyên dương hợp lệ",
    });
  }

  try {
    const result = await userManagementService.getRoleOptions(actorUserId);
    return res.status(200).json({
      status: "success",
      ...result,
    });
  } catch (error) {
    return handleControllerError(error, res, next, "Không thể lấy danh sách role khả dụng");
  }
}

async function getUserDetail(req, res, next) {
  const actorUserId = parseUserId(
    req.body?.actorUserId ?? req.query?.actorUserId ?? req.body?.userId ?? req.query?.userId,
  );
  const targetUserId = parseUserId(
    req.query?.targetUserId ?? req.query?.id ?? req.body?.targetUserId ?? req.body?.id,
  );

  if (!actorUserId || !targetUserId) {
    return res.status(400).json({
      status: "error",
      message: "actorUserId và targetUserId phải là số nguyên dương hợp lệ",
    });
  }

  try {
    const user = await userManagementService.getManagedUserDetail(actorUserId, targetUserId);
    return res.status(200).json({
      status: "success",
      user,
    });
  } catch (error) {
    return handleControllerError(error, res, next, "Không thể lấy chi tiết người dùng");
  }
}

async function createUser(req, res, next) {
  const actorUserId = parseUserId(
    req.body?.actorUserId ?? req.query?.actorUserId ?? req.body?.userId ?? req.query?.userId,
  );
  if (!actorUserId) {
    return res.status(400).json({
      status: "error",
      message: "actorUserId phải là số nguyên dương hợp lệ",
    });
  }

  try {
    const createdUser = await userManagementService.createManagedUser(actorUserId, req.body || {});
    return res.status(201).json({
      status: "success",
      message: "Thêm người dùng mới thành công",
      user: createdUser,
    });
  } catch (error) {
    return handleControllerError(error, res, next, "Không thể tạo người dùng mới");
  }
}

async function updateUser(req, res, next) {
  const actorUserId = parseUserId(
    req.body?.actorUserId ?? req.query?.actorUserId ?? req.body?.userId ?? req.query?.userId,
  );
  const targetUserId = parseUserId(
    req.body?.targetUserId ?? req.body?.id ?? req.query?.targetUserId ?? req.query?.id,
  );

  if (!actorUserId || !targetUserId) {
    return res.status(400).json({
      status: "error",
      message: "actorUserId và targetUserId phải là số nguyên dương hợp lệ",
    });
  }

  try {
    const updatedUser = await userManagementService.updateManagedUser(
      actorUserId,
      targetUserId,
      req.body || {},
    );
    return res.status(200).json({
      status: "success",
      message: "Cập nhật thông tin người dùng thành công",
      user: updatedUser,
    });
  } catch (error) {
    return handleControllerError(error, res, next, "Không thể cập nhật người dùng");
  }
}

async function deleteUser(req, res, next) {
  const actorUserId = parseUserId(
    req.body?.actorUserId ?? req.query?.actorUserId ?? req.body?.userId ?? req.query?.userId,
  );
  const targetUserId = parseUserId(
    req.body?.targetUserId ?? req.body?.id ?? req.query?.targetUserId ?? req.query?.id,
  );

  if (!actorUserId || !targetUserId) {
    return res.status(400).json({
      status: "error",
      message: "actorUserId và targetUserId phải là số nguyên dương hợp lệ",
    });
  }

  try {
    const result = await userManagementService.deleteManagedUser(actorUserId, targetUserId);
    return res.status(200).json({
      status: "success",
      message: "Đã xóa người dùng thành công",
      data: result,
    });
  } catch (error) {
    return handleControllerError(error, res, next, "Không thể xóa người dùng");
  }
}

module.exports = {
  listUsers,
  getRoleOptions,
  getUserDetail,
  createUser,
  updateUser,
  deleteUser,
};

