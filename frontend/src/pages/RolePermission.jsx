import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layouts/headers/Header";
import Footer from "../components/layouts/footers/Footer";
import Loading from "../components/commons/Loading";
import {
  DashboardFilterProvider,
  useDarkMode,
} from "../context/DashboardFilterContext";
import {
  assignGroupMember,
  createManagedGroup,
  getAssignableUsers,
  getGroupMembers,
  getManagedGroups,
  getMe,
  removeGroupMember,
  updateGroupDashboards,
} from "../services/authService";

const GROUP_ACCENTS = [
  {
    bar: "from-[#20A7C9] to-[#2fc4c6]",
    folderBg: "bg-background-ave-reach dark:bg-[#21b8b8]/20",
    folderText: "text-color-ave-reach dark:text-[#5bd6d8]",
    badge:
      "bg-background-ave-reach text-color-ave-reach border-[#21b8b8]/30 dark:bg-[#21b8b8]/15 dark:text-[#5bd6d8]",
  },
  {
    bar: "from-[#7367f0] to-[#9e95f5]",
    folderBg: "bg-background-rating-percent dark:bg-[#7367f0]/20",
    folderText: "text-color-rating-percent dark:text-[#a59ff8]",
    badge:
      "bg-background-rating-percent text-color-rating-percent border-[#7367f0]/30 dark:bg-[#7367f0]/15 dark:text-[#a59ff8]",
  },
  {
    bar: "from-[#f2994a] to-[#f7b731]",
    folderBg: "bg-background-ave-reach-percent dark:bg-[#f2994a]/20",
    folderText: "text-color-ave-reach-percent dark:text-[#f6b26b]",
    badge:
      "bg-background-ave-reach-percent text-color-ave-reach-percent border-[#f2994a]/30 dark:bg-[#f2994a]/15 dark:text-[#f6b26b]",
  },
  {
    bar: "from-[#0cb7a9] to-[#2ed8b6]",
    folderBg: "bg-background-succes-type-1 dark:bg-[#0cb7a9]/20",
    folderText: "text-color-succes-type-1 dark:text-color-succes-type-1-dark",
    badge:
      "bg-background-succes-type-1 text-color-succes-type-1 border-[#0cb7a9]/30 dark:bg-[#0cb7a9]/15 dark:text-color-succes-type-1-dark",
  },
];

