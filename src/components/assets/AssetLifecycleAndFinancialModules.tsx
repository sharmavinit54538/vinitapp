'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  KeyRound,
  Calculator,
  Truck,
  ScanLine,
  Trash2,
  Boxes,
  MapPin,
  Download,
  Camera,
} from 'lucide-react';
import {
  AssetRole,
  AssetWarrantyRecord,
  SoftwareLicenseRecord,
  AssetDepreciationRecord,
  AssetTransferRecord,
  PhysicalAuditCampaignRecord,
  AssetLossDisposalRecord,
  ConsumableStockRecord,
  AssetLocationCostCenterRecord,
} from '../../types/assets';
import {
  assetWarrantyApi,
  assetSoftwareLicensesApi,
  assetDepreciationApi,
  assetTransferApi,
  assetPhysicalAuditApi,
  assetLossDisposalApi,
  assetConsumablesApi,
  assetLocationsApi,
} from '../../services/assets';
import { useAssetPermission } from '../../hooks/useAssetPermission';
import {
  AssetSkeletonBlock,
  AssetPermissionDeniedState,
  AssetErrorState,
  AssetEmptyState,
  AssetModal,
} from './AssetPrimitives';

export interface AssetLifecycleModuleProps {
  role: AssetRole;
  notify: (msg: string) => void;
}

