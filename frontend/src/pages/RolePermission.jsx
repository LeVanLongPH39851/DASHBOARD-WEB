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
  deleteManagedGroup,
  getAssignableUsers,
  getGroupMembers,
  getManagedGroups,
  getMe,
  removeGroupMember,
  updateGroupDashboards,
} from "../services/authService";

const GROUP_ACCENTS = [
  {
    bar: "from-[#20A7C9] via-[#2fc4c6] to-[#5bd6d8]",
    folderBg: "bg-background-ave-reach dark:bg-[#21b8b8]/20",
    folderText: "text-color-ave-reach dark:text-[#5bd6d8]",
    badge:
      "bg-background-ave-reach text-color-ave-reach border-[#21b8b8]/30 dark:bg-[#21b8b8]/15 dark:text-[#5bd6d8]",
    hoverBorder: "hover:border-[#20A7C9]/60 dark:hover:border-[#5bd6d8]/50",
    hoverShadow: "hover:shadow-[0_12px_32px_-10px_rgba(32,167,201,0.22)]",
  },
  {
    bar: "from-[#7367f0] via-[#887ef2] to-[#9e95f5]",
    folderBg: "bg-background-rating-percent dark:bg-[#7367f0]/20",
    folderText: "text-color-rating-percent dark:text-[#a59ff8]",
    badge:
      "bg-background-rating-percent text-color-rating-percent border-[#7367f0]/30 dark:bg-[#7367f0]/15 dark:text-[#a59ff8]",
    hoverBorder: "hover:border-[#7367f0]/60 dark:hover:border-[#a59ff8]/50",
    hoverShadow: "hover:shadow-[0_12px_32px_-10px_rgba(115,103,240,0.22)]",
  },
  {
    bar: "from-[#f2994a] via-[#f5a940] to-[#f7b731]",
    folderBg: "bg-background-ave-reach-percent dark:bg-[#f2994a]/20",
    folderText: "text-color-ave-reach-percent dark:text-[#f6b26b]",
    badge:
      "bg-background-ave-reach-percent text-color-ave-reach-percent border-[#f2994a]/30 dark:bg-[#f2994a]/15 dark:text-[#f6b26b]",
    hoverBorder: "hover:border-[#f2994a]/60 dark:hover:border-[#f6b26b]/50",
    hoverShadow: "hover:shadow-[0_12px_32px_-10px_rgba(242,153,74,0.22)]",
  },
  {
    bar: "from-[#0cb7a9] via-[#1dc8b0] to-[#2ed8b6]",
    folderBg: "bg-background-succes-type-1 dark:bg-[#0cb7a9]/20",
    folderText: "text-color-succes-type-1 dark:text-color-succes-type-1-dark",
    badge:
      "bg-background-succes-type-1 text-color-succes-type-1 border-[#0cb7a9]/30 dark:bg-[#0cb7a9]/15 dark:text-color-succes-type-1-dark",
    hoverBorder: "hover:border-[#0cb7a9]/60 dark:hover:border-[#86e1e3]/50",
    hoverShadow: "hover:shadow-[0_12px_32px_-10px_rgba(12,183,169,0.22)]",
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

const ROLE_RANK = {
  group_member: 1,
  group_admin: 2,
  super_admin: 3,
  admin_ami: 4,
};

function getRoleRank(roleCode) {
  return ROLE_RANK[String(roleCode || "").toLowerCase()] || 1;
}

function getUserMaxGlobalRank(userObj) {
  if (!userObj) return 1;
  if (Number.isInteger(userObj.max_global_role_rank)) {
    return userObj.max_global_role_rank;
  }
  if (userObj.highest_global_role_code) {
    return getRoleRank(userObj.highest_global_role_code);
  }
  const globalRoles = userObj.global_roles || [];
  if (Array.isArray(globalRoles) && globalRoles.length > 0) {
    return Math.max(
      ...globalRoles.map((r) =>
        getRoleRank(typeof r === "string" ? r : r?.role_code),
      ),
    );
  }
  return 1;
}

function flattenGroups(groups = [], level = 0, result = []) {
  groups.forEach((g) => {
    result.push({
      id: g.id,
      group_name: g.group_name,
      parent_group_id: g.parent_group_id,
      dashboards: g.dashboards || [],
      my_group_roles: g.my_group_roles || [],
      my_group_permissions: g.my_group_permissions || [],
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

// Tìm toàn bộ ID của Group hiện tại + các Group cha/ông + các Group con/cháu trên cùng nhánh
function getSameLineageGroupIds(groups = [], targetId) {
  const flat = flattenGroups(groups);
  const parentMap = new Map();
  flat.forEach((g) => {
    parentMap.set(
      Number(g.id),
      g.parent_group_id ? Number(g.parent_group_id) : null,
    );
  });

  const lineageSet = new Set([Number(targetId)]);

  // Tìm ngược lên các Group cha / ông
  let curr = parentMap.get(Number(targetId));
  while (curr) {
    lineageSet.add(Number(curr));
    curr = parentMap.get(Number(curr));
  }

  // Tìm xuôi xuống các Group con / cháu
  const targetNode = findGroupById(groups, targetId);
  function collectDescendants(node) {
    if (!node || !Array.isArray(node.children)) return;
    node.children.forEach((child) => {
      lineageSet.add(Number(child.id));
      collectDescendants(child);
    });
  }
  collectDescendants(targetNode);

  return lineageSet;
}

// Tìm đường dẫn từ gốc đến Group hiện tại (Breadcrumbs)
function getGroupBreadcrumb(groups = [], targetId) {
  function search(nodes, path) {
    for (const node of nodes) {
      const currentPath = [...path, node];
      if (Number(node.id) === Number(targetId)) {
        return currentPath;
      }
      if (Array.isArray(node.children) && node.children.length > 0) {
        const found = search(node.children, currentPath);
        if (found) return found;
      }
    }
    return null;
  }
  return search(groups, []) || [];
}

// Node cây thư mục Group trong Sidebar (Explorer)
const GroupTreeNode = ({
  group,
  level = 0,
  selectedGroupId,
  onSelectGroup,
  searchQuery = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = Number(selectedGroupId) === Number(group.id);
  const children = group.children || [];
  const dashboards = group.dashboards || [];
  const accent = GROUP_ACCENTS[level % GROUP_ACCENTS.length];

  return (
    <div className="space-y-1">
      <div
        onClick={() => onSelectGroup(group.id)}
        className={`group/node flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl text-xs cursor-pointer transition-all duration-200 border ${
          isSelected
            ? "bg-gradient-to-r from-[#20A7C9]/15 via-[#2fc4c6]/10 to-[#7367f0]/15 border-color-neotam dark:border-[#5bd6d8] shadow-xs text-color-neotam dark:text-[#5bd6d8] font-bold"
            : "border-transparent hover:border-border-black-10 dark:hover:border-background-white-15 hover:bg-background-dashboard dark:hover:bg-background-white-8 text-color-black-80 dark:text-color-white-90"
        }`}
        style={{ paddingLeft: `${Math.max(10, level * 16 + 10)}px` }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {children.length > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="w-4 h-4 rounded flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
              title={isExpanded ? "Thu gọn" : "Mở rộng"}
            >
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${
                  isExpanded ? "rotate-90" : ""
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          ) : (
            <span className="w-4 h-4 flex items-center justify-center opacity-40 text-[10px] shrink-0">
              •
            </span>
          )}

          <div
            className={`w-6 h-6 rounded-lg ${accent.folderBg} ${accent.folderText} flex items-center justify-center shrink-0 shadow-2xs transition-transform group-hover/node:scale-105`}
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
                d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"
              />
            </svg>
          </div>

          <span className="truncate">{group.group_name}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className="px-1.5 py-0.5 rounded-full text-[10px] bg-background-black-4 dark:bg-background-white-8 text-color-black-50 dark:text-color-white-50"
            title={`${group.member_count || 0} thành viên`}
          >
            {group.member_count || 0}u
          </span>
          <span
            className="px-1.5 py-0.5 rounded-full text-[10px] bg-background-ave-reach/50 dark:bg-[#21b8b8]/15 text-color-ave-reach dark:text-[#5bd6d8]"
            title={`${dashboards.length} dashboard`}
          >
            {dashboards.length}d
          </span>
        </div>
      </div>

      {children.length > 0 && isExpanded && (
        <div className="relative pl-2 ml-3 border-l border-dashed border-border-black-10 dark:border-background-white-15 space-y-1">
          {children.map((child) => (
            <GroupTreeNode
              key={child.id}
              group={child}
              level={level + 1}
              selectedGroupId={selectedGroupId}
              onSelectGroup={onSelectGroup}
              searchQuery={searchQuery}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Khối Workspace chi tiết cho Group được chọn trong chế độ 2 Cột Explorer
const GroupDetailWorkspace = ({
  group,
  groups,
  isSystemManager,
  onOpenEditModal,
  onOpenCreateChildModal,
  onOpenMembersModal,
  onRequestDeleteGroup,
  onSelectGroup,
}) => {
  if (!group) return null;

  const dashboards = group.dashboards || [];
  const children = group.children || [];
  const groupPerms = Array.isArray(group.my_group_permissions)
    ? group.my_group_permissions
    : [];
  const groupRoles = Array.isArray(group.my_group_roles)
    ? group.my_group_roles
    : [];
  const level = group.parent_group_id ? 1 : 0;

  const canEditGroupDashboards =
    isSystemManager ||
    groupPerms.includes("system.manage") ||
    (level > 0 && groupPerms.includes("group_dashboard.assign"));
  const canCreateChildGroup =
    isSystemManager ||
    groupPerms.includes("system.manage") ||
    groupPerms.includes("group.create");
  const canDeleteGroup =
    isSystemManager ||
    groupPerms.includes("system.manage") ||
    (level > 0 && groupPerms.includes("group.delete"));
  const canManageGroupMembers =
    isSystemManager ||
    groupPerms.includes("system.manage") ||
    groupPerms.includes("group_admin.assign") ||
    groupPerms.includes("member.create") ||
    groupPerms.includes("member.update") ||
    groupPerms.includes("member_dashboard.assign");

  const myRoleLabelInGroup =
    isSystemManager || groupRoles.includes("admin_ami")
      ? ""
      : groupRoles.includes("super_admin")
        ? "Quản trị cấp cao (super_admin)"
        : groupRoles.includes("group_admin")
          ? "Quản trị Group (group_admin)"
          : groupRoles.includes("group_member")
            ? "Thành viên (group_member)"
            : "";

  const breadcrumbs = getGroupBreadcrumb(groups, group.id);

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Thẻ Header thông tin Group */}
      <div className="relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-6 max-md:p-4 shadow-component">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#20A7C9] via-[#7367f0] to-[#f2994a]" />

        {/* Breadcrumb đường dẫn cây */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-color-black-50 dark:text-color-white-50 mb-3 pt-1">
          <span className="flex items-center gap-1 font-medium">
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
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span>Quản lý Group</span>
          </span>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={bc.id}>
              <span>/</span>
              <button
                type="button"
                onClick={() => onSelectGroup(bc.id)}
                className={`hover:text-color-neotam dark:hover:text-[#5bd6d8] transition ${
                  idx === breadcrumbs.length - 1
                    ? "font-bold text-color-black-100 dark:text-color-white-90"
                    : "cursor-pointer"
                }`}
              >
                {bc.group_name}
              </button>
            </React.Fragment>
          ))}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center shrink-0 shadow-xs">
              <svg
                className="w-6 h-6"
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
                <h2 className="text-xl max-md:text-lg font-bold text-color-black-100 dark:text-color-white-90 tracking-tight">
                  {group.group_name}
                </h2>
                <button
                  type="button"
                  onClick={() => onOpenMembersModal(group, "view")}
                  title="Xem thành viên & vai trò"
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#21b8b8]/30 bg-background-ave-reach text-color-ave-reach dark:bg-[#21b8b8]/15 dark:text-[#5bd6d8] cursor-pointer hover:scale-105 active:scale-95 transition"
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
                {myRoleLabelInGroup && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8] border border-[#7367f0]/30">
                    {myRoleLabelInGroup}
                  </span>
                )}
              </div>
              {group.description && (
                <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-1">
                  {group.description}
                </p>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {canManageGroupMembers && (
              <button
                type="button"
                onClick={() => onOpenMembersModal(group, "manage")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#7367f0]/40 bg-[#7367f0]/10 text-[#7367f0] dark:text-[#a59ff8] hover:bg-gradient-to-r hover:from-[#7367f0] hover:to-[#9e95f5] hover:text-white hover:border-transparent hover:-translate-y-0.5 transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs"
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
                    d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                  />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" x2="20" y1="8" y2="14" />
                  <line x1="23" x2="17" y1="11" y2="11" />
                </svg>
                <span>Quản lý User</span>
              </button>
            )}
            {canCreateChildGroup && (
              <button
                type="button"
                onClick={() => onOpenCreateChildModal(group)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 hover:border-[#20A7C9] hover:text-color-neotam dark:hover:text-[#5bd6d8] hover:-translate-y-0.5 transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs"
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
                    d="M12 5v14M5 12h14"
                  />
                </svg>
                <span>Thêm Group con</span>
              </button>
            )}
            {canDeleteGroup && (
              <button
                type="button"
                onClick={() => onRequestDeleteGroup(group)}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-color-error/40 bg-color-error/10 text-color-error hover:bg-color-error hover:text-white hover:border-transparent hover:-translate-y-0.5 transition cursor-pointer flex items-center gap-1.5 active:scale-95 shadow-2xs"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  />
                </svg>
                <span>Xóa Group</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Khối Quản lý Dashboard của Group */}
      <div className="rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-6 max-md:p-4 shadow-component">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border-black-10 dark:border-background-white-15">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-color-black-100 dark:text-color-white-90 uppercase tracking-wider">
              Danh sách Dashboard cấp phát
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8]">
              {dashboards.length}
            </span>
          </div>

          {canEditGroupDashboards && (
            <button
              type="button"
              onClick={() => onOpenEditModal(group)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-[#20A7C9]/40 bg-background-search dark:bg-background-white-8 text-color-neotam dark:text-[#5bd6d8] hover:bg-gradient-to-r hover:from-[#20A7C9] hover:to-[#2fc4c6] hover:text-white hover:border-transparent hover:-translate-y-0.5 transition cursor-pointer shadow-2xs"
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
                  d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                />
              </svg>
              <span>Edit Dashboard list</span>
            </button>
          )}
        </div>

        {dashboards.length === 0 ? (
          <div className="py-8 px-4 rounded-xl border border-dashed border-border-black-10 dark:border-background-white-15 text-center text-xs text-color-black-50 dark:text-color-white-50 flex flex-col items-center justify-center gap-1.5">
            <svg
              className="w-6 h-6 opacity-40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              viewBox="0 0 24 24"
            >
              <rect width="7" height="9" x="3" y="3" rx="1" />
              <rect width="7" height="5" x="14" y="3" rx="1" />
              <rect width="7" height="9" x="14" y="12" rx="1" />
              <rect width="7" height="5" x="3" y="16" rx="1" />
            </svg>
            <span>Group này hiện chưa được cấp phát Dashboard nào.</span>
            {canEditGroupDashboards && (
              <button
                type="button"
                onClick={() => onOpenEditModal(group)}
                className="text-color-neotam dark:text-[#5bd6d8] hover:underline font-semibold mt-1 cursor-pointer"
              >
                + Bấm vào đây để cấp phát Dashboard
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {dashboards.map((dash) => (
              <Link
                key={dash.id}
                to={dash.path}
                className="group/d flex items-center justify-between p-3.5 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-dashboard/50 dark:bg-background-white-8/40 hover:border-[#20A7C9] dark:hover:border-[#5bd6d8] hover:shadow-xs hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center shrink-0 group-hover/d:scale-105 transition-transform">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <rect width="7" height="9" x="3" y="3" rx="1" />
                      <rect width="7" height="5" x="14" y="3" rx="1" />
                      <rect width="7" height="9" x="14" y="12" rx="1" />
                      <rect width="7" height="5" x="3" y="16" rx="1" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-color-black-100 dark:text-color-white-90 group-hover/d:text-color-neotam dark:group-hover/d:text-[#5bd6d8] transition-colors truncate">
                      {dash.dashboard_title}
                    </p>
                    <p className="text-[11px] text-color-black-50 dark:text-color-white-50 font-mono truncate">
                      {dash.path}
                    </p>
                  </div>
                </div>

                <span className="w-7 h-7 rounded-lg border border-border-black-10 dark:border-background-white-15 flex items-center justify-center text-color-black-50 group-hover/d:bg-gradient-to-r group-hover/d:from-[#20A7C9] group-hover/d:to-[#2fc4c6] group-hover/d:text-white group-hover/d:border-transparent transition-all shrink-0">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Khối Group con trực thuộc (nếu có) */}
      {children.length > 0 && (
        <div className="rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-6 max-md:p-4 shadow-component">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-black-10 dark:border-background-white-15">
            <h3 className="text-sm font-bold text-color-black-100 dark:text-color-white-90 uppercase tracking-wider">
              Group con trực thuộc
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8]">
              {children.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {children.map((child) => (
              <div
                key={child.id}
                onClick={() => onSelectGroup(child.id)}
                className="group/child flex items-center justify-between p-3.5 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-dashboard/50 dark:bg-background-white-8/40 hover:border-[#7367f0] hover:shadow-xs hover:-translate-y-0.5 cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-background-rating-percent dark:bg-[#7367f0]/20 text-color-rating-percent dark:text-[#a59ff8] flex items-center justify-center shrink-0">
                    <svg
                      className="w-4 h-4"
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
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-color-black-100 dark:text-color-white-90 group-hover/child:text-[#7367f0] dark:group-hover/child:text-[#a59ff8] transition-colors truncate">
                      {child.group_name}
                    </p>
                    <p className="text-[11px] text-color-black-50 dark:text-color-white-50">
                      {child.member_count || 0} thành viên •{" "}
                      {(child.dashboards || []).length} dashboard
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-color-neotam dark:text-[#5bd6d8] flex items-center gap-1 shrink-0 group-hover/child:translate-x-0.5 transition-transform">
                  <span>Mở</span>
                  <span>→</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const GroupCardNode = ({
  group,
  index,
  level = 0,
  isSystemManager,
  onOpenEditModal,
  onOpenCreateChildModal,
  onOpenMembersModal,
  onRequestDeleteGroup,
}) => {
  const accent = GROUP_ACCENTS[(index + level) % GROUP_ACCENTS.length];
  const dashboards = group.dashboards || [];
  const children = group.children || [];
  const [isExpanded, setIsExpanded] = useState(true);

  // Chỉ lấy phân quyền của chính Group này (my_group_roles, my_group_permissions), tuyệt đối không lấy quyền cao nhất áp xuống Group khác
  const groupPerms = Array.isArray(group.my_group_permissions)
    ? group.my_group_permissions
    : [];
  const groupRoles = Array.isArray(group.my_group_roles)
    ? group.my_group_roles
    : [];

  // super_admin không thể sửa Edit Dashboard list ở cấp cao nhất do nó quản lý (level === 0), chỉ sửa được ở các Group con (level > 0)
  const canEditGroupDashboards =
    isSystemManager ||
    groupPerms.includes("system.manage") ||
    (level > 0 && groupPerms.includes("group_dashboard.assign"));
  const canCreateChildGroup =
    isSystemManager ||
    groupPerms.includes("system.manage") ||
    groupPerms.includes("group.create");
  const canDeleteGroup =
    isSystemManager ||
    groupPerms.includes("system.manage") ||
    (level > 0 && groupPerms.includes("group.delete"));
  const canManageGroupMembers =
    isSystemManager ||
    groupPerms.includes("system.manage") ||
    groupPerms.includes("group_admin.assign") ||
    groupPerms.includes("member.create") ||
    groupPerms.includes("member.update") ||
    groupPerms.includes("member_dashboard.assign");

  const myRoleLabelInGroup =
    isSystemManager || groupRoles.includes("admin_ami")
      ? ""
      : groupRoles.includes("super_admin")
        ? "Quản trị cấp cao (super_admin)"
        : groupRoles.includes("group_admin")
          ? "Quản trị Group (group_admin)"
          : groupRoles.includes("group_member")
            ? "Thành viên (group_member)"
            : "";

  return (
    <div
      style={{ animationDelay: `${Math.min((index + level) * 60, 360)}ms` }}
      className={`animate-fade-up ${
        level > 0
          ? "mt-4 pl-6 max-md:pl-3 border-l-2 border-dashed border-[#20A7C9]/40 dark:border-[#5bd6d8]/30 relative"
          : ""
      }`}
    >
      {level > 0 && (
        <span
          aria-hidden="true"
          className="absolute -left-[5px] top-6 w-2 h-2 rounded-full bg-[#20A7C9] dark:bg-[#5bd6d8] ring-4 ring-background-dashboard dark:ring-background-dashboard-dark"
        />
      )}
      <div
        className={`group/card relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-6 max-md:p-4 shadow-component transition-all duration-300 hover:-translate-y-1 ${accent.hoverBorder} ${accent.hoverShadow}`}
      >
        {/* Thanh màu đỉnh card */}
        <div
          className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${accent.bar}`}
        />

        {/* Tiêu đề Group + Icon Folder + Icon Thành viên (như ảnh mẫu) */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pt-1">
          <div className="flex items-center gap-3.5">
            <div
              className={`w-11 h-11 rounded-2xl ${accent.folderBg} ${accent.folderText} flex items-center justify-center shrink-0 shadow-xs transition-transform duration-300 group-hover/card:scale-110 group-hover/card:-rotate-3`}
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
                <h2 className="text-lg max-md:text-base font-bold text-color-black-100 dark:text-color-white-90 tracking-tight">
                  {group.group_name}
                </h2>

                {/* Icon thành viên (People Icon) - Click để chỉ xem danh sách thành viên & vai trò */}
                <button
                  type="button"
                  onClick={() => onOpenMembersModal(group, "view")}
                  title="Xem danh sách thành viên và vai trò trong Group"
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border cursor-pointer hover:scale-105 active:scale-95 transition-all duration-200 ${accent.badge}`}
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

                {!isSystemManager && level === 0 && myRoleLabelInGroup && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8] border border-[#7367f0]/30 shadow-2xs">
                    Vai trò của bạn: {myRoleLabelInGroup}
                  </span>
                )}

                {level > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-background-black-4 dark:bg-background-white-8 text-color-black-50 dark:text-color-white-50 border border-border-black-10 dark:border-background-white-15 flex items-center gap-1">
                    <span>↳</span>
                    <span>Group con</span>
                  </span>
                )}

                {children.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 border border-border-black-10 dark:border-background-white-15 hover:border-[#20A7C9] hover:text-color-neotam dark:hover:text-[#5bd6d8] transition-all duration-200 cursor-pointer shadow-2xs active:scale-95"
                    title={
                      isExpanded
                        ? "Thu gọn danh sách Group con"
                        : "Mở rộng danh sách Group con"
                    }
                  >
                    <span>{children.length} Group con</span>
                    <svg
                      className={`w-3 h-3 transition-transform duration-200 ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {group.description && (
                <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-0.5 font-normal">
                  {group.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {canManageGroupMembers && (
              <button
                type="button"
                onClick={() => onOpenMembersModal(group, "manage")}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-[#7367f0]/40 bg-[#7367f0]/10 text-[#7367f0] dark:text-[#a59ff8] hover:bg-gradient-to-r hover:from-[#7367f0] hover:to-[#9e95f5] hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95"
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
                    d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"
                  />
                  <circle cx="8.5" cy="7" r="4" />
                  <line x1="20" x2="20" y1="8" y2="14" />
                  <line x1="23" x2="17" y1="11" y2="11" />
                </svg>
                <span>Quản lý User ({group.member_count || 0})</span>
              </button>
            )}

            {canCreateChildGroup && (
              <button
                type="button"
                onClick={() => onOpenCreateChildModal(group)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 hover:border-[#20A7C9] hover:text-color-neotam dark:hover:text-[#5bd6d8] hover:-translate-y-0.5 hover:shadow-2xs transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95"
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
                    d="M12 5v14M5 12h14"
                  />
                </svg>
                <span>Thêm Group con</span>
              </button>
            )}

            {canDeleteGroup && (
              <button
                type="button"
                onClick={() => onRequestDeleteGroup(group)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-color-error/40 bg-color-error/10 text-color-error hover:bg-color-error hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:shadow-sm transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  />
                </svg>
                <span>Xóa Group</span>
              </button>
            )}
          </div>
        </div>

        {/* Bố cục chính: Bảng Dashboard bên trái & Nút Edit Dashboard list bên phải (như ảnh mẫu) */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-5">
          <div className="flex-1 overflow-x-auto rounded-xl border border-border-black-10/70 dark:border-background-white-15/70 bg-background-dashboard/50 dark:bg-background-white-8/40 p-3 shadow-inner">
            {dashboards.length === 0 ? (
              <div className="py-6 px-4 rounded-xl bg-background-light/60 dark:bg-background-dark/40 border border-dashed border-border-black-10 dark:border-background-white-15 text-xs text-color-black-50 dark:text-color-white-50 text-center flex flex-col items-center justify-center gap-1.5">
                <svg
                  className="w-5 h-5 opacity-40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  viewBox="0 0 24 24"
                >
                  <rect width="7" height="9" x="3" y="3" rx="1" />
                  <rect width="7" height="5" x="14" y="3" rx="1" />
                  <rect width="7" height="9" x="14" y="12" rx="1" />
                  <rect width="7" height="5" x="3" y="16" rx="1" />
                </svg>
                <span>Group này hiện chưa được cấp phát Dashboard nào.</span>
              </div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-black-10 dark:border-background-white-15 text-[11px] font-bold text-color-neotam dark:text-[#5bd6d8] uppercase tracking-wider">
                    <th className="py-2.5 pl-2.5 pr-4">Dashboard name</th>
                    <th className="py-2.5 px-4 w-44">Last modified</th>
                    <th className="py-2.5 pl-4 pr-2.5 w-20 text-right">Mở</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-black-10/70 dark:divide-background-white-15/70 text-sm">
                  {dashboards.map((dash) => (
                    <tr
                      key={dash.id}
                      className="group/row hover:bg-background-light dark:hover:bg-background-chart-dark/80 transition-colors"
                    >
                      <td className="py-2.5 pl-2.5 pr-4 font-semibold text-color-black-100 dark:text-color-white-90">
                        <Link
                          to={dash.path}
                          className="inline-flex items-center gap-2 hover:text-color-neotam dark:hover:text-[#5bd6d8] transition-colors"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-[#20A7C9] dark:bg-[#5bd6d8] opacity-75 group-hover/row:scale-150 transition-transform" />
                          <span>{dash.dashboard_title}</span>
                        </Link>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-color-black-50 dark:text-color-white-50">
                        {formatDateDMY(dash.created_at || group.updated_at)}
                      </td>
                      <td className="py-2.5 pl-4 pr-2.5 text-right">
                        <Link
                          to={dash.path}
                          title={`Mở ${dash.dashboard_title}`}
                          className="inline-flex items-center justify-center w-8 h-8 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-light dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 hover:bg-gradient-to-r hover:from-[#20A7C9] hover:to-[#2fc4c6] hover:text-white hover:border-transparent hover:scale-105 active:scale-95 transition-all duration-200 shadow-2xs"
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
          {canEditGroupDashboards && (
            <div className="shrink-0 flex justify-end">
              <button
                type="button"
                onClick={() => onOpenEditModal(group)}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold border border-[#20A7C9]/40 dark:border-[#5bd6d8]/40 bg-background-search dark:bg-background-white-8 text-color-neotam dark:text-[#5bd6d8] hover:bg-gradient-to-r hover:from-[#20A7C9] hover:to-[#2fc4c6] hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:shadow-md active:scale-95 transition-all duration-200 cursor-pointer shadow-xs"
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
                    d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                  />
                </svg>
                <span>Edit Dashboard list</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Hiển thị đệ quy danh sách các Group con */}
      {children.length > 0 && isExpanded && (
        <div className="space-y-4 animate-fade-up">
          {children.map((child, childIdx) => (
            <GroupCardNode
              key={child.id}
              group={child}
              index={childIdx}
              level={level + 1}
              isSystemManager={isSystemManager}
              onOpenEditModal={onOpenEditModal}
              onOpenCreateChildModal={onOpenCreateChildModal}
              onOpenMembersModal={onOpenMembersModal}
              onRequestDeleteGroup={onRequestDeleteGroup}
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

  // Bố cục hiển thị: "split" (2 cột Explorer + Workspace) hoặc "grid" (Lưới 2 cột cards)
  const [layoutMode, setLayoutMode] = useState("split");
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [groupSearchQuery, setGroupSearchQuery] = useState("");

  // Modal Edit Dashboard list
  const [editingGroup, setEditingGroup] = useState(null);
  const [selectedDashIds, setSelectedDashIds] = useState([]);
  const [savingDashboards, setSavingDashboards] = useState(false);
  const [dashSearch, setDashSearch] = useState("");

  // Modal Add new group / Thêm Group con
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingParentGroup, setCreatingParentGroup] = useState(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupDesc, setNewGroupDesc] = useState("");
  const [newParentGroupId, setNewParentGroupId] = useState("");
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [modalError, setModalError] = useState("");

  // Modal Xem / Quản lý thành viên của Group
  const [memberModalGroup, setMemberModalGroup] = useState(null);
  const [memberModalMode, setMemberModalMode] = useState("view"); // "view" | "manage"
  const [groupMembers, setGroupMembers] = useState([]);
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [targetUserId, setTargetUserId] = useState("");
  const [roleInGroup, setRoleInGroup] = useState("group_member");
  const [memberDashIds, setMemberDashIds] = useState([]);
  const [savingMember, setSavingMember] = useState(false);
  const [memberModalError, setMemberModalError] = useState("");

  // Popup xác nhận xóa (cho cả Xóa Group và Xóa thành viên khỏi Group)
  const [confirmDelete, setConfirmDelete] = useState(null); // { type: "group" | "member", group, member }
  const [deletingConfirm, setDeletingConfirm] = useState(false);
  const [confirmDeleteError, setConfirmDeleteError] = useState("");

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

      const mappedGroups = groupRes?.groups || [];
      setRoles(groupRes?.roles || []);
      setPermissions(groupRes?.permissions || []);
      setGroups(mappedGroups);
      setAvailableDashboards(groupRes?.availableDashboards || []);

      if (mappedGroups.length > 0) {
        setSelectedGroupId((prev) => {
          if (prev && findGroupById(mappedGroups, prev)) return prev;
          return mappedGroups[0].id;
        });
      }
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

  const flatGroupOptions = useMemo(() => flattenGroups(groups), [groups]);

  // Group đang được chọn trong chế độ 2 Cột Explorer
  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return groups[0] || null;
    return findGroupById(groups, selectedGroupId) || groups[0] || null;
  }, [groups, selectedGroupId]);

  // Lọc danh sách Group theo từ khóa tìm kiếm
  const filteredGroupsForExplorer = useMemo(() => {
    const q = groupSearchQuery.trim().toLowerCase();
    if (!q) return groups;
    function filterNodes(nodes) {
      const res = [];
      for (const node of nodes) {
        const matchesSelf = (node.group_name || "")
          .toLowerCase()
          .includes(q);
        const children = Array.isArray(node.children)
          ? filterNodes(node.children)
          : [];
        if (matchesSelf || children.length > 0) {
          res.push({
            ...node,
            children,
          });
        }
      }
      return res;
    }
    return filterNodes(groups);
  }, [groups, groupSearchQuery]);

  const isSystemManager = permissions.includes("system.manage");

  // Chỉ lấy danh sách các Group mà user thực sự có quyền tạo Group con (group.create) tại chính Group đó
  const creatableParentGroupOptions = useMemo(
    () =>
      flatGroupOptions.filter(
        (g) =>
          isSystemManager ||
          (g.my_group_permissions || []).includes("system.manage") ||
          (g.my_group_permissions || []).includes("group.create"),
      ),
    [flatGroupOptions, isSystemManager],
  );

  // Nút "+ Add new group" ở đầu trang và cuối trang chỉ xuất hiện khi là admin_ami và có quyền group.create
  const canCreateGroup =
    roles.includes("admin_ami") && permissions.includes("group.create");
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

  const filteredSelectableDashboards = useMemo(() => {
    const q = dashSearch.trim().toLowerCase();
    if (!q) return selectableDashboardsForEdit;
    return selectableDashboardsForEdit.filter(
      (d) =>
        (d.dashboard_title || "").toLowerCase().includes(q) ||
        String(d.id).includes(q) ||
        (d.path || "").toLowerCase().includes(q),
    );
  }, [selectableDashboardsForEdit, dashSearch]);

  // Mở modal chỉnh sửa danh sách Dashboard của Group
  const handleOpenEditModal = (group) => {
    setModalError("");
    setDashSearch("");
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

  // Mở modal tạo Group mới hoặc thêm Group con
  const handleOpenCreateModal = (parentGroup = null) => {
    setModalError("");
    setNewGroupName("");
    setNewGroupDesc("");
    setCreatingParentGroup(parentGroup || null);
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

  // Mở modal Xem ("view") hoặc Quản lý ("manage") thành viên của Group
  const handleOpenMembersModal = async (group, mode = "view") => {
    setMemberModalGroup(group);
    setMemberModalMode(mode);
    setMemberModalError("");
    setTargetUserId("");
    setRoleInGroup("group_member");
    setMemberDashIds((group.dashboards || []).map((d) => Number(d.id)));
    setLoadingMembers(true);

    try {
      if (mode === "manage") {
        const [membersRes, assignableRes] = await Promise.all([
          getGroupMembers(group.id).catch(() => ({ members: [] })),
          getAssignableUsers(group.id).catch(() => ({ users: [] })),
        ]);
        setGroupMembers(membersRes?.members || []);
        setAssignableUsers(assignableRes?.users || []);
      } else {
        const membersRes = await getGroupMembers(group.id).catch(() => ({
          members: [],
        }));
        setGroupMembers(membersRes?.members || []);
      }
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

    const targetObj =
      assignableUsers.find(
        (u) => Number(u.id ?? u.user_id) === Number(memberId),
      ) || member;
    const maxGlobalRank = getUserMaxGlobalRank(targetObj);
    const safeRoleCode =
      getRoleRank(roleCode) > maxGlobalRank ? "group_member" : roleCode;

    setTargetUserId(String(memberId));
    setRoleInGroup(safeRoleCode);
    setMemberDashIds(dashIds);
  };

  const handleAssignMember = async (e) => {
    e.preventDefault();
    if (!memberModalGroup) return;
    if (!targetUserId) {
      setMemberModalError("Vui lòng chọn User cần gán vào Group");
      return;
    }

    const selectedTargetUser =
      groupMembers.find(
        (m) => String(m.id ?? m.user_id) === String(targetUserId),
      ) ||
      assignableUsers.find(
        (u) => String(u.id ?? u.user_id) === String(targetUserId),
      );

    if (selectedTargetUser) {
      const targetMaxGlobalRank = getUserMaxGlobalRank(selectedTargetUser);
      const desiredRoleRank = getRoleRank(roleInGroup);
      if (desiredRoleRank > targetMaxGlobalRank) {
        setMemberModalError(
          "Role của thành viên trong Group không được cao hơn vai trò toàn cục (Global Role) của người dùng đó.",
        );
        return;
      }
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

      const [membersRes, assignableRes] = await Promise.all([
        getGroupMembers(memberModalGroup.id),
        getAssignableUsers(memberModalGroup.id).catch(() => ({ users: [] })),
      ]);
      setGroupMembers(membersRes?.members || []);
      setAssignableUsers(assignableRes?.users || []);
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

  // Mở popup xác nhận xóa Group
  const handleRequestDeleteGroup = (group) => {
    setConfirmDeleteError("");
    setConfirmDelete({
      type: "group",
      group,
      member: null,
    });
  };

  // Mở popup xác nhận xóa thành viên khỏi Group
  const handleRequestRemoveMember = (member) => {
    if (!memberModalGroup) return;
    setConfirmDeleteError("");
    setConfirmDelete({
      type: "member",
      group: memberModalGroup,
      member,
    });
  };

  // Thực hiện xóa sau khi người dùng xác nhận trên popup
  const handleConfirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      setDeletingConfirm(true);
      setConfirmDeleteError("");

      if (confirmDelete.type === "group" && confirmDelete.group) {
        await deleteManagedGroup(confirmDelete.group.id);
        setConfirmDelete(null);
        await fetchGroupData();
      } else if (
        confirmDelete.type === "member" &&
        confirmDelete.group &&
        confirmDelete.member
      ) {
        const memberUserId =
          confirmDelete.member.id ?? confirmDelete.member.user_id;
        await removeGroupMember(confirmDelete.group.id, memberUserId);
        const [membersRes, assignableRes] = await Promise.all([
          getGroupMembers(confirmDelete.group.id),
          getAssignableUsers(confirmDelete.group.id).catch(() => ({
            users: [],
          })),
        ]);
        setGroupMembers(membersRes?.members || []);
        setAssignableUsers(assignableRes?.users || []);
        setConfirmDelete(null);
        await fetchGroupData();
      }
    } catch (err) {
      setConfirmDeleteError(
        err.response?.data?.message ||
          err.message ||
          "Thao tác xóa thất bại",
      );
    } finally {
      setDeletingConfirm(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-family-be-vietnam-pro bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
      <Header username={user?.username} />

      <main className="flex-1 px-6 max-lg:px-5 max-md:px-4 py-6 max-lg:py-5 max-md:py-4 w-full">
        {/* Banner Role & Permission */}
        <section className="shine-auto relative overflow-hidden rounded-3xl p-7 max-lg:p-6 max-md:p-5 mb-6 bg-gradient-to-r from-[#1f1c47] via-[#4338ca] via-60% to-[#7367f0] dark:from-[#111725] dark:via-[#28245c] dark:to-[#5346d6] text-white shadow-xl border border-white/10 animate-gradient-shift">
          <div className="pointer-events-none absolute -top-20 -right-16 w-72 h-72 rounded-full bg-[#5bd6d8]/25 blur-3xl animate-float-slow" />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-[#f2994a]/25 blur-3xl animate-float-slow"
            style={{ animationDelay: "-3s" }}
          />
          <div
            className="pointer-events-none absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.45) 1px, transparent 0)",
              backgroundSize: "22px 22px",
            }}
          />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-5">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold mb-3 border border-white/20 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#ffd04c] animate-pulse" />
                <span>{roleBadgeLabel}</span>
              </div>
              <h1 className="text-2xl max-md:text-xl font-extrabold tracking-tight">
                Role & Permission — Quản lý Group & Phân quyền Dashboard
              </h1>
              <p className="text-sm max-md:text-xs text-white/85 mt-1.5 leading-relaxed">
                {isSystemManager
                  ? "Bạn đang xem toàn bộ các Group, Group con và danh sách Dashboard cấp phát trên hệ thống."
                  : isHighAdmin
                    ? "Danh sách các Group do bạn quản lý, bao gồm các Group con và Dashboard được cấp phát."
                    : "Thông tin Group bạn được phân quyền quản lý và các Dashboard đang cấp phát."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Thống kê nhanh trên Banner */}
              <div className="flex items-center gap-3 bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5 shadow-lg">
                <div className="text-center px-2">
                  <p className="text-[11px] text-white/75 font-medium">Tổng Group</p>
                  <p className="text-lg font-black leading-tight">
                    {loading ? "..." : flatGroupOptions.length}
                  </p>
                </div>
                <div className="w-px h-7 bg-white/20" />
                <div className="text-center px-2">
                  <p className="text-[11px] text-white/75 font-medium">Nhánh gốc</p>
                  <p className="text-lg font-black leading-tight">
                    {loading ? "..." : groups.length}
                  </p>
                </div>
                <div className="w-px h-7 bg-white/20" />
                <div className="text-center px-2">
                  <p className="text-[11px] text-white/75 font-medium">Dashboards</p>
                  <p className="text-lg font-black leading-tight">
                    {loading ? "..." : availableDashboards.length}
                  </p>
                </div>
              </div>

              {canCreateGroup && (
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(null)}
                  className="px-4 py-3 rounded-2xl text-sm font-bold bg-white text-[#312e81] hover:bg-[#ffd04c] hover:text-[#1f2933] hover:-translate-y-0.5 active:scale-95 transition-all duration-200 cursor-pointer shadow-lg flex items-center gap-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    viewBox="0 0 24 24"
                  >
                    <line x1="12" x2="12" y1="5" y2="19" />
                    <line x1="5" x2="19" y1="12" y2="12" />
                  </svg>
                  <span>Add new group</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Thanh Điều hướng & Bộ chuyển đổi Bố cục (Layout Switcher) */}
        {!loading && !error && groups.length > 0 && (
          <section className="mb-6 p-4 max-md:p-3.5 rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-component flex flex-wrap items-center justify-between gap-4 transition-all duration-300">
            {/* Ô tìm kiếm Group */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <input
                type="text"
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                placeholder="Tìm kiếm Group theo tên..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-xs text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam transition"
              />
              <svg
                className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-color-black-50 dark:text-color-white-50 pointer-events-none"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
              {groupSearchQuery && (
                <button
                  type="button"
                  onClick={() => setGroupSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-color-black-50 hover:text-color-error"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Nút chuyển đổi Bố cục */}
              <div className="flex items-center rounded-xl p-1 bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
                <button
                  type="button"
                  onClick={() => setLayoutMode("split")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    layoutMode === "split"
                      ? "bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-xs"
                      : "text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-color-white-90"
                  }`}
                  title="Bố cục 2 cột: Cột trái Cây thư mục Group - Cột phải Chi tiết quản trị"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <line x1="9" x2="9" y1="3" y2="21" />
                  </svg>
                  <span>2 Cột Explorer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutMode("grid")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    layoutMode === "grid"
                      ? "bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-xs"
                      : "text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-color-white-90"
                  }`}
                  title="Bố cục Lưới: Hiển thị các khối Group dạng 2 cột song song"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect width="7" height="7" x="3" y="3" rx="1.5" />
                    <rect width="7" height="7" x="14" y="3" rx="1.5" />
                    <rect width="7" height="7" x="14" y="14" rx="1.5" />
                    <rect width="7" height="7" x="3" y="14" rx="1.5" />
                  </svg>
                  <span>Lưới 2 cột</span>
                </button>
              </div>

              {canCreateGroup && (
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(null)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-dashed border-[#20A7C9] dark:border-[#5bd6d8] text-color-neotam dark:text-[#5bd6d8] hover:bg-[#20A7C9] hover:text-white transition cursor-pointer flex items-center gap-1.5"
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <line x1="12" x2="12" y1="5" y2="19" />
                    <line x1="5" x2="19" y1="12" y2="12" />
                  </svg>
                  <span>Tạo Group</span>
                </button>
              )}
            </div>
          </section>
        )}

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
          <div className="animate-fade-up p-14 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component text-center">
            <p className="text-base font-semibold text-color-black-100 dark:text-color-white-90 mb-1">
              Hiện chưa có Group nào trong phạm vi quản lý của bạn
            </p>
            <p className="text-xs text-color-black-50 dark:text-color-white-50">
              {canCreateGroup
                ? "Nhấn nút '+ Add new group' bên dưới để tạo Group đầu tiên."
                : "Tài khoản của bạn chưa được gán quyền quản lý Group."}
            </p>
          </div>
        ) : layoutMode === "split" ? (
          /* Bố cục 2 Cột: Cột trái Cây thư mục Group (Explorer Sidebar) - Cột phải Workspace Chi tiết */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start animate-fade-up">
            {/* Cột trái: Cây thư mục Group */}
            <div className="lg:col-span-4 xl:col-span-4 rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-4 shadow-component space-y-3 lg:sticky lg:top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border-black-10 dark:border-background-white-15">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#20A7C9] animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-color-black-100 dark:text-color-white-90">
                    Cây thư mục Group
                  </h3>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-background-dashboard dark:bg-background-white-8 text-color-black-70 dark:text-color-white-70">
                  {filteredGroupsForExplorer.length} nhánh
                </span>
              </div>

              {filteredGroupsForExplorer.length === 0 ? (
                <div className="py-8 text-center text-xs text-color-black-50 dark:text-color-white-50">
                  Không tìm thấy Group phù hợp
                </div>
              ) : (
                <div className="space-y-1">
                  {filteredGroupsForExplorer.map((grp) => (
                    <GroupTreeNode
                      key={grp.id}
                      group={grp}
                      level={0}
                      selectedGroupId={selectedGroupId}
                      onSelectGroup={(id) => setSelectedGroupId(id)}
                      searchQuery={groupSearchQuery}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Cột phải: Không gian quản trị chi tiết (Workspace) */}
            <div className="lg:col-span-8 xl:col-span-8">
              {selectedGroup ? (
                <GroupDetailWorkspace
                  group={selectedGroup}
                  groups={groups}
                  isSystemManager={isSystemManager}
                  onOpenEditModal={handleOpenEditModal}
                  onOpenCreateChildModal={handleOpenCreateModal}
                  onOpenMembersModal={handleOpenMembersModal}
                  onRequestDeleteGroup={handleRequestDeleteGroup}
                  onSelectGroup={(id) => setSelectedGroupId(id)}
                />
              ) : (
                <div className="p-12 rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 text-center text-xs text-color-black-50 dark:text-color-white-50">
                  Vui lòng chọn một Group ở cột bên trái để xem chi tiết.
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Bố cục Lưới: Hiển thị 2 cột song song thay vì 1 khối dài lê thê */
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 animate-fade-up">
            {filteredGroupsForExplorer.map((group, idx) => (
              <GroupCardNode
                key={group.id}
                group={group}
                index={idx}
                level={0}
                isSystemManager={isSystemManager}
                onOpenEditModal={handleOpenEditModal}
                onOpenCreateChildModal={handleOpenCreateModal}
                onOpenMembersModal={handleOpenMembersModal}
                onRequestDeleteGroup={handleRequestDeleteGroup}
              />
            ))}
          </div>
        )}

        {/* Nút + Add new group ở cuối trang */}
        {!loading && canCreateGroup && (
          <div className="mt-6 animate-fade-up">
            <button
              type="button"
              onClick={() => handleOpenCreateModal(null)}
              className="inline-flex items-center gap-2.5 px-5 py-3 rounded-2xl border-2 border-dashed border-[#20A7C9] dark:border-[#5bd6d8] text-color-neotam dark:text-[#5bd6d8] hover:bg-gradient-to-r hover:from-[#20A7C9] hover:to-[#2fc4c6] hover:text-white hover:border-transparent hover:-translate-y-0.5 hover:shadow-md font-semibold text-sm transition-all duration-200 cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 py-6">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-lg rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 shadow-2xl">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#20A7C9] via-[#7367f0] to-[#f2994a]" />

            <div className="flex items-center justify-between gap-3 mb-2 pt-1">
              <h3 className="text-lg font-bold text-color-black-100 dark:text-color-white-90">
                Edit Dashboard list — {editingGroup.group_name}
              </h3>
              <button
                type="button"
                onClick={() => setEditingGroup(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-color-black-50 dark:text-color-white-50 mb-3.5">
              Chọn các Dashboard được cấp phát cho Group này:
            </p>

            <form onSubmit={handleSaveDashboards}>
              {selectableDashboardsForEdit.length === 0 ? (
                <div className="p-5 mb-4 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-dashed border-border-black-10 dark:border-background-white-15 text-xs text-color-black-50 dark:text-color-white-50 text-center">
                  {editingGroup.parent_group_id
                    ? "Group cha hiện chưa được cấp phát Dashboard nào. Vui lòng cấp phát Dashboard cho Group cha trước."
                    : "Không có Dashboard khả dụng để cấp phát."}
                </div>
              ) : (
                <>
                  {/* Ô tìm kiếm Dashboard trong modal & nút Chọn/Bỏ chọn */}
                  <div className="space-y-2 mb-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={dashSearch}
                        onChange={(e) => setDashSearch(e.target.value)}
                        placeholder="Tìm kiếm Dashboard theo tên, ID..."
                        className="w-full pl-9 pr-8 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-xs text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam transition"
                      />
                      <svg
                        className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-color-black-50 dark:text-color-white-50 pointer-events-none"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="11" cy="11" r="8" />
                        <path d="m21 21-4.3-4.3" />
                      </svg>
                      {dashSearch && (
                        <button
                          type="button"
                          onClick={() => setDashSearch("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 flex items-center justify-center text-xs text-color-black-50 hover:text-color-error"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="text-color-black-50 dark:text-color-white-50">
                        Đã chọn{" "}
                        <strong className="text-color-neotam dark:text-[#5bd6d8]">
                          {selectedDashIds.length}
                        </strong>
                        /{selectableDashboardsForEdit.length} Dashboard
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedDashIds(
                              selectableDashboardsForEdit.map((d) =>
                                Number(d.id),
                              ),
                            )
                          }
                          className="text-color-neotam dark:text-[#5bd6d8] hover:underline cursor-pointer font-medium"
                        >
                          Chọn tất cả
                        </button>
                        <span className="text-border-black-10 dark:text-background-white-15">
                          •
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedDashIds([])}
                          className="text-color-error hover:underline cursor-pointer font-medium"
                        >
                          Bỏ chọn
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-64 overflow-y-auto space-y-2 mb-4 pr-1">
                    {filteredSelectableDashboards.length === 0 ? (
                      <div className="p-4 rounded-xl border border-dashed border-border-black-10 dark:border-background-white-15 text-center text-xs text-color-black-50 dark:text-color-white-50">
                        Không tìm thấy Dashboard phù hợp với từ khóa "{dashSearch}"
                      </div>
                    ) : (
                      filteredSelectableDashboards.map((dash) => {
                        const checked = selectedDashIds.includes(
                          Number(dash.id),
                        );
                        return (
                          <label
                            key={dash.id}
                            className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                              checked
                                ? "border-color-neotam bg-background-checked dark:bg-[#20A7C9]/15 shadow-2xs"
                                : "border-border-black-10 dark:border-background-white-15 hover:border-color-neotam/50 bg-background-dashboard/40 dark:bg-background-white-8/30"
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
                            <span className="text-xs font-mono text-color-black-50 dark:text-color-white-50 px-2 py-0.5 rounded bg-background-light dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
                              #{dash.id}
                            </span>
                          </label>
                        );
                      })
                    )}
                  </div>
                </>
              )}

              {modalError && (
                <p className="text-xs text-color-error mb-3">{modalError}</p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-black-10 dark:border-background-white-15">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingDashboards}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white hover:shadow-md transition cursor-pointer disabled:opacity-60"
                >
                  {savingDashboards ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Add new group / Thêm Group con */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 py-6">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-md rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 shadow-2xl">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#7367f0] via-[#887ef2] to-[#9e95f5]" />

            <div className="flex items-center justify-between gap-3 mb-2 pt-1">
              <h3 className="text-lg font-bold text-color-black-100 dark:text-color-white-90">
                {creatingParentGroup
                  ? `Thêm Group con — ${creatingParentGroup.group_name}`
                  : "Add new group"}
              </h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-color-black-50 dark:text-color-white-50 mb-4">
              {creatingParentGroup
                ? `Tạo Group con trực thuộc "${creatingParentGroup.group_name}".`
                : "Tạo Group mới cấp cao nhất."}
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
                  className="px-4 py-2 rounded-xl text-xs font-medium border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#7367f0] to-[#9e95f5] text-white hover:shadow-md transition cursor-pointer disabled:opacity-60"
                >
                  {creatingGroup ? "Đang tạo..." : "Tạo Group"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xem / Quản lý thành viên & quản trị viên của Group */}
      {memberModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 py-6 overflow-y-auto">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-3xl rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#20A7C9] via-[#7367f0] to-[#f2994a]" />

            <div className="flex items-center justify-between gap-3 mb-3 pt-1">
              <div>
                <h3 className="text-lg font-bold text-color-black-100 dark:text-color-white-90">
                  {memberModalMode === "view"
                    ? `Danh sách Thành viên — ${memberModalGroup.group_name}`
                    : `Quản lý Thành viên & Quản trị — ${memberModalGroup.group_name}`}
                </h3>
                <p className="text-xs text-color-black-50 dark:text-color-white-50">
                  {memberModalMode === "view"
                    ? "Chế độ chỉ xem: Thông tin các thành viên trong Group và vai trò tương ứng."
                    : isSystemManager
                      ? "Bạn có quyền system.manage nên được phép gán các User khác trong bảng user_global_roles."
                      : "Bạn chỉ được gán các User khác do chính bạn tạo ra vào Group (không thể sửa hoặc xóa User trong hệ thống)."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setMemberModalGroup(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Form Gán User vào Group (chỉ hiện ở chế độ Quản lý User và khi user có quyền quản lý trong chính Group này) */}
            {memberModalMode === "manage" &&
              (isSystemManager ||
                (memberModalGroup.my_group_permissions || []).includes(
                  "system.manage",
                ) ||
                (memberModalGroup.my_group_permissions || []).includes(
                  "group_admin.assign",
                ) ||
                (memberModalGroup.my_group_permissions || []).includes(
                  "member.create",
                ) ||
                (memberModalGroup.my_group_permissions || []).includes(
                  "member.update",
                ) ||
                (memberModalGroup.my_group_permissions || []).includes(
                  "member_dashboard.assign",
                )) && (
                <form
                  onSubmit={handleAssignMember}
                  className="p-4 mb-5 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 space-y-3.5"
                >
                  {(() => {
                    // Chỉ check role & permission của người đang thao tác ở trong chính Group này (ở global chỉ check có phải là system không)
                    const modalGroupPerms = Array.isArray(
                      memberModalGroup.my_group_permissions,
                    )
                      ? memberModalGroup.my_group_permissions
                      : [];
                    const modalGroupRoles = Array.isArray(
                      memberModalGroup.my_group_roles,
                    )
                      ? memberModalGroup.my_group_roles
                      : [];

                    const canAssignModalGroupAdmin =
                      isSystemManager ||
                      modalGroupPerms.includes("group_admin.assign");

                    const actorGroupRank = isSystemManager
                      ? 4
                      : modalGroupRoles.length > 0
                        ? Math.max(
                            ...modalGroupRoles.map((r) => getRoleRank(r)),
                          )
                        : 1;

                    const editingMemberObj = groupMembers.find(
                      (m) =>
                        String(m.id ?? m.user_id) === String(targetUserId),
                    );

                    const selectedTargetUser =
                      editingMemberObj ||
                      assignableUsers.find(
                        (u) =>
                          String(u.id ?? u.user_id) === String(targetUserId),
                      );

                    const targetMaxGlobalRank = selectedTargetUser
                      ? getUserMaxGlobalRank(selectedTargetUser)
                      : 1;

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                            {editingMemberObj
                              ? "Đang sửa thành viên trong Group *"
                              : "Chọn User cần gán *"}
                          </label>
                          <select
                            value={targetUserId}
                            onChange={(e) => {
                              const newId = e.target.value;
                              setTargetUserId(newId);
                              const foundUser =
                                groupMembers.find(
                                  (m) =>
                                    String(m.id ?? m.user_id) ===
                                    String(newId),
                                ) ||
                                assignableUsers.find(
                                  (u) =>
                                    String(u.id ?? u.user_id) ===
                                    String(newId),
                                );
                              if (foundUser) {
                                const maxRank = getUserMaxGlobalRank(foundUser);
                                if (getRoleRank(roleInGroup) > maxRank) {
                                  setRoleInGroup("group_member");
                                }
                              }
                            }}
                            className="w-full px-3 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-light dark:bg-background-dark text-xs text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam"
                            required
                          >
                            <option value="">-- Chọn User --</option>
                            {editingMemberObj && (
                              <option
                                value={
                                  editingMemberObj.id ??
                                  editingMemberObj.user_id
                                }
                              >
                                #{editingMemberObj.id ?? editingMemberObj.user_id}{" "}
                                — {editingMemberObj.username} (
                                {editingMemberObj.email || "no-email"}) [Global:{" "}
                                {editingMemberObj.highest_global_role_name ||
                                  "Thành viên"}
                                ] [Đang sửa]
                              </option>
                            )}
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
                                // Không cho phép gán user đã có chức vụ trong Group này hoặc trong nhánh Group cha - con - cháu
                                const alreadyInGroup = groupMembers.some(
                                  (m) => Number(m.id ?? m.user_id) === uid,
                                );
                                if (alreadyInGroup) return false;
                                const lineageSet = getSameLineageGroupIds(
                                  groups,
                                  memberModalGroup.id,
                                );
                                const userGroupIds = Array.isArray(
                                  u.member_group_ids,
                                )
                                  ? u.member_group_ids
                                  : [];
                                if (
                                  userGroupIds.some((gId) =>
                                    lineageSet.has(Number(gId)),
                                  )
                                ) {
                                  return false;
                                }
                                if (!isSystemManager) {
                                  const isCreatedByMe =
                                    Number(u.assigned_by) === currentId ||
                                    Number(u.created_by_fk) === currentId;
                                  if (!isCreatedByMe) return false;
                                }
                                return true;
                              })
                              .map((u) => {
                                const uid = u.id ?? u.user_id;
                                const globalName =
                                  u.highest_global_role_name ||
                                  u.role_name ||
                                  "Thành viên";
                                return (
                                  <option key={uid} value={uid}>
                                    #{uid} — {u.username} (
                                    {u.email || "no-email"}) [Global: {globalName}]
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
                            {canAssignModalGroupAdmin &&
                              actorGroupRank >= 2 &&
                              targetMaxGlobalRank >= 2 && (
                                <option value="group_admin">
                                  Quản trị Group (group_admin)
                                </option>
                              )}
                            {canAssignModalGroupAdmin &&
                              actorGroupRank >= 3 &&
                              targetMaxGlobalRank >= 3 && (
                                <option value="super_admin">
                                  Quản trị cấp cao (super_admin)
                                </option>
                              )}
                          </select>
                          {selectedTargetUser && (
                            <p className="text-[11px] text-color-black-50 dark:text-color-white-50 mt-1">
                              Vai trò tối đa trong Group:{" "}
                              <span className="font-semibold text-color-black-70 dark:text-color-white-80">
                                {selectedTargetUser.highest_global_role_name ||
                                  "Thành viên"}
                              </span>{" "}
                              (theo Global Role)
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Chọn các Dashboard cho phép thành viên xem (từ danh sách Dashboard của Group) */}
                  {roleInGroup === "group_member" && (
                    <div>
                      <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                        Cấp phát Dashboard xem trong Group (
                        {memberDashIds.length}/
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
                    <p className="text-xs text-color-error">
                      {memberModalError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2">
                    {groupMembers.some(
                      (m) =>
                        String(m.id ?? m.user_id) === String(targetUserId),
                    ) && (
                      <button
                        type="button"
                        onClick={() => {
                          setTargetUserId("");
                          setRoleInGroup("group_member");
                          setMemberDashIds(
                            (memberModalGroup.dashboards || []).map((d) =>
                              Number(d.id),
                            ),
                          );
                        }}
                        className="px-3.5 py-2 rounded-xl text-xs font-medium border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 cursor-pointer"
                      >
                        Hủy sửa
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={savingMember}
                      className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white cursor-pointer disabled:opacity-60"
                    >
                      {savingMember
                        ? "Đang lưu..."
                        : groupMembers.some(
                              (m) =>
                                String(m.id ?? m.user_id) ===
                                String(targetUserId),
                            )
                          ? "Cập nhật thành viên"
                          : "Gán User vào Group"}
                    </button>
                  </div>
                </form>
              )}

            {/* Danh sách thành viên hiện tại trong Group */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-color-neotam dark:text-[#5bd6d8] mb-2.5">
                Danh sách Thành viên & Vai trò trong Group (
                {groupMembers.length})
              </h4>

              {memberModalMode === "view" && memberModalError && (
                <p className="text-xs text-color-error mb-2">
                  {memberModalError}
                </p>
              )}

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
                        {memberModalMode === "manage" && (
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
                        const isUserCreatedByMe =
                          Number(m.assigned_by) === currentId ||
                          Number(m.created_by_fk) === currentId;
                        const isAssignedToGroupByMe =
                          Number(m.created_by) === currentId;
                        // Mặc dù user đó do mình tạo ra nhưng nếu không phải chính mình gán vào Group thì không thể sửa hoặc xóa (trừ system)
                        const canEditOrDeleteMember =
                          !isSelf &&
                          (isSystemManager ||
                            (isUserCreatedByMe && isAssignedToGroupByMe));
                        const roleCode =
                          m.role_code || m.role_in_group || "group_member";
                        const roleLabel = m.role_name || roleCode;
                        const dashCount = Array.isArray(m.member_dashboard_ids)
                          ? m.member_dashboard_ids.length
                          : (m.dashboards || []).length;

                        return (
                          <tr
                            key={memberId}
                            className="hover:bg-background-dashboard/50 dark:hover:bg-background-white-8/40 transition-colors"
                          >
                            <td className="py-2.5 pr-3 font-semibold text-color-black-100 dark:text-color-white-90">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#20A7C9] to-[#7367f0] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                                  {(m.username || "U").charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div>
                                    #{memberId} — {m.username}
                                  </div>
                                  {m.full_name && (
                                    <div className="text-[11px] font-normal text-color-black-50 dark:text-color-white-50">
                                      {m.full_name}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="py-2.5 px-3 text-color-black-70 dark:text-color-white-80">
                              {m.email || "-"}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                                  roleCode === "super_admin"
                                    ? "bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8] border-[#7367f0]/30"
                                    : roleCode === "group_admin"
                                      ? "bg-[#20A7C9]/15 text-[#20A7C9] dark:text-[#5bd6d8] border-[#20A7C9]/30"
                                      : "bg-[#0cb7a9]/15 text-[#0cb7a9] dark:text-color-succes-type-1-dark border-[#0cb7a9]/30"
                                }`}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                                <span>
                                  {roleLabel} ({roleCode})
                                </span>
                              </span>
                              {m.highest_global_role_name && (
                                <div className="text-[10px] text-color-black-50 dark:text-color-white-50 mt-0.5">
                                  Global: {m.highest_global_role_name}
                                </div>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-color-black-70 dark:text-color-white-80">
                              <span className="inline-block px-2 py-0.5 rounded-md bg-background-light dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 font-medium">
                                {roleCode === "group_member"
                                  ? `${dashCount} dashboard`
                                  : "Tất cả trong Group"}
                              </span>
                            </td>
                            {memberModalMode === "manage" && (
                              <td className="py-2.5 pl-3 text-right space-x-1.5">
                                {canEditOrDeleteMember && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleSelectExistingMemberForEdit(m)
                                      }
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#20A7C9]/10 text-color-neotam dark:text-[#5bd6d8] hover:bg-[#20A7C9] hover:text-white transition cursor-pointer active:scale-95 shadow-2xs"
                                    >
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
                                        />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"
                                        />
                                      </svg>
                                      <span>Sửa</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleRequestRemoveMember(m)
                                      }
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-color-error/10 text-color-error hover:bg-color-error hover:text-white transition cursor-pointer active:scale-95 shadow-2xs"
                                    >
                                      <svg
                                        className="w-3 h-3"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                      >
                                        <polyline points="3 6 5 6 21 6" />
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                                        />
                                      </svg>
                                      <span>Xóa</span>
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

      {/* Popup xác nhận Xóa (Xóa Group hoặc Xóa thành viên khỏi Group) */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs px-4 py-6">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-md rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 shadow-2xl">
            {/* Top red accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#eb5757] via-[#ff7676] to-[#f2994a]" />

            <div className="flex items-center gap-3.5 mb-3 pt-1">
              <div className="relative flex items-center justify-center shrink-0">
                <span className="animate-ping absolute inline-flex h-9 w-9 rounded-2xl bg-color-error/25" />
                <div className="w-11 h-11 rounded-2xl bg-color-error/15 text-color-error flex items-center justify-center shrink-0 border border-color-error/30 shadow-xs">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v4m0 4h.01M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"
                    />
                  </svg>
                </div>
              </div>
              <h3 className="text-lg font-bold text-color-black-100 dark:text-color-white-90">
                {confirmDelete.type === "group"
                  ? "Xác nhận xóa Group"
                  : "Xác nhận xóa thành viên khỏi Group"}
              </h3>
            </div>

            <p className="text-xs leading-relaxed text-color-black-70 dark:text-color-white-80 mb-4">
              {confirmDelete.type === "group" ? (
                <>
                  Bạn có chắc chắn muốn xóa Group{" "}
                  <strong className="text-color-black-100 dark:text-color-white-90">
                    "{confirmDelete.group?.group_name}"
                  </strong>{" "}
                  không? Toàn bộ các dữ liệu liên quan (bao gồm các Group con,
                  danh sách thành viên và Dashboard cấp phát trong Group) sẽ bị
                  xóa.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn xóa thành viên{" "}
                  <strong className="text-color-black-100 dark:text-color-white-90">
                    #{confirmDelete.member?.id ?? confirmDelete.member?.user_id}{" "}
                    — {confirmDelete.member?.username}
                  </strong>{" "}
                  khỏi Group{" "}
                  <strong className="text-color-black-100 dark:text-color-white-90">
                    "{confirmDelete.group?.group_name}"
                  </strong>{" "}
                  không? Các quyền và Dashboard được cấp cho thành viên này
                  trong Group sẽ bị xóa.
                </>
              )}
            </p>

            {confirmDeleteError && (
              <p className="text-xs text-color-error mb-3">
                {confirmDeleteError}
              </p>
            )}

            <div className="flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={deletingConfirm}
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deletingConfirm}
                onClick={handleConfirmDeleteAction}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-color-error text-white hover:opacity-90 hover:shadow-md transition cursor-pointer disabled:opacity-60"
              >
                {deletingConfirm ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
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
