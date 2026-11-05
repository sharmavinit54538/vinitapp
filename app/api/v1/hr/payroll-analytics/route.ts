import { NextRequest, NextResponse } from 'next/server';
import {
  computePayrollAnalyticsData,
  PayrollFilterState,
  FinancialYearOption,
  PayrollMonthOption,
  PayrollDepartmentOption,
  PayrollLocationOption,
  EmploymentTypeOption,
  DateRangeOption,
  PayrollAnomalyItem,
  ComplianceAlertItem,
  DEFAULT_PAYROLL_FILTERS,
  canManagePayrollActions,
  PayrollRole,
} from '@/lib/payroll-analytics-types';

const globalForPayrollAnalytics = globalThis as unknown as {
  __ofc360PayrollAnomalies?: PayrollAnomalyItem[];
  __ofc360PayrollCompliance?: ComplianceAlertItem[];
};

function getPersistentOverrides() {
  if (!globalForPayrollAnalytics.__ofc360PayrollAnomalies) {
    const initial = computePayrollAnalyticsData(DEFAULT_PAYROLL_FILTERS);
    globalForPayrollAnalytics.__ofc360PayrollAnomalies = initial.anomalies;
    globalForPayrollAnalytics.__ofc360PayrollCompliance = initial.complianceAlerts;
  }
  return {
    anomalies: globalForPayrollAnalytics.__ofc360PayrollAnomalies,
    compliance: globalForPayrollAnalytics.__ofc360PayrollCompliance,
  };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const filters: Partial<PayrollFilterState> = {
    financialYear:
      (searchParams.get('financialYear') as FinancialYearOption) ||
      DEFAULT_PAYROLL_FILTERS.financialYear,
    month:
      (searchParams.get('month') as PayrollMonthOption) ||
      DEFAULT_PAYROLL_FILTERS.month,
    department:
      (searchParams.get('department') as PayrollDepartmentOption) ||
      DEFAULT_PAYROLL_FILTERS.department,
    location:
      (searchParams.get('location') as PayrollLocationOption) ||
      DEFAULT_PAYROLL_FILTERS.location,
    employmentType:
      (searchParams.get('employmentType') as EmploymentTypeOption) ||
      DEFAULT_PAYROLL_FILTERS.employmentType,
    dateRange:
      (searchParams.get('dateRange') as DateRangeOption) ||
      DEFAULT_PAYROLL_FILTERS.dateRange,
  };

  const { anomalies, compliance } = getPersistentOverrides();
  const response = computePayrollAnalyticsData(filters, anomalies, compliance);
  return NextResponse.json(response);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, role = 'hr_admin' } = body as {
      action: string;
      role?: PayrollRole;
      anomalyId?: string;
      status?: 'Open' | 'Investigating' | 'Resolved';
      complianceId?: string;
      filters?: Partial<PayrollFilterState>;
    };

    if (!canManagePayrollActions(role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions: HR Admin, Finance Admin, or Super Admin required.' },
        { status: 403 }
      );
    }

    const { anomalies, compliance } = getPersistentOverrides();

    if (action === 'update_anomaly' && body.anomalyId && body.status) {
      globalForPayrollAnalytics.__ofc360PayrollAnomalies = anomalies.map((item) =>
        item.id === body.anomalyId ? { ...item, status: body.status } : item
      );
    } else if (action === 'file_compliance' && body.complianceId) {
      globalForPayrollAnalytics.__ofc360PayrollCompliance = compliance?.map((c) =>
        c.id === body.complianceId ? { ...c, status: 'Paid & Filed' } : c
      );
    }

    const updated = computePayrollAnalyticsData(
      body.filters || DEFAULT_PAYROLL_FILTERS,
      globalForPayrollAnalytics.__ofc360PayrollAnomalies,
      globalForPayrollAnalytics.__ofc360PayrollCompliance
    );

    return NextResponse.json(updated);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to process payroll action' },
      { status: 400 }
    );
  }
}
