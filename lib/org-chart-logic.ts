import {
  HrDashboardDataState,
  WorkforceEmployee,
  DepartmentAttendanceMetric,
  RecruitmentRequisition,
} from './hr-dashboard-logic';

export type OrgChartViewMode = 'hierarchy' | 'department' | 'reporting';

export interface OrgEmployeeNode {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  department: string;
  location: string;
  shift: string;
  status: WorkforceEmployee['status'];
  attendanceRate: number;
  joiningDate: string;
  initials: string;
  avatarUrl?: string;
  managerId: string | null;
  managerName: string | null;
  directReportIds: string[];
  directReportsCount: number;
  totalSubtreeCount: number;
  level: number;
  isDepartmentHead: boolean;
  hasCircularReference: boolean;
}

export interface OrgTreeBranch {
  node: OrgEmployeeNode;
  children: OrgTreeBranch[];
}

export interface OrgChartFilterState {
  search: string;
  department: string;
  managerId: string;
  location: string;
}

export interface DepartmentSpanMetric {
  departmentId: string;
  department: string;
  headOfDept: string;
  headEmployeeId: string | null;
  enrolledDirectoryCount: number;
  departmentTotalHeadcount: number;
  attendancePercentage: number;
  openRequisitionsCount: number;
}

export interface ManagerSpanMetric {
  managerEmployeeId: string;
  managerName: string;
  designation: string;
  department: string;
  directReportsCount: number;
  totalSubtreeCount: number;
}

export interface OrgChartAnalyticsSummary {
  totalDirectoryEmployees: number;
  totalActiveWorkforceKpi: number;
  totalDepartments: number;
  totalManagers: number;
  reportingLevels: number;
  employeesWithoutManager: number;
  vacantPositions: number;
  averageSpanOfControl: number;
  departmentMetrics: DepartmentSpanMetric[];
  managerSpanMetrics: ManagerSpanMetric[];
}

export interface BuiltOrgHierarchy {
  nodesById: Record<string, OrgEmployeeNode>;
  allNodes: OrgEmployeeNode[];
  rootBranches: OrgTreeBranch[];
  analytics: OrgChartAnalyticsSummary;
  locations: string[];
  departments: string[];
  managers: { employeeId: string; name: string; department: string }[];
}

/**
 * Dynamically builds the organization hierarchy from actual employee records,
 * department head mappings, and admin profile data returned by the API.
 * Safely guards against missing managers and circular reporting relationships.
 */