function formatDateDMY(dateStr) {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "-";
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function flattenGroups(groups = [], level = 0, result = []) {
  groups.forEach((g) => {
    result.push({
      id: g.id,
      group_name: g.group_name,
      parent_group_id: g.parent_group_id,
      dashboards: g.dashboards || [],
      level,
    });
    if (Array.isArray(g.children) && g.children.length > 0) {
      flattenGroups(g.children, level + 1, result);
    }
  });
  return result;
}

function findGroupById(groups = [], targetId) {
  for (const g of groups) {
    if (Number(g.id) === Number(targetId)) {
      return g;
    }
    if (Array.isArray(g.children) && g.children.length > 0) {
      const found = findGroupById(g.children, targetId);
      if (found) return found;
    }
  }
  return null;
}

const GroupCardNode = ({
  group,
  index,
  level = 0,
  canEditDashboards,
  canCreateGroup,
  canManageMembers,
  onOpenEditModal,
  onOpenCreateChildModal,
  onOpenMembersModal,
}) => {
  const accent = GROUP_ACCENTS[(index + level) % GROUP_ACCENTS.length];
  const dashboards = group.dashboards || [];
  const children = group.children || [];

  return (
    <div
      className={
        level > 0
          ? "mt-4 pl-6 max-md:pl-3 border-l-2 border-dashed border-[#20A7C9]/40 dark:border-[#5bd6d8]/30"
          : ""
      }
    >
      <div className="relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-6 max-md:p-4 shadow-component transition-all duration-300">
        {/* Thanh màu đỉnh card */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${accent.bar}`}
        />

        {/* Tiêu đề Group + Icon Folder + Icon Thành viên (như ảnh mẫu) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pt-1">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl ${accent.folderBg} ${accent.folderText} flex items-center justify-center shrink-0`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                />
              </svg>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h2 className="text-lg max-md:text-base font-bold text-color-black-100 dark:text-color-white-90">
                  {group.group_name}
                </h2>

                {/* Icon thành viên (People Icon) - Click để quản lý thành viên */}
                <button
                  type="button"
                  onClick={() => onOpenMembersModal(group)}
                  title="Xem & Gán thành viên / quản trị cho Group"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border cursor-pointer hover:opacity-85 transition ${accent.badge}`}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                    />
                    <circle cx="9" cy="7" r="4" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
                    />
                  </svg>
                  <span>{group.member_count || 0} thành viên</span>
                </button>

                {level > 0 && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-background-black-4 dark:bg-background-white-8 text-color-black-50 dark:text-color-white-50">
                    Group con
                  </span>
                )}
              </div>

              {group.description && (
                <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-0.5">
                  {group.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canManageMembers && (
              <button
                type="button"
                onClick={() => onOpenMembersModal(group)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#7367f0]/40 bg-[#7367f0]/10 text-[#7367f0] dark:text-[#a59ff8] hover:bg-[#7367f0] hover:text-white transition cursor-pointer flex items-center gap-1.5"
              >
                <span>Quản lý User ({group.member_count || 0})</span>
              </button>
            )}

            {canCreateGroup && (
              <button
                type="button"
                onClick={() => onOpenCreateChildModal(group)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:border-color-neotam hover:text-color-neotam transition cursor-pointer flex items-center gap-1.5"
              >
                <span>+ Thêm Group con</span>
              </button>
            )}
          </div>
        </div>

        {/* Bố cục chính: Bảng Dashboard bên trái & Nút Edit Dashboard list bên phải (như ảnh mẫu) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="flex-1 overflow-x-auto">
            {dashboards.length === 0 ? (
              <div className="py-6 px-4 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-dashed border-border-black-10 dark:border-background-white-15 text-xs text-color-black-50 dark:text-color-white-50">
                Group này hiện chưa được cấp phát Dashboard nào.
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b-2 border-border-black-10 dark:border-background-white-15 text-xs font-semibold text-color-neotam dark:text-background-primary uppercase">
                    <th className="py-2.5 pr-4">Dashboard name</th>
                    <th className="py-2.5 px-4 w-44">Last modified</th>
                    <th className="py-2.5 pl-4 w-20 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-black-10 dark:divide-background-white-15 text-sm">
                  {dashboards.map((dash) => (
                    <tr
                      key={dash.id}
                      className="hover:bg-background-checked/50 dark:hover:bg-background-hover-dark/50 transition-colors"
                    >
                      <td className="py-3 pr-4 font-medium text-color-black-100 dark:text-color-white-90">
                        <Link
                          to={dash.path}
                          className="hover:text-color-neotam dark:hover:text-[#5bd6d8] transition-colors"
                        >
                          {dash.dashboard_title}
                        </Link>
                      </td>
                      <td className="py-3 px-4 text-xs text-color-black-50 dark:text-color-white-50">
                        {formatDateDMY(dash.created_at || group.updated_at)}
                      </td>
                      <td className="py-3 pl-4 text-right">
                        <Link
                          to={dash.path}
                          title={`Mở ${dash.dashboard_title}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-lg border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 hover:bg-color-neotam hover:text-white hover:border-transparent transition-all duration-200"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Nút Edit Dashboard list ở góc phải dưới như ảnh mẫu */}
          {canEditDashboards && (
            <div className="shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => onOpenEditModal(group)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-border-black-20 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-color-black-100 dark:text-color-white-90 hover:bg-gradient-to-r hover:from-[#20A7C9] hover:to-[#2fc4c6] hover:text-white hover:border-transparent transition-all duration-200 cursor-pointer shadow-xs"
              >
                Edit Dashboard list
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị đệ quy danh sách các Group con */}
      {children.length > 0 && (
        <div className="space-y-4">
          {children.map((child, childIdx) => (
            <GroupCardNode
              key={child.id}
              group={child}
              index={childIdx}
              level={level + 1}
              canEditDashboards={canEditDashboards}
              canCreateGroup={canCreateGroup}
              canManageMembers={canManageMembers}
              onOpenEditModal={onOpenEditModal}
              onOpenCreateChildModal={onOpenCreateChildModal}
              onOpenMembersModal={onOpenMembersModal}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const RolePermissionContent = () => {
  const { value: darkMode } = useDarkMode();

  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [availableDashboards, setAvailableDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal Edit Dashboard list
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedDashIds, setSelectedDashIds] = useState([]);
  const [savingDashboards, setSavingDashboards] = useState(false);

  // Modal Add new group
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newParentGroupId, setNewParentGroupId] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [modalError, setModalError] = useState("");

  // Modal Quản lý thành viên / Quản trị viên của Group
  const [memberModalGroup, setMemberModalGroup] = useState(null);
  const [groupMembers, setGroupMembers] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [roleInGroup, setRoleInGroup] = useState("group_member");
  const [memberDashIds, setMemberDashIds] = useState([]);
  const [savingMember, setSavingMember] = useState(false);
  const [memberModalError, setMemberModalError] = useState("");

  const fetchGroupData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const [meRes, groupRes] = await Promise.all([
        getMe().catch(() => null),
        getManagedGroups(),
      ]);

      if (meRes?.user) {
        setUser(meRes.user);
      }

      setRoles(groupRes?.roles || []);
      setPermissions(groupRes?.permissions || []);
      setGroups(groupRes?.groups || []);
      setAvailableDashboards(groupRes?.availableDashboards || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải thông tin Role & Permission",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroupData();
  }, [fetchGroupData]);

  const canCreateGroup =
    permissions.includes("system.manage") ||
    permissions.includes("group.create");

  const canEditDashboards =
    permissions.includes("system.manage") ||
    permissions.includes("group_dashboard.assign");

  const canManageMembers =
    permissions.includes("system.manage") ||
    permissions.includes("group_admin.assign") ||
    permissions.includes("member.create") ||
    permissions.includes("member.update") ||
    permissions.includes("member_dashboard.assign");

  const canAssignGroupAdmin =
    permissions.includes("system.manage") ||
    permissions.includes("group_admin.assign");

  const flatGroupOptions = useMemo(() => flattenGroups(groups), [groups]);

  const isSystemManager = permissions.includes("system.manage");
  const isHighAdmin =
    !isSystemManager &&
    (permissions.includes("group.create") ||
      permissions.includes("group_admin.assign") ||
      permissions.includes("group_dashboard.assign"));
  const isGroupLevelAdmin =
    !isSystemManager &&
    !isHighAdmin &&
    (permissions.includes("member_dashboard.assign") ||
      permissions.includes("member.create"));

  const roleBadgeLabel = useMemo(() => {
    if (isSystemManager) return "Quản trị toàn hệ thống (system.manage)";
    if (isHighAdmin) return "Quản lý cấp cao (Group & Group con)";
    if (isGroupLevelAdmin) return "Quản lý cấp Group (Group được giao)";
    return "Thành viên";
  }, [isSystemManager, isHighAdmin, isGroupLevelAdmin]);

  // Nếu đang sửa Group con thì chỉ cho phép chọn các Dashboard đang có trong Group cha
  const selectableDashboardsForEdit = useMemo(() => {
    if (!editingGroup) return [];
    if (!editingGroup.parent_group_id) {
      return availableDashboards;
    }
    const parentGroup = findGroupById(groups, editingGroup.parent_group_id);
    if (!parentGroup) {
      return [];
    }
    const parentDashIds = new Set(
      (parentGroup.dashboards || []).map((d) => Number(d.id)),
    );
    return availableDashboards.filter((d) => parentDashIds.has(Number(d.id)));
  }, [editingGroup, groups, availableDashboards]);

  // Mở modal chỉnh sửa danh sách Dashboard của Group
  const handleOpenEditModal = (group) => {
    setModalError("");
    setEditingGroup(group);
    setSelectedDashIds((group.dashboards || []).map((d) => Number(d.id)));
  };

  const toggleDashId = (id) => {
    setSelectedDashIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSaveDashboards = async (e) => {
    e.preventDefault();
    if (!editingGroup) return;

    try {
      setSavingDashboards(true);
      setModalError("");
      await updateGroupDashboards(editingGroup.id, selectedDashIds);
      setEditingGroup(null);
      await fetchGroupData();
    } catch (err) {
      setModalError(
        err.response?.data?.message ||
          err.message ||
          "Cập nhật danh sách Dashboard thất bại",
      );
    } finally {
      setSavingDashboards(false);
    }
  };

  // Mở modal tạo Group mới
  const handleOpenCreateModal = (parentGroup = null) => {
    setModalError("");
    setNewGroupName("");
    setNewGroupDesc("");
    setNewParentGroupId(parentGroup ? String(parentGroup.id) : "");
    setShowCreateModal(true);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setModalError("Vui lòng nhập tên Group");
      return;
    }

    try {
      setCreatingGroup(true);
      setModalError("");
      await createManagedGroup({
        groupName: newGroupName.trim(),
        description: newGroupDesc.trim(),
        parentGroupId: newParentGroupId ? Number(newParentGroupId) : null,
      });
      setShowCreateModal(false);
      await fetchGroupData();
    } catch (err) {
      setModalError(
        err.response?.data?.message || err.message || "Tạo Group thất bại",
      );
    } finally {
      setCreatingGroup(false);
    }
  };

  // Mở modal Quản lý thành viên / quản trị của Group
  const handleOpenMembersModal = async (group) => {
    setMemberModalGroup(group);
    setMemberModalError("");
    setTargetUserId("");
    setRoleInGroup("group_member");
    setMemberDashIds((group.dashboards || []).map((d) => Number(d.id)));
    setLoadingMembers(true);

    try {
      const [membersRes, assignableRes] = await Promise.all([
        getGroupMembers(group.id).catch(() => ({ members: [] })),
        getAssignableUsers().catch(() => ({ users: [] })),
      ]);

      setGroupMembers(membersRes?.members || []);
      setAssignableUsers(assignableRes?.users || []);
    } catch (err) {
      setMemberModalError(
        err.response?.data?.message ||
          err.message ||
          "Không thể tải danh sách thành viên của Group",
      );
    } finally {
      setLoadingMembers(false);
    }
  };

  const toggleMemberDashId = (id) => {
    setMemberDashIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  const handleSelectExistingMemberForEdit = (member) => {
    const memberId = member.id ?? member.user_id;
    const roleCode = member.role_code || member.role_in_group || "group_member";
    const dashIds = Array.isArray(member.member_dashboard_ids)
      ? member.member_dashboard_ids.map((id) => Number(id))
      : (member.dashboards || []).map((d) => Number(d.id || d.dashboard_id));

    setTargetUserId(String(memberId));
    setRoleInGroup(roleCode);
    setMemberDashIds(dashIds);
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!memberModalGroup) return;
    if (!targetUserId) {
      setMemberModalError("Vui lòng chọn User cần gán vào Group");
      return;
    }

    try {
      setSavingMember(true);
      setMemberModalError("");
      await assignGroupMember(memberModalGroup.id, {
        targetUserId: Number(targetUserId),
        roleCode: roleInGroup,
        roleInGroup,
        dashboardIds: memberDashIds,
      });

      const membersRes = await getGroupMembers(memberModalGroup.id);
      setGroupMembers(membersRes?.members || []);
      setTargetUserId("");
      await fetchGroupData();
    } catch (err) {
      setMemberModalError(
        err.response?.data?.message ||
          err.message ||
          "Gán thành viên vào Group thất bại",
      );
    } finally {
      setSavingMember(false);
    }
  };

  const handleRemoveMember = async (memberUserId) => {
    if (!memberModalGroup) return;
    try {
      setMemberModalError("");
      await removeGroupMember(memberModalGroup.id, memberUserId);
      const membersRes = await getGroupMembers(memberModalGroup.id);
      setGroupMembers(membersRes?.members || []);
      await fetchGroupData();
    } catch (err) {
      setMemberModalError(
        err.response?.data?.message ||
          err.message ||
          "Xóa thành viên khỏi Group thất bại",
      );
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-family-be-vietnam-pro bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
      <Header username={user?.username || user?.profile?.username} />

      <main className="flex-1 px-6 max-lg:px-5 max-md:px-4 py-6 max-lg:py-5 max-md:py-4 w-full">
        {/* Banner Role & Permission */}
        <section className="relative overflow-hidden rounded-2xl p-6 max-md:p-5 mb-6 bg-gradient-to-r from-[#1f1c47] via-[#4338ca] to-[#7367f0] dark:from-[#111725] dark:via-[#28245c] dark:to-[#5346d6] text-white shadow-lg border border-white/10">
          <div className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[#5bd6d8]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-[#f2994a]/20 blur-3xl" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-medium mb-2.5 border border-white/20">
                <span className="w-2 h-2 rounded-full bg-[#ffd04c]" />
                <span>{roleBadgeLabel}</span>
              </div>
              <h1 className="text-2xl max-md:text-xl font-bold tracking-tight">
                Role & Permission — Quản lý Group & Phân quyền Dashboard
              </h1>
              <p className="text-sm max-md:text-xs text-white/80 mt-1">
                {isSystemManager
                  ? "Bạn đang xem toàn bộ các Group, Group con và danh sách Dashboard cấp phát trên hệ thống."
                  : isHighAdmin
                    ? "Danh sách các Group do bạn quản lý, bao gồm các Group con và Dashboard được cấp phát."
                    : "Thông tin Group bạn được phân quyền quản lý và các Dashboard đang cấp phát."}
              </p>
            </div>

            {canCreateGroup && (
              <button
                type="button"
                onClick={() => handleOpenCreateModal(null)}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-white text-[#312e81] hover:bg-[#ffd04c] hover:text-[#1f2933] transition-all duration-200 cursor-pointer shadow-md flex items-center gap-2"
              >
                <span>+ Add new group</span>
              </button>
            )}
          </div>
        </section>

        {/* Danh sách các Group theo phân quyền */}
        {loading ? (
          <div className="p-6 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component">
            <Loading height="400px" />
          </div>
        ) : error ? (
          <div className="p-12 bg-background-light dark:bg-background-chart-dark border border-border-error rounded-2xl shadow-component text-center">
            <p className="text-base font-semibold text-color-error mb-1">
              {error}
            </p>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-14 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component text-center">
            <p className="text-base font-semibold text-color-black-100 dark:text-color-white-90 mb-1">
              Hiện chưa có Group nào trong phạm vi quản lý của bạn
            </p>
            <p className="text-xs text-color-black-50 dark:text-color-white-50">
              {canCreateGroup
                ? "Nhấn nút '+ Add new group' bên dưới để tạo Group đầu tiên."
                : "Tài khoản của bạn chưa được gán quyền quản lý Group."}
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {groups.map((group, idx) => (
              <GroupCardNode
                key={group.id}
                group={group}
                index={idx}
                level={0}
                canEditDashboards={canEditDashboards}
                canCreateGroup={canCreateGroup}
                canManageMembers={canManageMembers}
                onOpenEditModal={handleOpenEditModal}
                onOpenCreateChildModal={handleOpenCreateModal}
                onOpenMembersModal={handleOpenMembersModal}
              />
            ))}
          </div>
        )}

        {/* Nút + Add new group ở cuối trang giống hệt wireframe */}
        {!loading && canCreateGroup && (
          <div className="mt-6">
            <button
              type="button"
              onClick={() => handleOpenCreateModal(null)}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border-2 border-dashed border-[#20A7C9] dark:border-[#5bd6d8] text-color-neotam dark:text-[#5bd6d8] hover:bg-[#20A7C9] hover:text-white dark:hover:bg-[#5bd6d8] dark:hover:text-[#111725] font-semibold text-sm transition-all duration-200 cursor-pointer"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
                />
                <line x1="12" x2="12" y1="11" y2="17" />
                <line x1="9" x2="15" y1="14" y2="14" />
              </svg>
              <span>Add new group</span>
            </button>
          </div>
        )}
      </main>

      {/* Modal: Edit Dashboard list cho Group */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-lg rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-color-black-100 dark:text-color-white-90 mb-1">
              Edit Dashboard list — {editingGroup.group_name}
            </h3>
            <p className="text-xs text-color-black-50 dark:text-color-white-50 mb-4">
              Chọn các Dashboard được cấp phát cho Group này:
            </p>

            <form onSubmit={handleSaveDashboards}>
              {selectableDashboardsForEdit.length === 0 ? (
                <div className="p-4 mb-4 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-dashed border-border-black-10 dark:border-background-white-15 text-xs text-color-black-50 dark:text-color-white-50 text-center">
                  {editingGroup.parent_group_id
                    ? "Group cha hiện chưa được cấp phát Dashboard nào. Vui lòng cấp phát Dashboard cho Group cha trước."
                    : "Không có Dashboard khả dụng để cấp phát."}
                </div>
              ) : (
                <div className="max-h-72 overflow-y-auto space-y-2 mb-4 pr-1">
                  {selectableDashboardsForEdit.map((dash) => {
                    const checked = selectedDashIds.includes(Number(dash.id));
                    return (
                      <label
                        key={dash.id}
                        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                          checked
                            ? "border-color-neotam bg-background-checked dark:bg-[#20A7C9]/15"
                            : "border-border-black-10 dark:border-background-white-15 hover:border-color-neotam/50"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleDashId(Number(dash.id))}
                            className="w-4 h-4 accent-[#20A7C9] cursor-pointer"
                          />
                          <span className="text-sm font-medium text-color-black-100 dark:text-color-white-90">
                            {dash.dashboard_title}
                          </span>
                        </div>
                        <span className="text-xs text-color-black-50 dark:text-color-white-50">
                          #{dash.id}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {modalError && (
                <p className="text-xs text-color-error mb-3">{modalError}</p>
              )}

              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingDashboards}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white cursor-pointer disabled:opacity-60"
                >
                  {savingDashboards ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add new group */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
          <div className="w-full max-w-md rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-color-black-100 dark:text-color-white-90 mb-1">
              Add new group
            </h3>
            <p className="text-xs text-color-black-50 dark:text-color-white-50 mb-4">
              Tạo Group mới hoặc Group con trực thuộc Group hiện có.
            </p>

            <form onSubmit={handleCreateGroup} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-color-black-70 dark:text-color-white-80 mb-1">
                  Tên Group *
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="VD: Group 1 - Ban chương trình"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-sm text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-color-black-70 dark:text-color-white-80 mb-1">
                  Group cha (Tùy chọn)
                </label>
                <select
                  value={newParentGroupId}
                  onChange={(e) => setNewParentGroupId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-sm text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam"
                >
                  <option value="" className="dark:bg-background-dark">
                    -- Group cấp cao nhất (Root Group) --
                  </option>
                  {flatGroupOptions.map((g) => (
                    <option
                      key={g.id}
                      value={g.id}
                      className="dark:bg-background-dark"
                    >
                      {"— ".repeat(g.level)}
                      {g.group_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-color-black-70 dark:text-color-white-80 mb-1">
                  Mô tả
                </label>
                <textarea
                  rows={2}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Mô tả chức năng của Group..."
                  className="w-full px-3.5 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-sm text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam"
                />
              </div>

              {modalError && (
                <p className="text-xs text-color-error">{modalError}</p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#7367f0] to-[#9e95f5] text-white cursor-pointer disabled:opacity-60"
                >
                  {creatingGroup ? "Đang tạo..." : "Tạo Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Quản lý thành viên & quản trị viên của Group */}
      {memberModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6 overflow-y-auto">
          <div className="w-full max-w-3xl rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between gap-3 mb-3">
              <div>
                <h3 className="text-lg font-bold text-color-black-100 dark:text-color-white-90">
                  Quản lý Thành viên & Quản trị — {memberModalGroup.group_name}
                </h3>
                <p className="text-xs text-color-black-50 dark:text-color-white-50">
                  {isSystemManager
                    ? "Bạn có quyền system.manage nên được phép gán các User khác trong bảng user_global_roles."
                    : "Bạn chỉ được gán các User khác do chính bạn tạo ra vào Group (không thể sửa hoặc xóa User trong hệ thống)."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMemberModalGroup(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 cursor-pointer"
              >
                Đóng
              </button>
            </div>

            {/* Form Gán User vào Group */}
            {canManageMembers && (
              <form
                onSubmit={handleAssignMember}
                className="p-4 mb-5 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 space-y-3.5"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                      Chọn User cần gán *
                    </label>
                    <select
                      value={targetUserId}
                      onChange={(e) => setTargetUserId(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-light dark:bg-background-dark text-xs text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam"
                      required
                    >
                      <option value="">-- Chọn User --</option>
                      {assignableUsers
                        .filter((u) => {
                          const uid = Number(u.id ?? u.user_id);
                          const currentId = Number(
                            user?.user_id ||
                              user?.id ||
                              user?.profile?.id ||
                              sessionStorage.getItem("user_id"),
                          );
                          if (uid === currentId) return false;
                          if (!isSystemManager) {
                            const alreadyInGroup = groupMembers.some(
                              (m) => Number(m.id ?? m.user_id) === uid,
                            );
                            if (alreadyInGroup) return false;
                          }
                          return true;
                        })
                        .map((u) => {
                          const uid = u.id ?? u.user_id;
                          const roleLabels = (u.global_roles || [])
                            .map((r) =>
                              typeof r === "string"
                                ? r
                                : r?.role_name || r?.role_code || "",
                            )
                            .filter(Boolean)
                            .join(", ");
                          return (
                            <option key={uid} value={uid}>
                              #{uid} — {u.username} ({u.email || "no-email"})
                              {roleLabels ? ` [${roleLabels}]` : ""}
                            </option>
                          );
                        })}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                      Vai trò trong Group *
                    </label>
                    <select
                      value={roleInGroup}
                      onChange={(e) => setRoleInGroup(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-light dark:bg-background-dark text-xs text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam"
                    >
                      <option value="group_member">
                        Thành viên xem Dashboard (group_member)
                      </option>
                      {canAssignGroupAdmin && (
                        <>
                          <option value="group_admin">
                            Quản trị Group (group_admin)
                          </option>
                          <option value="super_admin">
                            Quản trị cấp cao (super_admin)
                          </option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                {/* Chọn các Dashboard cho phép thành viên xem (từ danh sách Dashboard của Group) */}
                {roleInGroup === "group_member" && (
                  <div>
                    <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                      Cấp phát Dashboard xem trong Group ({memberDashIds.length}/
                      {(memberModalGroup.dashboards || []).length}):
                    </label>
                    {(memberModalGroup.dashboards || []).length === 0 ? (
                      <p className="text-xs text-color-black-50 dark:text-color-white-50">
                        Group này chưa có Dashboard nào.
                      </p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                        {(memberModalGroup.dashboards || []).map((dash) => {
                          const checked = memberDashIds.includes(
                            Number(dash.id),
                          );
                          return (
                            <label
                              key={dash.id}
                              className={`flex items-center justify-between px-3 py-2 rounded-xl border text-xs cursor-pointer transition ${
                                checked
                                  ? "border-color-neotam bg-background-checked dark:bg-[#20A7C9]/15"
                                  : "border-border-black-10 dark:border-background-white-15"
                              }`}
                            >
                              <span className="flex items-center gap-2 font-medium text-color-black-100 dark:text-color-white-90">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() =>
                                    toggleMemberDashId(Number(dash.id))
                                  }
                                  className="w-3.5 h-3.5 accent-[#20A7C9]"
                                />
                                <span>{dash.dashboard_title}</span>
                              </span>
                              <span className="text-[11px] text-color-black-50 dark:text-color-white-50">
                                #{dash.id}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {memberModalError && (
                  <p className="text-xs text-color-error">{memberModalError}</p>
                )}

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingMember}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white cursor-pointer disabled:opacity-60"
                  >
                    {savingMember
                      ? "Đang lưu..."
                      : isSystemManager
                        ? "Gán / Cập nhật User vào Group"
                        : "Gán User vào Group"}
                  </button>
                </div>
              </form>
            )}

            {/* Danh sách thành viên hiện tại trong Group */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-color-neotam dark:text-[#5bd6d8] mb-2.5">
                Danh sách Thành viên & Quản trị hiện tại ({groupMembers.length})
              </h4>

              {loadingMembers ? (
                <Loading height="160px" />
              ) : groupMembers.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-border-black-10 dark:border-background-white-15 text-center text-xs text-color-black-50 dark:text-color-white-50">
                  Group này chưa có thành viên nào.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-border-black-10 dark:border-background-white-15 text-color-black-50 dark:text-color-white-50 uppercase">
                        <th className="py-2 pr-3">User</th>
                        <th className="py-2 px-3">Email</th>
                        <th className="py-2 px-3">Vai trò</th>
                        <th className="py-2 px-3">Dashboards</th>
                        {isSystemManager && (
                          <th className="py-2 pl-3 text-right">Thao tác</th>
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-black-10 dark:divide-background-white-15">
                      {groupMembers.map((m) => {
                        const memberId = m.id ?? m.user_id;
                        const currentId = Number(
                          user?.user_id ||
                            user?.id ||
                            user?.profile?.id ||
                            sessionStorage.getItem("user_id"),
                        );
                        const isSelf = Number(memberId) === currentId;
                        const roleCode =
                          m.role_code || m.role_in_group || "group_member";
                        const roleLabel = m.role_name || roleCode;
                        const dashCount = Array.isArray(m.member_dashboard_ids)
                          ? m.member_dashboard_ids.length
                          : (m.dashboards || []).length;

                        return (
                          <tr key={memberId}>
                            <td className="py-2.5 pr-3 font-semibold text-color-black-100 dark:text-color-white-90">
                              <div>
                                #{memberId} — {m.username}
                              </div>
                              {m.full_name && (
                                <div className="text-[11px] font-normal text-color-black-50 dark:text-color-white-50">
                                  {m.full_name}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-color-black-70 dark:text-color-white-80">
                              {m.email || "-"}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                                  roleCode === "super_admin" ||
                                  roleCode === "group_admin"
                                    ? "bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8]"
                                    : "bg-[#20A7C9]/15 text-[#20A7C9] dark:text-[#5bd6d8]"
                                }`}
                              >
                                {roleLabel} ({roleCode})
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-color-black-70 dark:text-color-white-80">
                              {roleCode === "group_member"
                                ? `${dashCount} dashboard`
                                : "Tất cả trong Group"}
                            </td>
                            {isSystemManager && (
                              <td className="py-2.5 pl-3 text-right space-x-2">
                                {!isSelf && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSelectExistingMemberForEdit(m)
                                      }
                                      className="text-color-neotam hover:underline cursor-pointer font-medium"
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRemoveMember(memberId)
                                      }
                                      className="text-color-error hover:underline cursor-pointer font-medium"
                                    >
                                      Xóa
                                    </button>
                                  </>
                                )}
                              </td>
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="px-6 max-lg:px-5 max-md:px-4 pb-6 max-lg:pb-5 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
        <Footer color="text-color-black-100 dark:text-color-white-90" />
      </div>
    </div>
  );
};

const RolePermission = () => {
  return (
    <DashboardFilterProvider>
      <RolePermissionContent />
    </DashboardFilterProvider>
  );
};

export default RolePermission;
