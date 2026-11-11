'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Gauge,
  Package,
  Layers,
  ShoppingCart,
  Building2,
  ArrowLeftRight,
  ClipboardPlus,
  UserCheck,
  Wrench,
  Eye,
  Download,
  Upload,
} from 'lucide-react';
import {
  AssetRole,
  AssetModuleId,
  AssetDashboardResponse,
  AssetRegisterRecord,
  Asset360ProfileResponse,
  AssetCategoryRecord,
  ProcurementOrderRecord,
  AssetVendorRecord,
  AssetAllocationRecord,
  EmployeeAssetRequestRecord,
  LifecycleAssetHandoffRecord,
  AssetMaintenanceTicketRecord,
  AssetCondition,
} from '../../types/assets';
import {
  assetDashboardApi,
  assetRegisterApi,
  assetCategoriesApi,
  assetProcurementApi,
  assetVendorsApi,
  assetAllocationApi,
  assetRequestsApi,
  assetLifecycleIntegrationApi,
  assetMaintenanceApi,
} from '../../services/assets';
import { formatAssetCurrency } from '../../services/assets/client';
import { useAssetPermission } from '../../hooks/useAssetPermission';
import {
  AssetSkeletonBlock,
  AssetPermissionDeniedState,
  AssetErrorState,
  AssetEmptyState,
  AssetModal,
} from './AssetPrimitives';

export interface AssetModuleCommonProps {
  role: AssetRole;
  notify: (msg: string) => void;
}

