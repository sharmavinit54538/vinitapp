'use client';

import React, { useState } from 'react';
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
  ShieldAlert,
  KeyRound,
  Calculator,
  Truck,
  ScanLine,
  Trash2,
  Boxes,
  MapPin,
  QrCode,
  ShieldCheck,
  BarChart3,
  Settings,
  History,
  Bell,
  UsersRound,
  Laptop,
  ChevronRight,
  ChevronLeft,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { AssetModuleId, AssetRole } from '../../types/assets';
import { ASSET_ROLE_LABELS } from '../../hooks/useAssetPermission';
import {
  AssetDashboardModule,
  AssetRegisterModule,
  AssetCategoriesModule,
  AssetProcurementModule,
  AssetVendorsContractsModule,
  AssetAllocationReturnModule,
  EmployeeAssetRequestsModule,
  LifecycleAssetIntegrationModule,
  AssetMaintenanceRepairsModule,
} from './AssetCoreAndProcurementModules';
import {
  WarrantyAmcInsuranceModule,
  SoftwareLicensesModule,
  DepreciationFinancialsModule,
  AssetTransferModule,
  PhysicalAuditVerificationModule,
  LostDamagedDisposalModule,
  ConsumablesStockModule,
  LocationsCostCentersModule,
} from './AssetLifecycleAndFinancialModules';
import {
  QrBarcodeRfidModule,
  AssetApprovalsWorkflowModule,
  AssetReportsAnalyticsModule,
  AssetSettingsAutomationModule,
  AssetAuditLogsModule,
  AssetNotificationsModule,
  AssetManagerPortalModule,
  EmployeeAssetPortalModule,
} from './AssetGovernanceAndPortalsModules';