export function buildOrganizationHierarchy(
  data: HrDashboardDataState,
  explicitManagerOverrides?: Record<string, string | null>
): BuiltOrgHierarchy {
  const workforce = data.workforce || [];
  const departments: DepartmentAttendanceMetric[] = data.departments || [];
  const requisitions: RecruitmentRequisition[] = data.requisitions || [];

  // Build strictly from actual workforce records returned by the API
  const combinedEmployees: WorkforceEmployee[] = [...workforce];

  if (combinedEmployees.length === 0) {
    return {
      nodesById: {},
      allNodes: [],
      rootBranches: [],
      analytics: {
        totalDirectoryEmployees: 0,
        totalActiveWorkforceKpi: 0,
        totalDepartments: 0,
        totalManagers: 0,
        reportingLevels: 0,
        employeesWithoutManager: 0,
        vacantPositions: 0,
        averageSpanOfControl: 0,
        departmentMetrics: [],
        managerSpanMetrics: [],
      },
      locations: [],
      departments: [],
      managers: [],
    };
  }

  // Map department name -> headOfDept name from API department records (if matched in workforce)
  const deptHeadNameByDept = new Map<string, string>();
  departments.forEach((d) => {
    if (d.department && d.headOfDept) {
      deptHeadNameByDept.set(d.department, d.headOfDept.trim());
    }
  });

  // Index employees by employeeId and by normalized name
  const empById = new Map<string, WorkforceEmployee>();
  const empByName = new Map<string, WorkforceEmployee>();
  combinedEmployees.forEach((emp) => {
    empById.set(emp.employeeId, emp);
    empByName.set(emp.name.trim().toLowerCase(), emp);
  });

  // Determine department heads present in actual workforce
  const rawManagerMap = new Map<string, string | null>();
  const isDeptHeadSet = new Set<string>();
  const resolvedDeptHeadIdByDept = new Map<string, string>();

  const uniqueWorkforceDepts = Array.from(
    new Set(combinedEmployees.map((e) => e.department).filter(Boolean))
  );

  uniqueWorkforceDepts.forEach((deptName) => {
    const configuredHeadName = deptHeadNameByDept.get(deptName);
    const configuredHeadEmp = configuredHeadName
      ? empByName.get(configuredHeadName.toLowerCase())
      : undefined;

    if (configuredHeadEmp && configuredHeadEmp.department === deptName) {
      isDeptHeadSet.add(configuredHeadEmp.employeeId);
      resolvedDeptHeadIdByDept.set(deptName, configuredHeadEmp.employeeId);
    } else {
      const deptEmployees = combinedEmployees.filter(
        (e) => e.department === deptName
      );
      if (deptEmployees.length > 0) {
        isDeptHeadSet.add(deptEmployees[0].employeeId);
        resolvedDeptHeadIdByDept.set(deptName, deptEmployees[0].employeeId);
      }
    }
  });

  const adminEmpId =
    data.adminProfile?.employeeId && empById.has(data.adminProfile.employeeId)
      ? data.adminProfile.employeeId
      : null;

  combinedEmployees.forEach((emp) => {
    // 1. Check if caller provided an explicit manager map
    if (
      explicitManagerOverrides &&
      Object.prototype.hasOwnProperty.call(explicitManagerOverrides, emp.employeeId)
    ) {
      const overrideId = explicitManagerOverrides[emp.employeeId];
      rawManagerMap.set(
        emp.employeeId,
        overrideId && empById.has(overrideId) && overrideId !== emp.employeeId
          ? overrideId
          : null
      );
      return;
    }

    // 2. Root executive / admin node has no manager above them in the directory
    if (adminEmpId && emp.employeeId === adminEmpId) {
      rawManagerMap.set(emp.employeeId, null);
      return;
    }

    // 3. Find the department head for the employee's department
    const deptHeadEmpId = resolvedDeptHeadIdByDept.get(emp.department);

    if (deptHeadEmpId && deptHeadEmpId !== emp.employeeId) {
      rawManagerMap.set(emp.employeeId, deptHeadEmpId);
    } else if (adminEmpId && adminEmpId !== emp.employeeId) {
      rawManagerMap.set(emp.employeeId, adminEmpId);
    } else {
      rawManagerMap.set(emp.employeeId, null);
    }
  });

  // Detect and break circular reporting relationships (e.g. A -> B -> A)
  const safeManagerMap = new Map<string, string | null>();
  const circularSet = new Set<string>();

  combinedEmployees.forEach((emp) => {
    const visited = new Set<string>([emp.employeeId]);
    let curr = rawManagerMap.get(emp.employeeId) ?? null;
    let hasCycle = false;

    while (curr) {
      if (visited.has(curr)) {
        hasCycle = true;
        break;
      }
      visited.add(curr);
      curr = rawManagerMap.get(curr) ?? null;
    }

    if (hasCycle) {
      circularSet.add(emp.employeeId);
      safeManagerMap.set(emp.employeeId, null);
    } else {
      safeManagerMap.set(emp.employeeId, rawManagerMap.get(emp.employeeId) ?? null);
    }
  });

  // Build adjacency list (manager -> direct reports)
  const childrenMap = new Map<string, string[]>();
  combinedEmployees.forEach((emp) => {
    childrenMap.set(emp.employeeId, []);
  });

  combinedEmployees.forEach((emp) => {
    const mgrId = safeManagerMap.get(emp.employeeId);
    if (mgrId && childrenMap.has(mgrId)) {
      childrenMap.get(mgrId)!.push(emp.employeeId);
    }
  });

  // Calculate levels and subtree counts
  const nodesById: Record<string, OrgEmployeeNode> = {};

  function buildSubtree(empId: string, level: number, ancestorSet: Set<string>): OrgTreeBranch {
    const emp = empById.get(empId)!;
    const mgrId = safeManagerMap.get(empId) ?? null;
    const mgrEmp = mgrId ? empById.get(mgrId) : undefined;
    const directIds = (childrenMap.get(empId) || []).filter(
      (cid) => !ancestorSet.has(cid)
    );

    const nextAncestors = new Set(ancestorSet);
    nextAncestors.add(empId);

    const childBranches = directIds.map((cid) =>
      buildSubtree(cid, level + 1, nextAncestors)
    );

    const totalSubtreeCount = childBranches.reduce(
      (sum, b) => sum + 1 + b.node.totalSubtreeCount,
      0
    );

    const node: OrgEmployeeNode = {
      id: emp.id,
      employeeId: emp.employeeId,
      name: emp.name,
      email: emp.email,
      phone: emp.phone,
      designation: emp.designation,
      department: emp.department,
      location: emp.location,
      shift: emp.shift,
      status: emp.status,
      attendanceRate: emp.attendanceRate,
      joiningDate: emp.joiningDate,
      initials: emp.initials,
      managerId: mgrId,
      managerName: mgrEmp ? mgrEmp.name : null,
      directReportIds: directIds,
      directReportsCount: directIds.length,
      totalSubtreeCount,
      level,
      isDepartmentHead: isDeptHeadSet.has(emp.employeeId),
      hasCircularReference: circularSet.has(emp.employeeId),
    };

    nodesById[emp.employeeId] = node;

    return {
      node,
      children: childBranches,
    };
  }

  const rootEmployees = combinedEmployees.filter(
    (emp) => !safeManagerMap.get(emp.employeeId)
  );

  const rootBranches = rootEmployees.map((rootEmp) =>
    buildSubtree(rootEmp.employeeId, 1, new Set([rootEmp.employeeId]))
  );

  const allNodes = combinedEmployees
    .map((e) => nodesById[e.employeeId])
    .filter(Boolean);

  const maxLevel = allNodes.reduce((max, n) => Math.max(max, n.level), 0);
  const managerNodes = allNodes.filter((n) => n.directReportsCount > 0);
  const employeesWithoutManager = allNodes.filter((n) => n.managerId === null).length;

  const vacantPositions = requisitions
    .filter((r) => uniqueWorkforceDepts.includes(r.department))
    .reduce((sum, r) => sum + (Number(r.openings) || 0), 0);

  const departmentMetrics: DepartmentSpanMetric[] = uniqueWorkforceDepts.map(
    (deptName, idx) => {
      const deptNodes = allNodes.filter((n) => n.department === deptName);
      const headEmpId = resolvedDeptHeadIdByDept.get(deptName) || null;
      const headNode = headEmpId ? nodesById[headEmpId] : deptNodes[0];
      const avgAtt =
        deptNodes.length > 0
          ? Number(
              (
                deptNodes.reduce((acc, n) => acc + n.attendanceRate, 0) /
                deptNodes.length
              ).toFixed(1)
            )
          : 0;
      const deptOpenings = requisitions
        .filter((r) => r.department === deptName)
        .reduce((acc, r) => acc + (Number(r.openings) || 0), 0);

      return {
        departmentId: `DEPT-${String(idx + 1).padStart(2, '0')}`,
        department: deptName,
        headOfDept: headNode ? headNode.name : 'Unassigned',
        headEmployeeId: headNode ? headNode.employeeId : null,
        enrolledDirectoryCount: deptNodes.length,
        departmentTotalHeadcount: deptNodes.length,
        attendancePercentage: avgAtt,
        openRequisitionsCount: deptOpenings,
      };
    }
  );

  const managerSpanMetrics: ManagerSpanMetric[] = managerNodes
    .map((m) => ({
      managerEmployeeId: m.employeeId,
      managerName: m.name,
      designation: m.designation,
      department: m.department,
      directReportsCount: m.directReportsCount,
      totalSubtreeCount: m.totalSubtreeCount,
    }))
    .sort((a, b) => b.directReportsCount - a.directReportsCount);

  const averageSpanOfControl =
    managerNodes.length > 0
      ? Number(
          (
            managerNodes.reduce((s, m) => s + m.directReportsCount, 0) /
            managerNodes.length
          ).toFixed(1)
        )
      : 0;

  const locations = Array.from(
    new Set(allNodes.map((n) => n.location.split('·')[0].trim()).filter(Boolean))
  );

  return {
    nodesById,
    allNodes,
    rootBranches,
    analytics: {
      totalDirectoryEmployees: allNodes.length,
      totalActiveWorkforceKpi: allNodes.length,
      totalDepartments: uniqueWorkforceDepts.length,
      totalManagers: managerNodes.length,
      reportingLevels: maxLevel,
      employeesWithoutManager,
      vacantPositions,
      averageSpanOfControl,
      departmentMetrics,
      managerSpanMetrics,
    },
    locations,
    departments: uniqueWorkforceDepts,
    managers: managerNodes.map((m) => ({
      employeeId: m.employeeId,
      name: m.name,
      department: m.department,
    })),
  };
}

