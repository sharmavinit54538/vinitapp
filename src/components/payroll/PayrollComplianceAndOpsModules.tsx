'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Download,
  Upload,
  CheckCircle2,
  XCircle,
  Send,
  FileText,
  Landmark,
  ShieldCheck,
  UserMinus,
  Users,
} from 'lucide-react';
import {
  loansAdvancesService,
  statutoryComplianceService,
  taxDeclarationsService,
  payrollApprovalsService,
  payslipsService,
  bankDisbursementService,
  fnfSettlementService,
  formatPayrollCurrency,
  formatPayrollDate,
  PayrollApiError,
} from '../../services/payroll';
import {
  LoanTypeConfig,
  LoanAccountRecord,
  LoanEmiScheduleItem,
  StatutoryComplianceOverview,
  Form16EmployeeStatus,
  TaxDeclarationRecord,
  PayrollApprovalRequest,
  PayslipRecord,
  PayslipDetailedView,
  PayslipTemplateConfig,
  DisbursementEmployeeRecord,
  BankReconciliationSummary,
  FnfSettlementRecord,
  PaginatedResponse,
} from '../../types/payroll';
import { usePayrollPermission } from '../../hooks/usePayrollPermission';
import {
  PayrollLoadingSkeleton,
  PayrollEmptyState,
  PayrollErrorState,
  PayrollPermissionDenied,
} from './PayrollPrimitives';

function triggerBrowserBlobDownload(blob: Blob, filename: string) {
  if (typeof URL === 'undefined' || typeof document === 'undefined') return;
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = objectUrl;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(objectUrl);
}