export interface AssetModuleMeta {
  id: AssetModuleId;
  number: number;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

export const ASSET_MODULES_REGISTRY: AssetModuleMeta[] = [
  {
    id: 'dashboard',
    number: 1,
    label: '1. Asset Dashboard',
    subtitle: 'Inventory KPIs, book value, SLA breaches & utilization',
    icon: Gauge,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'register',
    number: 2,
    label: '2. Asset Register (Inventory)',
    subtitle: 'Auto-tag inventory, bulk CSV import & Asset 360° profile',
    icon: Package,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'categories',
    number: 3,
    label: '3. Categories & Custom Fields',
    subtitle: 'Tag rules, SLM/WDV depreciation mapping & eligibility',
    icon: Layers,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'procurement',
    number: 4,
    label: '4. Procurement (PR, PO, GRN)',
    subtitle: 'Purchase requisitions, quotes, GRN & auto-asset creation',
    icon: ShoppingCart,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'vendors',
    number: 5,
    label: '5. Vendors & Contracts',
    subtitle: 'Vendor master, AMC terms, SLA compliance & scorecards',
    icon: Building2,
    iconBg: 'bg-violet-50 dark:bg-violet-950/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'allocation',
    number: 6,
    label: '6. Asset Allocation & Return',
    subtitle: 'E-sign handover, accessory bundling & Payroll recovery',
    icon: ArrowLeftRight,
    iconBg: 'bg-pink-50 dark:bg-pink-950/60',
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'requests',
    number: 7,
    label: '7. Asset Requests (Self-Service)',
    subtitle: 'New/replacement/upgrade requests & auto-stock allocation',
    icon: ClipboardPlus,
    iconBg: 'bg-orange-50 dark:bg-orange-950/60',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'lifecycle-integration',
    number: 8,
    label: '8. Onboarding & Offboarding',
    subtitle: 'Joiner kits, exit return checklist, No-Dues PDF & F&F',
    icon: UserCheck,
    iconBg: 'bg-teal-50 dark:bg-teal-950/60',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'maintenance',
    number: 9,
    label: '9. Maintenance & Repairs',
    subtitle: 'Preventive schedules, breakdown tickets & Repair/Replace',
    icon: Wrench,
    iconBg: 'bg-sky-50 dark:bg-sky-950/60',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'warranty',
    number: 10,
    label: '10. Warranty, AMC & Insurance',
    subtitle: '60/30/7-day expiry alerts, renewal workflow & claims',
    icon: ShieldAlert,
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'licenses',
    number: 11,
    label: '11. Software Licenses',
    subtitle: 'Seat compliance, assign/revoke, unused alerts & SSO sync',
    icon: KeyRound,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'depreciation',
    number: 12,
    label: '12. Depreciation & Financials',
    subtitle: 'SLM/WDV schedules, book value, month-end run & GL CSV',
    icon: Calculator,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'transfers',
    number: 13,
    label: '13. Asset Transfer',
    subtitle: 'Employee/location/entity transfers & dual acknowledgement',
    icon: Truck,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'physical-audit',
    number: 14,
    label: '14. Audit & Physical Verification',
    subtitle: 'Audit campaigns, mobile QR/Barcode scan & reconciliation',
    icon: ScanLine,
    iconBg: 'bg-violet-50 dark:bg-violet-950/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'loss-disposal',
    number: 15,
    label: '15. Lost, Damaged & Disposal',
    subtitle: 'FIR incident report, scrap/buyback & data-wipe certificate',
    icon: Trash2,
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'consumables',
    number: 16,
    label: '16. Consumables & Stock',
    subtitle: 'Stock ledger, issue/receive, reorder thresholds & alerts',
    icon: Boxes,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'locations',
    number: 17,
    label: '17. Locations & Cost Centers',
    subtitle: 'Entity → Site → Building → Floor → Room & seating links',
    icon: MapPin,
    iconBg: 'bg-teal-50 dark:bg-teal-950/60',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'qr-barcode',
    number: 18,
    label: '18. QR / Barcode / RFID',
    subtitle: 'Thermal label designer, bulk print & scan-to-verify',
    icon: QrCode,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'approvals',
    number: 19,
    label: '19. Approvals Workflow',
    subtitle: 'Multi-level PO, exception, transfer & write-off inbox',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'reports',
    number: 20,
    label: '20. Reports & Analytics',
    subtitle: '16 standard fixed-asset, custody & compliance reports',
    icon: BarChart3,
    iconBg: 'bg-sky-50 dark:bg-sky-950/60',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'settings',
    number: 21,
    label: '21. Settings & Automation',
    subtitle: 'Tag format, SLAs, 12 automation rules & 8 integrations',
    icon: Settings,
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'audit-logs',
    number: 22,
    label: '22. Audit Logs',
    subtitle: 'Immutable custody, financial & serial reveal history',
    icon: History,
    iconBg: 'bg-violet-50 dark:bg-violet-950/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'notifications',
    number: 23,
    label: '23. Notifications',
    subtitle: 'Allocation, return due, warranty & low-stock alerts',
    icon: Bell,
    iconBg: 'bg-orange-50 dark:bg-orange-950/60',
    iconColor: 'text-orange-500 dark:text-orange-400',
  },
  {
    id: 'manager-portal',
    number: 24,
    label: '24. Manager Portal',
    subtitle: 'Team allocated assets, requests & reportees clearance',
    icon: UsersRound,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'employee-portal',
    number: 25,
    label: '25. Employee Portal (My Assets)',
    subtitle: 'My assets, e-sign acknowledgement, licenses & self-audit',
    icon: Laptop,
    iconBg: 'bg-teal-50 dark:bg-teal-950/60',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
];

const ASSET_DIRECTORY_GROUPS: AssetModuleMeta[][] = [
  ASSET_MODULES_REGISTRY.slice(0, 5),
  ASSET_MODULES_REGISTRY.slice(5, 10),
  ASSET_MODULES_REGISTRY.slice(10, 15),
  ASSET_MODULES_REGISTRY.slice(15, 20),
  ASSET_MODULES_REGISTRY.slice(20, 25),
];

export interface AssetWorkspaceShellProps {
  initialModule?: AssetModuleId;
  embedded?: boolean;
  startInDirectory?: boolean;
}

export function AssetWorkspaceShell({
  initialModule = 'dashboard',
  embedded = false,
  startInDirectory = false,
}: AssetWorkspaceShellProps) {
  const [activeModule, setActiveModule] =
    useState<AssetModuleId>(initialModule);
  const [viewMode, setViewMode] = useState<'directory' | 'module'>(
    startInDirectory ? 'directory' : 'module'
  );
  const [role, setRole] = useState<AssetRole>('asset_admin');
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const activeMeta =
    ASSET_MODULES_REGISTRY.find((m) => m.id === activeModule) ??
    ASSET_MODULES_REGISTRY[0];

  const handleSelectModule = (id: AssetModuleId) => {
    setActiveModule(id);
    setViewMode('module');
  };

  return (
    <div
      className={
        embedded
          ? viewMode === 'directory'
            ? 'w-full p-0 m-0'
            : 'space-y-3 p-4'
          : 'min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
      }
    >
      <div
        className={
          embedded
            ? viewMode === 'directory'
              ? 'w-full p-0 m-0'
              : 'space-y-3'
            : viewMode === 'directory'
              ? 'mx-auto max-w-[440px] min-h-screen bg-white dark:bg-zinc-900 border-x border-slate-200/80 dark:border-slate-800/80 shadow-xl p-0 m-0'
              : 'mx-auto max-w-[440px] min-h-screen bg-slate-50/90 dark:bg-slate-950 border-x border-slate-200/80 dark:border-slate-800/80 shadow-xl px-3.5 py-4 space-y-3.5'
        }
      >
        {/* Toast Notification */}
        {toast && (
          <div className="rounded-xl bg-slate-900 dark:bg-indigo-600 text-white px-3.5 py-2.5 text-xs font-semibold shadow-md flex items-center justify-between">
            <span>{toast}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-[10px] underline opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Directory View: Single Continuous List */}
        {viewMode === 'directory' ? (
          <div className="w-full bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800/70">
            {ASSET_MODULES_REGISTRY.map((mod) => {
              const isSelected = mod.id === activeModule;
              return (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => handleSelectModule(mod.id)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3.5 text-left transition cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-100 dark:bg-zinc-800/60'
                      : 'hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-semibold text-zinc-950 dark:text-white leading-snug truncate">
                      {mod.label}
                    </p>
                    <p className="text-[12px] font-normal text-zinc-500 dark:text-zinc-400 leading-snug truncate mt-0.5">
                      {mod.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          /* Active Module Workspace */
          <div className="space-y-3.5">
            <div className="rounded-xl px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-start gap-2.5">
              <button
                type="button"
                onClick={() => setViewMode('directory')}
                className="h-9 px-3 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer hover:bg-zinc-200/70 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>All Asset Modules</span>
              </button>
            </div>
            {activeModule === 'dashboard' && (
              <AssetDashboardModule
                role={role}
                notify={notify}
                onNavigateModule={handleSelectModule}
              />
            )}
            {activeModule === 'register' && (
              <AssetRegisterModule role={role} notify={notify} />
            )}
            {activeModule === 'categories' && (
              <AssetCategoriesModule role={role} notify={notify} />
            )}
            {activeModule === 'procurement' && (
              <AssetProcurementModule role={role} notify={notify} />
            )}
            {activeModule === 'vendors' && (
              <AssetVendorsContractsModule role={role} notify={notify} />
            )}
            {activeModule === 'allocation' && (
              <AssetAllocationReturnModule role={role} notify={notify} />
            )}
            {activeModule === 'requests' && (
              <EmployeeAssetRequestsModule role={role} notify={notify} />
            )}
            {activeModule === 'lifecycle-integration' && (
              <LifecycleAssetIntegrationModule role={role} notify={notify} />
            )}
            {activeModule === 'maintenance' && (
              <AssetMaintenanceRepairsModule role={role} notify={notify} />
            )}
            {activeModule === 'warranty' && (
              <WarrantyAmcInsuranceModule role={role} notify={notify} />
            )}
            {activeModule === 'licenses' && (
              <SoftwareLicensesModule role={role} notify={notify} />
            )}
            {activeModule === 'depreciation' && (
              <DepreciationFinancialsModule role={role} notify={notify} />
            )}
            {activeModule === 'transfers' && (
              <AssetTransferModule role={role} notify={notify} />
            )}
            {activeModule === 'physical-audit' && (
              <PhysicalAuditVerificationModule role={role} notify={notify} />
            )}
            {activeModule === 'loss-disposal' && (
              <LostDamagedDisposalModule role={role} notify={notify} />
            )}
            {activeModule === 'consumables' && (
              <ConsumablesStockModule role={role} notify={notify} />
            )}
            {activeModule === 'locations' && (
              <LocationsCostCentersModule role={role} notify={notify} />
            )}
            {activeModule === 'qr-barcode' && (
              <QrBarcodeRfidModule role={role} notify={notify} />
            )}
            {activeModule === 'approvals' && (
              <AssetApprovalsWorkflowModule role={role} notify={notify} />
            )}
            {activeModule === 'reports' && (
              <AssetReportsAnalyticsModule role={role} notify={notify} />
            )}
            {activeModule === 'settings' && (
              <AssetSettingsAutomationModule role={role} notify={notify} />
            )}
            {activeModule === 'audit-logs' && (
              <AssetAuditLogsModule role={role} notify={notify} />
            )}
            {activeModule === 'notifications' && (
              <AssetNotificationsModule role={role} notify={notify} />
            )}
            {activeModule === 'manager-portal' && (
              <AssetManagerPortalModule role={role} notify={notify} />
            )}
            {activeModule === 'employee-portal' && (
              <EmployeeAssetPortalModule role={role} notify={notify} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
