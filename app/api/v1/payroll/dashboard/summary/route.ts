import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const financialYear = searchParams.get('financialYear') || '2026-27';
  const cycleId = searchParams.get('cycleId') || 'CYCLE-2026-11';

  return NextResponse.json({
    kpis: {
      currentCycleId: cycleId,
      currentCycleLabel: 'Nov 2026',
      cycleStatus: 'In Progress',
      payDate: '2026-11-30',
      cutoffDate: '2026-11-25',
      currencyCode: 'INR',
      grossPay: 2840000,
      netPay: 2485600,
      totalDeductions: 354400,
      employerContributions: 211000,
      totalPayrollCost: 3051000,
      processedHeadcount: 48,
      pendingHoldCount: 0,
      variancePercentVsLastMonth: 2.4,
    },
    monthlyTrend: [
      { cycleLabel: 'Jun 2026', grossPay: 2710000, netPay: 2370000, statutoryDeductions: 198000, employerCost: 202000, headcount: 45 },
      { cycleLabel: 'Jul 2026', grossPay: 2750000, netPay: 2410000, statutoryDeductions: 202000, employerCost: 205000, headcount: 46 },
      { cycleLabel: 'Aug 2026', grossPay: 2790000, netPay: 2440000, statutoryDeductions: 205000, employerCost: 207000, headcount: 47 },
      { cycleLabel: 'Sep 2026', grossPay: 2810000, netPay: 2460000, statutoryDeductions: 208000, employerCost: 209000, headcount: 47 },
      { cycleLabel: 'Oct 2026', grossPay: 2825000, netPay: 2470000, statutoryDeductions: 209500, employerCost: 210000, headcount: 48 },
      { cycleLabel: 'Nov 2026', grossPay: 2840000, netPay: 2485600, statutoryDeductions: 211000, employerCost: 211000, headcount: 48 },
    ],
    departmentCostBreakdown: [
      { department: 'Engineering', costCenterCode: 'CC-ENG', headcount: 22, grossAmount: 1420000, netAmount: 1242800, sharePercentage: 50 },
      { department: 'Product & Design', costCenterCode: 'CC-PRD', headcount: 9, grossAmount: 568000, netAmount: 497120, sharePercentage: 20 },
      { department: 'People Operations', costCenterCode: 'CC-HR', headcount: 8, grossAmount: 426000, netAmount: 372840, sharePercentage: 15 },
      { department: 'Sales & Marketing', costCenterCode: 'CC-MKT', headcount: 9, grossAmount: 426000, netAmount: 372840, sharePercentage: 15 },
    ],
    statutoryDues: [
      { id: 'due-1', statutoryType: 'PF', title: 'Provident Fund (EPF)', dueDate: '2026-12-15', amountDue: 182400, status: 'Upcoming' },
      { id: 'due-2', statutoryType: 'ESI', title: 'Employee State Insurance (ESIC)', dueDate: '2026-12-15', amountDue: 28600, status: 'Upcoming' },
      { id: 'due-3', statutoryType: 'TDS', title: 'Tax Deducted at Source (TDS)', dueDate: '2026-12-07', amountDue: 143400, status: 'Upcoming' },
      { id: 'due-4', statutoryType: 'PT', title: 'Professional Tax (PT)', dueDate: '2026-12-10', amountDue: 9600, status: 'Upcoming' },
    ],
    exceptions: [
      {
        id: 'exc-1',
        severity: 'info',
        category: 'High Variance',
        employeeId: 'EMP-001',
        employeeName: 'Aarav Sharma',
        message: 'Annual performance bonus included in current payroll run.',
        detectedAt: '2026-11-10T10:30:00Z',
      },
    ],
    pendingApprovalsCount: 2,
    financialYear,
  });
}
