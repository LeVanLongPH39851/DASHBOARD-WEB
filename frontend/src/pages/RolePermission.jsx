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
  updateManagedGroup,
} from "../services/authService";

const GROUP_ACCENTS = [
  // 0: Cyan / Teal
  {
    name: "cyan",
    accentColor: "#0891b2",
    bar: "from-[#0891b2] via-[#06b6d4] to-[#22d3ee]",
    folderBg: "bg-[#0891b2]/15 dark:bg-[#0891b2]/25",
    folderText: "text-[#0891b2] dark:text-[#22d3ee]",
    badge:
      "bg-[#0891b2]/12 text-[#0891b2] border-[#0891b2]/30 dark:bg-[#0891b2]/20 dark:text-[#22d3ee]",
    hoverBorder: "hover:border-[#0891b2]/60 dark:hover:border-[#22d3ee]/50",
    hoverShadow: "hover:shadow-[0_12px_32px_-10px_rgba(8,145,178,0.25)]",
    selectedNode:
      "bg-[#0891b2]/15 dark:bg-[#0891b2]/25 border-[#0891b2] dark:border-[#22d3ee] text-[#0891b2] dark:text-[#22d3ee] font-bold shadow-xs",
    itemHover: "group-hover/d:text-[#0891b2] dark:group-hover/d:text-[#22d3ee]",
    playHover: "group-hover/d:bg-[#0891b2] group-hover/d:text-white",
    btnSolid:
      "bg-gradient-to-r from-[#0891b2] to-[#06b6d4] text-white hover:opacity-95",
    btnOutline:
      "border border-[#0891b2]/40 bg-[#0891b2]/10 text-[#0891b2] dark:text-[#22d3ee] hover:bg-[#0891b2] hover:text-white",
    btnGhostHover:
      "hover:border-[#0891b2] hover:text-[#0891b2] dark:hover:text-[#22d3ee]",
    checkedItem: "border-[#0891b2] bg-[#0891b2]/10 dark:bg-[#0891b2]/20",
    focusRing: "focus:border-[#0891b2]",
    line: "border-[#0891b2]/40 dark:border-[#22d3ee]/30",
  },
  // 1: Indigo / Violet
  {
    name: "indigo",
    accentColor: "#4f46e5",
    bar: "from-[#4f46e5] via-[#6366f1] to-[#818cf8]",
    folderBg: "bg-[#4f46e5]/15 dark:bg-[#4f46e5]/25",
    folderText: "text-[#4f46e5] dark:text-[#818cf8]",
    badge:
      "bg-[#4f46e5]/12 text-[#4f46e5] border-[#4f46e5]/30 dark:bg-[#4f46e5]/20 dark:text-[#818cf8]",
    hoverBorder: "hover:border-[#4f46e5]/60 dark:hover:border-[#818cf8]/50",
    hoverShadow: "hover:shadow-[0_12px_32px_-10px_rgba(79,70,229,0.25)]",
    selectedNode:
      "bg-[#4f46e5]/15 dark:bg-[#4f46e5]/25 border-[#4f46e5] dark:border-[#818cf8] text-[#4f46e5] dark:text-[#818cf8] font-bold shadow-xs",
    itemHover: "group-hover/d:text-[#4f46e5] dark:group-hover/d:text-[#818cf8]",
    playHover: "group-hover/d:bg-[#4f46e5] group-hover/d:text-white",
    btnSolid:
      "bg-gradient-to-r from-[#4f46e5] to-[#6366f1] text-white hover:opacity-95",
    btnOutline:
      "border border-[#4f46e5]/40 bg-[#4f46e5]/10 text-[#4f46e5] dark:text-[#818cf8] hover:bg-[#4f46e5] hover:text-white",
    btnGhostHover:
      "hover:border-[#4f46e5] hover:text-[#4f46e5] dark:hover:text-[#818cf8]",
    checkedItem: "border-[#4f46e5] bg-[#4f46e5]/10 dark:bg-[#4f46e5]/20",
    focusRing: "focus:border-[#4f46e5]",
    line: "border-[#4f46e5]/40 dark:border-[#818cf8]/30",
  },
  // 2: Warm Amber / Orange
  {
    name: "orange",
    accentColor: "#ea580c",
    bar: "from-[#ea580c] via-[#f97316] to-[#fb923c]",
    folderBg: "bg-[#ea580c]/15 dark:bg-[#ea580c]/25",
    folderText: "text-[#ea580c] dark:text-[#fb923c]",
    badge:
      "bg-[#ea580c]/12 text-[#ea580c] border-[#ea580c]/30 dark:bg-[#ea580c]/20 dark:text-[#fb923c]",
    hoverBorder: "hover:border-[#ea580c]/60 dark:hover:border-[#fb923c]/50",
    hoverShadow: "hover:shadow-[0_12px_32px_-10px_rgba(234,88,12,0.25)]",
    selectedNode:
      "bg-[#ea580c]/15 dark:bg-[#ea580c]/25 border-[#ea580c] dark:border-[#fb923c] text-[#ea580c] dark:text-[#fb923c] font-bold shadow-xs",
    itemHover: "group-hover/d:text-[#ea580c] dark:group-hover/d:text-[#fb923c]",
    playHover: "group-hover/d:bg-[#ea580c] group-hover/d:text-white",
    btnSolid:
      "bg-gradient-to-r from-[#ea580c] to-[#f97316] text-white hover:opacity-95",
    btnOutline:
      "border border-[#ea580c]/40 bg-[#ea580c]/10 text-[#ea580c] dark:text-[#fb923c] hover:bg-[#ea580c] hover:text-white",
    btnGhostHover:
      "hover:border-[#ea580c] hover:text-[#ea580c] dark:hover:text-[#fb923c]",
    checkedItem: "border-[#ea580c] bg-[#ea580c]/10 dark:bg-[#ea580c]/20",
    focusRing: "focus:border-[#ea580c]",
    line: "border-[#ea580c]/40 dark:border-[#fb923c]/30",
  },
  // 3: Emerald / Mint
  {
    name: "emerald",
    accentColor: "#059669",
    bar: "from-[#059669] via-[#10b981] to-[#34d399]",
    folderBg: "bg-[#059669]/15 dark:bg-[#059669]/25",
    folderText: "text-[#059669] dark:text-[#34d399]",
    badge:
      "bg-[#059669]/12 text-[#059669] border-[#059669]/30 dark:bg-[#059669]/20 dark:text-[#34d399]",
    hoverBorder: "hover:border-[#059669]/60 dark:hover:border-[#34d399]/50",
    hoverShadow: "hover:shadow-[0_12px_32px_-10px_rgba(5,150,105,0.25)]",
    selectedNode:
      "bg-[#059669]/15 dark:bg-[#059669]/25 border-[#059669] dark:border-[#34d399] text-[#059669] dark:text-[#34d399] font-bold shadow-xs",
    itemHover: "group-hover/d:text-[#059669] dark:group-hover/d:text-[#34d399]",
    playHover: "group-hover/d:bg-[#059669] group-hover/d:text-white",
    btnSolid:
      "bg-gradient-to-r from-[#059669] to-[#10b981] text-white hover:opacity-95",
    btnOutline:
      "border border-[#059669]/40 bg-[#059669]/10 text-[#059669] dark:text-[#34d399] hover:bg-[#059669] hover:text-white",
    btnGhostHover:
      "hover:border-[#059669] hover:text-[#059669] dark:hover:text-[#34d399]",
    checkedItem: "border-[#059669] bg-[#059669]/10 dark:bg-[#059669]/20",
    focusRing: "focus:border-[#059669]",
    line: "border-[#059669]/40 dark:border-[#34d399]/30",
  },
  // 4: Rose / Crimson
  {
    name: "rose",
    accentColor: "#e11d48",
    bar: "from-[#e11d48] via-[#f43f5e] to-[#fb7185]",
    folderBg: "bg-[#e11d48]/15 dark:bg-[#e11d48]/25",
    folderText: "text-[#e11d48] dark:text-[#fb7185]",
    badge:
      "bg-[#e11d48]/12 text-[#e11d48] border-[#e11d48]/30 dark:bg-[#e11d48]/20 dark:text-[#fb7185]",
    hoverBorder: "hover:border-[#e11d48]/60 dark:hover:border-[#fb7185]/50",
    hoverShadow: "hover:shadow-[0_12px_32px_-10px_rgba(225,29,72,0.25)]",
    selectedNode:
      "bg-[#e11d48]/15 dark:bg-[#e11d48]/25 border-[#e11d48] dark:border-[#fb7185] text-[#e11d48] dark:text-[#fb7185] font-bold shadow-xs",
    itemHover: "group-hover/d:text-[#e11d48] dark:group-hover/d:text-[#fb7185]",
    playHover: "group-hover/d:bg-[#e11d48] group-hover/d:text-white",
    btnSolid:
      "bg-gradient-to-r from-[#e11d48] to-[#f43f5e] text-white hover:opacity-95",
    btnOutline:
      "border border-[#e11d48]/40 bg-[#e11d48]/10 text-[#e11d48] dark:text-[#fb7185] hover:bg-[#e11d48] hover:text-white",
    btnGhostHover:
      "hover:border-[#e11d48] hover:text-[#e11d48] dark:hover:text-[#fb7185]",
    checkedItem: "border-[#e11d48] bg-[#e11d48]/10 dark:bg-[#e11d48]/20",
    focusRing: "focus:border-[#e11d48]",
    line: "border-[#e11d48]/40 dark:border-[#fb7185]/30",
  },
  // 5: Cobalt / Sky Blue
  {
    name: "cobalt",
    accentColor: "#1d4ed8",
    bar: "from-[#1d4ed8] via-[#2563eb] to-[#60a5fa]",
    folderBg: "bg-[#1d4ed8]/15 dark:bg-[#1d4ed8]/25",
    folderText: "text-[#1d4ed8] dark:text-[#60a5fa]",
    badge:
      "bg-[#1d4ed8]/12 text-[#1d4ed8] border-[#1d4ed8]/30 dark:bg-[#1d4ed8]/20 dark:text-[#60a5fa]",
    hoverBorder: "hover:border-[#1d4ed8]/60 dark:hover:border-[#60a5fa]/50",
    hoverShadow: "hover:shadow-[0_12px_32px_-10px_rgba(29,78,216,0.25)]",
    selectedNode:
      "bg-[#1d4ed8]/15 dark:bg-[#1d4ed8]/25 border-[#1d4ed8] dark:border-[#60a5fa] text-[#1d4ed8] dark:text-[#60a5fa] font-bold shadow-xs",
    itemHover: "group-hover/d:text-[#1d4ed8] dark:group-hover/d:text-[#60a5fa]",
    playHover: "group-hover/d:bg-[#1d4ed8] group-hover/d:text-white",
    btnSolid:
      "bg-gradient-to-r from-[#1d4ed8] to-[#2563eb] text-white hover:opacity-95",
    btnOutline:
      "border border-[#1d4ed8]/40 bg-[#1d4ed8]/10 text-[#1d4ed8] dark:text-[#60a5fa] hover:bg-[#1d4ed8] hover:text-white",
    btnGhostHover:
      "hover:border-[#1d4ed8] hover:text-[#1d4ed8] dark:hover:text-[#60a5fa]",
    checkedItem: "border-[#1d4ed8] bg-[#1d4ed8]/10 dark:bg-[#1d4ed8]/20",
    focusRing: "focus:border-[#1d4ed8]",
    line: "border-[#1d4ed8]/40 dark:border-[#60a5fa]/30",
  },
  // 6: Purple / Fuchsia
  {
    name: "fuchsia",
    accentColor: "#9333ea",
    bar: "from-[#9333ea] via-[#a855f7] to-[#d8b4fe]",
    folderBg: "bg-[#9333ea]/15 dark:bg-[#9333ea]/25",
    folderText: "text-[#9333ea] dark:text-[#d8b4fe]",
    badge:
      "bg-[#9333ea]/12 text-[#9333ea] border-[#9333ea]/30 dark:bg-[#9333ea]/20 dark:text-[#d8b4fe]",
    hoverBorder: "hover:border-[#9333ea]/60 dark:hover:border-[#d8b4fe]/50",
    hoverShadow: "hover:shadow-[0_12px_32px_-10px_rgba(147,51,234,0.25)]",
    selectedNode:
      "bg-[#9333ea]/15 dark:bg-[#9333ea]/25 border-[#9333ea] dark:border-[#d8b4fe] text-[#9333ea] dark:text-[#d8b4fe] font-bold shadow-xs",
    itemHover: "group-hover/d:text-[#9333ea] dark:group-hover/d:text-[#d8b4fe]",
    playHover: "group-hover/d:bg-[#9333ea] group-hover/d:text-white",
    btnSolid:
      "bg-gradient-to-r from-[#9333ea] to-[#a855f7] text-white hover:opacity-95",
    btnOutline:
      "border border-[#9333ea]/40 bg-[#9333ea]/10 text-[#9333ea] dark:text-[#d8b4fe] hover:bg-[#9333ea] hover:text-white",
    btnGhostHover:
      "hover:border-[#9333ea] hover:text-[#9333ea] dark:hover:text-[#d8b4fe]",
    checkedItem: "border-[#9333ea] bg-[#9333ea]/10 dark:bg-[#9333ea]/20",
    focusRing: "focus:border-[#9333ea]",
    line: "border-[#9333ea]/40 dark:border-[#d8b4fe]/30",
  },
  // 7: Bronze / Gold
  {
    name: "bronze",
    accentColor: "#b45309",
    bar: "from-[#b45309] via-[#d97706] to-[#f59e0b]",
    folderBg: "bg-[#b45309]/15 dark:bg-[#b45309]/25",
    folderText: "text-[#b45309] dark:text-[#fbbf24]",
    badge:
      "bg-[#b45309]/12 text-[#b45309] border-[#b45309]/30 dark:bg-[#b45309]/20 dark:text-[#fbbf24]",
    hoverBorder: "hover:border-[#b45309]/60 dark:hover:border-[#fbbf24]/50",
    hoverShadow: "hover:shadow-[0_12px_32px_-10px_rgba(180,83,9,0.25)]",
    selectedNode:
      "bg-[#b45309]/15 dark:bg-[#b45309]/25 border-[#b45309] dark:border-[#fbbf24] text-[#b45309] dark:text-[#fbbf24] font-bold shadow-xs",
    itemHover: "group-hover/d:text-[#b45309] dark:group-hover/d:text-[#fbbf24]",
    playHover: "group-hover/d:bg-[#b45309] group-hover/d:text-white",
    btnSolid:
      "bg-gradient-to-r from-[#b45309] to-[#d97706] text-white hover:opacity-95",
    btnOutline:
      "border border-[#b45309]/40 bg-[#b45309]/10 text-[#b45309] dark:text-[#fbbf24] hover:bg-[#b45309] hover:text-white",
    btnGhostHover:
      "hover:border-[#b45309] hover:text-[#b45309] dark:hover:text-[#fbbf24]",
    checkedItem: "border-[#b45309] bg-[#b45309]/10 dark:bg-[#b45309]/20",
    focusRing: "focus:border-[#b45309]",
    line: "border-[#b45309]/40 dark:border-[#fbbf24]/30",
  },
];