// 10. Warranty, AMC & Insurance
export function WarrantyAmcInsuranceModule({
  role,
  notify,
}: AssetLifecycleModuleProps) {
  const perm = useAssetPermission('warranty', role);
  const [items, setItems] = useState<AssetWarrantyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renewOpen, setRenewOpen] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [renewedTillDate, setRenewedTillDate] = useState('');
  const [renewalCost, setRenewalCost] = useState(12000);
  const [policyRef, setPolicyRef] = useState('');

  const loadWarranties = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetWarrantyApi.listWarranties();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load Warranty, AMC & Insurance records'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadWarranties();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadWarranties]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Warranty, AMC & Insurance"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Warranty, AMC & Insurance Coverage Tracker
        </h3>
        <p className="text-xs text-slate-500">
          60 / 30 / 7-day auto-expiry alerts, renewal workflow & policy claims
        </p>
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState message={error} onRetry={loadWarranties} />
      ) : items.length === 0 ? (
        <AssetEmptyState
          icon={ShieldAlert}
          title="No Warranty or AMC Records"
          description="Warranty, AMC, and insurance policies linked to registered assets appear here."
          actionLabel="Refresh Coverage"
          onAction={loadWarranties}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((w) => (
            <div
              key={w.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {w.assetTag} ({w.assetName}) · {w.coverageType}
                </p>
                <p className="text-[11px] text-slate-500">
                  Provider: {w.providerName} · Policy: {w.policyOrContractNumber}{' '}
                  · Expires: {w.expiryDate} ({w.daysRemaining}d)
                </p>
              </div>
              {perm.canEdit && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(w.id);
                    setRenewOpen(true);
                  }}
                  className="rounded-lg bg-indigo-600 px-2.5 py-1.5 text-[11px] font-semibold text-white"
                >
                  Renew
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={renewOpen}
        title="Renew Warranty / AMC / Insurance"
        onClose={() => setRenewOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetWarrantyApi.renewCoverage(activeId, {
                renewedTillDate,
                renewalCost,
                policyOrContractRef: policyRef,
              });
              notify('Coverage renewed');
              setRenewOpen(false);
              void loadWarranties();
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Renewal failed');
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold mb-1">
              Renewed Expiry Date
            </label>
            <input
              type="date"
              required
              value={renewedTillDate}
              onChange={(e) => setRenewedTillDate(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Renewal Cost
              </label>
              <input
                type="number"
                required
                value={renewalCost}
                onChange={(e) => setRenewalCost(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Policy / AMC Reference
              </label>
              <input
                required
                value={policyRef}
                onChange={(e) => setPolicyRef(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRenewOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Confirm Renewal
            </button>
          </div>
        </form>
      </AssetModal>
    </div>
  );
}

// 11. Software Licenses
export function SoftwareLicensesModule({
  role,
  notify,
}: AssetLifecycleModuleProps) {
  const perm = useAssetPermission('licenses', role);
  const [licenses, setLicenses] = useState<SoftwareLicenseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [softwareName, setSoftwareName] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [seatsPurchased, setSeatsPurchased] = useState(50);
  const [annualCost, setAnnualCost] = useState(250000);
  const [renewalDate, setRenewalDate] = useState('');

  const loadLicenses = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetSoftwareLicensesApi.listLicenses();
      setLicenses(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load software license inventory'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLicenses();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadLicenses]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Software Licenses"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Software Licenses, Seat Compliance & SSO Integration
          </h3>
          <p className="text-xs text-slate-500">
            Purchased vs assigned seats, unused seat alerts, compliance & SaaS SSO sync
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            + Add License
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadLicenses}
          actionLabel={perm.canCreate ? '+ Add License' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : licenses.length === 0 ? (
        <AssetEmptyState
          icon={KeyRound}
          title="No Software Licenses Registered"
          description="Add SaaS or enterprise software licenses to track seat utilization and renewals."
          actionLabel={perm.canCreate ? 'Add License' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {licenses.map((l) => (
            <div
              key={l.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {l.softwareName} ({l.vendorName})
                </p>
                <p className="text-[11px] text-slate-500">
                  Seats: {l.seatsAssigned}/{l.seatsPurchased} (Unused:{' '}
                  {l.unusedSeats}) · Renewal: {l.renewalDate} · SSO:{' '}
                  {l.ssoIntegrationStatus}
                </p>
              </div>
              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {l.complianceStatus}
              </span>
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={createOpen}
        title="Register Software License Pool"
        onClose={() => setCreateOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetSoftwareLicensesApi.createLicense({
                softwareName,
                vendorName,
                licenseType: 'PerSeatSaaS',
                seatsPurchased,
                annualCost,
                renewalDate,
              });
              notify('Software license pool added');
              setCreateOpen(false);
              void loadLicenses();
            } catch (err) {
              notify(err instanceof Error ? err.message : 'License save failed');
            }
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Software Name
              </label>
              <input
                required
                value={softwareName}
                onChange={(e) => setSoftwareName(e.target.value)}
                placeholder="e.g. GitHub Enterprise / Figma"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Vendor</label>
              <input
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Seats</label>
              <input
                type="number"
                min={1}
                value={seatsPurchased}
                onChange={(e) => setSeatsPurchased(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Annual Cost
              </label>
              <input
                type="number"
                value={annualCost}
                onChange={(e) => setAnnualCost(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Renewal Date
              </label>
              <input
                type="date"
                required
                value={renewalDate}
                onChange={(e) => setRenewalDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Save License
            </button>
          </div>
        </form>
      </AssetModal>
    </div>
  );
}

// 12. Depreciation & Financials
export function DepreciationFinancialsModule({
  role,
  notify,
}: AssetLifecycleModuleProps) {
  const perm = useAssetPermission('depreciation', role);
  const [schedules, setSchedules] = useState<AssetDepreciationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [periodMonth, setPeriodMonth] = useState('2026-11');

  const loadSchedules = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetDepreciationApi.listSchedules({
        period: periodMonth,
      });
      setSchedules(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load fixed asset depreciation schedules'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, periodMonth]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSchedules();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadSchedules]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Depreciation & Financials"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Depreciation Schedules, Book Value & GL Journal Export
          </h3>
          <p className="text-xs text-slate-500">
            SLM / WDV schedules, capitalization date, month-end run & ERP/GL journal entry
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={periodMonth}
            onChange={(e) => setPeriodMonth(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs"
          />
          {perm.canEdit && (
            <button
              type="button"
              onClick={async () => {
                try {
                  const res =
                    await assetDepreciationApi.runMonthEndDepreciation({
                      periodMonth,
                      postToErpGl: true,
                    });
                  notify(
                    `Depreciation run completed (${res.journalBatchCode})`
                  );
                  void loadSchedules();
                } catch (err) {
                  notify(
                    err instanceof Error
                      ? err.message
                      : 'Depreciation run failed'
                  );
                }
              }}
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Run Month-End
            </button>
          )}
          {perm.canExport && (
            <button
              type="button"
              onClick={async () => {
                try {
                  await assetDepreciationApi.exportJournalCsv(periodMonth);
                  notify('Exported GL Journal CSV');
                } catch (err) {
                  notify(err instanceof Error ? err.message : 'Export failed');
                }
              }}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold"
            >
              <Download className="h-3.5 w-3.5" /> GL CSV
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState message={error} onRetry={loadSchedules} />
      ) : schedules.length === 0 ? (
        <AssetEmptyState
          icon={Calculator}
          title="No Depreciation Schedules Found"
          description="Capitalized fixed assets and their SLM/WDV book values appear here."
          actionLabel="Refresh Schedule"
          onAction={loadSchedules}
        />
      ) : (
        <div className="space-y-2.5">
          {schedules.map((d) => (
            <div
              key={d.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {d.assetTag} · {d.assetName} ({d.method})
                </p>
                <p className="text-[11px] text-slate-500">
                  Cost: {d.originalCostFormatted} · Accum. Depr:{' '}
                  {d.accumulatedDepreciationFormatted} · Net Book Value:{' '}
                  {d.netBookValueFormatted}
                </p>
              </div>
              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {d.erpGlSyncStatus}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 13. Asset Transfer
export function AssetTransferModule({
  role,
  notify,
}: AssetLifecycleModuleProps) {
  const perm = useAssetPermission('transfers', role);
  const [transfers, setTransfers] = useState<AssetTransferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [assetTag, setAssetTag] = useState('');
  const [transferType, setTransferType] = useState<
    'EmployeeToEmployee' | 'LocationToLocation' | 'Department' | 'LegalEntity'
  >('EmployeeToEmployee');
  const [fromTarget, setFromTarget] = useState('');
  const [toTarget, setToTarget] = useState('');
  const [reason, setReason] = useState('');

  const loadTransfers = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetTransferApi.listTransfers();
      setTransfers(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load asset custody transfers'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTransfers();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTransfers]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState moduleName="Asset Transfer" role={role} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Asset Transfers (Employee, Location, Department & Entity)
          </h3>
          <p className="text-xs text-slate-500">
            Dual-party acknowledgement, in-transit tracking & custody chain
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            + Initiate Transfer
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadTransfers}
          actionLabel={perm.canCreate ? '+ Initiate Transfer' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : transfers.length === 0 ? (
        <AssetEmptyState
          icon={Truck}
          title="No Active Asset Transfers"
          description="Initiate a custody transfer between employees, offices, departments, or legal entities."
          actionLabel={perm.canCreate ? 'Initiate Transfer' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {transfers.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {t.transferCode} · {t.assetTag} ({t.fromTarget} → {t.toTarget})
                </p>
                <p className="text-[11px] text-slate-500">
                  {t.transferType} · Status: {t.status}
                </p>
              </div>
              {t.status !== 'Completed' && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await assetTransferApi.acknowledgeTransfer(t.id);
                      notify('Transfer acknowledged');
                      void loadTransfers();
                    } catch (err) {
                      notify(
                        err instanceof Error
                          ? err.message
                          : 'Acknowledgement failed'
                      );
                    }
                  }}
                  className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white"
                >
                  Acknowledge
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={createOpen}
        title="Initiate Asset Custody Transfer"
        onClose={() => setCreateOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetTransferApi.createTransfer({
                assetTag,
                transferType,
                fromTarget,
                toTarget,
                reason,
              });
              notify('Asset transfer initiated');
              setCreateOpen(false);
              void loadTransfers();
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Transfer failed');
            }
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Asset Tag
              </label>
              <input
                required
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Transfer Type
              </label>
              <select
                value={transferType}
                onChange={(e) =>
                  setTransferType(
                    e.target.value as
                      | 'EmployeeToEmployee'
                      | 'LocationToLocation'
                      | 'Department'
                      | 'LegalEntity'
                  )
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              >
                <option value="EmployeeToEmployee">Employee to Employee</option>
                <option value="LocationToLocation">Location to Location</option>
                <option value="Department">Department Transfer</option>
                <option value="LegalEntity">Legal Entity Transfer</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">From</label>
              <input
                required
                value={fromTarget}
                onChange={(e) => setFromTarget(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">To</label>
              <input
                required
                value={toTarget}
                onChange={(e) => setToTarget(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Reason</label>
            <input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Submit Transfer
            </button>
          </div>
        </form>
      </AssetModal>
    </div>
  );
}

// 14. Audit & Physical Verification
export function PhysicalAuditVerificationModule({
  role,
  notify,
}: AssetLifecycleModuleProps) {
  const perm = useAssetPermission('physical-audit', role);
  const [campaigns, setCampaigns] = useState<PhysicalAuditCampaignRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [scanOpen, setScanOpen] = useState(false);
  const [scannedTagOrQr, setScannedTagOrQr] = useState('');
  const [cameraPermissionState, setCameraPermissionState] = useState<
    'idle' | 'granted' | 'fallback'
  >('idle');

  const loadCampaigns = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetPhysicalAuditApi.listCampaigns();
      setCampaigns(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load physical verification audit campaigns'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCampaigns();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadCampaigns]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Audit & Physical Verification"
        role={role}
      />
    );
  }

  const requestCameraScan = async () => {
    if (
      typeof navigator !== 'undefined' &&
      navigator.mediaDevices &&
      typeof navigator.mediaDevices.getUserMedia === 'function'
    ) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        stream.getTracks().forEach((t) => t.stop());
        setCameraPermissionState('granted');
      } catch {
        setCameraPermissionState('fallback');
      }
    } else {
      setCameraPermissionState('fallback');
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Audit & Physical Verification (Camera QR / Barcode Scan)
          </h3>
          <p className="text-xs text-slate-500">
            Audit campaigns, mobile QR/Barcode scan, verified/missing/mismatch reconciliation
          </p>
        </div>
        {perm.canEdit && (
          <button
            type="button"
            onClick={() => setScanOpen(true)}
            className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            <ScanLine className="h-3.5 w-3.5" /> Scan QR / Barcode
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadCampaigns}
          actionLabel={perm.canEdit ? 'Scan QR / Barcode' : undefined}
          onAction={perm.canEdit ? () => setScanOpen(true) : undefined}
        />
      ) : campaigns.length === 0 ? (
        <AssetEmptyState
          icon={ScanLine}
          title="No Active Physical Audit Campaigns"
          description="Launch a physical audit campaign or scan an asset QR/Barcode to verify custody."
          actionLabel={perm.canEdit ? 'Scan QR / Barcode' : undefined}
          onAction={perm.canEdit ? () => setScanOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {c.campaignCode} · {c.campaignName} ({c.location})
                </p>
                <p className="text-[11px] text-slate-500">
                  Verified: {c.verifiedCount}/{c.totalAssetsInScope} · Missing:{' '}
                  {c.missingCount} · Mismatch: {c.mismatchCount}
                </p>
              </div>
              <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                {c.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={scanOpen}
        title="Camera QR / Barcode Verification & Manual Fallback"
        onClose={() => setScanOpen(false)}
      >
        <div className="space-y-3">
          <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 p-3 text-center">
            <button
              type="button"
              onClick={() => void requestCameraScan()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              <Camera className="h-3.5 w-3.5" /> Request Camera QR Scanner
            </button>
            <p className="text-[11px] text-slate-500 mt-1.5">
              {cameraPermissionState === 'granted'
                ? 'Camera permission granted — point lens at asset QR tag or enter code below.'
                : cameraPermissionState === 'fallback'
                ? 'Camera unavailable or permission denied — using manual/USB scanner fallback.'
                : 'Supports mobile camera QR/Barcode or USB handheld scanner.'}
            </p>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await assetPhysicalAuditApi.submitScanVerification('ACTIVE', {
                  scannedTagOrQr,
                  scanMode:
                    cameraPermissionState === 'granted'
                      ? 'CameraQR'
                      : 'ManualFallback',
                  observedStatus: 'Verified',
                });
                notify(`Verified asset tag ${scannedTagOrQr}`);
                setScanOpen(false);
                void loadCampaigns();
              } catch (err) {
                notify(
                  err instanceof Error ? err.message : 'Scan verification failed'
                );
              }
            }}
            className="space-y-3"
          >
            <div>
              <label className="block text-xs font-semibold mb-1">
                Asset Tag / Scanned QR Payload
              </label>
              <input
                required
                value={scannedTagOrQr}
                onChange={(e) => setScannedTagOrQr(e.target.value)}
                placeholder="e.g. AST-LAP-0092"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setScanOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
              >
                Record Verification
              </button>
            </div>
          </form>
        </div>
      </AssetModal>
    </div>
  );
}

// 15. Lost, Damaged & Disposal
export function LostDamagedDisposalModule({
  role,
  notify,
}: AssetLifecycleModuleProps) {
  const perm = useAssetPermission('loss-disposal', role);
  const [items, setItems] = useState<AssetLossDisposalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reportOpen, setReportOpen] = useState(false);
  const [assetTag, setAssetTag] = useState('');
  const [recordType, setRecordType] = useState<
    'Lost' | 'Damaged' | 'ScrapDisposal' | 'Buyback' | 'Donation'
  >('Lost');
  const [reason, setReason] = useState('');
  const [refCode, setRefCode] = useState('');
  const [valueAmount, setValueAmount] = useState(0);

  const loadRecords = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetLossDisposalApi.listRecords();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load lost, damaged & disposal records'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRecords();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRecords]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Lost, Damaged & Disposal"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Lost, Damaged, Write-Off & Certified Disposal
          </h3>
          <p className="text-xs text-slate-500">
            FIR/incident reporting, scrap/buyback/donation & data-wipe certificate
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setReportOpen(true)}
            className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            + Report Loss / Disposal
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadRecords}
          actionLabel={perm.canCreate ? '+ Report Loss / Disposal' : undefined}
          onAction={perm.canCreate ? () => setReportOpen(true) : undefined}
        />
      ) : items.length === 0 ? (
        <AssetEmptyState
          icon={Trash2}
          title="No Loss, Damage, or Disposal Records"
          description="Report a lost or damaged asset, or initiate a certified e-waste / buyback disposal."
          actionLabel={perm.canCreate ? 'Report Loss / Disposal' : undefined}
          onAction={perm.canCreate ? () => setReportOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {r.assetTag} ({r.assetName}) · {r.recordType}
                </p>
                <p className="text-[11px] text-slate-500">
                  Ref: {r.policeFirOrWipeCertRef} · Value:{' '}
                  {r.writeOffOrDisposalValueFormatted} · Status: {r.status}
                </p>
              </div>
              {r.dataWipeVerified && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await assetLossDisposalApi.downloadDataWipeCertificate(
                        r.id
                      );
                      notify('Downloaded Data-Wipe Certificate PDF');
                    } catch (err) {
                      notify(
                        err instanceof Error ? err.message : 'Download failed'
                      );
                    }
                  }}
                  className="rounded-lg border border-slate-200 px-2.5 py-1 text-[11px] font-semibold"
                >
                  Wipe Cert PDF
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={reportOpen}
        title="Report Lost / Damaged Asset or Initiate Disposal"
        onClose={() => setReportOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetLossDisposalApi.reportLossOrDisposal({
                assetTag,
                recordType,
                reason,
                policeFirOrWipeCertRef: refCode,
                disposalOrRecoveryValue: valueAmount,
              });
              notify('Loss / disposal record submitted');
              setReportOpen(false);
              void loadRecords();
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Submission failed');
            }
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Asset Tag
              </label>
              <input
                required
                value={assetTag}
                onChange={(e) => setAssetTag(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Type</label>
              <select
                value={recordType}
                onChange={(e) =>
                  setRecordType(
                    e.target.value as
                      | 'Lost'
                      | 'Damaged'
                      | 'ScrapDisposal'
                      | 'Buyback'
                      | 'Donation'
                  )
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              >
                <option value="Lost">Lost / Stolen</option>
                <option value="Damaged">Damaged Beyond Repair</option>
                <option value="ScrapDisposal">E-Waste Scrap Disposal</option>
                <option value="Buyback">Employee Buyback</option>
                <option value="Donation">CSR Donation</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Police FIR / Data-Wipe Certificate Reference
            </label>
            <input
              required
              value={refCode}
              onChange={(e) => setRefCode(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Reason / Investigation Summary
            </label>
            <input
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Write-Off / Buyback / Scrap Value
            </label>
            <input
              type="number"
              value={valueAmount}
              onChange={(e) => setValueAmount(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReportOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Submit Record
            </button>
          </div>
        </form>
      </AssetModal>
    </div>
  );
}

// 16. Consumables & Stock
export function ConsumablesStockModule({
  role,
  notify,
}: AssetLifecycleModuleProps) {
  const perm = useAssetPermission('consumables', role);
  const [items, setItems] = useState<ConsumableStockRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStock = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetConsumablesApi.listConsumables();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load consumables & peripheral stock ledger'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadStock();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadStock]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Consumables & Stock"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Consumables & Peripheral Stock Ledger
        </h3>
        <p className="text-xs text-slate-500">
          Adapters, cables, toners, reorder thresholds & auto-PR low-stock triggers
        </p>
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState message={error} onRetry={loadStock} />
      ) : items.length === 0 ? (
        <AssetEmptyState
          icon={Boxes}
          title="No Consumable Stock Items"
          description="Track peripheral stock quantities, reorder thresholds, and issue/receive logs."
          actionLabel="Refresh Ledger"
          onAction={loadStock}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {s.itemName} ({s.skuCode})
                </p>
                <p className="text-[11px] text-slate-500">
                  Qty: {s.availableQty} (Reorder: {s.reorderLevel}) ·{' '}
                  {s.location} · Auto-Reorder: {s.autoReorderStatus}
                </p>
              </div>
              {perm.canEdit && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await assetConsumablesApi.adjustStock(s.id, {
                        transactionType: 'Issue',
                        quantity: 1,
                        employeeOrVendorRef: 'EMP-ISSUE',
                      });
                      notify(`Issued 1 unit of ${s.itemName}`);
                      void loadStock();
                    } catch (err) {
                      notify(
                        err instanceof Error ? err.message : 'Stock issue failed'
                      );
                    }
                  }}
                  className="rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-semibold text-white"
                >
                  Issue 1 Unit
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 17. Locations & Cost Centers
export function LocationsCostCentersModule({
  role,
  notify,
}: AssetLifecycleModuleProps) {
  const perm = useAssetPermission('locations', role);
  const [locations, setLocations] = useState<AssetLocationCostCenterRecord[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [entityName, setEntityName] = useState('OFC360 India Pvt Ltd');
  const [siteName, setSiteName] = useState('Bengaluru Global HQ');
  const [buildingFloorRoom, setBuildingFloorRoom] = useState(
    'Tower A · Floor 4 · Bay 2'
  );
  const [costCenterCode, setCostCenterCode] = useState('CC-BLR-402');
  const [seatingCapacity, setSeatingCapacity] = useState(120);

  const loadLocations = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetLocationsApi.listLocations();
      setLocations(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load location hierarchy & cost centers'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadLocations();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadLocations]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Locations & Cost Centers"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Locations Hierarchy & Cost Center Mapping
          </h3>
          <p className="text-xs text-slate-500">
            Entity → Site → Building → Floor → Room hierarchy & seating capacity
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            + Add Location
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadLocations}
          actionLabel={perm.canCreate ? '+ Add Location' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : locations.length === 0 ? (
        <AssetEmptyState
          icon={MapPin}
          title="No Asset Locations Configured"
          description="Define legal entity sites, floors, rooms, and cost centers for asset allocation."
          actionLabel={perm.canCreate ? 'Add Location' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {locations.map((l) => (
            <div
              key={l.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {l.siteName} · {l.buildingFloorRoom}
                </p>
                <p className="text-[11px] text-slate-500">
                  Entity: {l.entityName} · Cost Center: {l.costCenterCode} ·
                  Capacity: {l.seatingCapacity}
                </p>
              </div>
              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold">
                {l.allocatedAssetsCount} Assets
              </span>
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={createOpen}
        title="Add Asset Location & Cost Center"
        onClose={() => setCreateOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetLocationsApi.createLocation({
                entityName,
                siteName,
                buildingFloorRoom,
                costCenterCode,
                seatingCapacity,
              });
              notify('Location & cost center created');
              setCreateOpen(false);
              void loadLocations();
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Location save failed');
            }
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Entity</label>
              <input
                required
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Site</label>
              <input
                required
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Building / Floor / Room
            </label>
            <input
              required
              value={buildingFloorRoom}
              onChange={(e) => setBuildingFloorRoom(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Cost Center Code
              </label>
              <input
                required
                value={costCenterCode}
                onChange={(e) => setCostCenterCode(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Seating Capacity
              </label>
              <input
                type="number"
                value={seatingCapacity}
                onChange={(e) => setSeatingCapacity(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Save Location
            </button>
          </div>
        </form>
      </AssetModal>
    </div>
  );
}
