import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Header from "../components/layouts/headers/Header";
import Footer from "../components/layouts/footers/Footer";
import Loading from "../components/commons/Loading";
import { DashboardFilterProvider } from "../context/DashboardFilterContext";
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
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "—";
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

  let curr = parentMap.get(Number(targetId));
  while (curr) {
    lineageSet.add(Number(curr));
    curr = parentMap.get(Number(curr));
  }

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
            ? "bg-gradient-to-r from-[#20A7C9]/15 to-[#7367f0]/15 border-color-neotam dark:border-[#5bd6d8] text-color-neotam dark:text-[#5bd6d8] font-bold"
            : "border-transparent hover:border-border-black-10 dark:hover:border-background-white-15 hover:bg-background-dashboard dark:hover:bg-background-white-8 text-color-black-80 dark:text-color-white-90"
        }`}
        style={{ paddingLeft: `${Math.max(10, level * 14 + 10)}px` }}
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
            <span className="w-4 h-4 flex items-center justify-center opacity-35 text-[10px] shrink-0">
              •
            </span>
          )}

          <div
            className={`w-6 h-6 rounded-lg ${accent.folderBg} ${accent.folderText} flex items-center justify-center shrink-0`}
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

        <div className="flex items-center gap-1 shrink-0">
          <span
            className="px-1.5 py-0.5 rounded-md text-[10px] bg-background-black-4 dark:bg-background-white-8 text-color-black-50 dark:text-color-white-50"
            title={`${group.member_count || 0} thành viên`}
          >
            {group.member_count || 0}
          </span>
          <span
            className="px-1.5 py-0.5 rounded-md text-[10px] bg-background-ave-reach/50 dark:bg-[#21b8b8]/15 text-color-ave-reach dark:text-[#5bd6d8]"
            title={`${dashboards.length} báo cáo`}
          >
            {dashboards.length}
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

const GroupDetailWorkspace = ({
  group,
  groups,
  isSystemManager,
  currentUserId,
  onOpenEditModal,
  onOpenCreateChildModal,
  onOpenMembersModal,
  onRequestDeleteGroup,
  onSelectGroup,
}) => {
  if (!group) return null;

  const dashboards = group.dashboards || [];
  const children = group.children || [];
  const groupRoles = Array.isArray(group.my_group_roles)
    ? group.my_group_roles
    : [];

  const flatGroup = flattenGroups(groups).find(
    (g) => Number(g.id) === Number(group.id),
  );
  const actualLevel = flatGroup
    ? flatGroup.level
    : group.parent_group_id
      ? 1
      : 0;

  const isMaxDepthReached = actualLevel >= 4;
  const isMaxChildrenReached = children.length >= 10;

  const canEditGroupDashboards =
    isSystemManager ||
    groupRoles.includes("admin_ami") ||
    (actualLevel > 0 && groupRoles.includes("super_admin"));

  const canCreateChildGroup =
    (isSystemManager ||
      groupRoles.includes("admin_ami") ||
      groupRoles.includes("super_admin")) &&
    !isMaxDepthReached &&
    !isMaxChildrenReached;

  const isCreator = Number(group.created_by) === Number(currentUserId);
  const canDeleteGroup =
    isSystemManager ||
    (isCreator &&
      (groupRoles.includes("admin_ami") || groupRoles.includes("super_admin")));

  const canManageGroupMembers =
    isSystemManager ||
    groupRoles.includes("admin_ami") ||
    groupRoles.includes("super_admin") ||
    groupRoles.includes("group_admin");

  const myRoleLabelInGroup =
    isSystemManager || groupRoles.includes("admin_ami")
      ? ""
      : groupRoles.includes("super_admin")
        ? "Super Admin"
        : groupRoles.includes("group_admin")
          ? "Group Admin"
          : groupRoles.includes("group_member")
            ? "Thành viên"
            : "";

  const breadcrumbs = getGroupBreadcrumb(groups, group.id);

  return (
    <div className="space-y-5">
      {/* Group Header Card */}
      <div className="relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-5 sm:p-6 shadow-component">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#20A7C9] via-[#7367f0] to-[#f2994a]" />

        {/* Breadcrumb */}
        {breadcrumbs.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-color-black-50 dark:text-color-white-50 mb-3">
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={bc.id}>
                {idx > 0 && <span>/</span>}
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
        )}

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center shrink-0">
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
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-color-black-100 dark:text-color-white-90">
                  {group.group_name}
                </h2>
                <button
                  type="button"
                  onClick={() => onOpenMembersModal(group, "view")}
                  className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border border-[#21b8b8]/30 bg-background-ave-reach text-color-ave-reach dark:bg-[#21b8b8]/15 dark:text-[#5bd6d8] cursor-pointer hover:opacity-90 transition"
                >
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

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {canManageGroupMembers && (
              <button
                type="button"
                onClick={() => onOpenMembersModal(group, "manage")}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-[#7367f0]/40 bg-[#7367f0]/10 text-[#7367f0] dark:text-[#a59ff8] hover:bg-[#7367f0] hover:text-white transition cursor-pointer flex items-center gap-1.5"
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
                <span>Thành viên</span>
              </button>
            )}
            {canCreateChildGroup ? (
              <button
                type="button"
                onClick={() => onOpenCreateChildModal(group)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 hover:border-[#20A7C9] hover:text-color-neotam dark:hover:text-[#5bd6d8] transition cursor-pointer flex items-center gap-1.5"
              >
                <span>+ Nhóm con</span>
              </button>
            ) : isSystemManager || groupRoles.includes("super_admin") ? (
              <span className="px-3 py-2 rounded-xl text-xs font-medium border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-color-black-40 dark:text-color-white-40 select-none">
                {isMaxDepthReached ? "Tối đa 5 cấp" : "Đủ 10 nhóm con"}
              </span>
            ) : null}
            {canDeleteGroup && (
              <button
                type="button"
                onClick={() => onRequestDeleteGroup(group)}
                className="px-3 py-2 rounded-xl text-xs font-semibold border border-color-error/40 bg-color-error/10 text-color-error hover:bg-color-error hover:text-white transition cursor-pointer flex items-center gap-1.5"
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
                <span>Xóa</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dashboards Section */}
      <div className="rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-5 sm:p-6 shadow-component">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-border-black-10 dark:border-background-white-15">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-color-black-100 dark:text-color-white-90 uppercase tracking-wider">
              Báo cáo được cấp phát
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8]">
              {dashboards.length}
            </span>
          </div>

          {canEditGroupDashboards && (
            <button
              type="button"
              onClick={() => onOpenEditModal(group)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border border-[#20A7C9]/40 bg-background-search dark:bg-background-white-8 text-color-neotam dark:text-[#5bd6d8] hover:bg-gradient-to-r hover:from-[#20A7C9] hover:to-[#2fc4c6] hover:text-white hover:border-transparent transition cursor-pointer"
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
              <span>Cập nhật báo cáo</span>
            </button>
          )}
        </div>

        {dashboards.length === 0 ? (
          <div className="py-8 px-4 rounded-xl border border-dashed border-border-black-10 dark:border-background-white-15 text-center text-xs text-color-black-50 dark:text-color-white-50 flex flex-col items-center justify-center gap-1.5">
            <span>Chưa có báo cáo nào được cấp phát.</span>
            {canEditGroupDashboards && (
              <button
                type="button"
                onClick={() => onOpenEditModal(group)}
                className="text-color-neotam dark:text-[#5bd6d8] hover:underline font-semibold mt-1 cursor-pointer"
              >
                + Cấp phát báo cáo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {dashboards.map((dash) => (
              <Link
                key={dash.id}
                to={dash.path}
                className="group/d flex items-center justify-between p-3.5 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-dashboard/60 dark:bg-background-white-8/40 hover:border-[#20A7C9] dark:hover:border-[#5bd6d8] transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-background-ave-reach dark:bg-[#21b8b8]/20 text-color-ave-reach dark:text-[#5bd6d8] flex items-center justify-center shrink-0">
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
                  <span className="text-xs sm:text-sm font-bold text-color-black-100 dark:text-color-white-90 group-hover/d:text-color-neotam dark:group-hover/d:text-[#5bd6d8] transition-colors truncate">
                    {dash.dashboard_title}
                  </span>
                </div>

                <span className="text-xs font-semibold text-color-neotam dark:text-[#5bd6d8] shrink-0">
                  Mở →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Child Groups Section */}
      {children.length > 0 && (
        <div className="rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-5 sm:p-6 shadow-component">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border-black-10 dark:border-background-white-15">
            <h3 className="text-xs font-bold text-color-black-100 dark:text-color-white-90 uppercase tracking-wider">
              Nhóm con trực thuộc
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8]">
              {children.length}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {children.map((child) => (
              <div
                key={child.id}
                onClick={() => onSelectGroup(child.id)}
                className="group/child flex items-center justify-between p-3.5 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-dashboard/60 dark:bg-background-white-8/40 hover:border-[#7367f0] cursor-pointer transition-all duration-200"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-background-rating-percent dark:bg-[#7367f0]/20 text-color-rating-percent dark:text-[#a59ff8] flex items-center justify-center shrink-0">
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
                    <p className="text-xs sm:text-sm font-bold text-color-black-100 dark:text-color-white-90 group-hover/child:text-[#7367f0] dark:group-hover/child:text-[#a59ff8] transition-colors truncate">
                      {child.group_name}
                    </p>
                    <p className="text-[11px] text-color-black-50 dark:text-color-white-50">
                      {child.member_count || 0} thành viên •{" "}
                      {(child.dashboards || []).length} báo cáo
                    </p>
                  </div>
                </div>

                <span className="text-xs font-semibold text-color-neotam dark:text-[#5bd6d8] shrink-0">
                  Chọn →
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
  currentUserId,
  onOpenEditModal,
  onOpenCreateChildModal,
  onOpenMembersModal,
  onRequestDeleteGroup,
}) => {
  const accent = GROUP_ACCENTS[(index + level) % GROUP_ACCENTS.length];
  const dashboards = group.dashboards || [];
  const children = group.children || [];
  const [isExpanded, setIsExpanded] = useState(true);

  const groupRoles = Array.isArray(group.my_group_roles)
    ? group.my_group_roles
    : [];

  const isMaxDepthReached = level >= 4;
  const isMaxChildrenReached = children.length >= 10;

  const canEditGroupDashboards =
    isSystemManager ||
    groupRoles.includes("admin_ami") ||
    (level > 0 && groupRoles.includes("super_admin"));

  const canCreateChildGroup =
    (isSystemManager ||
      groupRoles.includes("admin_ami") ||
      groupRoles.includes("super_admin")) &&
    !isMaxDepthReached &&
    !isMaxChildrenReached;

  const isCreator = Number(group.created_by) === Number(currentUserId);
  const canDeleteGroup =
    isSystemManager ||
    (isCreator &&
      (groupRoles.includes("admin_ami") || groupRoles.includes("super_admin")));

  const canManageGroupMembers =
    isSystemManager ||
    groupRoles.includes("admin_ami") ||
    groupRoles.includes("super_admin") ||
    groupRoles.includes("group_admin");

  const myRoleLabelInGroup =
    isSystemManager || groupRoles.includes("admin_ami")
      ? ""
      : groupRoles.includes("super_admin")
        ? "Super Admin"
        : groupRoles.includes("group_admin")
          ? "Group Admin"
          : groupRoles.includes("group_member")
            ? "Thành viên"
            : "";

  return (
    <div
      className={
        level > 0
          ? "mt-3.5 pl-4 sm:pl-5 border-l-2 border-dashed border-[#20A7C9]/40 dark:border-[#5bd6d8]/30 relative"
          : ""
      }
    >
      <div
        className={`relative overflow-hidden rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-5 shadow-component transition-all duration-200 ${accent.hoverBorder}`}
      >
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent.bar}`}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
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
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                  {group.group_name}
                </h2>

                <button
                  type="button"
                  onClick={() => onOpenMembersModal(group, "view")}
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border cursor-pointer ${accent.badge}`}
                >
                  <span>{group.member_count || 0} thành viên</span>
                </button>

                {!isSystemManager && level === 0 && myRoleLabelInGroup && (
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8] border border-[#7367f0]/30">
                    {myRoleLabelInGroup}
                  </span>
                )}

                {children.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 border border-border-black-10 dark:border-background-white-15 cursor-pointer"
                  >
                    <span>{children.length} nhóm con</span>
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
                <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-0.5">
                  {group.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {canManageGroupMembers && (
              <button
                type="button"
                onClick={() => onOpenMembersModal(group, "manage")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#7367f0]/40 bg-[#7367f0]/10 text-[#7367f0] dark:text-[#a59ff8] hover:bg-[#7367f0] hover:text-white transition cursor-pointer"
              >
                Thành viên
              </button>
            )}

            {canCreateChildGroup && (
              <button
                type="button"
                onClick={() => onOpenCreateChildModal(group)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 hover:border-[#20A7C9] hover:text-color-neotam transition cursor-pointer"
              >
                + Nhóm con
              </button>
            )}

            {canEditGroupDashboards && (
              <button
                type="button"
                onClick={() => onOpenEditModal(group)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#20A7C9]/40 bg-background-search dark:bg-background-white-8 text-color-neotam dark:text-[#5bd6d8] hover:bg-[#20A7C9] hover:text-white transition cursor-pointer"
              >
                Báo cáo
              </button>
            )}

            {canDeleteGroup && (
              <button
                type="button"
                onClick={() => onRequestDeleteGroup(group)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-color-error/40 bg-color-error/10 text-color-error hover:bg-color-error hover:text-white transition cursor-pointer"
              >
                Xóa
              </button>
            )}
          </div>
        </div>

        {/* Dashboards list inside card */}
        <div className="rounded-xl border border-border-black-10/70 dark:border-background-white-15/70 bg-background-dashboard/50 dark:bg-background-white-8/30 p-3">
          {dashboards.length === 0 ? (
            <div className="py-3 text-xs text-color-black-50 dark:text-color-white-50 text-center">
              Chưa có báo cáo được cấp phát
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {dashboards.map((dash) => (
                <Link
                  key={dash.id}
                  to={dash.path}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 text-xs font-semibold text-color-black-100 dark:text-color-white-90 hover:border-color-neotam hover:text-color-neotam dark:hover:text-[#5bd6d8] transition"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-[#20A7C9]" />
                  <span>{dash.dashboard_title}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {children.length > 0 && isExpanded && (
        <div className="space-y-3.5">
          {children.map((child, childIdx) => (
            <GroupCardNode
              key={child.id}
              group={child}
              index={childIdx}
              level={level + 1}
              isSystemManager={isSystemManager}
              currentUserId={currentUserId}
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
  const [user, setUser] = useState(null);
  const [roles, setRoles] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [groups, setGroups] = useState([]);

  const [availableDashboards, setAvailableDashboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  // Popup xác nhận xóa
  const [confirmDelete, setConfirmDelete] = useState(null);
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

  const selectedGroup = useMemo(() => {
    if (!selectedGroupId) return groups[0] || null;
    return findGroupById(groups, selectedGroupId) || groups[0] || null;
  }, [groups, selectedGroupId]);

  const filteredGroupsForExplorer = useMemo(() => {
    const q = groupSearchQuery.trim().toLowerCase();
    if (!q) return groups;

    function filterNodes(nodes) {
      const res = [];
      for (const node of nodes) {
        const matchesSelf = (node.group_name || "").toLowerCase().includes(q);
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

  const isSystemManager = roles.includes("admin_ami");

  const currentUserId = Number(
    user?.user_id ||
      user?.id ||
      user?.profile?.id ||
      sessionStorage.getItem("user_id"),
  );

  const canCreateGroup = roles.includes("admin_ami");
  const isHighAdmin = !isSystemManager && roles.includes("super_admin");
  const isGroupLevelAdmin =
    !isSystemManager && !isHighAdmin && roles.includes("group_admin");

  const roleBadgeLabel = useMemo(() => {
    if (isSystemManager) return "Quản trị hệ thống";
    if (isHighAdmin) return "Quản trị cấp cao";
    if (isGroupLevelAdmin) return "Quản trị nhóm";
    return "Thành viên";
  }, [isSystemManager, isHighAdmin, isGroupLevelAdmin]);

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
  }, [editingGroup, availableDashboards, groups]);

  const filteredSelectableDashboards = useMemo(() => {
    const q = dashSearch.trim().toLowerCase();
    if (!q) return selectableDashboardsForEdit;
    return selectableDashboardsForEdit.filter(
      (d) =>
        (d.dashboard_title || "").toLowerCase().includes(q) ||
        String(d.id).includes(q),
    );
  }, [selectableDashboardsForEdit, dashSearch]);

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

  const handleOpenCreateModal = (parentGroup = null) => {
    if (parentGroup) {
      const flatItem = flatGroupOptions.find(
        (g) => Number(g.id) === Number(parentGroup.id),
      );
      const pLevel = flatItem ? flatItem.level : 0;
      const pChildrenCount = (parentGroup.children || []).length;

      if (pLevel >= 4) {
        alert(
          "Một nhánh chỉ được phép tồn tại tối đa 5 cấp. Không thể tạo thêm nhóm con.",
        );
        return;
      }
      if (pChildrenCount >= 10) {
        alert(
          "Mỗi nhóm cha chỉ được phép có tối đa 10 nhóm con.",
        );
        return;
      }
    }

    setModalError("");
    setCreatingParentGroup(parentGroup);
    setNewGroupName("");
    setNewGroupDesc("");
    setNewParentGroupId(parentGroup ? String(parentGroup.id) : "");
    setShowCreateModal(true);
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      setModalError("Vui lòng nhập tên nhóm");
      return;
    }

    if (!isSystemManager && !newParentGroupId) {
      setModalError("Vui lòng chọn nhóm cha");
      return;
    }

    if (newParentGroupId) {
      const targetParent = findGroupById(groups, Number(newParentGroupId));
      const flatParent = flatGroupOptions.find(
        (g) => Number(g.id) === Number(newParentGroupId),
      );
      if (flatParent && flatParent.level >= 4) {
        setModalError("Nhánh này đã đạt giới hạn tối đa 5 cấp.");
        return;
      }
      if (targetParent && (targetParent.children || []).length >= 10) {
        setModalError("Nhóm cha này đã đạt giới hạn tối đa 10 nhóm con.");
        return;
      }
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
        err.response?.data?.message || err.message || "Tạo nhóm thất bại",
      );
    } finally {
      setCreatingGroup(false);
    }
  };

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
          "Không thể tải danh sách thành viên",
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
      setMemberModalError("Vui lòng chọn tài khoản cần gán");
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
          "Vai trò trong nhóm không được cao hơn vai trò hệ thống của người dùng.",
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
          "Gán thành viên vào nhóm thất bại",
      );
    } finally {
      setSavingMember(false);
    }
  };

  const handleRequestDeleteGroup = (group) => {
    if (!isSystemManager && Number(group.created_by) !== currentUserId) {
      alert("Bạn chỉ có thể xóa nhóm do chính bạn tạo ra");
      return;
    }
    setConfirmDeleteError("");
    setConfirmDelete({
      type: "group",
      group,
      member: null,
    });
  };

  const handleRequestRemoveMember = (member) => {
    if (!memberModalGroup) return;
    setConfirmDeleteError("");
    setConfirmDelete({
      type: "member",
      group: memberModalGroup,
      member,
    });
  };

  const handleConfirmDeleteAction = async () => {
    if (!confirmDelete) return;
    try {
      setDeletingConfirm(true);
      setConfirmDeleteError("");

      if (confirmDelete.type === "group" && confirmDelete.group) {
        if (
          !isSystemManager &&
          Number(confirmDelete.group.created_by) !== currentUserId
        ) {
          throw new Error("Bạn chỉ có thể xóa nhóm do chính bạn tạo ra");
        }
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

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* Executive Header */}
        <section className="relative overflow-hidden rounded-2xl p-6 bg-gradient-to-r from-[#1f1c47] via-[#4338ca] to-[#7367f0] dark:from-[#111725] dark:via-[#28245c] dark:to-[#5346d6] text-white shadow-lg border border-white/10">
          <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#5bd6d8]/20 blur-3xl" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-semibold mb-2.5 border border-white/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffd04c]" />
                <span>{roleBadgeLabel}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Phân quyền Nhóm & Báo cáo
              </h1>
              <p className="text-xs sm:text-sm text-white/80 mt-1">
                Quản lý cấu trúc cây đơn vị, thành viên và danh mục báo cáo được cấp phát
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto">
              <div className="flex items-center gap-3 bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl px-4 py-2.5">
                <div className="text-center px-2">
                  <p className="text-[10px] text-white/75 uppercase tracking-wider">
                    Tổng nhóm
                  </p>
                  <p className="text-lg font-black leading-tight">
                    {loading ? "—" : flatGroupOptions.length}
                  </p>
                </div>
                <div className="w-px h-7 bg-white/20" />
                <div className="text-center px-2">
                  <p className="text-[10px] text-white/75 uppercase tracking-wider">
                    Nhóm gốc
                  </p>
                  <p className="text-lg font-black leading-tight">
                    {loading ? "—" : groups.length}
                  </p>
                </div>
                <div className="w-px h-7 bg-white/20" />
                <div className="text-center px-2">
                  <p className="text-[10px] text-white/75 uppercase tracking-wider">
                    Báo cáo
                  </p>
                  <p className="text-lg font-black leading-tight">
                    {loading ? "—" : availableDashboards.length}
                  </p>
                </div>
              </div>

              {canCreateGroup && (
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(null)}
                  className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-[#312e81] hover:bg-[#ffd04c] hover:text-[#1f2933] transition cursor-pointer shadow-sm flex items-center gap-1.5"
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
                  <span>Tạo nhóm gốc</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Command Bar */}
        {!loading && !error && groups.length > 0 && (
          <section className="p-3.5 sm:p-4 rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-component flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                placeholder="Tìm kiếm nhóm..."
                className="w-full pl-9 pr-8 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-xs sm:text-sm text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam transition"
              />
              <svg
                className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-color-black-50 dark:text-color-white-50 pointer-events-none"
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
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-color-black-50 hover:text-color-error cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-2.5">
              <div className="flex items-center rounded-xl p-1 bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
                <button
                  type="button"
                  onClick={() => setLayoutMode("split")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    layoutMode === "split"
                      ? "bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-xs"
                      : "text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-color-white-90"
                  }`}
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
                  <span>Explorer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutMode("grid")}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    layoutMode === "grid"
                      ? "bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-xs"
                      : "text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-color-white-90"
                  }`}
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
                  <span>Lưới thẻ</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="p-6 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component">
            <Loading height="380px" />
          </div>
        ) : error ? (
          <div className="p-12 bg-background-light dark:bg-background-chart-dark border border-border-error rounded-2xl shadow-component text-center">
            <p className="text-sm font-semibold text-color-error">{error}</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="p-14 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component text-center">
            <p className="text-sm font-bold text-color-black-100 dark:text-color-white-90">
              Chưa có nhóm nào trong phạm vi quản lý
            </p>
            {canCreateGroup && (
              <button
                type="button"
                onClick={() => handleOpenCreateModal(null)}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white cursor-pointer"
              >
                + Tạo nhóm đầu tiên
              </button>
            )}
          </div>
        ) : layoutMode === "split" ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Sidebar: Tree Explorer */}
            <div className="lg:col-span-4 rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-4 shadow-component space-y-3 lg:sticky lg:top-4 max-h-[calc(100vh-120px)] overflow-y-auto">
              <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-border-black-10 dark:border-background-white-15">
                <h3 className="text-xs font-bold uppercase tracking-wider text-color-black-100 dark:text-color-white-90">
                  Cây đơn vị
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-background-dashboard dark:bg-background-white-8 text-color-black-70 dark:text-color-white-70">
                  {filteredGroupsForExplorer.length} nhánh
                </span>
              </div>

              {filteredGroupsForExplorer.length === 0 ? (
                <div className="py-8 text-center text-xs text-color-black-50 dark:text-color-white-50">
                  Không tìm thấy nhóm phù hợp
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

            {/* Right Pane: Group Detail Workspace */}
            <div className="lg:col-span-8">
              {selectedGroup ? (
                <GroupDetailWorkspace
                  group={selectedGroup}
                  groups={groups}
                  isSystemManager={isSystemManager}
                  currentUserId={currentUserId}
                  onOpenEditModal={handleOpenEditModal}
                  onOpenCreateChildModal={handleOpenCreateModal}
                  onOpenMembersModal={handleOpenMembersModal}
                  onRequestDeleteGroup={handleRequestDeleteGroup}
                  onSelectGroup={(id) => setSelectedGroupId(id)}
                />
              ) : (
                <div className="p-12 rounded-2xl bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 text-center text-xs text-color-black-50 dark:text-color-white-50">
                  Chọn một nhóm bên trái để xem chi tiết.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredGroupsForExplorer.map((group, idx) => (
              <GroupCardNode
                key={group.id}
                group={group}
                index={idx}
                level={0}
                isSystemManager={isSystemManager}
                currentUserId={currentUserId}
                onOpenEditModal={handleOpenEditModal}
                onOpenCreateChildModal={handleOpenCreateModal}
                onOpenMembersModal={handleOpenMembersModal}
                onRequestDeleteGroup={handleRequestDeleteGroup}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal: Cập nhật báo cáo của Nhóm */}
      {editingGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-lg rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6]" />

            <div className="flex items-center justify-between px-6 py-4 border-b border-border-black-10 dark:border-background-white-15">
              <div>
                <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                  Phân quyền báo cáo
                </h3>
                <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-0.5">
                  {editingGroup.group_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingGroup(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDashboards} className="p-6">
              {selectableDashboardsForEdit.length === 0 ? (
                <div className="p-5 mb-4 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-dashed border-border-black-10 dark:border-background-white-15 text-xs text-color-black-50 dark:text-color-white-50 text-center">
                  {editingGroup.parent_group_id
                    ? "Nhóm cha hiện chưa được cấp phát báo cáo nào."
                    : "Không có báo cáo khả dụng."}
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-3">
                    <div className="relative">
                      <input
                        type="text"
                        value={dashSearch}
                        onChange={(e) => setDashSearch(e.target.value)}
                        placeholder="Tìm kiếm báo cáo..."
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
                    </div>

                    <div className="flex items-center justify-between text-xs px-1">
                      <span className="text-color-black-50 dark:text-color-white-50">
                        Đã chọn{" "}
                        <strong className="text-color-neotam dark:text-[#5bd6d8]">
                          {selectedDashIds.length}
                        </strong>{" "}
                        / {selectableDashboardsForEdit.length}
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
                        <span>•</span>
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
                    {filteredSelectableDashboards.map((dash) => {
                      const checked = selectedDashIds.includes(Number(dash.id));
                      return (
                        <label
                          key={dash.id}
                          className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${
                            checked
                              ? "border-color-neotam bg-background-checked dark:bg-[#20A7C9]/15"
                              : "border-border-black-10 dark:border-background-white-15 bg-background-dashboard/40 dark:bg-background-white-8/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() => toggleDashId(Number(dash.id))}
                              className="w-4 h-4 accent-[#20A7C9] cursor-pointer"
                            />
                            <span className="text-xs sm:text-sm font-medium text-color-black-100 dark:text-color-white-90">
                              {dash.dashboard_title}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </>
              )}

              {modalError && (
                <p className="text-xs text-color-error mb-3">{modalError}</p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border-black-10 dark:border-background-white-15">
                <button
                  type="button"
                  onClick={() => setEditingGroup(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingDashboards}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white hover:opacity-95 transition cursor-pointer disabled:opacity-60"
                >
                  {savingDashboards ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Tạo Nhóm */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-md rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 shadow-2xl">
            <div className="h-1 bg-gradient-to-r from-[#7367f0] to-[#9e95f5]" />

            <div className="flex items-center justify-between px-6 py-4 border-b border-border-black-10 dark:border-background-white-15">
              <div>
                <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                  {creatingParentGroup ? "Thêm nhóm con" : "Tạo nhóm gốc"}
                </h3>
                {creatingParentGroup && (
                  <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-0.5">
                    Trực thuộc: {creatingParentGroup.group_name}
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                  Tên nhóm <span className="text-color-rating">*</span>
                </label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Nhập tên nhóm..."
                  className="w-full px-3.5 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-xs sm:text-sm text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                  Mô tả
                </label>
                <textarea
                  rows={2}
                  value={newGroupDesc}
                  onChange={(e) => setNewGroupDesc(e.target.value)}
                  placeholder="Mô tả ngắn gọn..."
                  className="w-full px-3.5 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-xs sm:text-sm text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam"
                />
              </div>

              {modalError && (
                <p className="text-xs text-color-error">{modalError}</p>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-black-10 dark:border-background-white-15">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={creatingGroup}
                  className="px-5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#7367f0] to-[#9e95f5] text-white hover:opacity-95 transition cursor-pointer disabled:opacity-60"
                >
                  {creatingGroup ? "Đang tạo..." : "Tạo nhóm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Xem / Quản lý Thành viên trong Nhóm */}
      {memberModalGroup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-3xl rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="h-1 bg-gradient-to-r from-[#20A7C9] via-[#7367f0] to-[#f2994a]" />

            <div className="flex items-center justify-between px-6 py-4 border-b border-border-black-10 dark:border-background-white-15">
              <div>
                <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
                  {memberModalMode === "view"
                    ? "Danh sách thành viên"
                    : "Quản lý thành viên"}
                </h3>
                <p className="text-xs text-color-black-50 dark:text-color-white-50 mt-0.5">
                  {memberModalGroup.group_name}
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

            <div className="p-6 overflow-y-auto space-y-5 flex-1">
              {/* Form Gán / Cập nhật thành viên */}
              {memberModalMode === "manage" &&
                (isSystemManager ||
                  (memberModalGroup.my_group_roles || []).includes(
                    "admin_ami",
                  ) ||
                  (memberModalGroup.my_group_roles || []).includes(
                    "super_admin",
                  ) ||
                  (memberModalGroup.my_group_roles || []).includes(
                    "group_admin",
                  )) && (
                  <form
                    onSubmit={handleAssignMember}
                    className="p-4 rounded-xl bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 space-y-3.5"
                  >
                    {(() => {
                      const modalGroupRoles = Array.isArray(
                        memberModalGroup.my_group_roles,
                      )
                        ? memberModalGroup.my_group_roles
                        : [];

                      const canAssignModalGroupAdmin =
                        isSystemManager ||
                        modalGroupRoles.includes("admin_ami") ||
                        modalGroupRoles.includes("super_admin");

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
                                ? "Thành viên đang chỉnh sửa"
                                : "Tài khoản cần thêm"}
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
                                  const maxRank =
                                    getUserMaxGlobalRank(foundUser);
                                  if (getRoleRank(roleInGroup) > maxRank) {
                                    setRoleInGroup("group_member");
                                  }
                                }
                              }}
                              className="w-full px-3 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-light dark:bg-background-dark text-xs text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam"
                              required
                            >
                              <option value="">-- Chọn tài khoản --</option>
                              {editingMemberObj && (
                                <option
                                  value={
                                    editingMemberObj.id ??
                                    editingMemberObj.user_id
                                  }
                                >
                                  @{editingMemberObj.username} (
                                  {editingMemberObj.email || "—"}) —{" "}
                                  {editingMemberObj.highest_global_role_name ||
                                    "Thành viên"}
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
                                      @{u.username} ({u.email || "—"}) —{" "}
                                      {globalName}
                                    </option>
                                  );
                                })}
                            </select>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                              Vai trò trong nhóm
                            </label>
                            <select
                              value={roleInGroup}
                              onChange={(e) => setRoleInGroup(e.target.value)}
                              className="w-full px-3 py-2 rounded-xl border border-border-black-10 dark:border-background-white-15 bg-background-light dark:bg-background-dark text-xs text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam"
                            >
                              <option value="group_member">Thành viên</option>
                              {canAssignModalGroupAdmin &&
                                actorGroupRank >= 2 &&
                                targetMaxGlobalRank >= 2 && (
                                  <option value="group_admin">
                                    Group Admin
                                  </option>
                                )}
                              {canAssignModalGroupAdmin &&
                                actorGroupRank >= 3 &&
                                targetMaxGlobalRank >= 3 && (
                                  <option value="super_admin">
                                    Super Admin
                                  </option>
                                )}
                            </select>
                          </div>
                        </div>
                      );
                    })()}

                    {roleInGroup === "group_member" && (
                      <div>
                        <label className="block text-xs font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                          Báo cáo được xem ({memberDashIds.length}/
                          {(memberModalGroup.dashboards || []).length})
                        </label>
                        {(memberModalGroup.dashboards || []).length === 0 ? (
                          <p className="text-xs text-color-black-50 dark:text-color-white-50">
                            Nhóm chưa có báo cáo nào.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-36 overflow-y-auto pr-1">
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
                            ? "Cập nhật"
                            : "Thêm vào nhóm"}
                      </button>
                    </div>
                  </form>
                )}

              {/* Members Table */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-color-black-50 dark:text-color-white-50">
                    Thành viên ({groupMembers.length})
                  </h4>
                </div>

                {memberModalMode === "view" && memberModalError && (
                  <p className="text-xs text-color-error mb-2">
                    {memberModalError}
                  </p>
                )}

                {loadingMembers ? (
                  <Loading height="150px" />
                ) : groupMembers.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-border-black-10 dark:border-background-white-15 text-center text-xs text-color-black-50 dark:text-color-white-50">
                    Nhóm chưa có thành viên nào.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border-black-10 dark:border-background-white-15 text-color-black-50 dark:text-color-white-50 uppercase">
                          <th className="py-2.5 pr-3">Tài khoản</th>
                          <th className="py-2.5 px-3">Email</th>
                          <th className="py-2.5 px-3">Vai trò</th>
                          <th className="py-2.5 px-3">Báo cáo</th>
                          {memberModalMode === "manage" && (
                            <th className="py-2.5 pl-3 text-right">Thao tác</th>
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
                          const canEditOrDeleteMember =
                            !isSelf &&
                            (isSystemManager ||
                              (isUserCreatedByMe && isAssignedToGroupByMe));
                          const roleCode =
                            m.role_code || m.role_in_group || "group_member";
                          const roleLabel = m.role_name || roleCode;
                          const dashCount = Array.isArray(
                            m.member_dashboard_ids,
                          )
                            ? m.member_dashboard_ids.length
                            : (m.dashboards || []).length;

                          return (
                            <tr
                              key={memberId}
                              className="hover:bg-background-dashboard/50 dark:hover:bg-background-white-8/40 transition-colors"
                            >
                              <td className="py-2.5 pr-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#20A7C9] to-[#7367f0] text-white flex items-center justify-center font-bold text-xs shrink-0">
                                    {(m.username || "U")
                                      .charAt(0)
                                      .toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="font-bold text-color-black-100 dark:text-color-white-90">
                                      {m.full_name || m.username}
                                    </div>
                                    <div className="text-[11px] font-mono text-color-black-50 dark:text-color-white-50">
                                      @{m.username}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-mono text-color-black-70 dark:text-color-white-80">
                                {m.email || "—"}
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
                                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                  <span>{roleLabel}</span>
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-color-black-70 dark:text-color-white-80">
                                <span className="inline-block px-2 py-0.5 rounded-md bg-background-light dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 font-medium">
                                  {roleCode === "group_member"
                                    ? `${dashCount} báo cáo`
                                    : "Toàn bộ"}
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
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#20A7C9]/10 text-color-neotam dark:text-[#5bd6d8] hover:bg-[#20A7C9] hover:text-white transition cursor-pointer"
                                      >
                                        Sửa
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() =>
                                          handleRequestRemoveMember(m)
                                        }
                                        className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-color-error/10 text-color-error hover:bg-color-error hover:text-white transition cursor-pointer"
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
        </div>
      )}

      {/* Modal: Xác nhận Xóa */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-md rounded-2xl bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 shadow-2xl text-center">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#eb5757] to-[#f87171]" />

            <div className="w-11 h-11 rounded-2xl bg-color-error/15 text-color-error flex items-center justify-center mx-auto mb-3 border border-color-error/30">
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

            <h3 className="text-base font-bold text-color-black-100 dark:text-color-white-90">
              {confirmDelete.type === "group"
                ? `Xóa nhóm "${confirmDelete.group?.group_name}"?`
                : `Xóa thành viên @${confirmDelete.member?.username}?`}
            </h3>

            <p className="text-xs leading-relaxed text-color-black-50 dark:text-color-white-50 mt-1.5 mb-4">
              {confirmDelete.type === "group"
                ? "Toàn bộ nhóm con trực thuộc, thành viên và cấu hình báo cáo của nhóm này sẽ bị xóa."
                : `Thành viên sẽ bị gỡ khỏi nhóm "${confirmDelete.group?.group_name}" cùng các báo cáo được cấp phát.`}
            </p>

            {confirmDeleteError && (
              <p className="text-xs text-color-error mb-3">
                {confirmDeleteError}
              </p>
            )}

            <div className="flex items-center justify-center gap-2.5">
              <button
                type="button"
                disabled={deletingConfirm}
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deletingConfirm}
                onClick={handleConfirmDeleteAction}
                className="px-5 py-2 rounded-xl text-xs font-semibold bg-color-error text-white hover:opacity-95 transition cursor-pointer disabled:opacity-60"
              >
                {deletingConfirm ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="px-4 sm:px-6 lg:px-8 pb-6 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
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