/**
 * Returns the upward manager chain from root down to the selected employee's immediate manager.
 */
export function getUpwardReportingChain(
  employeeId: string,
  nodesById: Record<string, OrgEmployeeNode>
): OrgEmployeeNode[] {
  const chain: OrgEmployeeNode[] = [];
  const visited = new Set<string>([employeeId]);
  let current = nodesById[employeeId];

  while (current && current.managerId) {
    if (visited.has(current.managerId)) break;
    visited.add(current.managerId);
    const parent = nodesById[current.managerId];
    if (!parent) break;
    chain.unshift(parent);
    current = parent;
  }

  return chain;
}

/**
 * Returns all employeeIds in the reporting line of a given employee
 * (all upward managers + the employee + all direct reports).
 */
export function getHighlightedReportingLineIds(
  employeeId: string | null,
  nodesById: Record<string, OrgEmployeeNode>
): Set<string> {
  const set = new Set<string>();
  if (!employeeId || !nodesById[employeeId]) return set;

  set.add(employeeId);
  const upward = getUpwardReportingChain(employeeId, nodesById);
  upward.forEach((u) => set.add(u.employeeId));

  const target = nodesById[employeeId];
  target.directReportIds.forEach((cid) => set.add(cid));

  return set;
}

/**
 * Checks whether an OrgEmployeeNode matches the active search and filter criteria.
 */
export function matchesOrgFilter(
  node: OrgEmployeeNode,
  filters: OrgChartFilterState
): boolean {
  const q = filters.search.trim().toLowerCase();
  const matchesSearch =
    q === '' ||
    node.name.toLowerCase().includes(q) ||
    node.employeeId.toLowerCase().includes(q) ||
    node.designation.toLowerCase().includes(q) ||
    node.department.toLowerCase().includes(q) ||
    node.location.toLowerCase().includes(q);

  const matchesDept =
    filters.department === 'All' || node.department === filters.department;

  const matchesManager =
    filters.managerId === 'All' ||
    node.managerId === filters.managerId ||
    node.employeeId === filters.managerId;

  const matchesLocation =
    filters.location === 'All' ||
    node.location.toLowerCase().includes(filters.location.toLowerCase());

  return matchesSearch && matchesDept && matchesManager && matchesLocation;
}