// ============================================================================
// MODULE 7: LOANS & ADVANCES
// ============================================================================
export function LoansAdvancesModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [loanTypes, setLoanTypes] = useState<LoanTypeConfig[]>([]);
  const [loansPage, setLoansPage] = useState<PaginatedResponse<LoanAccountRecord> | null>(null);
  const [emiSchedule, setEmiSchedule] = useState<LoanEmiScheduleItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [loanForm, setLoanForm] = useState({
    employeeId: '',
    loanTypeId: '',
    principalAmount: 100000,
    tenureMonths: 12,
    deductionStartCycle: '',
    reason: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadLoans = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const [types, loans] = await Promise.all([
        loansAdvancesService.getLoanTypes({ signal }),
        loansAdvancesService.getLoans({ page: 1, pageSize: 25 }, { signal }),
      ]);
      setLoanTypes(types);
      setLoansPage(loans);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load loans and salary advances',
        status: err instanceof PayrollApiError ? err.statusCode : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('loans-advances')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadLoans(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadLoans, perms]);

  if (!perms.canAccessModule('loans-advances')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Loans & Advances"
        requiredPermission="payroll.loans.view"
        currentRole={perms.role}
      />
    );
  }

  const handleCreateLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await loansAdvancesService.createLoanRequest(loanForm);
      setShowRequestModal(false);
      onToast('Loan / advance request submitted for approval');
      loadLoans();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Loan request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Employee Loans, Salary Advances & EMI Recovery
          </h2>
          <p className="text-xs text-slate-500">
            Zero/flat/reducing-balance interest schemes, automated EMI payroll deductions, and pre-closure settlements
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowRequestModal(true)}
          className="h-11 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Loan / Advance Request</span>
        </button>
      </div>

      {loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="Loans & Advances API Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadLoans()}
          primaryActionLabel="New Loan / Advance Request"
          onPrimaryAction={() => setShowRequestModal(true)}
        />
      ) : !loansPage || loansPage.items.length === 0 ? (
        <PayrollEmptyState
          title="No Active Loans or Advances"
          description="Submit a loan or festival advance request to generate backend EMI recovery schedules."
          ctaLabel="New Loan / Advance Request"
          onAction={() => setShowRequestModal(true)}
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 px-2">Loan # & Employee</th>
                <th className="py-3 px-2">Scheme</th>
                <th className="py-3 px-2 text-right">Principal</th>
                <th className="py-3 px-2 text-right">Monthly EMI</th>
                <th className="py-3 px-2 text-right">Remaining Balance</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Schedule</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {loansPage.items.map((ln) => (
                <tr key={ln.id}>
                  <td className="py-3 px-2 font-bold">{ln.loanNumber} · {ln.employeeName}</td>
                  <td className="py-3 px-2">{ln.loanTypeName} ({ln.interestRatePercent}%)</td>
                  <td className="py-3 px-2 text-right font-mono">{formatPayrollCurrency(ln.principalAmount)}</td>
                  <td className="py-3 px-2 text-right font-mono">{formatPayrollCurrency(ln.monthlyEmiAmount)}</td>
                  <td className="py-3 px-2 text-right font-mono font-bold">
                    {formatPayrollCurrency(ln.remainingBalance)}
                  </td>
                  <td className="py-3 px-2">{ln.status}</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const sched = await loansAdvancesService.getEmiSchedule(ln.id);
                          setEmiSchedule(sched);
                        } catch (err) {
                          onToast(err instanceof Error ? err.message : 'Could not fetch EMI schedule');
                        }
                      }}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      EMI Schedule
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {emiSchedule ? (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
          <div className="flex justify-between">
            <h4 className="font-bold">EMI Repayment Schedule (Computed by Backend)</h4>
            <button type="button" onClick={() => setEmiSchedule(null)} className="text-slate-500">
              Close
            </button>
          </div>
          {emiSchedule.map((item) => (
            <div key={item.installmentNumber} className="flex justify-between py-1.5 border-b border-slate-100 dark:border-slate-800 font-mono">
              <span>#{item.installmentNumber} · {item.cycleName}</span>
              <span>EMI: {formatPayrollCurrency(item.totalEmi)} · Closing: {formatPayrollCurrency(item.closingBalance)} ({item.deductionStatus})</span>
            </div>
          ))}
        </div>
      ) : null}

      {showRequestModal ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleCreateLoan}
            className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Submit Loan / Salary Advance Request
            </h3>
            <div className="space-y-3">
              <input
                type="text"
                required
                value={loanForm.employeeId}
                onChange={(e) => setLoanForm({ ...loanForm, employeeId: e.target.value })}
                placeholder="Employee ID"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                required
                value={loanForm.loanTypeId}
                onChange={(e) => setLoanForm({ ...loanForm, loanTypeId: e.target.value })}
                placeholder={loanTypes.length ? `Loan Type (${loanTypes[0].code})` : 'Loan Type Code (e.g. SAL_ADV)'}
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  required
                  value={loanForm.principalAmount}
                  onChange={(e) =>
                    setLoanForm({ ...loanForm, principalAmount: Number(e.target.value) })
                  }
                  placeholder="Principal Amount"
                  className="h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
                <input
                  type="number"
                  required
                  min={1}
                  max={60}
                  value={loanForm.tenureMonths}
                  onChange={(e) =>
                    setLoanForm({ ...loanForm, tenureMonths: Number(e.target.value) })
                  }
                  placeholder="Tenure (Months)"
                  className="h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <input
                type="text"
                required
                value={loanForm.deductionStartCycle}
                onChange={(e) =>
                  setLoanForm({ ...loanForm, deductionStartCycle: e.target.value })
                }
                placeholder="Deduction Start Cycle (e.g. DEC-2026)"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="text"
                required
                value={loanForm.reason}
                onChange={(e) => setLoanForm({ ...loanForm, reason: e.target.value })}
                placeholder="Reason for Loan / Advance"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRequestModal(false)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-semibold"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================================
// MODULE 8: STATUTORY COMPLIANCE (PF, ESI, PT, LWF, TDS, FORM 16)
// ============================================================================
export function StatutoryComplianceModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [overview, setOverview] = useState<StatutoryComplianceOverview | null>(null);
  const [form16Page, setForm16Page] = useState<PaginatedResponse<Form16EmployeeStatus> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [showRegModal, setShowRegModal] = useState(false);
  const [regForm, setRegForm] = useState({
    epfoEstablishmentId: '',
    epfoSignatoryName: '',
    pfEmployerRatePercent: 12,
    pfEmployeeRatePercent: 12,
    pfWageCeiling: 15000,
    esicCode: '',
    esiEmployerRatePercent: 3.25,
    esiEmployeeRatePercent: 0.75,
    esiWageCeiling: 21000,
    tanNumber: '',
    panNumber: '',
    deductorCategory: 'Company',
    ptRegisteredStates: ['Karnataka', 'Maharashtra', 'Telangana'],
    lwfApplicableStates: ['Karnataka', 'Maharashtra'],
  });

  const loadStatutory = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const [ov, f16] = await Promise.all([
        statutoryComplianceService.getOverview({ financialYear: '2026-27' }, { signal }),
        statutoryComplianceService.getForm16Statuses({ page: 1, pageSize: 25 }, { signal }),
      ]);
      setOverview(ov);
      setForm16Page(f16);
      if (ov.registrations) {
        setRegForm(ov.registrations);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load statutory compliance filings',
        status: err instanceof PayrollApiError ? err.statusCode : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('statutory')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadStatutory(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadStatutory, perms]);

  if (!perms.canAccessModule('statutory')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Statutory Compliance"
        requiredPermission="payroll.statutory.view"
        currentRole={perms.role}
      />
    );
  }

  const handleBulkForm16Download = async () => {
    try {
      const blob = await statutoryComplianceService.bulkDownloadForm16({
        financialYear: '2026-27',
        part: 'Combined',
      });
      triggerBrowserBlobDownload(blob, 'Form16_FY2026_27_Combined.zip');
      onToast('Form 16 Part A & B archive downloaded');
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Form 16 bulk download failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Statutory Compliance: PF, ESI, PT, LWF, TDS & Form 16
          </h2>
          <p className="text-xs text-slate-500">
            ECR returns, ESIC challans, state-wise PT slabs, Form 24Q quarterly returns, and Form 16 Part A/B
          </p>
        </div>
        <div className="flex items-center gap-2">
          {perms.canManageStatutory ? (
            <>
              <button
                type="button"
                onClick={handleBulkForm16Download}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Bulk Download Form 16</span>
              </button>
              <button
                type="button"
                onClick={() => setShowRegModal(true)}
                className="h-11 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Statutory Registrations</span>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="Statutory Compliance Service Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadStatutory()}
          primaryActionLabel={perms.canManageStatutory ? 'Configure Statutory Registrations' : undefined}
          onPrimaryAction={perms.canManageStatutory ? () => setShowRegModal(true) : undefined}
        />
      ) : !overview ? (
        <PayrollEmptyState
          title="No Statutory Filings Generated"
          description="Configure company EPFO, ESIC, TAN, and PT state registrations to generate statutory returns."
          ctaLabel="Configure Statutory Registrations"
          onAction={() => setShowRegModal(true)}
          canAction={perms.canManageStatutory}
        />
      ) : (
        <div className="space-y-4">
          <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
            <h3 className="text-sm font-bold mb-3">Challans, ECR & Quarterly Returns (24Q)</h3>
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                  <th className="py-3 px-2">Type & Cycle</th>
                  <th className="py-3 px-2">State / Jurisdiction</th>
                  <th className="py-3 px-2 text-right">Employee Share</th>
                  <th className="py-3 px-2 text-right">Employer Share</th>
                  <th className="py-3 px-2 text-right">Total Remittance</th>
                  <th className="py-3 px-2 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {overview.filings.map((f) => (
                  <tr key={f.id}>
                    <td className="py-3 px-2 font-bold">{f.statutoryType} · {f.cycleName}</td>
                    <td className="py-3 px-2">{f.stateOrJurisdiction}</td>
                    <td className="py-3 px-2 text-right font-mono">{formatPayrollCurrency(f.employeeContribution)}</td>
                    <td className="py-3 px-2 text-right font-mono">{formatPayrollCurrency(f.employerContribution)}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold">{formatPayrollCurrency(f.totalRemittance)}</td>
                    <td className="py-3 px-2 text-right">
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const blob = await statutoryComplianceService.downloadFilingChallan(f.id);
                            triggerBrowserBlobDownload(blob, `${f.statutoryType}_${f.cycleName}.${f.returnFormat === 'ECR Text' ? 'txt' : 'pdf'}`);
                            onToast(`Downloaded ${f.returnFormat}`);
                          } catch (err) {
                            onToast(err instanceof Error ? err.message : 'Download failed');
                          }
                        }}
                        className="text-indigo-600 font-semibold hover:underline"
                      >
                        {f.returnFormat}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {form16Page && form16Page.items.length > 0 ? (
            <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <h3 className="text-sm font-bold mb-3">Form 16 Part A & B Status</h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {form16Page.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between">
                    <span>{item.employeeName} ({item.panMasked})</span>
                    <span className="font-mono">
                      TDS: {formatPayrollCurrency(item.totalTdsDeducted)} · Part A: {item.partAStatus} · Part B: {item.partBStatus}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}

      {showRegModal ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await statutoryComplianceService.updateRegistrations(regForm);
                setShowRegModal(false);
                onToast('Company statutory registrations saved');
                loadStatutory();
              } catch (err) {
                onToast(err instanceof Error ? err.message : 'Failed to save registrations');
              }
            }}
            className="w-full max-w-lg rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold">Company Statutory Registrations</h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold mb-1">EPFO Establishment ID</label>
                <input
                  type="text"
                  required
                  value={regForm.epfoEstablishmentId}
                  onChange={(e) =>
                    setRegForm({ ...regForm, epfoEstablishmentId: e.target.value })
                  }
                  placeholder="PYKRP0012345000"
                  className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">ESIC Employer Code</label>
                <input
                  type="text"
                  required
                  value={regForm.esicCode}
                  onChange={(e) => setRegForm({ ...regForm, esicCode: e.target.value })}
                  placeholder="53000123450001001"
                  className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">TAN Number</label>
                <input
                  type="text"
                  required
                  value={regForm.tanNumber}
                  onChange={(e) => setRegForm({ ...regForm, tanNumber: e.target.value.toUpperCase() })}
                  placeholder="BLRO12345F"
                  className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Corporate PAN</label>
                <input
                  type="text"
                  required
                  value={regForm.panNumber}
                  onChange={(e) => setRegForm({ ...regForm, panNumber: e.target.value.toUpperCase() })}
                  placeholder="AABCO3600F"
                  className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRegModal(false)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-semibold"
              >
                Save Registrations
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================================
// MODULE 9: TAX DECLARATIONS & INVESTMENT PROOFS
// ============================================================================
export function TaxDeclarationsModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [declarations, setDeclarations] = useState<PaginatedResponse<TaxDeclarationRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [showWindowModal, setShowWindowModal] = useState(false);
  const [windowForm, setWindowForm] = useState({
    financialYear: '2026-27',
    declarationWindowOpen: true,
    declarationDeadline: '2026-05-31',
    proofSubmissionWindowOpen: true,
    proofSubmissionDeadline: '2027-01-20',
    allowRegimeSwitch: true,
  });

  const loadTaxDeclarations = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await taxDeclarationsService.getDeclarations(
        { page: 1, pageSize: 25, financialYear: '2026-27' },
        { signal }
      );
      setDeclarations(res);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load tax declarations & proof queue',
        status: err instanceof PayrollApiError ? err.statusCode : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('tax-declarations')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadTaxDeclarations(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadTaxDeclarations, perms]);

  if (!perms.canAccessModule('tax-declarations')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Tax Declarations & Investment Proofs"
        requiredPermission="payroll.tax.view"
        currentRole={perms.role}
      />
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Tax Declarations (80C, 80D, HRA, Sec 24) & Proof Verification Queue
          </h2>
          <p className="text-xs text-slate-500">
            Old vs New Tax Regime comparison, investment proof verification, and declaration cutoff windows
          </p>
        </div>
        {perms.canVerifyTax ? (
          <button
            type="button"
            onClick={() => setShowWindowModal(true)}
            className="h-11 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold"
          >
            Declaration & Proof Window Settings
          </button>
        ) : null}
      </div>

      {loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="Tax Declarations API Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadTaxDeclarations()}
          primaryActionLabel={perms.canVerifyTax ? 'Configure Declaration Window' : undefined}
          onPrimaryAction={perms.canVerifyTax ? () => setShowWindowModal(true) : undefined}
        />
      ) : !declarations || declarations.items.length === 0 ? (
        <PayrollEmptyState
          title="No Employee Tax Declarations Submitted"
          description="Open the IT declaration window for the financial year so employees can select their tax regime and upload 80C/80D/HRA proofs."
          ctaLabel="Configure Declaration Window"
          onAction={() => setShowWindowModal(true)}
          canAction={perms.canVerifyTax}
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 px-2">Employee</th>
                <th className="py-3 px-2">Regime</th>
                <th className="py-3 px-2 text-right">Declared / Verified</th>
                <th className="py-3 px-2 text-right">Projected Tax (New / Old)</th>
                <th className="py-3 px-2 text-right">Monthly TDS</th>
                <th className="py-3 px-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {declarations.items.map((d) => (
                <tr key={d.id}>
                  <td className="py-3 px-2 font-bold">{d.employeeName} ({d.employeeCode})</td>
                  <td className="py-3 px-2">{d.selectedRegime}</td>
                  <td className="py-3 px-2 text-right font-mono">
                    {formatPayrollCurrency(d.totalDeclaredInvestments)} / {formatPayrollCurrency(d.totalVerifiedInvestments)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono">
                    {formatPayrollCurrency(d.projectedAnnualTaxNewRegime)} / {formatPayrollCurrency(d.projectedAnnualTaxOldRegime)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold">
                    {formatPayrollCurrency(d.monthlyTdsDeduction)}
                  </td>
                  <td className="py-3 px-2">{d.overallStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showWindowModal ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await taxDeclarationsService.configureTaxWindow(windowForm);
                setShowWindowModal(false);
                onToast('Tax declaration & proof submission window updated');
              } catch (err) {
                onToast(err instanceof Error ? err.message : 'Failed to update tax window');
              }
            }}
            className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold">Tax Declaration & Proof Submission Windows</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="font-semibold">IT Declaration Window Open</span>
                <input
                  type="checkbox"
                  checked={windowForm.declarationWindowOpen}
                  onChange={(e) =>
                    setWindowForm({ ...windowForm, declarationWindowOpen: e.target.checked })
                  }
                />
              </label>
              <div>
                <label className="block font-semibold mb-1">Declaration Cutoff Date</label>
                <input
                  type="date"
                  value={windowForm.declarationDeadline}
                  onChange={(e) =>
                    setWindowForm({ ...windowForm, declarationDeadline: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <label className="flex items-center justify-between">
                <span className="font-semibold">Investment Proof Window Open</span>
                <input
                  type="checkbox"
                  checked={windowForm.proofSubmissionWindowOpen}
                  onChange={(e) =>
                    setWindowForm({ ...windowForm, proofSubmissionWindowOpen: e.target.checked })
                  }
                />
              </label>
              <div>
                <label className="block font-semibold mb-1">Proof Submission Deadline</label>
                <input
                  type="date"
                  value={windowForm.proofSubmissionDeadline}
                  onChange={(e) =>
                    setWindowForm({ ...windowForm, proofSubmissionDeadline: e.target.value })
                  }
                  className="w-full h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowWindowModal(false)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-semibold"
              >
                Save Window Settings
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================================
// MODULE 10: APPROVALS WORKFLOW
// ============================================================================
export function PayrollApprovalsModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [approvalsPage, setApprovalsPage] = useState<PaginatedResponse<PayrollApprovalRequest> | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [showDelegateModal, setShowDelegateModal] = useState(false);
  const [delegateForm, setDelegateForm] = useState({
    delegateToUserId: '',
    validFrom: '',
    validUntil: '',
    reason: '',
  });

  const loadApprovals = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await payrollApprovalsService.getApprovals(
        { page: 1, pageSize: 25 },
        { signal }
      );
      setApprovalsPage(res);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load multi-level payroll approvals',
        status: err instanceof PayrollApiError ? err.statusCode : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('approvals')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadApprovals(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadApprovals, perms]);

  if (!perms.canAccessModule('approvals')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Approvals Workflow"
        requiredPermission="payroll.approvals.view"
        currentRole={perms.role}
      />
    );
  }

  const handleBulkDecision = async (decision: 'Approved' | 'Rejected') => {
    if (selectedIds.length === 0) return;
    try {
      await payrollApprovalsService.bulkDecide({
        ids: selectedIds,
        decision,
        comments: `Bulk ${decision.toLowerCase()} by ${perms.role}`,
      });
      setSelectedIds([]);
      onToast(`Bulk ${decision.toLowerCase()} ${selectedIds.length} requests`);
      loadApprovals();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Bulk decision failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Multi-Level Payroll Approvals & Delegation
          </h2>
          <p className="text-xs text-slate-500">
            Payroll run sign-off, salary revisions, loans, reimbursements, off-cycle payouts, F&F, and salary holds
          </p>
        </div>
        {perms.canActOnApprovals ? (
          <div className="flex items-center gap-2">
            {selectedIds.length > 0 ? (
              <>
                <button
                  type="button"
                  onClick={() => handleBulkDecision('Approved')}
                  className="h-11 px-4 rounded-2xl bg-emerald-600 text-white text-xs font-semibold"
                >
                  Bulk Approve ({selectedIds.length})
                </button>
                <button
                  type="button"
                  onClick={() => handleBulkDecision('Rejected')}
                  className="h-11 px-4 rounded-2xl bg-rose-600 text-white text-xs font-semibold"
                >
                  Bulk Reject
                </button>
              </>
            ) : null}
            <button
              type="button"
              onClick={() => setShowDelegateModal(true)}
              className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Delegate Approvals</span>
            </button>
          </div>
        ) : null}
      </div>

      {loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="Payroll Approvals API Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadApprovals()}
          primaryActionLabel={perms.canActOnApprovals ? 'Configure Approval Delegation' : undefined}
          onPrimaryAction={perms.canActOnApprovals ? () => setShowDelegateModal(true) : undefined}
        />
      ) : !approvalsPage || approvalsPage.items.length === 0 ? (
        <PayrollEmptyState
          title="All Payroll Approvals Cleared"
          description="No pending multi-level approval items in your queue."
          ctaLabel="Delegate Approval Authority"
          onAction={() => setShowDelegateModal(true)}
          canAction={perms.canActOnApprovals}
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3">
          {approvalsPage.items.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(item.id)}
                  onChange={(e) =>
                    setSelectedIds((prev) =>
                      e.target.checked ? [...prev, item.id] : prev.filter((x) => x !== item.id)
                    )
                  }
                  aria-label={`Select ${item.referenceCode}`}
                />
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {item.entityType} · {item.subjectTitle} ({item.referenceCode})
                  </div>
                  <div className="text-slate-500">
                    Level {item.currentLevel}/{item.totalLevels} · Impact:{' '}
                    <span className="font-mono font-bold">
                      {formatPayrollCurrency(item.financialImpactAmount, item.currencyCode)}
                    </span>
                  </div>
                </div>
              </div>
              {perms.canActOnApprovals && item.status === 'Pending' ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await payrollApprovalsService.decideApproval(item.id, {
                          decision: 'Approved',
                          comments: 'Approved',
                        });
                        onToast(`Approved ${item.referenceCode}`);
                        loadApprovals();
                      } catch (err) {
                        onToast(err instanceof Error ? err.message : 'Approval failed');
                      }
                    }}
                    className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white font-semibold inline-flex items-center gap-1"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve</span>
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await payrollApprovalsService.decideApproval(item.id, {
                          decision: 'Rejected',
                          comments: 'Rejected',
                        });
                        onToast(`Rejected ${item.referenceCode}`);
                        loadApprovals();
                      } catch (err) {
                        onToast(err instanceof Error ? err.message : 'Rejection failed');
                      }
                    }}
                    className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-slate-700 font-semibold inline-flex items-center gap-1"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      {showDelegateModal ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await payrollApprovalsService.delegateApprovals(delegateForm);
                setShowDelegateModal(false);
                onToast('Approval authority delegated');
              } catch (err) {
                onToast(err instanceof Error ? err.message : 'Delegation failed');
              }
            }}
            className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold">Delegate Payroll Approval Authority</h3>
            <div className="space-y-3">
              <input
                type="text"
                required
                value={delegateForm.delegateToUserId}
                onChange={(e) =>
                  setDelegateForm({ ...delegateForm, delegateToUserId: e.target.value })
                }
                placeholder="Delegate User / Employee ID"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  required
                  value={delegateForm.validFrom}
                  onChange={(e) => setDelegateForm({ ...delegateForm, validFrom: e.target.value })}
                  className="h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
                <input
                  type="date"
                  required
                  value={delegateForm.validUntil}
                  onChange={(e) => setDelegateForm({ ...delegateForm, validUntil: e.target.value })}
                  className="h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>
              <input
                type="text"
                required
                value={delegateForm.reason}
                onChange={(e) => setDelegateForm({ ...delegateForm, reason: e.target.value })}
                placeholder="Delegation reason"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowDelegateModal(false)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-semibold"
              >
                Save Delegation
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================================
// MODULE 11: PAYSLIPS
// ============================================================================
export function PayslipsModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [payslipsPage, setPayslipsPage] = useState<PaginatedResponse<PayslipRecord> | null>(null);
  const [templates, setTemplates] = useState<PayslipTemplateConfig[]>([]);
  const [detailView, setDetailView] = useState<PayslipDetailedView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [passwordProtected, setPasswordProtected] = useState(true);

  const loadPayslips = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const [slips, tmpls] = await Promise.all([
        payslipsService.getPayslips({ page: 1, pageSize: 25 }, { signal }),
        perms.canManagePayslips
          ? payslipsService.getTemplates({ signal })
          : Promise.resolve([]),
      ]);
      setPayslipsPage(slips);
      setTemplates(tmpls);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load payslip registry',
        status: err instanceof PayrollApiError ? err.statusCode : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, [perms.canManagePayslips]);

  useEffect(() => {
    if (!perms.canAccessModule('payslips')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadPayslips(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadPayslips, perms]);

  if (!perms.canAccessModule('payslips')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Payslips Management"
        requiredPermission="payroll.payslips.view"
        currentRole={perms.role}
      />
    );
  }

  const handleBulkGenerate = async () => {
    try {
      const res = await payslipsService.bulkGeneratePayslips('CURRENT');
      onToast(`Bulk payslip generation queued (${res.count} employees)`);
      loadPayslips();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Bulk payslip generation failed');
    }
  };

  const handlePublish = async (publish: boolean) => {
    try {
      const res = await payslipsService.publishPayslips({
        cycleId: 'CURRENT',
        publish,
        channels: ['email', 'whatsapp'],
      });
      onToast(`${publish ? 'Published' : 'Unpublished'} ${res.updatedCount} payslips`);
      loadPayslips();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Payslip publish action failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Payslips Generation, Distribution & Templates
          </h2>
          <p className="text-xs text-slate-500">
            Password-protected PDFs, Email & WhatsApp dispatch status, bulk generation, and template layouts
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <label className="inline-flex items-center gap-1.5 text-xs font-semibold mr-2">
            <input
              type="checkbox"
              checked={passwordProtected}
              onChange={(e) => setPasswordProtected(e.target.checked)}
            />
            <span>Password-Protect PDF</span>
          </label>
          {perms.canManagePayslips ? (
            <>
              <button
                type="button"
                onClick={handleBulkGenerate}
                className="h-11 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Bulk Generate</span>
              </button>
              <button
                type="button"
                onClick={() => handlePublish(true)}
                className="h-11 px-4 rounded-2xl bg-slate-900 text-white text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish & Dispatch</span>
              </button>
            </>
          ) : null}
        </div>
      </div>

      {templates.length > 0 ? (
        <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
          <span className="font-semibold">
            Active Payslip Template: {templates.find((t) => t.isDefault)?.name || templates[0].name}
          </span>
        </div>
      ) : null}

      {loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="Payslips Service Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadPayslips()}
          primaryActionLabel={perms.canManagePayslips ? 'Bulk Generate Payslips' : undefined}
          onPrimaryAction={perms.canManagePayslips ? handleBulkGenerate : undefined}
        />
      ) : !payslipsPage || payslipsPage.items.length === 0 ? (
        <PayrollEmptyState
          title="No Payslips Generated for Cycle"
          description="Trigger bulk payslip generation after statutory calculation and run approval."
          ctaLabel="Bulk Generate Payslips"
          onAction={handleBulkGenerate}
          canAction={perms.canManagePayslips}
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 px-2">Employee & Cycle</th>
                <th className="py-3 px-2 text-right">Gross</th>
                <th className="py-3 px-2 text-right">Deductions</th>
                <th className="py-3 px-2 text-right">Net Pay</th>
                <th className="py-3 px-2">Delivery</th>
                <th className="py-3 px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {payslipsPage.items.map((ps) => (
                <tr key={ps.id}>
                  <td className="py-3 px-2 font-bold">{ps.employeeName} · {ps.cycleName}</td>
                  <td className="py-3 px-2 text-right font-mono">{formatPayrollCurrency(ps.grossEarnings, ps.currencyCode)}</td>
                  <td className="py-3 px-2 text-right font-mono">{formatPayrollCurrency(ps.totalDeductions, ps.currencyCode)}</td>
                  <td className="py-3 px-2 text-right font-mono font-bold">{formatPayrollCurrency(ps.netPay, ps.currencyCode)}</td>
                  <td className="py-3 px-2">
                    Email: {ps.emailDeliveryStatus} · WA: {ps.whatsappDeliveryStatus}
                  </td>
                  <td className="py-3 px-2 text-right space-x-2">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const d = await payslipsService.getPayslipDetail(ps.id);
                          setDetailView(d);
                        } catch (err) {
                          onToast(err instanceof Error ? err.message : 'Failed to load payslip view');
                        }
                      }}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      View
                    </button>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const blob = await payslipsService.downloadPayslipPdf(ps.id, passwordProtected);
                          triggerBrowserBlobDownload(blob, `Payslip_${ps.employeeCode}_${ps.cycleName}.pdf`);
                        } catch (err) {
                          onToast(err instanceof Error ? err.message : 'PDF download failed');
                        }
                      }}
                      className="text-emerald-600 font-semibold hover:underline"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {detailView ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="w-full max-w-lg rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold">
                Payslip: {detailView.employeeName} ({detailView.cycleName})
              </h3>
              <button type="button" onClick={() => setDetailView(null)} className="text-slate-500">
                Close
              </button>
            </div>
            <div className="font-mono font-bold text-sm text-indigo-600">
              Net Pay: {formatPayrollCurrency(detailView.netPay, detailView.currencyCode)} ({detailView.netPayInWords})
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================================
// MODULE 12: BANK ADVICE & DISBURSEMENT
// ============================================================================
export function BankDisbursementModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [disbPage, setDisbPage] = useState<PaginatedResponse<DisbursementEmployeeRecord> | null>(null);
  const [reconSummary, setReconSummary] = useState<BankReconciliationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [bankFormat, setBankFormat] = useState<'HDFC Corporate' | 'ICICI CIB' | 'SBI CMP' | 'Axis Corporate' | 'Generic NEFT CSV'>('HDFC Corporate');
  const [paymentMode, setPaymentMode] = useState<'NEFT' | 'RTGS' | 'IMPS'>('NEFT');

  const loadDisbursements = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await bankDisbursementService.getDisbursements(
        { page: 1, pageSize: 25 },
        { signal }
      );
      setDisbPage(res);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load bank advice & disbursement records',
        status: err instanceof PayrollApiError ? err.statusCode : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('bank-disbursement')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadDisbursements(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadDisbursements, perms]);

  if (!perms.canAccessModule('bank-disbursement')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Bank Advice & Disbursement"
        requiredPermission="payroll.disbursement.view"
        currentRole={perms.role}
      />
    );
  }

  const handleGenerateBankFile = async () => {
    try {
      const blob = await bankDisbursementService.generateBankAdviceFile({
        cycleId: 'CURRENT',
        bankFormat,
        paymentMode,
      });
      triggerBrowserBlobDownload(blob, `BankAdvice_${bankFormat.replace(/\s+/g, '_')}_${paymentMode}.csv`);
      onToast(`Generated ${bankFormat} (${paymentMode}) file`);
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Bank advice generation failed');
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Bank Advice Generation, NEFT/RTGS/IMPS & UTR Reconciliation
          </h2>
          <p className="text-xs text-slate-500">
            Generate corporate bank transfer files, upload bank UTR response files, and retry failed payouts
          </p>
        </div>
        {perms.canManageDisbursement ? (
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={bankFormat}
              onChange={(e) => setBankFormat(e.target.value as typeof bankFormat)}
              className="h-11 px-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              <option value="HDFC Corporate">HDFC Corporate</option>
              <option value="ICICI CIB">ICICI CIB</option>
              <option value="SBI CMP">SBI CMP</option>
              <option value="Axis Corporate">Axis Corporate</option>
              <option value="Generic NEFT CSV">Generic NEFT CSV</option>
            </select>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value as typeof paymentMode)}
              className="h-11 px-3 rounded-2xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold"
            >
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="IMPS">IMPS</option>
            </select>
            <button
              type="button"
              onClick={handleGenerateBankFile}
              className="h-11 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <Landmark className="w-3.5 h-3.5" />
              <span>Download Bank File</span>
            </button>
            <label className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Bank UTR Response</span>
              <input
                type="file"
                accept=".csv,.xlsx,.txt"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    const summary = await bankDisbursementService.uploadBankResponseFile(f, 'CURRENT');
                    setReconSummary(summary);
                    onToast(`Reconciled ${summary.creditedCount} credited payments`);
                    loadDisbursements();
                  } catch (err) {
                    onToast(err instanceof Error ? err.message : 'Bank response upload failed');
                  }
                }}
              />
            </label>
          </div>
        ) : null}
      </div>

      {reconSummary ? (
        <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-900 text-xs flex justify-between">
          <span className="font-bold">
            UTR Reconciliation Batch {reconSummary.batchReference}: {reconSummary.creditedCount} Credited · {reconSummary.failedCount} Failed
          </span>
          <span className="font-mono font-bold">{formatPayrollCurrency(reconSummary.totalDisbursedAmount)}</span>
        </div>
      ) : null}

      {loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="Bank Disbursement API Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadDisbursements()}
          primaryActionLabel={perms.canManageDisbursement ? 'Download Bank Advice File' : undefined}
          onPrimaryAction={perms.canManageDisbursement ? handleGenerateBankFile : undefined}
        />
      ) : !disbPage || disbPage.items.length === 0 ? (
        <PayrollEmptyState
          title="No Disbursement Batch Generated"
          description="Generate a NEFT/RTGS/IMPS bank advice file for the approved payroll run."
          ctaLabel="Download Bank Advice File"
          onAction={handleGenerateBankFile}
          canAction={perms.canManageDisbursement}
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 px-2">Employee</th>
                <th className="py-3 px-2">Bank & IFSC</th>
                <th className="py-3 px-2">Mode</th>
                <th className="py-3 px-2 text-right">Net Amount</th>
                <th className="py-3 px-2">Status / UTR</th>
                <th className="py-3 px-2 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {disbPage.items.map((row) => (
                <tr key={row.id}>
                  <td className="py-3 px-2 font-bold">{row.employeeName} ({row.employeeCode})</td>
                  <td className="py-3 px-2 font-mono">{row.bankName} · {row.accountNumberMasked} · {row.ifscCode}</td>
                  <td className="py-3 px-2">{row.paymentMode}</td>
                  <td className="py-3 px-2 text-right font-mono font-bold">{formatPayrollCurrency(row.netPayAmount)}</td>
                  <td className="py-3 px-2">{row.disbursementStatus} {row.utrReferenceNumber ? `(${row.utrReferenceNumber})` : ''}</td>
                  <td className="py-3 px-2 text-right">
                    {row.disbursementStatus === 'Failed' && perms.canManageDisbursement ? (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await bankDisbursementService.retryFailedPayment(row.id, 'IMPS');
                            onToast('Retrying payout via IMPS');
                            loadDisbursements();
                          } catch (err) {
                            onToast(err instanceof Error ? err.message : 'Retry failed');
                          }
                        }}
                        className="text-rose-600 font-semibold hover:underline"
                      >
                        Retry Payout
                      </button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 13: FULL & FINAL SETTLEMENT (F&F)
