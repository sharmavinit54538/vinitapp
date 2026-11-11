'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { HrDashboardDataState } from '@/lib/hr-dashboard-logic';
import {
  OrgChartViewMode,
  OrgEmployeeNode,
  OrgTreeBranch,
  OrgChartFilterState,
  buildOrganizationHierarchy,
  getUpwardReportingChain,
  getHighlightedReportingLineIds,
  matchesOrgFilter,
} from '@/lib/org-chart-logic';
import {
  Search,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  Download,
  FileSpreadsheet,
  FileImage,
  Printer,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Users,
  Building2,
  Network,
  GitBranch,
  MapPin,
  Mail,
  Phone,
  Calendar,
  Clock,
  ShieldAlert,
  UserPlus,
  X,
  CheckCircle2,
  BarChart3,
  Briefcase,
  ArrowUpRight,
} from 'lucide-react';

interface OrganizationChartModuleProps {
  data: HrDashboardDataState;
  canEdit: boolean;
  initialDepartmentFilter?: string;
  onOpenAddEmployee: () => void;
  onSuccessToast?: (msg: string) => void;
}

export function OrganizationChartModule({
  data,
  canEdit,
  initialDepartmentFilter = 'All',
  onOpenAddEmployee,
  onSuccessToast,
}: OrganizationChartModuleProps) {
  const [viewMode, setViewMode] = useState<OrgChartViewMode>('hierarchy');
  const [filters, setFilters] = useState<OrgChartFilterState>({
    search: '',
    department: initialDepartmentFilter,
    managerId: 'All',
    location: 'All',
  });

  // Memoized dynamic hierarchy built strictly from actual API state
  const hierarchy = useMemo(() => buildOrganizationHierarchy(data), [data]);

  // Selected employee for Profile Side Panel, Reporting Line Highlighting & Reporting View
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    () => hierarchy.rootBranches[0]?.node.employeeId || null
  );
  const [isProfilePanelOpen, setIsProfilePanelOpen] = useState<boolean>(false);
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState<boolean>(true);

  // Expand / Collapse state by employeeId
  const [collapsedNodeIds, setCollapsedNodeIds] = useState<Record<string, boolean>>({});

  // Zoom, Pan & Fullscreen state
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedEmployee = selectedEmployeeId
    ? hierarchy.nodesById[selectedEmployeeId] || null
    : null;

  // Highlighted reporting line (upward chain + selected node + direct reports)
  const highlightedLineIds = useMemo(
    () => getHighlightedReportingLineIds(selectedEmployeeId, hierarchy.nodesById),
    [selectedEmployeeId, hierarchy.nodesById]
  );

  // Filtered nodes for search highlight & counts
  const matchingEmployeeIds = useMemo(() => {
    const set = new Set<string>();
    hierarchy.allNodes.forEach((node) => {
      if (matchesOrgFilter(node, filters)) {
        set.add(node.employeeId);
      }
    });
    return set;
  }, [hierarchy.allNodes, filters]);

  const hasActiveFilter =
    filters.search.trim() !== '' ||
    filters.department !== 'All' ||
    filters.managerId !== 'All' ||
    filters.location !== 'All';

  // Handlers for Zoom, Fit, Fullscreen, Expand/Collapse
  const handleZoomIn = () => setZoom((z) => Math.min(1.5, Number((z + 0.1).toFixed(2))));
  const handleZoomOut = () => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))));
  const handleFitToScreen = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleToggleFullscreen = () => {
    if (typeof document !== 'undefined' && containerRef.current) {
      if (!document.fullscreenElement && containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen().catch(() => {
          setIsFullscreen((prev) => !prev);
        });
        setIsFullscreen(true);
      } else if (document.fullscreenElement && document.exitFullscreen) {
        document.exitFullscreen().catch(() => {
          setIsFullscreen(false);
        });
        setIsFullscreen(false);
      } else {
        setIsFullscreen((prev) => !prev);
      }
    } else {
      setIsFullscreen((prev) => !prev);
    }
  };

  const handleExpandAll = () => setCollapsedNodeIds({});
  const handleCollapseAll = () => {
    const next: Record<string, boolean> = {};
    hierarchy.allNodes.forEach((n) => {
      if (n.directReportsCount > 0) {
        next[n.employeeId] = true;
      }
    });
    setCollapsedNodeIds(next);
  };

  const handleToggleNodeCollapse = (empId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCollapsedNodeIds((prev) => ({
      ...prev,
      [empId]: !prev[empId],
    }));
  };

  const handleSelectEmployeeCard = (empId: string) => {
    setSelectedEmployeeId(empId);
    setIsProfilePanelOpen(true);
  };

  // Drag-and-pan handlers for Hierarchy canvas
  const handleMouseDownCanvas = (e: React.MouseEvent<HTMLDivElement>) => {
    if ((e.target as HTMLElement).closest('button, a, input, select')) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMoveCanvas = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUpCanvas = () => {
    setIsDragging(false);
  };

  // Export 1: CSV Hierarchy Export
  const handleExportCsv = () => {
    if (typeof window === 'undefined') return;
    const rows = [
      [
        'Employee ID',
        'Name',
        'Designation',
        'Department',
        'Manager ID',
        'Manager Name',
        'Direct Reports Count',
        'Total Subtree Count',
        'Reporting Level',
        'Location',
        'Employment Status',
        'Attendance Rate (%)',
      ],
      ...hierarchy.allNodes.map((n) => [
        n.employeeId,
        n.name,
        n.designation,
        n.department,
        n.managerId || 'ROOT',
        n.managerName || 'None (Top Executive)',
        String(n.directReportsCount),
        String(n.totalSubtreeCount),
        `Level ${n.level}`,
        n.location,
        n.status,
        String(n.attendanceRate),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ofc360-organization-hierarchy.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onSuccessToast?.('Exported Organization Chart Hierarchy as CSV.');
  };

  // Export 2: High-Resolution PNG Diagram Export via HTML5 Canvas
  const handleExportPng = () => {
    if (typeof window === 'undefined') return;
    const canvas = document.createElement('canvas');
    const width = 1400;
    const rowHeight = 76;
    const headerHeight = 120;
    const height = Math.max(640, headerHeight + hierarchy.allNodes.length * rowHeight + 60);
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // White Enterprise Background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Header bar
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, width, 84);
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('OFC360 Enterprise Organization Chart', 32, 42);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '13px monospace';
    ctx.fillText(
      `Directory Nodes: ${hierarchy.analytics.totalDirectoryEmployees} | Active Workforce: ${hierarchy.analytics.totalActiveWorkforceKpi} | Departments: ${hierarchy.analytics.totalDepartments} | Levels: ${hierarchy.analytics.reportingLevels}`,
      32,
      66
    );

    // Draw each employee node sorted by level
    const sortedNodes = [...hierarchy.allNodes].sort((a, b) => a.level - b.level);
    sortedNodes.forEach((node, idx) => {
      const y = headerHeight + idx * rowHeight;
      const indentX = 36 + (node.level - 1) * 72;

      // Connector line
      if (node.level > 1) {
        ctx.strokeStyle = '#6366f1';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(indentX - 36, y + 26);
        ctx.lineTo(indentX - 8, y + 26);
        ctx.stroke();
      }

      // Card box
      ctx.fillStyle = '#f8fafc';
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(indentX, y, width - indentX - 48, 56, 10);
      ctx.fill();
      ctx.stroke();

      // Badge & Text
      ctx.fillStyle = '#4f46e5';
      ctx.font = 'bold 12px monospace';
      ctx.fillText(`L${node.level} · ${node.employeeId}`, indentX + 16, y + 22);

      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(`${node.name} — ${node.designation}`, indentX + 145, y + 22);

      ctx.fillStyle = '#475569';
      ctx.font = '12px sans-serif';
      ctx.fillText(
        `Dept: ${node.department} | Reports To: ${node.managerName || 'Root'} | Direct Reports: ${node.directReportsCount} | Status: ${node.status}`,
        indentX + 16,
        y + 42
      );
    });

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ofc360-organization-chart.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      onSuccessToast?.('Exported Organization Chart as PNG image.');
    }, 'image/png');
  };

  // Export 3: PDF / Print Document Export
  const handleExportPdf = () => {
    if (typeof window === 'undefined') return;
    window.print();
    onSuccessToast?.('Opened PDF / Print dialog for Organization Chart.');
  };

  // Render an Employee Card with all required fields & interactions
  const renderEmployeeNodeCard = (
    node: OrgEmployeeNode,
    options?: { showToggle?: boolean; isCollapsed?: boolean; compact?: boolean }
  ) => {
    const isSelected = selectedEmployeeId === node.employeeId;
    const isInReportingLine = highlightedLineIds.has(node.employeeId);
    const isFilterMatch = matchingEmployeeIds.has(node.employeeId);
    const isSearchHighlighted =
      filters.search.trim() !== '' && isFilterMatch;

    return (
      <div
        key={node.employeeId}
        role="button"
        tabIndex={0}
        onClick={() => handleSelectEmployeeCard(node.employeeId)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelectEmployeeCard(node.employeeId);
          }
        }}
        data-testid={`org-node-${node.employeeId}`}
        className={`group relative text-left rounded-2xl border transition-all cursor-pointer select-none ${
          options?.compact ? 'p-3 w-full' : 'p-3.5 w-full sm:w-[236px]'
        } ${
          isSelected
            ? 'border-indigo-600 dark:border-indigo-400 bg-indigo-50/40 dark:bg-indigo-950/50 ring-2 ring-indigo-500/30 shadow-md'
            : isSearchHighlighted
            ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 ring-2 ring-amber-400/40 shadow-sm'
            : isInReportingLine
            ? 'border-indigo-300 dark:border-indigo-800 bg-white dark:bg-slate-900 shadow-xs'
            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs'
        } ${hasActiveFilter && !isFilterMatch ? 'opacity-45' : 'opacity-100'}`}
      >
        {/* Top Row: Avatar + Name + ID + Status Dot */}
        <div className="flex items-start justify-between gap-2.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <div
                className={`w-10 h-10 rounded-xl font-bold text-xs flex items-center justify-center text-white ${
                  node.level === 1
                    ? 'bg-indigo-600'
                    : node.isDepartmentHead
                    ? 'bg-slate-900 dark:bg-indigo-500'
                    : 'bg-slate-700 dark:bg-slate-800'
                }`}
              >
                {node.initials}
              </div>
              <span
                title={`Status: ${node.status}`}
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                  node.status === 'Present' || node.status === 'Remote'
                    ? 'bg-emerald-500'
                    : node.status === 'Late'
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] font-bold text-indigo-600 dark:text-indigo-400">
                  {node.employeeId}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  L{node.level}
                </span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate mt-0.5">
                {node.name}
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                {node.designation}
              </p>
            </div>
          </div>

          <span
            className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${
              node.status === 'Present' || node.status === 'Remote'
                ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                : node.status === 'Late'
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                : 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300'
            }`}
          >
            {node.status}
          </span>
        </div>

        {/* Bottom Metadata Row: Department + Direct Reports Count + Expand/Collapse */}
        <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300 truncate font-medium">
            <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">{node.department}</span>
          </span>

          <div className="flex items-center gap-1.5 shrink-0">
            <span
              data-testid={`org-direct-reports-badge-${node.employeeId}`}
              className="px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] font-semibold"
              title={`${node.directReportsCount} Direct Reports`}
            >
              {node.directReportsCount} {node.directReportsCount === 1 ? 'Report' : 'Reports'}
            </span>

            {options?.showToggle && node.directReportsCount > 0 && (
              <button
                type="button"
                onClick={(e) => handleToggleNodeCollapse(node.employeeId, e)}
                data-testid={`org-node-toggle-${node.employeeId}`}
                aria-label={
                  options.isCollapsed
                    ? `Expand ${node.name} direct reports`
                    : `Collapse ${node.name} direct reports`
                }
                className="w-6 h-6 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950 text-slate-600 dark:text-slate-300 flex items-center justify-center cursor-pointer"
              >
                {options.isCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Recursive Tree Renderer for Hierarchy View
  const renderHierarchyBranch = (branch: OrgTreeBranch): React.ReactNode => {
    const { node, children } = branch;
    const isCollapsed = !!collapsedNodeIds[node.employeeId];
    const hasVisibleChildren = children.length > 0 && !isCollapsed;

    return (
      <div
        key={node.employeeId}
        className="flex flex-col items-center"
        data-testid={`org-tree-branch-${node.employeeId}`}
      >
        {renderEmployeeNodeCard(node, {
          showToggle: true,
          isCollapsed,
        })}

        {hasVisibleChildren && (
          <>
            {/* Vertical Connector Stem down from parent */}
            <div
              className={`w-0.5 h-6 transition-colors ${
                highlightedLineIds.has(node.employeeId)
                  ? 'bg-indigo-500'
                  : 'bg-slate-300 dark:bg-slate-700'
              }`}
            />

            {/* Children Horizontal Container */}
            <div className="relative w-full flex flex-wrap items-start justify-center gap-4 pt-3 border-t-2 border-slate-200 dark:border-slate-800">
              {children.map((childBranch) => (
                <div
                  key={childBranch.node.employeeId}
                  className="flex flex-col items-center"
                >
                  {renderHierarchyBranch(childBranch)}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  // Upward chain & direct reports for Reporting View
  const reportingViewChain = useMemo(
    () =>
      selectedEmployeeId
        ? getUpwardReportingChain(selectedEmployeeId, hierarchy.nodesById)
        : [],
    [selectedEmployeeId, hierarchy.nodesById]
  );

  const reportingViewDirectReports = useMemo(
    () =>
      selectedEmployee
        ? selectedEmployee.directReportIds
            .map((id) => hierarchy.nodesById[id])
            .filter(Boolean)
        : [],
    [selectedEmployee, hierarchy.nodesById]
  );

  const reportingViewPeers = useMemo(() => {
    if (!selectedEmployee) return [];
    return hierarchy.allNodes.filter(
      (n) =>
        n.department === selectedEmployee.department &&
        n.employeeId !== selectedEmployee.employeeId &&
        !selectedEmployee.directReportIds.includes(n.employeeId)
    );
  }, [selectedEmployee, hierarchy.allNodes]);

  return (
    <div
      ref={containerRef}
      data-testid="workforce-org-chart-view"
      className={`space-y-4 ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-slate-50 dark:bg-slate-950 p-4 sm:p-6 overflow-y-auto'
          : ''
      }`}
    >
      {/* 1. ENTERPRISE HEADER & CONTROLS TOOLBAR */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* View Mode Selector + Export + Fullscreen */}
          <div className="w-full flex flex-wrap items-center justify-between gap-2">
            <div
              role="group"
              aria-label="Organization Chart View Mode"
              className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800"
            >
              <button
                type="button"
                onClick={() => setViewMode('hierarchy')}
                data-testid="org-view-mode-hierarchy"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'hierarchy'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Network className="w-3.5 h-3.5" />
                <span>Hierarchy View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('department')}
                data-testid="org-view-mode-department"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'department'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Department View</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('reporting')}
                data-testid="org-view-mode-reporting"
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer transition-colors ${
                  viewMode === 'reporting'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <GitBranch className="w-3.5 h-3.5" />
                <span>Reporting View</span>
              </button>
            </div>

            {/* Export Options: CSV, PNG, PDF */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleExportCsv}
                data-testid="export-org-chart-btn"
                title="Export Hierarchy CSV"
                className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>CSV</span>
              </button>
              <button
                type="button"
                onClick={handleExportPng}
                data-testid="export-org-png-btn"
                title="Export Chart as PNG"
                className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
              >
                <FileImage className="w-3.5 h-3.5 text-indigo-600" />
                <span>PNG</span>
              </button>
              <button
                type="button"
                onClick={handleExportPdf}
                data-testid="export-org-pdf-btn"
                title="Export Chart as PDF"
                className="h-9 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-violet-600" />
                <span>PDF</span>
              </button>
              <button
                type="button"
                onClick={handleToggleFullscreen}
                data-testid="org-fullscreen-btn"
                aria-label="Toggle Fullscreen Mode"
                className="h-9 px-2.5 rounded-xl bg-slate-900 dark:bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1 cursor-pointer"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Exit</span>
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Fullscreen</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search + Department Filter + Manager Filter + Location Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={filters.search}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, search: e.target.value }))
              }
              data-testid="org-chart-search-input"
              placeholder="Search employee, ID, or title..."
              aria-label="Search employees in organization chart"
              className="w-full h-9 pl-8 pr-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-900 dark:text-white"
            />
          </div>

          <select
            value={filters.department}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, department: e.target.value }))
            }
            aria-label="Filter Org Chart by Department"
            data-testid="org-chart-dept-select"
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value="All">All Departments ({hierarchy.departments.length})</option>
            {hierarchy.departments.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <select
            value={filters.managerId}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, managerId: e.target.value }))
            }
            aria-label="Filter Org Chart by Manager"
            data-testid="org-chart-manager-select"
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value="All">All Reporting Managers ({hierarchy.managers.length})</option>
            {hierarchy.managers.map((m) => (
              <option key={m.employeeId} value={m.employeeId}>
                {m.name} ({m.department})
              </option>
            ))}
          </select>

          <select
            value={filters.location}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, location: e.target.value }))
            }
            aria-label="Filter Org Chart by Location"
            data-testid="org-chart-location-select"
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white"
          >
            <option value="All">All Locations ({hierarchy.locations.length})</option>
            {hierarchy.locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Interactive Tree Navigation Bar: Expand/Collapse, Zoom In/Out, Fit to Screen, Filter Status */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <button
              type="button"
              onClick={handleExpandAll}
              data-testid="org-expand-all-btn"
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Expand All
            </button>
            <button
              type="button"
              onClick={handleCollapseAll}
              data-testid="org-collapse-all-btn"
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 cursor-pointer"
            >
              Collapse All
            </button>

            {hasActiveFilter && (
              <button
                type="button"
                onClick={() =>
                  setFilters({
                    search: '',
                    department: 'All',
                    managerId: 'All',
                    location: 'All',
                  })
                }
                className="h-8 px-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-semibold cursor-pointer"
              >
                Reset Filters ({matchingEmployeeIds.size} matched)
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleZoomOut}
              data-testid="org-zoom-out-btn"
              aria-label="Zoom Out"
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="font-mono text-[11px] font-bold px-2 text-slate-600 dark:text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleZoomIn}
              data-testid="org-zoom-in-btn"
              aria-label="Zoom In"
              className="w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleFitToScreen}
              data-testid="org-fit-screen-btn"
              className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-slate-700 dark:text-slate-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Fit to Screen</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. ORGANIZATION ANALYTICS KPI STRIP & SPAN-OF-CONTROL PANEL */}
      <div
        data-testid="org-analytics-strip"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5"
      >
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            Total Employees
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {hierarchy.analytics.totalDirectoryEmployees}
            </span>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
              ({hierarchy.analytics.totalActiveWorkforceKpi} Org KPI)
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            Total Departments
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {hierarchy.analytics.totalDepartments}
            </span>
            <span className="text-[10px] text-slate-400">Active Units</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            Total Managers
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {hierarchy.analytics.totalManagers}
            </span>
            <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400">
              Avg Span: {hierarchy.analytics.averageSpanOfControl}
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            Reporting Levels
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {hierarchy.analytics.reportingLevels}
            </span>
            <span className="text-[10px] text-slate-400">Max Depth</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            Without Manager
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
              {hierarchy.analytics.employeesWithoutManager}
            </span>
            <span className="text-[10px] text-slate-400">Root Node</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-2xs">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
            Vacant Positions
          </span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
              {hierarchy.analytics.vacantPositions}
            </span>
            <span className="text-[10px] text-slate-400">
              {data.requisitions.length} Open Reqs
            </span>
          </div>
        </div>
      </div>

      {/* 3. MAIN INTERACTIVE CHART WORKSPACE + PROFILE SIDE PANEL */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        <div
          className={`${
            isProfilePanelOpen && selectedEmployee
              ? 'xl:col-span-8'
              : 'xl:col-span-12'
          } space-y-4`}
        >
          {hierarchy.allNodes.length === 0 ? (
            <div
              data-testid="org-chart-empty-state"
              className="py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-center space-y-3 shadow-2xs"
            >
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Network className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  No data available
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  No employee records are enrolled in the workforce directory yet. Enroll employees to dynamically generate the enterprise organization chart.
                </p>
              </div>
              {canEdit && (
                <button
                  type="button"
                  onClick={onOpenAddEmployee}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs cursor-pointer"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add Employee</span>
                </button>
              )}
            </div>
          ) : (
            <>
              {/* VIEW MODE 1: HIERARCHY VIEW */}
              {viewMode === 'hierarchy' && (
                <div
                  onMouseDown={handleMouseDownCanvas}
                  onMouseMove={handleMouseMoveCanvas}
                  onMouseUp={handleMouseUpCanvas}
                  onMouseLeave={handleMouseUpCanvas}
                  data-testid="org-hierarchy-canvas"
                  className={`rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 overflow-x-auto shadow-2xs ${
                    isDragging ? 'cursor-grabbing' : 'cursor-grab'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4 text-[11px] text-slate-400 font-mono">
                    <span>
                      DRAG TO PAN · CLICK ANY CARD TO INSPECT REPORTING LINE &amp; PROFILE
                    </span>
                    <span>
                      Highlighted Path: {highlightedLineIds.size} Nodes
                    </span>
                  </div>

                  <div
                    style={{
                      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                      transformOrigin: 'top center',
                    }}
                    className="w-full py-2 transition-transform duration-150 flex flex-col items-center gap-6"
                  >
                    {hierarchy.rootBranches.map((rootBranch) =>
                      renderHierarchyBranch(rootBranch)
                    )}
                  </div>
                </div>
              )}

              {/* VIEW MODE 2: DEPARTMENT VIEW */}
              {viewMode === 'department' && (
                <div
                  data-testid="org-department-view"
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                  {hierarchy.analytics.departmentMetrics
                    .filter(
                      (d) =>
                        filters.department === 'All' ||
                        d.department === filters.department
                    )
                    .map((deptMetric) => {
                      const deptNodes = hierarchy.allNodes.filter(
                        (n) => n.department === deptMetric.department
                      );
                      const headNode = deptMetric.headEmployeeId
                        ? hierarchy.nodesById[deptMetric.headEmployeeId]
                        : undefined;
                      const teamNodes = deptNodes.filter(
                        (n) => n.employeeId !== headNode?.employeeId
                      );

                      return (
                        <div
                          key={deptMetric.departmentId}
                          data-testid={`org-dept-group-${deptMetric.departmentId}`}
                          className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
                            <div>
                              <span className="text-[10px] font-mono text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                                {deptMetric.departmentId} · {deptMetric.departmentTotalHeadcount} Total Headcount
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                                {deptMetric.department}
                              </h4>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 block">
                                {deptMetric.attendancePercentage}% Att
                              </span>
                              {deptMetric.openRequisitionsCount > 0 && (
                                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                                  {deptMetric.openRequisitionsCount} Open Roles
                                </span>
                              )}
                            </div>
                          </div>

                          {headNode && (
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                                Department Head
                              </span>
                              {renderEmployeeNodeCard(headNode, { compact: true })}
                            </div>
                          )}

                          <div className="pl-3.5 border-l-2 border-indigo-200 dark:border-indigo-900 space-y-2">
                            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                              Department Members ({teamNodes.length})
                            </span>
                            {teamNodes.length === 0 ? (
                              <p className="text-xs text-slate-400 py-1">
                                No additional direct report records in directory for this unit.
                              </p>
                            ) : (
                              teamNodes.map((member) =>
                                renderEmployeeNodeCard(member, { compact: true })
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* VIEW MODE 3: REPORTING VIEW */}
              {viewMode === 'reporting' && (
                <div
                  data-testid="org-reporting-view"
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-5 shadow-2xs"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        Focused Reporting Chain View
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Inspect upward supervisor chain, direct reports, and department peers
                      </p>
                    </div>

                    <select
                      value={selectedEmployeeId || ''}
                      onChange={(e) => {
                        setSelectedEmployeeId(e.target.value);
                        setIsProfilePanelOpen(true);
                      }}
                      aria-label="Select Employee for Reporting Chain"
                      data-testid="org-reporting-employee-select"
                      className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      {hierarchy.allNodes.map((n) => (
                        <option key={n.employeeId} value={n.employeeId}>
                          {n.name} ({n.employeeId} · {n.designation})
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedEmployee && (
                    <div className="space-y-4">
                      {/* Upward Manager Chain */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                          1. Upward Reporting Chain ({reportingViewChain.length} Supervisor Levels)
                        </span>
                        {reportingViewChain.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-500 dark:text-slate-400">
                            {selectedEmployee.name} is a top-level root executive node with no upward supervisor in the directory.
                          </div>
                        ) : (
                          <div className="flex flex-wrap items-center gap-3">
                            {reportingViewChain.map((mgr) => (
                              <React.Fragment key={mgr.employeeId}>
                                <div className="w-full sm:w-72">
                                  {renderEmployeeNodeCard(mgr, { compact: true })}
                                </div>
                                <ChevronRight className="w-4 h-4 text-indigo-500 hidden sm:block" />
                              </React.Fragment>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Selected Employee Focus */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-600 dark:text-indigo-400 font-bold block">
                          2. Focused Employee Node
                        </span>
                        <div className="max-w-md">
                          {renderEmployeeNodeCard(selectedEmployee, { compact: true })}
                        </div>
                      </div>

                      {/* Direct Reports */}
                      <div className="space-y-2">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                          3. Direct Reports ({reportingViewDirectReports.length})
                        </span>
                        {reportingViewDirectReports.length === 0 ? (
                          <div className="rounded-xl border border-dashed border-slate-200 dark:border-slate-800 p-3 text-xs text-slate-500 dark:text-slate-400">
                            No direct reports currently assigned to {selectedEmployee.name}.
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {reportingViewDirectReports.map((rep) =>
                              renderEmployeeNodeCard(rep, { compact: true })
                            )}
                          </div>
                        )}
                      </div>

                      {/* Department Peers */}
                      {reportingViewPeers.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                          <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 block">
                            4. Department Peers in {selectedEmployee.department} ({reportingViewPeers.length})
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {reportingViewPeers.map((peer) =>
                              renderEmployeeNodeCard(peer, { compact: true })
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 4. DEPARTMENT HEADCOUNT & SPAN-OF-CONTROL ANALYTICS */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3.5 shadow-2xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      Department Headcount Distribution &amp; Manager Span-of-Control Analytics
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowAnalyticsPanel((prev) => !prev)}
                    className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 cursor-pointer"
                  >
                    {showAnalyticsPanel ? 'Hide Details' : 'Show Details'}
                  </button>
                </div>

                {showAnalyticsPanel && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {/* Department Headcount Bars */}
                    <div className="space-y-2.5">
                      <span className="text-[11px] font-mono uppercase text-slate-400 block">
                        Department Headcount &amp; Open Roles
                      </span>
                      {hierarchy.analytics.departmentMetrics.map((d) => {
                        const pct = Math.round(
                          (d.departmentTotalHeadcount /
                            Math.max(1, hierarchy.analytics.totalActiveWorkforceKpi)) *
                            100
                        );
                        return (
                          <div key={d.departmentId} className="space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {d.department}{' '}
                                <span className="text-[11px] text-slate-400 font-normal">
                                  ({d.headOfDept})
                                </span>
                              </span>
                              <span className="font-mono text-[11px] text-slate-600 dark:text-slate-300">
                                {d.departmentTotalHeadcount} ({pct}%) · {d.enrolledDirectoryCount} in tree
                              </span>
                            </div>
                            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                              <div
                                className="h-full rounded-full bg-indigo-600 dark:bg-indigo-500"
                                style={{ width: `${Math.min(100, pct * 2)}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Span-of-Control Table */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-mono uppercase text-slate-400 block">
                        Span of Control (Employees per Manager)
                      </span>
                      <div className="space-y-1.5">
                        {hierarchy.analytics.managerSpanMetrics.map((m) => (
                          <div
                            key={m.managerEmployeeId}
                            className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 px-3 py-2 flex items-center justify-between text-xs"
                          >
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 dark:text-white truncate">
                                {m.managerName}{' '}
                                <span className="font-mono text-[10px] text-indigo-600 dark:text-indigo-400">
                                  {m.managerEmployeeId}
                                </span>
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                                {m.designation} · {m.department}
                              </p>
                            </div>
                            <div className="text-right font-mono shrink-0">
                              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                                {m.directReportsCount} Direct
                              </span>
                              <span className="text-[10px] text-slate-400">
                                {m.totalSubtreeCount} Total Subtree
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* 5. EMPLOYEE PROFILE & RELATIONSHIP GOVERNANCE SIDE PANEL */}
        {isProfilePanelOpen && selectedEmployee && (
          <aside
            data-testid="org-employee-profile-panel"
            aria-label="Selected Employee Profile Panel"
            className="xl:col-span-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-4 shadow-sm sticky top-20"
          >
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                  {selectedEmployee.initials}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      {selectedEmployee.employeeId}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                      Level {selectedEmployee.level}
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white mt-0.5">
                    {selectedEmployee.name}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedEmployee.designation}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsProfilePanelOpen(false)}
                aria-label="Close Employee Profile Panel"
                className="w-7 h-7 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Telemetry Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-2.5">
                <span className="text-[10px] text-slate-400 block">Department</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {selectedEmployee.department}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-2.5">
                <span className="text-[10px] text-slate-400 block">Status &amp; Att.</span>
                <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                  {selectedEmployee.status} ({selectedEmployee.attendanceRate}%)
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-2.5">
                <span className="text-[10px] text-slate-400 block">Reporting Manager</span>
                <span className="font-bold text-slate-900 dark:text-white truncate block">
                  {selectedEmployee.managerName || 'Root Executive'}
                </span>
              </div>
              <div className="rounded-xl bg-slate-50 dark:bg-slate-950/60 p-2.5">
                <span className="text-[10px] text-slate-400 block">Direct Reports</span>
                <span className="font-bold font-mono text-slate-900 dark:text-white">
                  {selectedEmployee.directReportsCount} Direct ({selectedEmployee.totalSubtreeCount} Total)
                </span>
              </div>
            </div>

            {/* Contact & Shift Details */}
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{selectedEmployee.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="font-mono">{selectedEmployee.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{selectedEmployee.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>
                  {selectedEmployee.shift} · Joined {selectedEmployee.joiningDate}
                </span>
              </div>
            </div>

            {/* Functional Relationship Navigation Actions */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                Reporting Line Navigation
              </span>
              <div className="grid grid-cols-2 gap-2">
                {selectedEmployee.managerId && (
                  <button
                    type="button"
                    onClick={() => setSelectedEmployeeId(selectedEmployee.managerId)}
                    data-testid="org-action-view-manager"
                    className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5 text-indigo-600" />
                    <span>View Manager</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setViewMode('reporting')}
                  data-testid="org-action-view-reports"
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <GitBranch className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Direct Reports ({selectedEmployee.directReportsCount})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setFilters((prev) => ({
                      ...prev,
                      department: selectedEmployee.department,
                    }));
                    setViewMode('department');
                  }}
                  data-testid="org-action-view-team"
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 inline-flex items-center justify-center gap-1.5 cursor-pointer col-span-2"
                >
                  <Users className="w-3.5 h-3.5 text-emerald-600" />
                  <span>View {selectedEmployee.department} Team Members</span>
                </button>
              </div>
            </div>

            {/* Authorized Relationship Mutation API Status (Transparent Backend Availability Report) */}
            <div
              data-testid="org-relationship-api-notice"
              className="rounded-xl border border-amber-200/80 dark:border-amber-900/50 bg-amber-50/70 dark:bg-amber-950/30 p-3 space-y-2"
            >
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 dark:text-amber-200">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Relationship Mutation API Status</span>
              </div>
              <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
                <strong>Change Reporting Manager</strong>, <strong>Transfer Department</strong>, and{' '}
                <strong>Update Designation</strong> require backend endpoint{' '}
                <code className="font-mono text-[10px] px-1 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60">
                  PATCH /api/v1/hr/workforce/:id
                </code>{' '}
                which is not exposed by the current backend API. Relationships are strictly read-only from{' '}
                <code className="font-mono text-[10px]">GET /api/v1/hr/dashboard</code>.
              </p>
              {canEdit && (
                <button
                  type="button"
                  onClick={onOpenAddEmployee}
                  className="w-full h-8 rounded-lg bg-slate-900 dark:bg-indigo-600 text-white text-[11px] font-semibold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Onboard New Employee (POST /api/v1/hr/workforce)</span>
                </button>
              )}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