function getGroupAccent(branchIndex = 0) {
  return GROUP_ACCENTS[Math.abs(branchIndex) % GROUP_ACCENTS.length];
}

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

function getGroupBranchIndex(groups = [], groupId) {
  if (!groupId || !Array.isArray(groups) || groups.length === 0) return 0;
  const breadcrumbs = getGroupBreadcrumb(groups, groupId);
  const rootGroupId = breadcrumbs[0]?.id;
  const rootIndex = groups.findIndex(
    (g) => Number(g.id) === Number(rootGroupId),
  );
  return rootIndex >= 0 ? rootIndex : 0;
}

const GroupTreeNode = ({
  group,
  branchIndex = 0,
  level = 0,
  index = 0,
  selectedGroupId,
  onSelectGroup,
  searchQuery = "",
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const isSelected = Number(selectedGroupId) === Number(group.id);
  const children = group.children || [];
  const dashboards = group.dashboards || [];
  const accent = getGroupAccent(branchIndex);

  return (
    <div className="space-y-1 max-lg:space-y-0.5">
      <div
        onClick={() => onSelectGroup(group.id)}
        className={`group/node flex items-center justify-between gap-2 max-lg:gap-1.5 max-md:gap-1 px-3 max-lg:px-2.5 max-md:px-2 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg max-md:rounded-md text-xs max-lg:text-[11px] max-md:text-[10px] cursor-pointer transition-all duration-200 border ${
          isSelected
            ? accent.selectedNode
            : "border-transparent hover:border-border-black-10 dark:hover:border-background-white-15 hover:bg-background-dashboard dark:hover:bg-background-white-8 text-color-black-80 dark:text-color-white-90"
        }`}
        style={{ paddingLeft: `${Math.max(8, level * 12 + 8)}px` }}
      >
        <div className="flex items-center gap-2 max-lg:gap-1.5 max-md:gap-1 min-w-0">
          {children.length > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
              className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3 rounded flex items-center justify-center hover:bg-black/10 dark:hover:bg-white/10 transition-colors shrink-0"
            >
              <svg
                className={`w-3 h-3 max-lg:w-2.5 max-lg:h-2.5 transition-transform duration-200 ${
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
            <span className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3 flex items-center justify-center opacity-35 text-[10px] max-lg:text-[9px] max-md:text-[8px] shrink-0">
              •
            </span>
          )}

          <div
            className={`w-6 h-6 max-lg:w-5 max-lg:h-5 max-md:w-4.5 max-md:h-4.5 rounded-lg max-lg:rounded-md ${accent.folderBg} ${accent.folderText} flex items-center justify-center shrink-0`}
          >
            <svg
              className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-2.5 max-md:h-2.5"
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

        <div className="flex items-center gap-1 max-lg:gap-0.5 shrink-0">
          <span
            className="px-1.5 max-lg:px-1 py-0.5 rounded-md text-[10px] max-lg:text-[9px] max-md:text-[8px] bg-background-black-4 dark:bg-background-white-8 text-color-black-50 dark:text-color-white-50"
            title={`${group.member_count || 0} thành viên`}
          >
            {group.member_count || 0}
          </span>
          <span
            className={`px-1.5 max-lg:px-1 py-0.5 rounded-md text-[10px] max-lg:text-[9px] max-md:text-[8px] font-semibold border ${accent.badge}`}
            title={`${dashboards.length} Dashboard`}
          >
            {dashboards.length}
          </span>
        </div>
      </div>

      {children.length > 0 && isExpanded && (
        <div className="relative pl-2 max-lg:pl-1.5 ml-3 max-lg:ml-2 max-md:ml-1.5 border-l border-dashed border-border-black-10 dark:border-background-white-15 space-y-1 max-lg:space-y-0.5">
          {children.map((child, childIdx) => (
            <GroupTreeNode
              key={child.id}
              group={child}
              branchIndex={branchIndex}
              level={level + 1}
              index={childIdx}
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
  onOpenEditGroupInfoModal,
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
  const canEditGroupInfo = isSystemManager || isCreator;
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
  const branchIndex = getGroupBranchIndex(groups, group.id);
  const accent = getGroupAccent(branchIndex);

  return (
    <div
      key={group.id}
      className="space-y-5 max-lg:space-y-3.5 max-md:space-y-2.5 animate-fade-up"
    >
      {/* Group Header Card */}
      <div className="relative overflow-hidden rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-6 max-lg:p-4 max-md:p-3 shadow-component">
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent.bar}`}
        />

        {/* Breadcrumb */}
        {breadcrumbs.length > 1 && (
          <div className="flex flex-wrap items-center gap-1.5 max-lg:gap-1 text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50 mb-3 max-lg:mb-2 max-md:mb-1.5">
            {breadcrumbs.map((bc, idx) => (
              <React.Fragment key={bc.id}>
                {idx > 0 && <span>/</span>}
                <button
                  type="button"
                  onClick={() => onSelectGroup(bc.id)}
                  className={`transition ${accent.folderText.replace("text-", "hover:text-")} ${
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

        <div className="flex flex-row items-start justify-between gap-4 max-lg:gap-3 max-md:gap-2.5">
          <div className="flex items-start gap-3.5 max-lg:gap-2.5 max-md:gap-2">
            <div
              className={`w-11 h-11 max-lg:w-9 max-lg:h-9 max-md:w-8 max-md:h-8 rounded-2xl max-lg:rounded-xl max-md:rounded-lg ${accent.folderBg} ${accent.folderText} flex items-center justify-center shrink-0`}
            >
              <svg
                className="w-5 h-5 max-lg:w-4.5 max-lg:h-4.5 max-md:w-4 max-md:h-4"
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
              <div className="flex flex-wrap items-center gap-2 max-lg:gap-1.5 max-md:gap-1">
                <h2 className="text-xl max-lg:text-lg max-md:text-base font-bold text-color-black-100 dark:text-color-white-90">
                  {group.group_name}
                </h2>
                {canEditGroupInfo && (
                  <button
                    type="button"
                    onClick={() => onOpenEditGroupInfoModal(group)}
                    title="Chỉnh sửa thông tin nhóm"
                    aria-label="Chỉnh sửa thông tin nhóm"
                    className={`p-1 max-lg:p-1 max-md:p-0.5 rounded-md border ${accent.badge} bg-background-search dark:bg-background-white-8 hover:bg-gradient-to-r ${accent.bar} hover:text-white hover:border-transparent transition-all duration-200 cursor-pointer shadow-xs active:scale-95`}
                  >
                    <svg
                      className="w-3.5 h-3.5 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3"
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
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onOpenMembersModal(group, "view")}
                  className={`inline-flex items-center gap-0.5 px-2.5 max-lg:px-2 max-md:px-1.5 py-0.5 rounded-full text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold border cursor-pointer hover:opacity-90 transition ${accent.badge}`}
                >
                  <svg
                    className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-2.5 max-md:h-2.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                    />
                    <circle cx="8.5" cy="7" r="4" />
                  </svg>
                  <span>{group.member_count || 0} thành viên</span>
                </button>
                {myRoleLabelInGroup && (
                  <span className="px-2.5 max-lg:px-2 max-md:px-1.5 py-0.5 rounded-full text-[11px] max-lg:text-[10px] max-md:text-[9px] font-semibold bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8] border border-[#7367f0]/30">
                    {myRoleLabelInGroup}
                  </span>
                )}
              </div>
              {group.description && (
                <p className="text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50 mt-1 max-lg:mt-0.5">
                  {group.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 max-lg:gap-1.5 shrink-0">
            {canManageGroupMembers && (
              <button
                type="button"
                onClick={() => onOpenMembersModal(group, "manage")}
                title="Quản lý thành viên"
                aria-label="Quản lý thành viên"
                className={`px-3.5 max-lg:px-2.5 max-md:px-2 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold ${accent.btnOutline} transition cursor-pointer flex items-center gap-1.5 max-lg:gap-1`}
              >
                <svg
                  className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-3 max-md:h-3 shrink-0"
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
                <span className="max-md:hidden">Thành viên</span>
              </button>
            )}
            {canCreateChildGroup ? (
              <button
                type="button"
                onClick={() => onOpenCreateChildModal(group)}
                title="Thêm nhóm con"
                aria-label="Thêm nhóm con"
                className={`px-3.5 max-lg:px-2.5 max-md:px-2 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 ${accent.btnGhostHover} transition cursor-pointer flex items-center gap-1.5 max-lg:gap-1`}
              >
                <svg
                  className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-3 max-md:h-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="max-md:hidden">Nhóm con</span>
              </button>
            ) : isSystemManager || groupRoles.includes("super_admin") ? (
              <span
                title={isMaxDepthReached ? "Tối đa 5 cấp" : "Đủ 10 nhóm con"}
                className="px-3 max-lg:px-2 max-md:px-2 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-medium border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-color-black-40 dark:text-color-white-40 select-none inline-flex items-center gap-1"
              >
                <svg
                  className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-3 max-md:h-3 shrink-0 md:hidden text-color-black-40 dark:text-color-white-40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
                <span className="max-md:hidden">
                  {isMaxDepthReached ? "Tối đa 5 cấp" : "Đủ 10 nhóm con"}
                </span>
              </span>
            ) : null}
            {canDeleteGroup && (
              <button
                type="button"
                onClick={() => onRequestDeleteGroup(group)}
                title="Xóa nhóm"
                aria-label="Xóa nhóm"
                className="px-3 max-lg:px-2.5 max-md:px-2 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold border border-color-error/40 bg-color-error/10 text-color-error hover:bg-color-error hover:text-white transition cursor-pointer flex items-center gap-1.5 max-lg:gap-1"
              >
                <svg
                  className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-3 max-md:h-3 shrink-0"
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
                <span className="max-md:hidden">Xóa</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Dashboards Section */}
      <div className="rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-6 max-lg:p-4 max-md:p-3 shadow-component">
        <div className="flex flex-wrap items-center justify-between gap-3 max-lg:gap-2 mb-4 max-lg:mb-3 max-md:mb-2 pb-3 max-lg:pb-2.5 max-md:pb-2 border-b border-border-black-10 dark:border-background-white-15">
          <div className="flex items-center gap-2 max-lg:gap-1.5">
            <h3 className="text-xs max-lg:text-[11px] max-md:text-[10px] font-bold text-color-black-100 dark:text-color-white-90 uppercase tracking-wider">
              Dashboard được chỉ định
            </h3>
            <span
              className={`px-2 max-lg:px-1.5 py-0.5 rounded-full text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold border ${accent.badge}`}
            >
              {dashboards.length}
            </span>
          </div>

          {canEditGroupDashboards && (
            <button
              type="button"
              onClick={() => onOpenEditModal(group)}
              title="Chỉ định Dashboard"
              aria-label="Chỉ định Dashboard"
              className={`p-1.5 max-lg:p-1.5 max-md:p-1 rounded-lg inline-flex items-center justify-center border ${accent.badge} bg-background-search dark:bg-background-white-8 hover:bg-gradient-to-r ${accent.bar} hover:text-white hover:border-transparent transition cursor-pointer shadow-xs`}
            >
              <svg
                className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3"
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
            </button>
          )}
        </div>

        {dashboards.length === 0 ? (
          <div className="py-8 max-lg:py-6 max-md:py-4 px-4 max-lg:px-3 rounded-xl border border-dashed border-border-black-10 dark:border-background-white-15 text-center text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50 flex flex-col items-center justify-center gap-1.5 max-lg:gap-1">
            <span>Chưa có Dashboard nào được chỉ định.</span>
            {canEditGroupDashboards && (
              <button
                type="button"
                onClick={() => onOpenEditModal(group)}
                className={`${accent.folderText} hover:underline font-semibold mt-1 cursor-pointer`}
              >
                + Chỉ định Dashboard
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3 max-lg:gap-2 max-md:gap-1.5">
            {dashboards.map((dash, idx) => (
              <Link
                key={dash.id}
                to={dash.path}
                style={{
                  animationDelay: `${Math.min(idx * 45 + 60, 360)}ms`,
                }}
                className={`shine animate-fade-up group/d relative overflow-hidden flex items-center justify-between p-3.5 max-lg:p-2.5 max-md:p-2 rounded-xl max-lg:rounded-lg border border-border-black-10 dark:border-background-white-15 bg-background-dashboard/60 dark:bg-background-white-8/40 ${accent.hoverBorder} hover:-translate-y-0.5 transition-all duration-200`}
              >
                <div className="flex items-center gap-3 max-lg:gap-2 min-w-0">
                  <div
                    className={`w-8 h-8 max-lg:w-7 max-lg:h-7 max-md:w-6 max-md:h-6 rounded-lg max-lg:rounded-md ${accent.folderBg} ${accent.folderText} flex items-center justify-center shrink-0`}
                  >
                    <svg
                      className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3"
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
                  <span
                    className={`text-sm max-lg:text-xs max-md:text-[11px] font-bold text-color-black-100 dark:text-color-white-90 ${accent.itemHover} transition-colors truncate`}
                  >
                    {dash.dashboard_title}
                  </span>
                </div>

                <span
                  title="Mở Dashboard"
                  aria-label="Mở Dashboard"
                  className={`w-7 h-7 max-lg:w-6 max-lg:h-6 max-md:w-5 max-md:h-5 rounded-lg max-lg:rounded-md inline-flex items-center justify-center ${accent.folderBg} ${accent.folderText} ${accent.playHover} transition-all shrink-0`}
                >
                  <svg
                    className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-2.5 max-md:h-2.5 fill-current"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Child Groups Section */}
      {children.length > 0 && (
        <div className="rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-6 max-lg:p-4 max-md:p-3 shadow-component">
          <div className="flex items-center gap-2 max-lg:gap-1.5 mb-4 max-lg:mb-3 max-md:mb-2 pb-3 max-lg:pb-2.5 max-md:pb-2 border-b border-border-black-10 dark:border-background-white-15">
            <h3 className="text-xs max-lg:text-[11px] max-md:text-[10px] font-bold text-color-black-100 dark:text-color-white-90 uppercase tracking-wider">
              Nhóm con
            </h3>
            <span
              className={`px-2 max-lg:px-1.5 py-0.5 rounded-full text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold border ${accent.badge}`}
            >
              {children.length}
            </span>
          </div>

          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3 max-lg:gap-2 max-md:gap-1.5">
            {children.map((child, idx) => (
              <div
                key={child.id}
                onClick={() => onSelectGroup(child.id)}
                style={{
                  animationDelay: `${Math.min(idx * 45 + 90, 360)}ms`,
                }}
                className={`shine animate-fade-up group/child relative overflow-hidden flex items-center justify-between p-3.5 max-lg:p-2.5 max-md:p-2 rounded-xl max-lg:rounded-lg border border-border-black-10 dark:border-background-white-15 bg-background-dashboard/60 dark:bg-background-white-8/40 ${accent.hoverBorder} hover:-translate-y-0.5 cursor-pointer transition-all duration-200`}
              >
                <div className="flex items-center gap-3 max-lg:gap-2 min-w-0">
                  <div
                    className={`w-8 h-8 max-lg:w-7 max-lg:h-7 max-md:w-6 max-md:h-6 rounded-lg max-lg:rounded-md ${accent.folderBg} ${accent.folderText} flex items-center justify-center shrink-0`}
                  >
                    <svg
                      className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3"
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
                    <p
                      className={`text-sm max-lg:text-xs max-md:text-[11px] font-bold text-color-black-100 dark:text-color-white-90 ${accent.folderText.replace("text-", "group-hover/child:text-")} transition-colors truncate`}
                    >
                      {child.group_name}
                    </p>
                    <p className="text-[11px] max-lg:text-[10px] max-md:text-[9px] text-color-black-50 dark:text-color-white-50">
                      {child.member_count || 0} thành viên •{" "}
                      {(child.dashboards || []).length} Dashboard
                    </p>
                  </div>
                </div>

                <span
                  className={`text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold shrink-0 ${accent.folderText}`}
                >
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
  branchIndex = 0,
  level = 0,
  isSystemManager,
  currentUserId,
  onOpenEditGroupInfoModal,
  onOpenEditModal,
  onOpenCreateChildModal,
  onOpenMembersModal,
  onRequestDeleteGroup,
}) => {
  const accent = getGroupAccent(branchIndex);
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
  const canEditGroupInfo = isSystemManager || isCreator;
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
      style={{ animationDelay: `${Math.min((index + level) * 60, 360)}ms` }}
      className={`animate-fade-up ${
        level > 0
          ? `mt-3.5 max-lg:mt-2.5 max-md:mt-2 pl-4 sm:pl-5 max-lg:pl-3 max-md:pl-2 border-l-2 border-dashed ${accent.line} relative`
          : ""
      }`}
    >
      <div
        className={`shine relative overflow-hidden rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-5 max-lg:p-3.5 max-md:p-2.5 shadow-component transition-all duration-300 hover:-translate-y-0.5 ${accent.hoverBorder} ${accent.hoverShadow}`}
      >
        <div
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accent.bar}`}
        />

        <div className="flex flex-wrap items-center justify-between gap-3 max-lg:gap-2 mb-4 max-lg:mb-3 max-md:mb-2">
          <div className="flex items-center gap-3 max-lg:gap-2">
            <div
              className={`w-10 h-10 max-lg:w-8.5 max-lg:h-8.5 max-md:w-7.5 max-md:h-7.5 rounded-xl max-lg:rounded-lg ${accent.folderBg} ${accent.folderText} flex items-center justify-center shrink-0`}
            >
              <svg
                className="w-5 h-5 max-lg:w-4 max-lg:h-4 max-md:w-3.5 max-md:h-3.5"
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
              <div className="flex flex-wrap items-center gap-2 max-lg:gap-1.5">
                <h2 className="text-base max-lg:text-sm max-md:text-xs font-bold text-color-black-100 dark:text-color-white-90">
                  {group.group_name}
                </h2>

                {canEditGroupInfo && (
                  <button
                    type="button"
                    onClick={() => onOpenEditGroupInfoModal(group)}
                    title="Chỉnh sửa thông tin nhóm"
                    aria-label="Chỉnh sửa thông tin nhóm"
                    className={`p-1 max-lg:p-1 max-md:p-0.5 rounded-md border ${accent.badge} bg-background-search dark:bg-background-white-8 hover:bg-gradient-to-r ${accent.bar} hover:text-white hover:border-transparent transition-all duration-200 cursor-pointer shadow-xs active:scale-95`}
                  >
                    <svg
                      className="w-3 h-3 max-lg:w-3 max-lg:h-3 max-md:w-2.5 max-md:h-2.5"
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
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onOpenMembersModal(group, "view")}
                  className={`inline-flex items-center gap-0.5 px-2.5 max-lg:px-2 max-md:px-1.5 py-0.5 rounded-full text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold border cursor-pointer ${accent.badge}`}
                >
                  <svg
                    className="w-3 h-3 max-lg:w-2.5 max-lg:h-2.5 shrink-0"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"
                    />
                    <circle cx="8.5" cy="7" r="4" />
                  </svg>
                  <span className="text-[11px] max-lg:text-[10px] max-md:text-[9px]">
                    {group.member_count || 0}
                  </span>
                </button>

                {!isSystemManager && level === 0 && myRoleLabelInGroup && (
                  <span className="px-2.5 max-lg:px-2 max-md:px-1.5 py-0.5 rounded-full text-[11px] max-lg:text-[10px] max-md:text-[9px] font-semibold bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8] border border-[#7367f0]/30">
                    {myRoleLabelInGroup}
                  </span>
                )}

                {children.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsExpanded(!isExpanded)}
                    title={
                      isExpanded
                        ? "Thu gọn nhóm con"
                        : `Mở rộng ${children.length} nhóm con`
                    }
                    aria-label={
                      isExpanded
                        ? "Thu gọn nhóm con"
                        : `Mở rộng ${children.length} nhóm con`
                    }
                    className="inline-flex items-center justify-center px-2.5 max-lg:px-2 max-md:px-1.5 py-0.5 rounded-full bg-background-search dark:bg-background-white-8 hover:bg-black/5 dark:hover:bg-white/12 text-color-black-70 dark:text-color-white-80 border border-border-black-10 dark:border-background-white-15 cursor-pointer transition-all duration-200 active:scale-95 shadow-2xs select-none"
                  >
                    <svg
                      className={`w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-2.5 max-md:h-2.5 transition-transform duration-300 ease-in-out ${
                        isExpanded ? "rotate-180" : "rotate-0"
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
                <p className="text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50 mt-0.5">
                  {group.description}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 max-lg:gap-1.5 shrink-0">
            {canManageGroupMembers && (
              <button
                type="button"
                onClick={() => onOpenMembersModal(group, "manage")}
                title="Quản lý thành viên"
                aria-label="Quản lý thành viên"
                className={`px-3.5 max-lg:px-2.5 max-md:px-2 py-1.5 max-lg:py-1 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold ${accent.btnOutline} transition cursor-pointer flex items-center gap-1.5 max-lg:gap-1`}
              >
                <svg
                  className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-3 max-md:h-3 shrink-0"
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
                <span className="max-md:hidden">Thành viên</span>
              </button>
            )}

            {canCreateChildGroup ? (
              <button
                type="button"
                onClick={() => onOpenCreateChildModal(group)}
                title="Thêm nhóm con"
                aria-label="Thêm nhóm con"
                className={`px-3.5 max-lg:px-2.5 max-md:px-2 py-1.5 max-lg:py-1 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-color-black-70 dark:text-color-white-80 ${accent.btnGhostHover} transition cursor-pointer flex items-center gap-1.5 max-lg:gap-1`}
              >
                <svg
                  className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-3 max-md:h-3 shrink-0"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="max-md:hidden">Nhóm con</span>
              </button>
            ) : isSystemManager || groupRoles.includes("super_admin") ? (
              <span
                title={isMaxDepthReached ? "Tối đa 5 cấp" : "Đủ 10 nhóm con"}
                className="px-3 max-lg:px-2 max-md:px-2 py-1.5 max-lg:py-1 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-medium border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-color-black-40 dark:text-color-white-40 select-none inline-flex items-center gap-1"
              >
                <svg
                  className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-3 max-md:h-3 shrink-0 md:hidden text-color-black-40 dark:text-color-white-40"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                </svg>
                <span className="max-md:hidden">
                  {isMaxDepthReached ? "Tối đa 5 cấp" : "Đủ 10 nhóm con"}
                </span>
              </span>
            ) : null}

            {canDeleteGroup && (
              <button
                type="button"
                onClick={() => onRequestDeleteGroup(group)}
                title="Xóa nhóm"
                aria-label="Xóa nhóm"
                className="px-3.5 max-lg:px-2.5 max-md:px-2 py-1.5 max-lg:py-1 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold border border-color-error/40 bg-color-error/10 text-color-error hover:bg-color-error hover:text-white transition cursor-pointer flex items-center gap-1.5 max-lg:gap-1"
              >
                <svg
                  className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-3 max-md:h-3 shrink-0"
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
                <span className="max-md:hidden">Xóa</span>
              </button>
            )}
          </div>
        </div>

        {/* Dashboards list inside card */}
        <div className="rounded-xl max-lg:rounded-lg border border-border-black-10/70 dark:border-background-white-15/70 bg-background-dashboard/50 dark:bg-background-white-8/30 p-3.5 max-lg:p-2.5 max-md:p-2">
          <div className="flex flex-wrap items-center justify-between gap-2.5 max-lg:gap-2 mb-3 max-lg:mb-2 pb-2.5 max-lg:pb-2 border-b border-border-black-10/70 dark:border-background-white-15/70">
            <div className="flex items-center gap-2 max-lg:gap-1.5">
              <h3 className="text-xs max-lg:text-[11px] max-md:text-[10px] font-bold text-color-black-100 dark:text-color-white-90 uppercase tracking-wider">
                Dashboard được chỉ định
              </h3>
              <span
                className={`px-2 max-lg:px-1.5 py-0.5 rounded-full text-[11px] max-lg:text-[10px] max-md:text-[9px] font-semibold border ${accent.badge}`}
              >
                {dashboards.length}
              </span>
            </div>

            {canEditGroupDashboards && (
              <button
                type="button"
                onClick={() => onOpenEditModal(group)}
                title="Chỉ định Dashboard"
                aria-label="Chỉ định Dashboard"
                className={`p-1.5 max-lg:p-1 max-md:p-0.5 rounded-lg inline-flex items-center justify-center border ${accent.badge} bg-background-search dark:bg-background-white-8 hover:bg-gradient-to-r ${accent.bar} hover:text-white hover:border-transparent transition cursor-pointer shadow-xs`}
              >
                <svg
                  className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3"
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
              </button>
            )}
          </div>

          {dashboards.length === 0 ? (
            <div className="py-4 max-lg:py-3 max-md:py-2 px-3 max-lg:px-2 rounded-xl border border-dashed border-border-black-10 dark:border-background-white-15 text-center text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50 flex flex-col items-center justify-center gap-1">
              <span>Chưa có Dashboard nào được chỉ định.</span>
              {canEditGroupDashboards && (
                <button
                  type="button"
                  onClick={() => onOpenEditModal(group)}
                  className={`${accent.folderText} hover:underline font-semibold mt-0.5 cursor-pointer`}
                >
                  + Chỉ định Dashboard
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2.5 max-lg:gap-2 max-md:gap-1.5">
              {dashboards.map((dash) => (
                <Link
                  key={dash.id}
                  to={dash.path}
                  className={`group/d flex items-center justify-between p-2.5 max-lg:p-2 max-md:p-1.5 rounded-xl max-lg:rounded-lg border border-border-black-10 dark:border-background-white-15 bg-background-dashboard/60 dark:bg-background-white-8/40 ${accent.hoverBorder} hover:-translate-y-0.5 transition-all duration-200`}
                >
                  <div className="flex items-center gap-2.5 max-lg:gap-2 min-w-0">
                    <div
                      className={`w-7 h-7 max-lg:w-6 max-lg:h-6 max-md:w-5 max-md:h-5 rounded-lg max-lg:rounded-md ${accent.folderBg} ${accent.folderText} flex items-center justify-center shrink-0`}
                    >
                      <svg
                        className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-2.5 max-md:h-2.5"
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
                    <span
                      className={`text-xs max-lg:text-[11px] max-md:text-[10px] font-bold text-color-black-100 dark:text-color-white-90 ${accent.itemHover} transition-colors truncate`}
                    >
                      {dash.dashboard_title}
                    </span>
                  </div>

                  <span
                    title="Mở Dashboard"
                    aria-label="Mở Dashboard"
                    className={`w-7 h-7 max-lg:w-6 max-lg:h-6 max-md:w-5 max-md:h-5 rounded-lg max-lg:rounded-md inline-flex items-center justify-center ${accent.folderBg} ${accent.folderText} ${accent.playHover} transition-all shrink-0`}
                  >
                    <svg
                      className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-2.5 max-md:h-2.5 fill-current"
                      viewBox="0 0 20 20"
                    >
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {children.length > 0 && (
        <div
          className={`grid transition-all duration-300 ease-in-out ${
            isExpanded
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden">
            <div className="space-y-3.5 max-lg:space-y-2.5 max-md:space-y-2">
              {children.map((child, childIdx) => (
                <GroupCardNode
                  key={child.id}
                  group={child}
                  index={childIdx}
                  branchIndex={branchIndex}
                  level={level + 1}
                  isSystemManager={isSystemManager}
                  currentUserId={currentUserId}
                  onOpenEditGroupInfoModal={onOpenEditGroupInfoModal}
                  onOpenEditModal={onOpenEditModal}
                  onOpenCreateChildModal={onOpenCreateChildModal}
                  onOpenMembersModal={onOpenMembersModal}
                  onRequestDeleteGroup={onRequestDeleteGroup}
                />
              ))}
            </div>
          </div>
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

  const [layoutMode, setLayoutModeState] = useState(() => {
    try {
      const saved =
        localStorage.getItem("groups_layout_mode") ||
        localStorage.getItem("role_permission_layout_mode");
      return saved === "grid" || saved === "split" ? saved : "split";
    } catch {
      return "split";
    }
  });

  const setLayoutMode = (mode) => {
    setLayoutModeState(mode);
    try {
      localStorage.setItem("groups_layout_mode", mode);
    } catch {
      // ignore
    }
  };
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

  // Modal Sửa thông tin group (tên, mô tả)
  const [editingGroupInfo, setEditingGroupInfo] = useState(null);
  const [editGroupName, setEditGroupName] = useState("");
  const [editGroupDesc, setEditGroupDesc] = useState("");
  const [savingGroupInfo, setSavingGroupInfo] = useState(false);
  const [editGroupInfoError, setEditGroupInfoError] = useState("");

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

  const selectedGroup = useMemo(() => {
    const sourceGroups = groupSearchQuery.trim()
      ? filteredGroupsForExplorer
      : groups;
    if (sourceGroups.length === 0) return null;
    if (!selectedGroupId) return sourceGroups[0] || null;
    return (
      findGroupById(sourceGroups, selectedGroupId) || sourceGroups[0] || null
    );
  }, [groups, filteredGroupsForExplorer, groupSearchQuery, selectedGroupId]);

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

  const handleOpenEditGroupInfoModal = (group) => {
    setEditingGroupInfo(group);
    setEditGroupName(group.group_name || "");
    setEditGroupDesc(group.description || "");
    setEditGroupInfoError("");
  };

  const handleSaveGroupInfo = async (e) => {
    e.preventDefault();
    if (!editingGroupInfo) return;
    if (!editGroupName.trim()) {
      setEditGroupInfoError("Tên nhóm không được để trống");
      return;
    }

    try {
      setSavingGroupInfo(true);
      setEditGroupInfoError("");
      await updateManagedGroup(editingGroupInfo.id, {
        groupName: editGroupName.trim(),
        description: editGroupDesc.trim(),
      });
      setEditingGroupInfo(null);
      await fetchGroupData();
    } catch (err) {
      setEditGroupInfoError(
        err.response?.data?.message ||
          err.message ||
          "Cập nhật thông tin nhóm thất bại",
      );
    } finally {
      setSavingGroupInfo(false);
    }
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
        alert("Mỗi nhóm cha chỉ được phép có tối đa 10 nhóm con.");
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
        err.response?.data?.message || err.message || "Thao tác xóa thất bại",
      );
    } finally {
      setDeletingConfirm(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col font-family-be-vietnam-pro bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
      <Header username={user?.username} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto px-8 max-lg:px-6 max-md:px-4 py-6 max-lg:py-4.5 max-md:py-3 space-y-5 max-lg:space-y-4 max-md:space-y-3">
        {/* Executive Header */}
        <section className="shine-auto animate-gradient-shift animate-fade-up relative overflow-hidden rounded-2xl p-6 max-lg:p-4.5 max-md:p-3.5 bg-gradient-to-r from-[#1f1c47] via-[#4338ca] to-[#7367f0] dark:from-[#111725] dark:via-[#28245c] dark:to-[#5346d6] text-white shadow-lg border border-white/10">
          <div className="pointer-events-none absolute -top-24 -right-16 w-72 h-72 rounded-full bg-[#5bd6d8]/25 blur-3xl animate-float-slow" />
          <div
            className="pointer-events-none absolute -bottom-24 left-1/3 w-64 h-64 rounded-full bg-[#f2994a]/25 blur-3xl animate-float-slow"
            style={{ animationDelay: "-3s" }}
          />

          <div className="relative z-10 flex flex-row max-md:flex-col items-center max-md:items-start justify-between gap-4 max-lg:gap-3 max-md:gap-2.5">
            <div>
              <div
                style={{ animationDelay: "80ms" }}
                className="animate-pop-in inline-flex items-center gap-2 max-lg:gap-1.5 max-md:gap-1 px-3 max-lg:px-2.5 max-md:px-2 py-1 max-lg:py-0.5 max-md:py-0.5 rounded-full bg-white/15 backdrop-blur-md text-[11px] max-lg:text-[10px] max-md:text-[9px] font-semibold mb-2.5 max-lg:mb-1.5 max-md:mb-1 border border-white/20"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#ffd04c] animate-pulse" />
                <span>{roleBadgeLabel}</span>
              </div>
              <h1 className="text-2xl max-lg:text-xl max-md:text-lg font-extrabold tracking-tight">
                Phân quyền Nhóm & Dashboard
              </h1>
              <p className="text-sm max-lg:text-xs max-md:text-[11px] text-white/80 mt-1 max-lg:mt-0.5">
                Quản lý cấu trúc nhóm, thành viên và danh mục Dashboard được chỉ
                định
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 max-lg:gap-2 max-md:gap-1.5 self-auto max-md:self-start">
              <div
                style={{ animationDelay: "140ms" }}
                className="animate-pop-in flex items-center gap-3 max-lg:gap-2 max-md:gap-1.5 bg-white/12 backdrop-blur-md border border-white/20 rounded-2xl max-lg:rounded-xl max-md:rounded-lg px-4 max-lg:px-3 max-md:px-2 py-2.5 max-lg:py-2 max-md:py-1.5"
              >
                <div className="text-center px-2 max-lg:px-1.5 max-md:px-1">
                  <p className="text-[10px] max-lg:text-[9px] max-md:text-[8px] text-white/75 uppercase tracking-wider">
                    Tổng nhóm
                  </p>
                  <p className="text-lg max-lg:text-base max-md:text-sm font-black leading-tight">
                    {loading ? "—" : flatGroupOptions.length}
                  </p>
                </div>
                <div className="w-px h-7 max-lg:h-6 max-md:h-5 bg-white/20" />
                <div className="text-center px-2 max-lg:px-1.5 max-md:px-1">
                  <p className="text-[10px] max-lg:text-[9px] max-md:text-[8px] text-white/75 uppercase tracking-wider">
                    Nhóm chính
                  </p>
                  <p className="text-lg max-lg:text-base max-md:text-sm font-black leading-tight">
                    {loading ? "—" : groups.length}
                  </p>
                </div>
                <div className="w-px h-7 max-lg:h-6 max-md:h-5 bg-white/20" />
                <div className="text-center px-2 max-lg:px-1.5 max-md:px-1">
                  <p className="text-[10px] max-lg:text-[9px] max-md:text-[8px] text-white/75 uppercase tracking-wider">
                    Dashboard
                  </p>
                  <p className="text-lg max-lg:text-base max-md:text-sm font-black leading-tight">
                    {loading ? "—" : availableDashboards.length}
                  </p>
                </div>
              </div>

              {canCreateGroup && (
                <button
                  type="button"
                  onClick={() => handleOpenCreateModal(null)}
                  className="shine relative overflow-hidden px-4 max-lg:px-3.5 max-md:px-2.5 py-2.5 max-lg:py-2 max-md:py-1.5 rounded-xl max-lg:rounded-lg text-sm max-lg:text-xs max-md:text-[11px] font-bold bg-white text-[#312e81] hover:bg-[#ffd04c] hover:text-[#1f2933] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer shadow-sm flex items-center gap-1.5 max-lg:gap-1"
                >
                  <svg
                    className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.4"
                    viewBox="0 0 24 24"
                  >
                    <line x1="12" x2="12" y1="5" y2="19" />
                    <line x1="5" x2="19" y1="12" y2="12" />
                  </svg>
                  <span>Tạo nhóm chính</span>
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Command Bar */}
        {!loading && !error && groups.length > 0 && (
          <section
            style={{ animationDelay: "70ms" }}
            className="animate-fade-up p-4 max-lg:p-3 max-md:p-2 rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 shadow-component flex flex-row max-md:flex-col items-center max-md:items-stretch justify-between gap-3 max-lg:gap-2.5 max-md:gap-2"
          >
            <div className="relative flex-1 max-w-md max-md:max-w-none">
              <input
                type="text"
                value={groupSearchQuery}
                onChange={(e) => setGroupSearchQuery(e.target.value)}
                placeholder="Tìm kiếm nhóm..."
                className="w-full pl-9 max-lg:pl-8 max-md:pl-7 pr-8 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-sm max-lg:text-xs max-md:text-[11px] text-color-black-100 dark:text-color-white-90 outline-none focus:border-color-neotam transition"
              />
              <svg
                className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3 absolute left-3 top-1/2 -translate-y-1/2 text-color-black-50 dark:text-color-white-50 pointer-events-none"
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

            <div className="flex items-center justify-end max-md:justify-between gap-2.5 max-lg:gap-2 max-md:gap-1.5">
              <div className="flex items-center rounded-xl p-1 max-lg:p-0.5 bg-background-search dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15">
                <button
                  type="button"
                  onClick={() => setLayoutMode("split")}
                  title="Chế độ Cây đơn vị"
                  aria-label="Chế độ Cây đơn vị"
                  className={`p-1.5 max-lg:p-1.5 max-md:p-1 rounded-lg transition cursor-pointer ${
                    layoutMode === "split"
                      ? "bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-xs"
                      : "text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-color-white-90"
                  }`}
                >
                  <svg
                    className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <line x1="9" x2="9" y1="3" y2="21" />
                  </svg>
                </button>

                <button
                  type="button"
                  onClick={() => setLayoutMode("grid")}
                  title="Chế độ Lưới thẻ"
                  aria-label="Chế độ Lưới thẻ"
                  className={`p-1.5 max-lg:p-1.5 max-md:p-1 rounded-lg transition cursor-pointer ${
                    layoutMode === "grid"
                      ? "bg-gradient-to-r from-[#20A7C9] to-[#2fc4c6] text-white shadow-xs"
                      : "text-color-black-50 dark:text-color-white-50 hover:text-color-black-100 dark:hover:text-color-white-90"
                  }`}
                >
                  <svg
                    className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3"
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
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="animate-fade-up p-6 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component">
            <Loading height="380px" />
          </div>
        ) : error ? (
          <div className="animate-fade-up p-12 bg-background-light dark:bg-background-chart-dark border border-border-error rounded-2xl shadow-component text-center">
            <p className="text-sm font-semibold text-color-error">{error}</p>
          </div>
        ) : groups.length === 0 ? (
          <div className="animate-fade-up p-14 bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 rounded-2xl shadow-component text-center">
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
          <div
            style={{ animationDelay: "120ms" }}
            className="animate-fade-up grid grid-cols-12 max-md:grid-cols-1 gap-6 max-lg:gap-4 max-md:gap-3 items-start"
          >
            {/* Left Sidebar: Tree Explorer */}
            <div className="col-span-4 max-md:col-span-1 rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 p-4 max-lg:p-3 max-md:p-2.5 shadow-component space-y-3 max-lg:space-y-2 max-md:space-y-1.5 sticky top-4 max-md:static max-h-[calc(100vh-120px)] max-lg:max-h-[calc(100vh-100px)] overflow-y-auto">
              <div className="flex items-center justify-between gap-2 max-lg:gap-1.5 pb-2.5 max-lg:pb-2 max-md:pb-1.5 border-b border-border-black-10 dark:border-background-white-15">
                <div className="flex items-center gap-2 max-lg:gap-1.5">
                  <span className="w-2 h-2 max-lg:w-1.5 max-lg:h-1.5 rounded-full bg-[#20A7C9] animate-pulse" />
                  <h3 className="text-xs max-lg:text-[11px] max-md:text-[10px] font-bold tracking-wider text-color-black-100 dark:text-color-white-90">
                    CÁC NHÓM
                  </h3>
                </div>
                <span className="px-2 max-lg:px-1.5 py-0.5 rounded-full text-[11px] max-lg:text-[10px] max-md:text-[9px] font-semibold bg-background-dashboard dark:bg-background-white-8 text-color-black-70 dark:text-color-white-90">
                  {filteredGroupsForExplorer.length} nhóm chính
                </span>
              </div>

              {filteredGroupsForExplorer.length === 0 ? (
                <div className="py-8 max-lg:py-6 max-md:py-4 text-center text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50">
                  Không tìm thấy nhóm phù hợp
                </div>
              ) : (
                <div className="space-y-1 max-lg:space-y-0.5">
                  {filteredGroupsForExplorer.map((grp) => (
                    <GroupTreeNode
                      key={grp.id}
                      group={grp}
                      branchIndex={getGroupBranchIndex(groups, grp.id)}
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
            <div className="col-span-8 max-md:col-span-1">
              {selectedGroup ? (
                <GroupDetailWorkspace
                  group={selectedGroup}
                  groups={groups}
                  isSystemManager={isSystemManager}
                  currentUserId={currentUserId}
                  onOpenEditGroupInfoModal={handleOpenEditGroupInfoModal}
                  onOpenEditModal={handleOpenEditModal}
                  onOpenCreateChildModal={handleOpenCreateModal}
                  onOpenMembersModal={handleOpenMembersModal}
                  onRequestDeleteGroup={handleRequestDeleteGroup}
                  onSelectGroup={(id) => setSelectedGroupId(id)}
                />
              ) : (
                <div className="p-12 max-lg:p-8 max-md:p-6 rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-chart-dark border border-border-black-10 dark:border-background-white-15 text-center text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50">
                  Chọn một nhóm bên trái để xem chi tiết.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-5 max-lg:gap-3.5 max-md:gap-2.5">
            {filteredGroupsForExplorer.map((group, idx) => (
              <GroupCardNode
                key={group.id}
                group={group}
                index={idx}
                branchIndex={getGroupBranchIndex(groups, group.id)}
                level={0}
                isSystemManager={isSystemManager}
                currentUserId={currentUserId}
                onOpenEditGroupInfoModal={handleOpenEditGroupInfoModal}
                onOpenEditModal={handleOpenEditModal}
                onOpenCreateChildModal={handleOpenCreateModal}
                onOpenMembersModal={handleOpenMembersModal}
                onRequestDeleteGroup={handleRequestDeleteGroup}
              />
            ))}
          </div>
        )}
      </main>

      {/* Modal: Cập nhật Dashboard của Nhóm */}
      {editingGroup &&
        (() => {
          const editAccent = getGroupAccent(
            getGroupBranchIndex(groups, editingGroup.id),
          );
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 max-lg:p-3 max-md:p-2 overflow-y-auto">
              <div className="animate-scale-in relative overflow-hidden w-full max-w-lg rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 shadow-2xl max-h-[90vh] flex flex-col">
                <div className={`h-1 bg-gradient-to-r ${editAccent.bar}`} />

                <div className="flex items-center justify-between px-6 max-lg:px-5 max-md:px-4 py-4 max-lg:py-3 max-md:py-2.5 border-b border-border-black-10 dark:border-background-white-15">
                  <div>
                    <h3 className="text-base max-lg:text-sm max-md:text-xs font-bold text-color-black-100 dark:text-color-white-90">
                      Phân quyền Dashboard
                    </h3>
                    <p className="text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50 mt-0.5">
                      {editingGroup.group_name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingGroup(null)}
                    className="w-7 h-7 max-lg:w-6 max-lg:h-6 max-md:w-5.5 max-md:h-5.5 rounded-lg flex items-center justify-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer text-sm max-lg:text-xs max-md:text-[11px]"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={handleSaveDashboards}
                  className="p-6 max-lg:p-4 max-md:p-3 overflow-y-auto flex-1 flex flex-col justify-between"
                >
                  {selectableDashboardsForEdit.length === 0 ? (
                    <div className="p-5 max-lg:p-4 max-md:p-3 mb-4 max-lg:mb-3 max-md:mb-2 rounded-xl max-lg:rounded-lg bg-background-dashboard dark:bg-background-white-8 border border-dashed border-border-black-10 dark:border-background-white-15 text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50 text-center">
                      {editingGroup.parent_group_id
                        ? "Nhóm cha hiện chưa được chỉ định Dashboard nào."
                        : "Không có Dashboard khả dụng."}
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2 max-lg:space-y-1.5 max-md:space-y-1 mb-3 max-lg:mb-2.5 max-md:mb-2">
                        <div className="relative">
                          <input
                            type="text"
                            value={dashSearch}
                            onChange={(e) => setDashSearch(e.target.value)}
                            placeholder="Tìm kiếm Dashboard..."
                            className={`w-full pl-9 max-lg:pl-8 max-md:pl-7 pr-8 max-lg:pr-7 max-md:pr-6 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-100 dark:text-color-white-90 outline-none ${editAccent.focusRing} transition`}
                          />
                          <svg
                            className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-2.5 max-md:h-2.5 absolute left-3 max-lg:left-2.5 max-md:left-2 top-1/2 -translate-y-1/2 text-color-black-50 dark:text-color-white-50 pointer-events-none"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <circle cx="11" cy="11" r="8" />
                            <path d="m21 21-4.3-4.3" />
                          </svg>
                        </div>

                        <div className="flex items-center justify-between text-xs max-lg:text-[11px] max-md:text-[10px] px-1">
                          <span className="text-color-black-50 dark:text-color-white-50">
                            Đã chọn{" "}
                            <strong className={editAccent.folderText}>
                              {selectedDashIds.length}
                            </strong>{" "}
                            / {selectableDashboardsForEdit.length}
                          </span>
                          <div className="flex items-center gap-2 max-lg:gap-1.5 max-md:gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                setSelectedDashIds(
                                  selectableDashboardsForEdit.map((d) =>
                                    Number(d.id),
                                  ),
                                )
                              }
                              className={`${editAccent.folderText} hover:underline cursor-pointer font-medium`}
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

                      <div className="max-h-64 max-lg:max-h-56 max-md:max-h-48 overflow-y-auto space-y-2 max-lg:space-y-1.5 max-md:space-y-1 mb-4 max-lg:mb-3 max-md:mb-2 pr-1 divTable">
                        {filteredSelectableDashboards.map((dash) => {
                          const checked = selectedDashIds.includes(
                            Number(dash.id),
                          );
                          return (
                            <label
                              key={dash.id}
                              className={`flex items-center justify-between p-3 max-lg:p-2.5 max-md:p-2 rounded-xl max-lg:rounded-lg border cursor-pointer transition ${
                                checked
                                  ? editAccent.checkedItem
                                  : "border-border-black-10 dark:border-background-white-15 bg-background-dashboard/40 dark:bg-background-white-8/30"
                              }`}
                            >
                              <div className="flex items-center gap-3 max-lg:gap-2.5 max-md:gap-2 min-w-0">
                                <input
                                  type="checkbox"
                                  checked={checked}
                                  onChange={() => toggleDashId(Number(dash.id))}
                                  style={{
                                    accentColor: editAccent.accentColor,
                                  }}
                                  className="w-4 h-4 max-lg:w-3.5 max-lg:h-3.5 max-md:w-3 max-md:h-3 cursor-pointer shrink-0"
                                />
                                <span className="text-sm max-lg:text-xs max-md:text-[11px] font-medium text-color-black-100 dark:text-color-white-90 truncate">
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
                    <p className="text-xs max-lg:text-[11px] max-md:text-[10px] text-color-error mb-3 max-lg:mb-2 max-md:mb-1.5">
                      {modalError}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2.5 max-lg:gap-2 max-md:gap-1.5 pt-3 max-lg:pt-2.5 max-md:pt-2 border-t border-border-black-10 dark:border-background-white-15">
                    <button
                      type="button"
                      onClick={() => setEditingGroup(null)}
                      className="px-4 max-lg:px-3 max-md:px-2.5 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={savingDashboards}
                      className={`px-5 max-lg:px-4 max-md:px-3 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold ${editAccent.btnSolid} transition cursor-pointer disabled:opacity-60`}
                    >
                      {savingDashboards ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

      {/* Modal: Tạo Nhóm */}
      {showCreateModal &&
        (() => {
          const createAccent = creatingParentGroup
            ? getGroupAccent(
                getGroupBranchIndex(groups, creatingParentGroup.id),
              )
            : getGroupAccent(groups.length);
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 max-lg:p-3 max-md:p-2">
              <div className="animate-scale-in relative overflow-hidden w-full max-w-md rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 shadow-2xl">
                <div className={`h-1 bg-gradient-to-r ${createAccent.bar}`} />

                <div className="flex items-center justify-between px-6 max-lg:px-5 max-md:px-4 py-4 max-lg:py-3 max-md:py-2.5 border-b border-border-black-10 dark:border-background-white-15">
                  <div>
                    <h3 className="text-base max-lg:text-sm max-md:text-xs font-bold text-color-black-100 dark:text-color-white-90">
                      {creatingParentGroup ? "Thêm nhóm con" : "Tạo nhóm chính"}
                    </h3>
                    {creatingParentGroup && (
                      <p className="text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50 mt-0.5">
                        Trực thuộc: {creatingParentGroup.group_name}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="w-7 h-7 max-lg:w-6 max-lg:h-6 rounded-lg flex items-center justify-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={handleCreateGroup}
                  className="p-6 max-lg:p-4 max-md:p-3 space-y-4 max-lg:space-y-3 max-md:space-y-2"
                >
                  <div>
                    <label className="block text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                      Tên nhóm <span className="text-color-rating">*</span>
                    </label>
                    <input
                      type="text"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      placeholder="Nhập tên nhóm..."
                      className={`w-full px-3.5 max-lg:px-3 max-md:px-2.5 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-sm max-lg:text-xs max-md:text-[11px] text-color-black-100 dark:text-color-white-90 outline-none ${createAccent.focusRing}`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                      Mô tả
                    </label>
                    <textarea
                      rows={2}
                      value={newGroupDesc}
                      onChange={(e) => setNewGroupDesc(e.target.value)}
                      placeholder="Mô tả ngắn gọn..."
                      className={`w-full px-3.5 max-lg:px-3 max-md:px-2.5 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-sm max-lg:text-xs max-md:text-[11px] text-color-black-100 dark:text-color-white-90 outline-none ${createAccent.focusRing}`}
                    />
                  </div>

                  {modalError && (
                    <p className="text-xs max-lg:text-[11px] max-md:text-[10px] text-color-error">
                      {modalError}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2.5 max-lg:gap-2 max-md:gap-1.5 pt-2 border-t border-border-black-10 dark:border-background-white-15">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 max-lg:px-3 max-md:px-2.5 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={creatingGroup}
                      className={`px-5 max-lg:px-4 max-md:px-3 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold ${createAccent.btnSolid} transition cursor-pointer disabled:opacity-60`}
                    >
                      {creatingGroup ? "Đang tạo..." : "Tạo nhóm"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

      {/* Modal: Chỉnh sửa thông tin Nhóm (Tên, Mô tả) */}
      {editingGroupInfo &&
        (() => {
          const editInfoAccent = getGroupAccent(
            getGroupBranchIndex(groups, editingGroupInfo.id),
          );
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 max-lg:p-3 max-md:p-2">
              <div className="animate-scale-in relative overflow-hidden w-full max-w-md rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 shadow-2xl">
                <div className={`h-1 bg-gradient-to-r ${editInfoAccent.bar}`} />

                <div className="flex items-center justify-between px-6 max-lg:px-5 max-md:px-4 py-4 max-lg:py-3 max-md:py-2.5 border-b border-border-black-10 dark:border-background-white-15">
                  <div>
                    <h3 className="text-base max-lg:text-sm max-md:text-xs font-bold text-color-black-100 dark:text-color-white-90">
                      Chỉnh sửa thông tin nhóm
                    </h3>
                    <p className="text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50 mt-0.5">
                      {editingGroupInfo.group_name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingGroupInfo(null)}
                    className="w-7 h-7 max-lg:w-6 max-lg:h-6 rounded-lg flex items-center justify-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <form
                  onSubmit={handleSaveGroupInfo}
                  className="p-6 max-lg:p-4 max-md:p-3 space-y-4 max-lg:space-y-3 max-md:space-y-2"
                >
                  <div>
                    <label className="block text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                      Tên nhóm <span className="text-color-rating">*</span>
                    </label>
                    <input
                      type="text"
                      value={editGroupName}
                      onChange={(e) => setEditGroupName(e.target.value)}
                      placeholder="Nhập tên nhóm..."
                      className={`w-full px-3.5 max-lg:px-3 max-md:px-2.5 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-sm max-lg:text-xs max-md:text-[11px] text-color-black-100 dark:text-color-white-90 outline-none ${editInfoAccent.focusRing}`}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                      Mô tả
                    </label>
                    <textarea
                      rows={2}
                      value={editGroupDesc}
                      onChange={(e) => setEditGroupDesc(e.target.value)}
                      placeholder="Mô tả ngắn gọn..."
                      className={`w-full px-3.5 max-lg:px-3 max-md:px-2.5 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg border border-border-black-10 dark:border-background-white-15 bg-background-search dark:bg-background-white-8 text-sm max-lg:text-xs max-md:text-[11px] text-color-black-100 dark:text-color-white-90 outline-none ${editInfoAccent.focusRing}`}
                    />
                  </div>

                  {editGroupInfoError && (
                    <p className="text-xs max-lg:text-[11px] max-md:text-[10px] text-color-error">
                      {editGroupInfoError}
                    </p>
                  )}

                  <div className="flex items-center justify-end gap-2.5 max-lg:gap-2 max-md:gap-1.5 pt-2 border-t border-border-black-10 dark:border-background-white-15">
                    <button
                      type="button"
                      onClick={() => setEditingGroupInfo(null)}
                      className="px-4 max-lg:px-3 max-md:px-2.5 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={savingGroupInfo}
                      className={`px-5 max-lg:px-4 max-md:px-3 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold ${editInfoAccent.btnSolid} transition cursor-pointer disabled:opacity-60`}
                    >
                      {savingGroupInfo ? "Đang lưu..." : "Lưu thay đổi"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          );
        })()}

      {/* Modal: Xem / Quản lý Thành viên trong Nhóm */}
      {memberModalGroup &&
        (() => {
          const memberGroupAccent = getGroupAccent(
            getGroupBranchIndex(groups, memberModalGroup.id),
          );
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 max-lg:p-3 max-md:p-2 overflow-y-auto">
              <div className="animate-scale-in relative overflow-hidden w-full max-w-3xl rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 shadow-2xl max-h-[90vh] flex flex-col">
                <div
                  className={`h-1 bg-gradient-to-r ${memberGroupAccent.bar}`}
                />

                <div className="flex items-center justify-between px-6 max-lg:px-5 max-md:px-4 py-4 max-lg:py-3 max-md:py-2.5 border-b border-border-black-10 dark:border-background-white-15">
                  <div>
                    <h3 className="text-base max-lg:text-sm max-md:text-xs font-bold text-color-black-100 dark:text-color-white-90">
                      {memberModalMode === "view"
                        ? "Danh sách thành viên"
                        : "Quản lý thành viên"}
                    </h3>
                    <p className="text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50 mt-0.5">
                      {memberModalGroup.group_name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setMemberModalGroup(null)}
                    className="w-7 h-7 max-lg:w-6 max-lg:h-6 rounded-lg flex items-center justify-center text-color-black-50 hover:text-color-black-100 dark:text-color-white-50 dark:hover:text-color-white-90 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>

                <div className="p-6 max-lg:p-4 max-md:p-3 overflow-y-auto space-y-5 max-lg:space-y-4 max-md:space-y-3 flex-1">
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
                      )) &&
                    (() => {
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

                      const lineageSet = getSameLineageGroupIds(
                        groups,
                        memberModalGroup.id,
                      );

                      const eligibleAssignableUsers = assignableUsers.filter(
                        (u) => {
                          const uid = Number(u.id ?? u.user_id);
                          if (uid === currentUserId) return false;
                          const alreadyInGroup = groupMembers.some(
                            (m) => Number(m.id ?? m.user_id) === uid,
                          );
                          if (alreadyInGroup) return false;
                          const userGroupIds = Array.isArray(u.member_group_ids)
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
                              Number(u.assigned_by) === currentUserId ||
                              Number(u.created_by_fk) === currentUserId;
                            if (!isCreatedByMe) return false;
                          }
                          return true;
                        },
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

                      if (
                        !editingMemberObj &&
                        eligibleAssignableUsers.length === 0
                      ) {
                        return (
                          <div className="p-4 max-lg:p-3 max-md:p-2.5 rounded-xl max-lg:rounded-lg bg-background-dashboard dark:bg-background-white-8 border border-dashed border-border-black-10 dark:border-background-white-15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 max-lg:gap-2.5">
                            <div className="flex items-center gap-3 max-lg:gap-2.5 min-w-0">
                              <div
                                className={`w-10 h-10 max-lg:w-9 max-lg:h-9 max-md:w-8 max-md:h-8 rounded-xl max-lg:rounded-lg ${memberGroupAccent.folderBg} ${memberGroupAccent.folderText} flex items-center justify-center shrink-0`}
                              >
                                <svg
                                  className="w-5 h-5 max-lg:w-4.5 max-lg:h-4.5 max-md:w-4 max-md:h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                  />
                                </svg>
                              </div>
                              <div className="min-w-0">
                                <h5 className="text-xs max-lg:text-[11px] max-md:text-[10px] font-bold text-color-black-100 dark:text-color-white-90">
                                  Đã phân bổ hết tài khoản khả dụng
                                </h5>
                                <p className="text-[11px] max-lg:text-[10px] max-md:text-[9px] text-color-black-50 dark:text-color-white-50 mt-0.5">
                                  Hiện không còn tài khoản hợp lệ nào để gán vào
                                  nhóm này. Bạn có thể tạo thêm tài khoản mới
                                  hoặc quản lý danh sách người dùng.
                                </p>
                              </div>
                            </div>
                            <Link
                              to="/users"
                              onClick={() => setMemberModalGroup(null)}
                              className={`inline-flex items-center gap-1.5 px-3.5 max-lg:px-3 max-md:px-2.5 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold text-white ${memberGroupAccent.btnSolid} transition cursor-pointer shrink-0 shadow-xs hover:opacity-95`}
                            >
                              <svg
                                className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3 max-md:w-2.5 max-md:h-2.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                              </svg>
                              <span>Quản trị thành viên</span>
                              <svg
                                className="w-3 h-3 max-lg:w-2.5 max-lg:h-2.5"
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
                            </Link>
                          </div>
                        );
                      }

                      return (
                        <form
                          onSubmit={handleAssignMember}
                          className="p-4 max-lg:p-3 max-md:p-2.5 rounded-xl max-lg:rounded-lg bg-background-dashboard dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 space-y-3.5 max-lg:space-y-2.5 max-md:space-y-2"
                        >
                          <div className="grid grid-cols-2 max-md:grid-cols-1 gap-3.5 max-lg:gap-2.5 max-md:gap-2">
                            <div>
                              <label className="block text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
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
                                className={`w-full px-3 max-lg:px-2.5 max-md:px-2 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg border border-border-black-10 dark:border-background-white-15 bg-background-light dark:bg-background-dark text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-100 dark:text-color-white-90 outline-none ${memberGroupAccent.focusRing}`}
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
                                {eligibleAssignableUsers.map((u) => {
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
                              <label className="block text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold text-color-black-70 dark:text-color-white-80 mb-1">
                                Vai trò trong nhóm
                              </label>
                              <select
                                value={roleInGroup}
                                onChange={(e) => setRoleInGroup(e.target.value)}
                                className={`w-full px-3 max-lg:px-2.5 max-md:px-2 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg border border-border-black-10 dark:border-background-white-15 bg-background-light dark:bg-background-dark text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-100 dark:text-color-white-90 outline-none ${memberGroupAccent.focusRing}`}
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

                          {roleInGroup === "group_member" && (
                            <div>
                              <label className="block text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold text-color-black-70 dark:text-color-white-80 mb-1.5">
                                Dashboard được xem ({memberDashIds.length}/
                                {(memberModalGroup.dashboards || []).length})
                              </label>
                              {(memberModalGroup.dashboards || []).length ===
                              0 ? (
                                <p className="text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50">
                                  Nhóm chưa có Dashboard nào.
                                </p>
                              ) : (
                                <div className="grid grid-cols-2 max-md:grid-cols-1 gap-2 max-lg:gap-1.5 max-md:gap-1 max-h-36 overflow-y-auto divTable pr-1">
                                  {(memberModalGroup.dashboards || []).map(
                                    (dash) => {
                                      const checked = memberDashIds.includes(
                                        Number(dash.id),
                                      );
                                      return (
                                        <label
                                          key={dash.id}
                                          className={`flex items-center justify-between px-3 max-lg:px-2.5 max-md:px-2 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg border text-xs max-lg:text-[11px] max-md:text-[10px] cursor-pointer transition ${
                                            checked
                                              ? memberGroupAccent.checkedItem
                                              : "border-border-black-10 dark:border-background-white-15"
                                          }`}
                                        >
                                          <span className="flex items-center gap-2 max-lg:gap-1.5 max-md:gap-1 font-medium text-color-black-100 dark:text-color-white-90">
                                            <input
                                              type="checkbox"
                                              checked={checked}
                                              onChange={() =>
                                                toggleMemberDashId(
                                                  Number(dash.id),
                                                )
                                              }
                                              style={{
                                                accentColor:
                                                  memberGroupAccent.accentColor,
                                              }}
                                              className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3"
                                            />
                                            <span>{dash.dashboard_title}</span>
                                          </span>
                                        </label>
                                      );
                                    },
                                  )}
                                </div>
                              )}
                            </div>
                          )}

                          {memberModalError && (
                            <p className="text-xs max-lg:text-[11px] max-md:text-[10px] text-color-error">
                              {memberModalError}
                            </p>
                          )}

                          <div className="flex justify-end gap-2 max-lg:gap-1.5 max-md:gap-1">
                            {groupMembers.some(
                              (m) =>
                                String(m.id ?? m.user_id) ===
                                String(targetUserId),
                            ) && (
                              <button
                                type="button"
                                onClick={() => {
                                  setTargetUserId("");
                                  setRoleInGroup("group_member");
                                  setMemberDashIds(
                                    (memberModalGroup.dashboards || []).map(
                                      (d) => Number(d.id),
                                    ),
                                  );
                                }}
                                className="px-3.5 max-lg:px-3 max-md:px-2.5 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-medium border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 cursor-pointer"
                              >
                                Hủy sửa
                              </button>
                            )}
                            <button
                              type="submit"
                              disabled={savingMember}
                              className={`px-4 max-lg:px-3.5 max-md:px-2.5 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold ${memberGroupAccent.btnSolid} cursor-pointer disabled:opacity-60`}
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
                      );
                    })()}

                  {/* Members Table */}
                  <div>
                    <div className="flex items-center justify-between mb-3 max-lg:mb-2 max-md:mb-1.5">
                      <h4 className="text-xs max-lg:text-[11px] max-md:text-[10px] font-bold uppercase tracking-wider text-color-black-50 dark:text-color-white-50">
                        Thành viên ({groupMembers.length})
                      </h4>
                    </div>

                    {memberModalMode === "view" && memberModalError && (
                      <p className="text-xs max-lg:text-[11px] max-md:text-[10px] text-color-error mb-2">
                        {memberModalError}
                      </p>
                    )}

                    {loadingMembers ? (
                      <Loading height="150px" />
                    ) : groupMembers.length === 0 ? (
                      <div className="p-6 max-lg:p-4 max-md:p-3 rounded-xl border border-dashed border-border-black-10 dark:border-background-white-15 text-center text-xs max-lg:text-[11px] max-md:text-[10px] text-color-black-50 dark:text-color-white-50">
                        Nhóm chưa có thành viên nào.
                      </div>
                    ) : (
                      <div className="overflow-x-auto divTable">
                        <table className="w-full text-left border-collapse text-xs max-lg:text-[11px] max-md:text-[10px] text-nowrap">
                          <thead>
                            <tr className="border-b border-border-black-10 dark:border-background-white-15 text-color-black-50 dark:text-color-white-50 uppercase">
                              <th className="py-2.5 max-lg:py-2 max-md:py-1.5 pr-3">
                                Tài khoản
                              </th>
                              <th className="py-2.5 max-lg:py-2 max-md:py-1.5 px-3">
                                Email
                              </th>
                              <th className="py-2.5 max-lg:py-2 max-md:py-1.5 px-3">
                                Vai trò
                              </th>
                              <th className="py-2.5 max-lg:py-2 max-md:py-1.5 px-3">
                                Dashboard
                              </th>
                              {memberModalMode === "manage" && (
                                <th className="py-2.5 max-lg:py-2 max-md:py-1.5 pl-3 text-right">
                                  Thao tác
                                </th>
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
                                m.role_code ||
                                m.role_in_group ||
                                "group_member";
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
                                  <td className="py-2.5 max-lg:py-2 max-md:py-1.5 pr-3">
                                    <div className="flex items-center gap-2.5 max-lg:gap-2 max-md:gap-1.5">
                                      <div
                                        className={`w-8 h-8 max-lg:w-7 max-lg:h-7 max-md:w-6 max-md:h-6 rounded-xl max-lg:rounded-lg bg-gradient-to-tr ${memberGroupAccent.bar} text-white flex items-center justify-center font-bold text-xs max-lg:text-[11px] max-md:text-[10px] shrink-0`}
                                      >
                                        {(m.username || "U")
                                          .charAt(0)
                                          .toUpperCase()}
                                      </div>
                                      <div>
                                        <div className="font-bold text-color-black-100 dark:text-color-white-90">
                                          {m.full_name || m.username}
                                        </div>
                                        <div className="text-[11px] max-lg:text-[10px] max-md:text-[9px] font-mono text-color-black-50 dark:text-color-white-50">
                                          @{m.username}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2.5 max-lg:py-2 max-md:py-1.5 px-3 font-mono text-color-black-70 dark:text-color-white-80">
                                    {m.email || "—"}
                                  </td>
                                  <td className="py-2.5 max-lg:py-2 max-md:py-1.5 px-3">
                                    <span
                                      className={`inline-flex items-center gap-1.5 px-2.5 max-lg:px-2 max-md:px-1.5 py-0.5 rounded-full text-[11px] max-lg:text-[10px] max-md:text-[9px] font-semibold border ${
                                        roleCode === "super_admin"
                                          ? "bg-[#7367f0]/15 text-[#7367f0] dark:text-[#a59ff8] border-[#7367f0]/30"
                                          : roleCode === "group_admin"
                                            ? memberGroupAccent.badge
                                            : "bg-[#0cb7a9]/15 text-[#0cb7a9] dark:text-color-succes-type-1-dark border-[#0cb7a9]/30"
                                      }`}
                                    >
                                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                                      <span>{roleLabel}</span>
                                    </span>
                                  </td>
                                  <td className="py-2.5 max-lg:py-2 max-md:py-1.5 px-3 text-color-black-70 dark:text-color-white-80">
                                    <span className="inline-block px-2 max-lg:px-1.5 max-md:px-1 py-0.5 rounded-md bg-background-light dark:bg-background-white-8 border border-border-black-10 dark:border-background-white-15 font-medium">
                                      {roleCode === "group_member"
                                        ? `${dashCount} Dashboard`
                                        : "Toàn bộ"}
                                    </span>
                                  </td>
                                  {memberModalMode === "manage" && (
                                    <td className="py-2.5 max-lg:py-2 max-md:py-1.5 pl-3 text-right space-x-1.5 max-lg:space-x-1">
                                      {canEditOrDeleteMember && (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleSelectExistingMemberForEdit(
                                                m,
                                              )
                                            }
                                            title="Sửa thành viên"
                                            aria-label="Sửa thành viên"
                                            className={`w-7 h-7 max-lg:w-6 max-lg:h-6 rounded-lg inline-flex items-center justify-center ${memberGroupAccent.folderBg} ${memberGroupAccent.folderText} ${memberGroupAccent.playHover} transition cursor-pointer`}
                                          >
                                            <svg
                                              className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                              />
                                            </svg>
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              handleRequestRemoveMember(m)
                                            }
                                            title="Xóa thành viên"
                                            aria-label="Xóa thành viên"
                                            className="w-7 h-7 max-lg:w-6 max-lg:h-6 rounded-lg inline-flex items-center justify-center bg-color-error/10 text-color-error hover:bg-color-error hover:text-white transition cursor-pointer"
                                          >
                                            <svg
                                              className="w-3.5 h-3.5 max-lg:w-3 max-lg:h-3"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                              />
                                            </svg>
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
          );
        })()}

      {/* Modal: Xác nhận Xóa */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 max-lg:p-3 max-md:p-2">
          <div className="animate-scale-in relative overflow-hidden w-full max-w-md rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-background-light dark:bg-background-dark border border-border-black-10 dark:border-background-white-15 p-6 max-lg:p-4 max-md:p-3 shadow-2xl text-center">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#eb5757] to-[#f87171]" />

            <div className="relative w-11 h-11 max-lg:w-9 max-lg:h-9 max-md:w-8 max-md:h-8 rounded-2xl max-lg:rounded-xl max-md:rounded-lg bg-color-error/15 text-color-error flex items-center justify-center mx-auto mb-3 max-lg:mb-2 border border-color-error/30">
              <span className="animate-ping absolute inline-flex h-8 w-8 max-lg:h-6 max-lg:w-6 rounded-2xl bg-color-error/25" />
              <svg
                className="relative w-5 h-5 max-lg:w-4 max-lg:h-4"
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

            <h3 className="text-base max-lg:text-sm max-md:text-xs font-bold text-color-black-100 dark:text-color-white-90">
              {confirmDelete.type === "group"
                ? `Xóa nhóm "${confirmDelete.group?.group_name}"?`
                : `Xóa thành viên @${confirmDelete.member?.username}?`}
            </h3>

            <p className="text-xs max-lg:text-[11px] max-md:text-[10px] leading-relaxed text-color-black-50 dark:text-color-white-50 mt-1.5 mb-4 max-lg:mb-3 max-md:mb-2">
              {confirmDelete.type === "group"
                ? "Toàn bộ nhóm con, thành viên và cấu hình Dashboard của nhóm này sẽ bị xóa."
                : `Thành viên sẽ bị gỡ khỏi nhóm "${confirmDelete.group?.group_name}" cùng các Dashboard được chỉ định.`}
            </p>

            {confirmDeleteError && (
              <p className="text-xs max-lg:text-[11px] max-md:text-[10px] text-color-error mb-3 max-lg:mb-2">
                {confirmDeleteError}
              </p>
            )}

            <div className="flex items-center justify-center gap-2.5 max-lg:gap-2 max-md:gap-1.5">
              <button
                type="button"
                disabled={deletingConfirm}
                onClick={() => setConfirmDelete(null)}
                className="px-4 max-lg:px-3 max-md:px-2.5 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold border border-border-black-10 dark:border-background-white-15 text-color-black-70 dark:text-color-white-80 hover:bg-background-black-4 dark:hover:bg-background-white-8 transition cursor-pointer disabled:opacity-60"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={deletingConfirm}
                onClick={handleConfirmDeleteAction}
                className="px-5 max-lg:px-4 max-md:px-3 py-2 max-lg:py-1.5 max-md:py-1 rounded-xl max-lg:rounded-lg text-xs max-lg:text-[11px] max-md:text-[10px] font-semibold bg-color-error text-white hover:opacity-95 transition cursor-pointer disabled:opacity-60"
              >
                {deletingConfirm ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-auto w-full max-w-[1600px] mx-auto px-8 max-lg:px-6 max-md:px-4 pb-6 max-lg:pb-4.5 max-md:pb-3 bg-background-dashboard dark:bg-background-dashboard-dark transition-all duration-300">
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