// 1. Asset Dashboard
export function AssetDashboardModule({
  role,
  onNavigateModule,
}: AssetModuleCommonProps & {
  onNavigateModule: (mod: AssetModuleId) => void;
}) {
  const perm = useAssetPermission('dashboard', role);
  const [summary, setSummary] = useState<AssetDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');

  const loadDashboard = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetDashboardApi.getSummary({
        categoryId: categoryFilter || undefined,
        location: locationFilter || undefined,
      });
      setSummary(res);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load Asset Dashboard'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, categoryFilter, locationFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDashboard();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDashboard]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState moduleName="Asset Dashboard" role={role} />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Asset Management Executive Dashboard
          </h3>
          <p className="text-xs text-slate-500">
            Inventory KPIs, book value, SLA breaches, warranty expiries & utilization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            placeholder="Filter category..."
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs"
          />
          <input
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Filter location..."
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs"
          />
        </div>
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadDashboard}
          actionLabel="Open Asset Register"
          onAction={() => onNavigateModule('register')}
        />
      ) : !summary ? (
        <AssetEmptyState
          icon={Gauge}
          title="No Asset Metrics Available"
          description="Register hardware, software, or facilities assets to populate live inventory & valuation metrics."
          actionLabel="Go to Asset Register"
          onAction={() => onNavigateModule('register')}
        />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <p className="text-[11px] text-slate-500">Total Assets / Allocated</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">
                {summary.kpis.totalAssets} / {summary.kpis.allocatedAssets}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <p className="text-[11px] text-slate-500">Available / Maintenance</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                {summary.kpis.availableAssets} / {summary.kpis.underMaintenance}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <p className="text-[11px] text-slate-500">Total Asset Value</p>
              <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                {formatAssetCurrency(summary.kpis.totalAssetValue)}
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <p className="text-[11px] text-slate-500">Current Book Value</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                {formatAssetCurrency(summary.kpis.currentBookValue)}
              </p>
            </div>
          </div>

          {summary.alerts.length > 0 && (
            <div className="rounded-xl border border-amber-200 dark:border-amber-900/60 bg-white dark:bg-slate-900 p-3.5 space-y-2">
              <p className="text-xs font-bold text-slate-900 dark:text-white">
                SLA Breaches & Expiring Warranties / Licenses
              </p>
              {summary.alerts.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center justify-between text-xs border-t border-slate-100 dark:border-slate-800 pt-2"
                >
                  <span>{a.title}</span>
                  <button
                    type="button"
                    onClick={() => onNavigateModule(a.module)}
                    className="text-indigo-600 dark:text-indigo-400 font-semibold"
                  >
                    Inspect →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 2. Asset Register (Inventory)
export function AssetRegisterModule({ role, notify }: AssetModuleCommonProps) {
  const perm = useAssetPermission('register', role);
  const [assets, setAssets] = useState<AssetRegisterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [profile360, setProfile360] = useState<Asset360ProfileResponse | null>(
    null
  );
  const [revealedMap, setRevealedMap] = useState<Record<string, string>>({});

  // Create form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Laptop');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [vendorName, setVendorName] = useState('');
  const [purchaseCost, setPurchaseCost] = useState(85000);
  const [warrantyEndDate, setWarrantyEndDate] = useState('');
  const [location, setLocation] = useState('Bengaluru HQ');
  const [condition, setCondition] = useState<AssetCondition>('New');

  const loadAssets = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetRegisterApi.listAssets({
        search: search || undefined,
        status: statusFilter || undefined,
      });
      setAssets(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load Asset Register inventory'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView, search, statusFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadAssets();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAssets]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Asset Register (Inventory)"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Asset Register & Master Inventory
            </h3>
            <p className="text-xs text-slate-500">
              Auto-tagged assets, masked serial/IMEI/cost, bulk CSV import & Asset 360° profile
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {perm.canCreate && (
              <>
                <button
                  type="button"
                  onClick={() => setCreateOpen(true)}
                  className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
                >
                  + Add Asset
                </button>
                <button
                  type="button"
                  onClick={() => setImportOpen(true)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold"
                >
                  <Upload className="h-3.5 w-3.5" /> Bulk Import
                </button>
              </>
            )}
            {perm.canExport && (
              <button
                type="button"
                onClick={async () => {
                  try {
                    await assetRegisterApi.exportRegister('csv');
                    notify('Exported Asset Register CSV');
                  } catch (err) {
                    notify(err instanceof Error ? err.message : 'Export failed');
                  }
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1.5 text-xs font-semibold"
              >
                <Download className="h-3.5 w-3.5" /> CSV
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tag, make, model, serial..."
            className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2.5 py-1.5 text-xs"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Allocated">Allocated</option>
            <option value="InMaintenance">In Maintenance</option>
            <option value="InTransit">In Transit</option>
            <option value="Lost">Lost</option>
            <option value="Damaged">Damaged</option>
            <option value="Disposed">Disposed</option>
          </select>
        </div>
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <div className="space-y-3">
          <AssetErrorState
            message={error}
            onRetry={loadAssets}
            actionLabel={perm.canCreate ? '+ Add Asset' : undefined}
            onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
          />
        </div>
      ) : assets.length === 0 ? (
        <AssetEmptyState
          icon={Package}
          title="No Assets in Register"
          description="Create a new asset or bulk-import via CSV/XLSX to start tracking lifecycle and custody."
          actionLabel={perm.canCreate ? 'Add Asset' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {assets.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">
                    {a.assetTag} · {a.name}
                  </span>
                  <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                    {a.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {a.category} · {a.make} {a.model} · Serial:{' '}
                  {revealedMap[a.id] || a.maskedSerialNumber} · Cost:{' '}
                  {a.maskedPurchaseCost} · Location: {a.location}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {perm.canRevealSensitive && !revealedMap[a.id] && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const rev = await assetRegisterApi.revealSensitive(a.id);
                        setRevealedMap((prev) => ({
                          ...prev,
                          [a.id]: rev.unmaskedSerialOrImei,
                        }));
                        notify('Unmasked serial/IMEI (Audit Logged)');
                      } catch (err) {
                        notify(
                          err instanceof Error ? err.message : 'Reveal failed'
                        );
                      }
                    }}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2 py-1 text-[11px] font-semibold"
                  >
                    <Eye className="h-3 w-3" /> Reveal
                  </button>
                )}
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const p = await assetRegisterApi.getAsset360(a.id);
                      setProfile360(p);
                    } catch (err) {
                      notify(
                        err instanceof Error
                          ? err.message
                          : 'Failed to fetch Asset 360 profile'
                      );
                    }
                  }}
                  className="rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-semibold"
                >
                  360° View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={createOpen}
        title="Register New Enterprise Asset"
        onClose={() => setCreateOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetRegisterApi.createAsset({
                name,
                category,
                make,
                model,
                serialNumber,
                purchaseDate,
                vendorName,
                purchaseCost,
                warrantyEndDate,
                location,
                condition,
              });
              notify('Asset created with auto-generated tag');
              setCreateOpen(false);
              void loadAssets();
            } catch (err) {
              notify(
                err instanceof Error ? err.message : 'Asset creation failed'
              );
            }
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Asset Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. MacBook Pro 16 M3"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              >
                <option value="Laptop">Laptop</option>
                <option value="Mobile">Mobile</option>
                <option value="ID Card">ID Card</option>
                <option value="Access Card">Access Card</option>
                <option value="Monitor">Monitor</option>
                <option value="Furniture">Furniture</option>
                <option value="Vehicle">Vehicle</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Make</label>
              <input
                required
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Apple / Dell / Lenovo"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Model</label>
              <input
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="A2991"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Serial Number / IMEI
              </label>
              <input
                required
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Purchase Cost
              </label>
              <input
                type="number"
                required
                value={purchaseCost}
                onChange={(e) => setPurchaseCost(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Purchase Date
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Warranty Expiry Date
              </label>
              <input
                type="date"
                required
                value={warrantyEndDate}
                onChange={(e) => setWarrantyEndDate(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Vendor</label>
              <input
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Location
              </label>
              <input
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as AssetCondition)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              >
                <option value="New">New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Damaged">Damaged</option>
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Save Asset
            </button>
          </div>
        </form>
      </AssetModal>

      <AssetModal
        open={importOpen}
        title="Bulk Import Assets (CSV / XLSX)"
        onClose={() => setImportOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            try {
              const res = await assetRegisterApi.bulkImportCsv(fd);
              notify(
                `Validated ${res.validRowsCount} rows (${res.errorRowsCount} errors)`
              );
              setImportOpen(false);
              void loadAssets();
            } catch (err) {
              notify(
                err instanceof Error ? err.message : 'Bulk import failed'
              );
            }
          }}
          className="space-y-3"
        >
          <input
            type="file"
            name="file"
            accept=".csv,.xlsx"
            required
            className="w-full text-xs"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setImportOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Upload & Validate
            </button>
          </div>
        </form>
      </AssetModal>

      <AssetModal
        open={Boolean(profile360)}
        title={`Asset 360° Profile — ${profile360?.asset.assetTag ?? ''}`}
        onClose={() => setProfile360(null)}
      >
        {profile360 && (
          <div className="space-y-2 text-xs">
            <p className="font-bold">
              {profile360.asset.name} ({profile360.asset.make}{' '}
              {profile360.asset.model})
            </p>
            <p className="text-slate-500">
              QR Payload: {profile360.qrPayload} · Book Value:{' '}
              {profile360.asset.bookValueFormatted}
            </p>
            <p className="text-slate-500">
              Linked Accessories: {profile360.linkedAccessories.join(', ') || 'None'}
            </p>
          </div>
        )}
      </AssetModal>
    </div>
  );
}

// 3. Asset Categories, Types & Custom Fields
export function AssetCategoriesModule({ role, notify }: AssetModuleCommonProps) {
  const perm = useAssetPermission('categories', role);
  const [items, setItems] = useState<AssetCategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [tagPrefix, setTagPrefix] = useState('AST-LAP');
  const [depreciationMethod, setDepreciationMethod] = useState<
    'SLM' | 'WDV' | 'Custom'
  >('SLM');
  const [usefulLifeMonths, setUsefulLifeMonths] = useState(36);
  const [eligibleGrades, setEligibleGrades] = useState('L1, L2, L3, M1');
  const [customFields, setCustomFields] = useState('RAM, Storage, MAC Address');

  const loadCategories = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetCategoriesApi.listCategories();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load asset categories & custom fields'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadCategories();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadCategories]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Asset Categories & Custom Fields"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Asset Categories, Types & Custom Field Builder
          </h3>
          <p className="text-xs text-slate-500">
            Tag format rules, SLM/WDV depreciation mapping & grade eligibility
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            + New Category
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadCategories}
          actionLabel={perm.canCreate ? '+ New Category' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : items.length === 0 ? (
        <AssetEmptyState
          icon={Layers}
          title="No Asset Categories Defined"
          description="Define Laptop, Mobile, ID Card, Access Card, Furniture, Vehicle, or Software categories."
          actionLabel={perm.canCreate ? 'New Category' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((c) => (
            <div
              key={c.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  {c.name} ({c.tagPrefix})
                </span>
                <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                  {c.depreciationMethod} · {c.usefulLifeMonths}m
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Grades: {c.eligibleGrades.join(', ')} · Custom Fields:{' '}
                {c.customFields.join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={createOpen}
        title="Create Asset Category & Custom Schema"
        onClose={() => setCreateOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetCategoriesApi.createCategory({
                name,
                tagPrefix,
                depreciationMethod,
                usefulLifeMonths,
                eligibleGrades: eligibleGrades
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
                customFields: customFields
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
              });
              notify('Asset category created');
              setCreateOpen(false);
              void loadCategories();
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Creation failed');
            }
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Category Name
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Engineering Laptops"
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Tag Prefix
              </label>
              <input
                required
                value={tagPrefix}
                onChange={(e) => setTagPrefix(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Depreciation Method
              </label>
              <select
                value={depreciationMethod}
                onChange={(e) =>
                  setDepreciationMethod(
                    e.target.value as 'SLM' | 'WDV' | 'Custom'
                  )
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              >
                <option value="SLM">SLM (Straight Line)</option>
                <option value="WDV">WDV (Written Down Value)</option>
                <option value="Custom">Custom Schedule</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Useful Life (Months)
              </label>
              <input
                type="number"
                min={1}
                value={usefulLifeMonths}
                onChange={(e) => setUsefulLifeMonths(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Eligible Grades (comma-separated)
            </label>
            <input
              value={eligibleGrades}
              onChange={(e) => setEligibleGrades(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Custom Fields (comma-separated)
            </label>
            <input
              value={customFields}
              onChange={(e) => setCustomFields(e.target.value)}
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
              Save Category
            </button>
          </div>
        </form>
      </AssetModal>
    </div>
  );
}

// 4. Procurement (Requests, PO, GRN)
export function AssetProcurementModule({ role, notify }: AssetModuleCommonProps) {
  const perm = useAssetPermission('procurement', role);
  const [orders, setOrders] = useState<ProcurementOrderRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [prOpen, setPrOpen] = useState(false);
  const [category, setCategory] = useState('Laptop');
  const [itemSpecification, setItemSpecification] = useState('');
  const [quantity, setQuantity] = useState(5);
  const [vendorName, setVendorName] = useState('');
  const [estimatedUnitCost, setEstimatedUnitCost] = useState(95000);
  const [costCenter, setCostCenter] = useState('CC-ENG-101');

  const loadOrders = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetProcurementApi.listOrders();
      setOrders(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load procurement PR / PO / GRN pipeline'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadOrders]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Procurement (PR / PO / GRN)"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Procurement (Purchase Requisitions, PO & GRN)
          </h3>
          <p className="text-xs text-slate-500">
            Quotation comparison, budget check, GRN receipt & auto-create assets from GRN
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setPrOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            + Raise PR
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadOrders}
          actionLabel={perm.canCreate ? '+ Raise PR' : undefined}
          onAction={perm.canCreate ? () => setPrOpen(true) : undefined}
        />
      ) : orders.length === 0 ? (
        <AssetEmptyState
          icon={ShoppingCart}
          title="No Active Purchase Requisitions or POs"
          description="Raise a purchase requisition to initiate vendor quotes, PO approval, and GRN asset creation."
          actionLabel={perm.canCreate ? 'Raise PR' : undefined}
          onAction={perm.canCreate ? () => setPrOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {orders.map((o) => (
            <div
              key={o.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {o.prNumber} {o.poNumber ? `· ${o.poNumber}` : ''} ·{' '}
                  {o.itemSpecification} (x{o.quantity})
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Vendor: {o.vendorName} · Total: {o.totalAmountFormatted} ·
                  Budget: {o.budgetCheckStatus} · Stage: {o.stage}
                </p>
              </div>
              {perm.canEdit && o.stage === 'PO' && (
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await assetProcurementApi.recordGrn(o.id, {
                        receivedQty: o.quantity,
                        invoiceNumber: `INV-${o.prNumber}`,
                        autoCreateAssets: true,
                      });
                      notify('GRN recorded and assets auto-created');
                      void loadOrders();
                    } catch (err) {
                      notify(err instanceof Error ? err.message : 'GRN failed');
                    }
                  }}
                  className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white"
                >
                  Record GRN & Auto-Tag
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={prOpen}
        title="Raise Purchase Requisition (PR)"
        onClose={() => setPrOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetProcurementApi.createRequisition({
                category,
                itemSpecification,
                quantity,
                vendorName,
                estimatedUnitCost,
                costCenter,
              });
              notify('Purchase Requisition submitted for budget & PO approval');
              setPrOpen(false);
              void loadOrders();
            } catch (err) {
              notify(err instanceof Error ? err.message : 'PR creation failed');
            }
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Category
              </label>
              <input
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Quantity
              </label>
              <input
                type="number"
                min={1}
                required
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Item Specification
            </label>
            <input
              required
              value={itemSpecification}
              onChange={(e) => setItemSpecification(e.target.value)}
              placeholder="e.g. 16GB RAM 512GB NVMe Developer Workstation"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">Vendor</label>
              <input
                required
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Est. Unit Cost
              </label>
              <input
                type="number"
                required
                value={estimatedUnitCost}
                onChange={(e) => setEstimatedUnitCost(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Cost Center
              </label>
              <input
                required
                value={costCenter}
                onChange={(e) => setCostCenter(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setPrOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Submit PR
            </button>
          </div>
        </form>
      </AssetModal>
    </div>
  );
}

// 5. Vendors & Contracts
export function AssetVendorsContractsModule({
  role,
  notify,
}: AssetModuleCommonProps) {
  const perm = useAssetPermission('vendors', role);
  const [vendors, setVendors] = useState<AssetVendorRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [categoriesSupplied, setCategoriesSupplied] = useState('Laptop, Monitor');
  const [amcExpiryDate, setAmcExpiryDate] = useState('');

  const loadVendors = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetVendorsApi.listVendors();
      setVendors(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load vendors & AMC contracts'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadVendors();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadVendors]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Vendors & Contracts"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Vendors, Contracts & SLA Scorecards
          </h3>
          <p className="text-xs text-slate-500">
            Vendor master, AMC terms, SLA compliance & contract expiry alerts
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            + Add Vendor
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadVendors}
          actionLabel={perm.canCreate ? '+ Add Vendor' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : vendors.length === 0 ? (
        <AssetEmptyState
          icon={Building2}
          title="No Asset Vendors Registered"
          description="Onboard hardware, SaaS, or maintenance vendors to track contracts and SLAs."
          actionLabel={perm.canCreate ? 'Add Vendor' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {v.name} ({v.vendorCode})
                </p>
                <p className="text-[11px] text-slate-500">
                  SLA: {v.slaCompliancePct}% · AMC Expires: {v.amcExpiryDate} ·
                  Rating: {v.scorecardRating}/5
                </p>
              </div>
              <span className="rounded-md bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                {v.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={createOpen}
        title="Register Asset Vendor & Contract"
        onClose={() => setCreateOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetVendorsApi.createVendor({
                name,
                contactEmail,
                categoriesSupplied: categoriesSupplied
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
                amcExpiryDate,
              });
              notify('Vendor onboarded');
              setCreateOpen(false);
              void loadVendors();
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Vendor save failed');
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold mb-1">
              Vendor Name
            </label>
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Contact Email
            </label>
            <input
              type="email"
              required
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Categories Supplied
              </label>
              <input
                value={categoriesSupplied}
                onChange={(e) => setCategoriesSupplied(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                AMC Contract Expiry
              </label>
              <input
                type="date"
                required
                value={amcExpiryDate}
                onChange={(e) => setAmcExpiryDate(e.target.value)}
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
              Save Vendor
            </button>
          </div>
        </form>
      </AssetModal>
    </div>
  );
}

// 6. Asset Allocation & Return
export function AssetAllocationReturnModule({
  role,
  notify,
}: AssetModuleCommonProps) {
  const perm = useAssetPermission('allocation', role);
  const [items, setItems] = useState<AssetAllocationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [returnOpen, setReturnOpen] = useState(false);
  const [activeId, setActiveId] = useState('');
  const [assetTag, setAssetTag] = useState('');
  const [assigneeEmployeeCode, setAssigneeEmployeeCode] = useState('');
  const [accessoriesBundled, setAccessoriesBundled] = useState('Charger, Sleeve');
  const [damageChargeAmount, setDamageChargeAmount] = useState(0);
  const [syncToPayroll, setSyncToPayroll] = useState(true);

  const loadAllocations = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetAllocationApi.listAllocations();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load asset allocations & returns'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadAllocations();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadAllocations]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Asset Allocation & Return"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Asset Allocation, E-Sign Handover & Return Recovery
          </h3>
          <p className="text-xs text-slate-500">
            Employee/project allocation, accessory bundling, return assessment & Payroll recovery sync
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setAssignOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            + Allocate Asset
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadAllocations}
          actionLabel={perm.canCreate ? '+ Allocate Asset' : undefined}
          onAction={perm.canCreate ? () => setAssignOpen(true) : undefined}
        />
      ) : items.length === 0 ? (
        <AssetEmptyState
          icon={ArrowLeftRight}
          title="No Active Asset Allocations"
          description="Allocate an available asset to an employee with e-sign/OTP handover acknowledgement."
          actionLabel={perm.canCreate ? 'Allocate Asset' : undefined}
          onAction={perm.canCreate ? () => setAssignOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {a.assetTag} ({a.assetName}) → {a.assigneeName} (
                  {a.assigneeEmployeeCode})
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Handover: {a.handoverStatus} · Accessories:{' '}
                  {a.accessoriesBundled.join(', ')} · Status: {a.status}
                </p>
              </div>
              {perm.canEdit && a.status !== 'Returned' && (
                <button
                  type="button"
                  onClick={() => {
                    setActiveId(a.id);
                    setReturnOpen(true);
                  }}
                  className="rounded-lg bg-amber-600 px-2.5 py-1.5 text-[11px] font-semibold text-white"
                >
                  Process Return
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={assignOpen}
        title="Allocate Asset to Employee"
        onClose={() => setAssignOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetAllocationApi.allocateAsset({
                assetTag,
                assigneeEmployeeCode,
                accessoriesBundled: accessoriesBundled
                  .split(',')
                  .map((s) => s.trim())
                  .filter(Boolean),
                conditionOnIssue: 'Good',
                requireESignOtp: true,
              });
              notify('Asset allocated and handover OTP/E-Sign dispatched');
              setAssignOpen(false);
              void loadAllocations();
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Allocation failed');
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold mb-1">
              Asset Tag
            </label>
            <input
              required
              value={assetTag}
              onChange={(e) => setAssetTag(e.target.value)}
              placeholder="e.g. AST-LAP-0092"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Employee Code
            </label>
            <input
              required
              value={assigneeEmployeeCode}
              onChange={(e) => setAssigneeEmployeeCode(e.target.value)}
              placeholder="e.g. EMP-3600"
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Bundled Accessories
            </label>
            <input
              value={accessoriesBundled}
              onChange={(e) => setAccessoriesBundled(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setAssignOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Allocate
            </button>
          </div>
        </form>
      </AssetModal>

      <AssetModal
        open={returnOpen}
        title="Process Asset Return & Damage Recovery"
        onClose={() => setReturnOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetAllocationApi.returnAsset(activeId, {
                conditionOnReturn:
                  damageChargeAmount > 0 ? 'Damaged' : 'Good',
                damageChargeAmount,
                syncRecoveryToPayroll: syncToPayroll,
                remarks: 'Processed via Asset Return desk',
              });
              notify('Asset return completed');
              setReturnOpen(false);
              void loadAllocations();
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Return failed');
            }
          }}
          className="space-y-3"
        >
          <div>
            <label className="block text-xs font-semibold mb-1">
              Damage Recovery Amount (0 if undamaged)
            </label>
            <input
              type="number"
              min={0}
              value={damageChargeAmount}
              onChange={(e) => setDamageChargeAmount(Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <label className="flex items-center gap-2 text-xs font-medium">
            <input
              type="checkbox"
              checked={syncToPayroll}
              onChange={(e) => setSyncToPayroll(e.target.checked)}
            />
            Sync damage recovery deduction to Payroll Module
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setReturnOpen(false)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Confirm Return
            </button>
          </div>
        </form>
      </AssetModal>
    </div>
  );
}

// 7. Asset Requests (Employee Self-Service)
export function EmployeeAssetRequestsModule({
  role,
  notify,
}: AssetModuleCommonProps) {
  const perm = useAssetPermission('requests', role);
  const [requests, setRequests] = useState<EmployeeAssetRequestRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [requestType, setRequestType] = useState<
    'New' | 'Replacement' | 'Upgrade' | 'Accessory'
  >('New');
  const [categoryName, setCategoryName] = useState('Laptop');
  const [justification, setJustification] = useState('');

  const loadRequests = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetRequestsApi.listRequests();
      setRequests(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load employee asset requests'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRequests();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRequests]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Employee Asset Requests"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Employee Asset Requests (New / Replacement / Upgrade / Accessory)
          </h3>
          <p className="text-xs text-slate-500">
            Grade eligibility check, Manager + IT approval chain & auto-allocation from stock
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            + Raise Asset Request
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadRequests}
          actionLabel={perm.canCreate ? '+ Raise Asset Request' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : requests.length === 0 ? (
        <AssetEmptyState
          icon={ClipboardPlus}
          title="No Asset Requests Found"
          description="Request a new asset, replacement, upgrade, or peripheral accessory."
          actionLabel={perm.canCreate ? 'Raise Asset Request' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {r.requestCode} · {r.employeeName} · {r.requestType}{' '}
                  {r.categoryName}
                </p>
                <p className="text-[11px] text-slate-500">
                  Eligibility: {r.eligibilityStatus} · Automation:{' '}
                  {r.autoAllocationStatus} · SLA: {r.slaHoursRemaining}h
                </p>
              </div>
              <span className="rounded-md bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                {r.approvalStage}
              </span>
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={createOpen}
        title="Raise Employee Asset Request"
        onClose={() => setCreateOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetRequestsApi.submitRequest({
                requestType,
                categoryName,
                justification,
                urgency: 'Normal',
              });
              notify('Asset request submitted for eligibility & approval');
              setCreateOpen(false);
              void loadRequests();
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Request failed');
            }
          }}
          className="space-y-3"
        >
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-semibold mb-1">
                Request Type
              </label>
              <select
                value={requestType}
                onChange={(e) =>
                  setRequestType(
                    e.target.value as
                      | 'New'
                      | 'Replacement'
                      | 'Upgrade'
                      | 'Accessory'
                  )
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              >
                <option value="New">New Asset</option>
                <option value="Replacement">Replacement</option>
                <option value="Upgrade">Upgrade</option>
                <option value="Accessory">Accessory</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">
                Category
              </label>
              <input
                required
                value={categoryName}
                onChange={(e) => setCategoryName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Business Justification
            </label>
            <textarea
              required
              rows={2}
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
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
              Submit Request
            </button>
          </div>
        </form>
      </AssetModal>
    </div>
  );
}

// 8. Onboarding & Offboarding Integration
export function LifecycleAssetIntegrationModule({
  role,
  notify,
}: AssetModuleCommonProps) {
  const perm = useAssetPermission('lifecycle-integration', role);
  const [handoffs, setHandoffs] = useState<LifecycleAssetHandoffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadHandoffs = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetLifecycleIntegrationApi.listHandoffs();
      setHandoffs(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load Onboarding & Offboarding asset handoffs'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadHandoffs();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadHandoffs]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Onboarding & Offboarding Integration"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">
          Onboarding Provisioning & Offboarding Exit Clearance
        </h3>
        <p className="text-xs text-slate-500">
          Auto-created joiner kits, exit asset recovery checklist, No-Dues Certificate & F&F link
        </p>
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState message={error} onRetry={loadHandoffs} />
      ) : handoffs.length === 0 ? (
        <AssetEmptyState
          icon={UserCheck}
          title="No Active Onboarding or Exit Asset Handoffs"
          description="Joiner provisioning queues and exiting employee asset clearance checklists appear here."
          actionLabel="Refresh Queue"
          onAction={loadHandoffs}
        />
      ) : (
        <div className="space-y-2.5">
          {handoffs.map((h) => (
            <div
              key={h.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {h.employeeName} ({h.employeeCode}) · {h.flowType}
                </p>
                <p className="text-[11px] text-slate-500">
                  Assets: {h.assetsList.join(', ')} · Pending:{' '}
                  {h.pendingItemsCount} · F&F Status: {h.fnfSyncStatus}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                {perm.canEdit && !h.noDuesCertificateIssued && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await assetLifecycleIntegrationApi.issueNoDuesCertificate(
                          h.id
                        );
                        notify('Issued Asset No-Dues Clearance');
                        void loadHandoffs();
                      } catch (err) {
                        notify(
                          err instanceof Error
                            ? err.message
                            : 'Clearance failed'
                        );
                      }
                    }}
                    className="rounded-lg bg-emerald-600 px-2.5 py-1.5 text-[11px] font-semibold text-white"
                  >
                    Issue No-Dues
                  </button>
                )}
                {h.noDuesCertificateIssued && (
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await assetLifecycleIntegrationApi.downloadNoDuesPdf(
                          h.id
                        );
                        notify('Downloaded No-Dues PDF');
                      } catch (err) {
                        notify(
                          err instanceof Error ? err.message : 'Download failed'
                        );
                      }
                    }}
                    className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold"
                  >
                    No-Dues PDF
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 9. Maintenance & Repairs
export function AssetMaintenanceRepairsModule({
  role,
  notify,
}: AssetModuleCommonProps) {
  const perm = useAssetPermission('maintenance', role);
  const [tickets, setTickets] = useState<AssetMaintenanceTicketRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [assetTag, setAssetTag] = useState('');
  const [maintenanceType, setMaintenanceType] = useState<
    'Preventive' | 'Breakdown'
  >('Breakdown');
  const [issueSummary, setIssueSummary] = useState('');
  const [vendorName, setVendorName] = useState('');

  const loadTickets = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await assetMaintenanceApi.listTickets();
      setTickets(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load maintenance & repair tickets'
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadTickets();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadTickets]);

  if (!perm.canView) {
    return (
      <AssetPermissionDeniedState
        moduleName="Maintenance & Repairs"
        role={role}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Preventive Maintenance & Breakdown Repairs
          </h3>
          <p className="text-xs text-slate-500">
            Service tickets, downtime tracking, warranty claims & Repair vs Replace workflow
          </p>
        </div>
        {perm.canCreate && (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white"
          >
            + Log Service Ticket
          </button>
        )}
      </div>

      {loading ? (
        <AssetSkeletonBlock rows={4} />
      ) : error ? (
        <AssetErrorState
          message={error}
          onRetry={loadTickets}
          actionLabel={perm.canCreate ? '+ Log Service Ticket' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : tickets.length === 0 ? (
        <AssetEmptyState
          icon={Wrench}
          title="No Active Maintenance Tickets"
          description="Log a breakdown repair or schedule preventive maintenance for an asset."
          actionLabel={perm.canCreate ? 'Log Service Ticket' : undefined}
          onAction={perm.canCreate ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {tickets.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  {t.ticketCode} · {t.assetTag} ({t.assetName})
                </p>
                <p className="text-[11px] text-slate-500">
                  {t.maintenanceType} · {t.issueSummary} · Cost:{' '}
                  {t.repairCostFormatted} · Downtime: {t.downtimeHours}h
                </p>
              </div>
              <span className="rounded-md bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-300">
                {t.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <AssetModal
        open={createOpen}
        title="Log Maintenance / Repair Ticket"
        onClose={() => setCreateOpen(false)}
      >
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            try {
              await assetMaintenanceApi.createTicket({
                assetTag,
                maintenanceType,
                issueSummary,
                vendorName,
                issueReplacementAsset: true,
              });
              notify('Maintenance service ticket logged');
              setCreateOpen(false);
              void loadTickets();
            } catch (err) {
              notify(err instanceof Error ? err.message : 'Ticket save failed');
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
                value={maintenanceType}
                onChange={(e) =>
                  setMaintenanceType(
                    e.target.value as 'Preventive' | 'Breakdown'
                  )
                }
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
              >
                <option value="Breakdown">Breakdown Repair</option>
                <option value="Preventive">Preventive Maintenance</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Issue Summary
            </label>
            <input
              required
              value={issueSummary}
              onChange={(e) => setIssueSummary(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-1.5 text-xs"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">
              Service Vendor
            </label>
            <input
              required
              value={vendorName}
              onChange={(e) => setVendorName(e.target.value)}
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
              Create Ticket
            </button>
          </div>
        </form>
      </AssetModal>
    </div>
  );
}