// ============================================================================
export function FnfSettlementModule({ onToast }: { onToast: (msg: string) => void }) {
  const perms = usePayrollPermission();
  const [fnfPage, setFnfPage] = useState<PaginatedResponse<FnfSettlementRecord> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ message: string; status?: number } | null>(null);
  const [showInitiateModal, setShowInitiateModal] = useState(false);
  const [fnfForm, setFnfForm] = useState({
    employeeId: '',
    lastWorkingDay: '',
    leaveEncashmentDays: 0,
    noticePeriodShortfallDays: 0,
    assetDamageRecoveryAmount: 0,
    remarks: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const loadFnf = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fnfSettlementService.getSettlements(
        { page: 1, pageSize: 25 },
        { signal }
      );
      setFnfPage(res);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError({
        message: err instanceof Error ? err.message : 'Failed to load Full & Final settlements',
        status: err instanceof PayrollApiError ? err.statusCode : undefined,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('fnf-settlement')) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      loadFnf(controller.signal);
    }, 0);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [loadFnf, perms]);

  if (!perms.canAccessModule('fnf-settlement')) {
    return (
      <PayrollPermissionDenied
        moduleTitle="Full & Final Settlement"
        requiredPermission="payroll.fnf.view"
        currentRole={perms.role}
      />
    );
  }

  const handleInitiateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fnfSettlementService.initiateSettlement(fnfForm);
      setShowInitiateModal(false);
      onToast('Full & Final settlement worksheet initiated on backend');
      loadFnf();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'F&F initiation failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            Full & Final Settlement (F&F) Engine
          </h2>
          <p className="text-xs text-slate-500">
            Unpaid salary, leave encashment, gratuity, notice recovery, loan/asset recovery, and F&F statement PDF
          </p>
        </div>
        {perms.canManageFnf ? (
          <button
            type="button"
            onClick={() => setShowInitiateModal(true)}
            className="h-11 px-4 rounded-2xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <UserMinus className="w-3.5 h-3.5" />
            <span>Initiate Exit F&F</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <PayrollLoadingSkeleton rows={4} />
      ) : error ? (
        <PayrollErrorState
          title="F&F Settlement API Error"
          message={error.message}
          statusCode={error.status}
          onRetry={() => loadFnf()}
          primaryActionLabel={perms.canManageFnf ? 'Initiate Exit F&F' : undefined}
          onPrimaryAction={perms.canManageFnf ? () => setShowInitiateModal(true) : undefined}
        />
      ) : !fnfPage || fnfPage.items.length === 0 ? (
        <PayrollEmptyState
          title="No Active F&F Settlements"
          description="Initiate a Full & Final settlement from an employee exit record to compute gratuity, leave encashment, and recoveries."
          ctaLabel="Initiate Exit F&F"
          onAction={() => setShowInitiateModal(true)}
          canAction={perms.canManageFnf}
        />
      ) : (
        <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500">
                <th className="py-3 px-2">Employee & LWD</th>
                <th className="py-3 px-2 text-right">Leave Encashment</th>
                <th className="py-3 px-2 text-right">Gratuity</th>
                <th className="py-3 px-2 text-right">Recoveries</th>
                <th className="py-3 px-2 text-right">Net F&F</th>
                <th className="py-3 px-2">Status</th>
                <th className="py-3 px-2 text-right">Statement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {fnfPage.items.map((fnf) => (
                <tr key={fnf.id}>
                  <td className="py-3 px-2 font-bold">
                    {fnf.employeeName} · LWD {formatPayrollDate(fnf.lastWorkingDay)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono">{formatPayrollCurrency(fnf.leaveEncashmentAmount)}</td>
                  <td className="py-3 px-2 text-right font-mono">{formatPayrollCurrency(fnf.gratuityAmount)}</td>
                  <td className="py-3 px-2 text-right font-mono text-rose-600">
                    {formatPayrollCurrency(fnf.noticeRecoveryAmount + fnf.loanRecoveryAmount + fnf.assetDamageRecoveryAmount)}
                  </td>
                  <td className="py-3 px-2 text-right font-mono font-bold">
                    {formatPayrollCurrency(fnf.netPayableOrRecoverable)}
                  </td>
                  <td className="py-3 px-2">{fnf.clearanceStatus}</td>
                  <td className="py-3 px-2 text-right">
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const blob = await fnfSettlementService.downloadStatementPdf(fnf.id);
                          triggerBrowserBlobDownload(blob, `FnF_${fnf.employeeCode}.pdf`);
                        } catch (err) {
                          onToast(err instanceof Error ? err.message : 'F&F PDF download failed');
                        }
                      }}
                      className="text-indigo-600 font-semibold hover:underline"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showInitiateModal ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleInitiateSubmit}
            className="w-full max-w-md rounded-3xl p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 text-xs"
          >
            <h3 className="text-base font-bold">Initiate Full & Final Settlement</h3>
            <div className="space-y-3">
              <input
                type="text"
                required
                value={fnfForm.employeeId}
                onChange={(e) => setFnfForm({ ...fnfForm, employeeId: e.target.value })}
                placeholder="Exiting Employee ID"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <input
                type="date"
                required
                value={fnfForm.lastWorkingDay}
                onChange={(e) => setFnfForm({ ...fnfForm, lastWorkingDay: e.target.value })}
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min={0}
                  value={fnfForm.leaveEncashmentDays}
                  onChange={(e) =>
                    setFnfForm({ ...fnfForm, leaveEncashmentDays: Number(e.target.value) })
                  }
                  placeholder="Leave Encashment Days"
                  className="h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
                <input
                  type="number"
                  min={0}
                  value={fnfForm.noticePeriodShortfallDays}
                  onChange={(e) =>
                    setFnfForm({ ...fnfForm, noticePeriodShortfallDays: Number(e.target.value) })
                  }
                  placeholder="Notice Shortfall Days"
                  className="h-11 px-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                />
              </div>
              <input
                type="text"
                required
                value={fnfForm.remarks}
                onChange={(e) => setFnfForm({ ...fnfForm, remarks: e.target.value })}
                placeholder="Exit clearance remarks"
                className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowInitiateModal(false)}
                className="h-11 px-4 rounded-2xl border border-slate-200 dark:border-slate-700 font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="h-11 px-5 rounded-2xl bg-indigo-600 text-white font-semibold"
              >
                Compute F&F via Backend
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}
