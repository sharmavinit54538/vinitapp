'use client';

import React, { useState } from 'react';
import {
  Gauge,
  CalendarPlus,
  UserPlus,
  Tablet,
  QrCode,
  UserCheck,
  BellRing,
  Sliders,
  ShieldAlert,
  FileSignature,
  Car,
  Truck,
  DoorOpen,
  PackageCheck,
  HeartPulse,
  Siren,
  Megaphone,
  CheckSquare,
  BarChart3,
  Settings,
  ShieldCheck,
  Bell,
  Briefcase,
  Globe,
  ChevronRight,
  ArrowLeft,
  Grid,
} from 'lucide-react';
import { VisitorModuleId, VisitorRole } from '../../types/visitors';
import {
  VISITOR_ROLE_LABELS,
  canVisitorRoleAccessModule,
} from '../../hooks/useVisitorPermission';
import {
  VisitorDashboardModule,
  PreRegistrationInvitationsModule,
  WalkInRegistrationModule,
  SelfCheckInKioskModule,
  VisitorQrPassManagementModule,
  ReceptionCheckInDeskModule,
  HostNotificationApprovalModule,
  VisitorTypesPurposeMasterModule,
} from './VisitorCoreAndCheckInModules';
import {
  WatchlistBlacklistScreeningModule,
  DocumentsIdNdaModule,
  VehicleParkingManagementModule,
  ContractorVendorDeliveryModule,
  MeetingRoomAreaAccessModule,
  AssetMaterialGatePassModule,
  HealthSafetyComplianceModule,
  EmergencyEvacuationRollCallModule,
} from './VisitorSecurityAndOperationsModules';
import {
  VisitorCommunicationsModule,
  VisitorApprovalsWorkflowModule,
  VisitorReportsAnalyticsModule,
  VisitorSettingsAutomationModule,
  VisitorAuditLogsModule,
  VisitorNotificationsModule,
  HostEmployeePortalModule,
  VisitorPublicPortalModule,
} from './VisitorGovernanceAndPortalsModules';

export interface VisitorModuleMeta {
  id: VisitorModuleId;
  number: number;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

export const VISITOR_MODULES_REGISTRY: VisitorModuleMeta[] = [
  {
    id: 'dashboard',
    number: 1,
    label: '1. Visitor Dashboard (Live Status)',
    subtitle: 'Who is inside, expected today, overstays & occupancy',
    icon: Gauge,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'pre-registration',
    number: 2,
    label: '2. Pre-Registration / Invitations',
    subtitle: 'Host invites, bulk CSV upload, recurring & QR passes',
    icon: CalendarPlus,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'walk-in',
    number: 3,
    label: '3. Visitor Registration (Walk-in)',
    subtitle: 'Photo capture, ID OCR confidence & returning check-in',
    icon: UserPlus,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'kiosk',
    number: 4,
    label: '4. Self Check-in Kiosk Mode',
    subtitle: 'Touch terminal, QR/OTP verify, lockdown & badge print',
    icon: Tablet,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'passes',
    number: 5,
    label: '5. Visitor QR / Pass Management',
    subtitle: 'Digital QR pass, gate scan verify, reprint & revoke',
    icon: QrCode,
    iconBg: 'bg-violet-50 dark:bg-violet-950/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'reception-desk',
    number: 6,
    label: '6. Check-in & Check-out (Reception Desk)',
    subtitle: 'One-click check-in/out, forced check-out & badge return',
    icon: UserCheck,
    iconBg: 'bg-cyan-50 dark:bg-cyan-950/60',
    iconColor: 'text-cyan-600 dark:text-cyan-400',
  },
  {
    id: 'host-approvals',
    number: 7,
    label: '7. Host Notification & Approval',
    subtitle: 'Arrival alerts, accept/decline/reschedule & escalation',
    icon: BellRing,
    iconBg: 'bg-pink-50 dark:bg-pink-950/60',
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'visitor-types',
    number: 8,
    label: '8. Visitor Types & Purpose Master',
    subtitle: 'Guest, Candidate, Vendor, Contractor, VIP & badge rules',
    icon: Sliders,
    iconBg: 'bg-teal-50 dark:bg-teal-950/60',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'watchlist',
    number: 9,
    label: '9. Watchlist, Blacklist & Screening',
    subtitle: 'Automated security screening, match alerts & overrides',
    icon: ShieldAlert,
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'documents-nda',
    number: 10,
    label: '10. Document, ID Capture & NDA / E-Sign',
    subtitle: 'DPDP/GDPR masked IDs, audited PII reveal & NDA vault',
    icon: FileSignature,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'vehicles-parking',
    number: 11,
    label: '11. Vehicle & Parking Management',
    subtitle: 'License plate entry, ANPR verification & bay allocation',
    icon: Car,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'contractors-deliveries',
    number: 12,
    label: '12. Contractor / Vendor / Delivery',
    subtitle: 'Work permits, safety validity & courier parcel handover',
    icon: Truck,
    iconBg: 'bg-orange-50 dark:bg-orange-950/60',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'area-access',
    number: 13,
    label: '13. Meeting Room & Area Access Control',
    subtitle: 'Zone access windows, mandatory escorts & turnstiles',
    icon: DoorOpen,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'material-gate-pass',
    number: 14,
    label: '14. Asset / Material Gate Pass',
    subtitle: 'Inward/outward RGP/NRGP declarations & serial verify',
    icon: PackageCheck,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'health-safety',
    number: 15,
    label: '15. Health, Safety & Compliance',
    subtitle: 'Safety induction video, PPE checklist & EHS clearance',
    icon: HeartPulse,
    iconBg: 'bg-rose-50 dark:bg-rose-950/60',
    iconColor: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'evacuation',
    number: 16,
    label: '16. Emergency & Evacuation (Live Roll-Call)',
    subtitle: 'One-click emergency/drill mode & assembly point muster',
    icon: Siren,
    iconBg: 'bg-rose-100 dark:bg-rose-950/80',
    iconColor: 'text-rose-700 dark:text-rose-300',
  },
  {
    id: 'communications',
    number: 17,
    label: '17. Visitor Communication & Notifications',
    subtitle: 'Invite passes, arrival alerts & post-visit feedback',
    icon: Megaphone,
    iconBg: 'bg-purple-50 dark:bg-purple-950/60',
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'approvals',
    number: 18,
    label: '18. Approvals Workflow',
    subtitle: 'Restricted areas, blacklist overrides & gate passes',
    icon: CheckSquare,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'reports',
    number: 19,
    label: '19. Reports & Analytics',
    subtitle: '15 footfall, watchlist, gate pass & compliance reports',
    icon: BarChart3,
    iconBg: 'bg-sky-50 dark:bg-sky-950/60',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'settings',
    number: 20,
    label: '20. Settings & Automation Rules',
    subtitle: 'DPDP/GDPR privacy, 14 automations & 8 integrations',
    icon: Settings,
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'audit-logs',
    number: 21,
    label: '21. Audit Logs',
    subtitle: 'Immutable log of PII reveals, overrides & kiosk actions',
    icon: ShieldCheck,
    iconBg: 'bg-violet-50 dark:bg-violet-950/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'notifications',
    number: 22,
    label: '22. Notifications',
    subtitle: 'In-app reception alerts for arrivals & overstays',
    icon: Bell,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'host-portal',
    number: 23,
    label: '23. Host / Employee Portal',
    subtitle: 'My invites, today’s guests, arrival approvals & passes',
    icon: Briefcase,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'visitor-portal',
    number: 24,
    label: '24. Visitor Portal (Public Pre-Registration)',
    subtitle: 'Secure token pre-registration, NDA e-sign & QR pass',
    icon: Globe,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
];

const DIRECTORY_GROUPS: VisitorModuleMeta[][] = [
  VISITOR_MODULES_REGISTRY.slice(0, 6),
  VISITOR_MODULES_REGISTRY.slice(6, 12),
  VISITOR_MODULES_REGISTRY.slice(12, 18),
  VISITOR_MODULES_REGISTRY.slice(18, 24),
];

export interface VisitorWorkspaceShellProps {
  initialModule?: VisitorModuleId;
  embedded?: boolean;
  startInDirectory?: boolean;
}

export function VisitorWorkspaceShell({
  initialModule = 'dashboard',
  embedded = false,
  startInDirectory = false,
}: VisitorWorkspaceShellProps) {
  const [activeModule, setActiveModule] =
    useState<VisitorModuleId>(initialModule);
  const [showDirectory, setShowDirectory] =
    useState<boolean>(startInDirectory);
  const [activeRole, setActiveRole] = useState<VisitorRole>('super_admin');

  const currentMeta =
    VISITOR_MODULES_REGISTRY.find((m) => m.id === activeModule) ||
    VISITOR_MODULES_REGISTRY[0];

  const handleSelectModule = (moduleId: VisitorModuleId) => {
    setActiveModule(moduleId);
    setShowDirectory(false);
  };

  const renderActiveModule = () => {
    const props = {
      activeRole,
      onNavigateModule: handleSelectModule,
    };

    switch (activeModule) {
      case 'dashboard':
        return <VisitorDashboardModule {...props} />;
      case 'pre-registration':
        return <PreRegistrationInvitationsModule {...props} />;
      case 'walk-in':
        return <WalkInRegistrationModule {...props} />;
      case 'kiosk':
        return <SelfCheckInKioskModule {...props} />;
      case 'passes':
        return <VisitorQrPassManagementModule {...props} />;
      case 'reception-desk':
        return <ReceptionCheckInDeskModule {...props} />;
      case 'host-approvals':
        return <HostNotificationApprovalModule {...props} />;
      case 'visitor-types':
        return <VisitorTypesPurposeMasterModule {...props} />;
      case 'watchlist':
        return <WatchlistBlacklistScreeningModule {...props} />;
      case 'documents-nda':
        return <DocumentsIdNdaModule {...props} />;
      case 'vehicles-parking':
        return <VehicleParkingManagementModule {...props} />;
      case 'contractors-deliveries':
        return <ContractorVendorDeliveryModule {...props} />;
      case 'area-access':
        return <MeetingRoomAreaAccessModule {...props} />;
      case 'material-gate-pass':
        return <AssetMaterialGatePassModule {...props} />;
      case 'health-safety':
        return <HealthSafetyComplianceModule {...props} />;
      case 'evacuation':
        return <EmergencyEvacuationRollCallModule {...props} />;
      case 'communications':
        return <VisitorCommunicationsModule {...props} />;
      case 'approvals':
        return <VisitorApprovalsWorkflowModule {...props} />;
      case 'reports':
        return <VisitorReportsAnalyticsModule {...props} />;
      case 'settings':
        return <VisitorSettingsAutomationModule {...props} />;
      case 'audit-logs':
        return <VisitorAuditLogsModule {...props} />;
      case 'notifications':
        return <VisitorNotificationsModule {...props} />;
      case 'host-portal':
        return <HostEmployeePortalModule {...props} />;
      case 'visitor-portal':
        return <VisitorPublicPortalModule {...props} />;
      default:
        return <VisitorDashboardModule {...props} />;
    }
  };

  return (
    <div
      className={
        embedded
          ? 'space-y-4 pb-8'
          : 'max-w-5xl mx-auto px-3 sm:px-5 py-4 space-y-4 pb-20'
      }
    >
      {/* Top Header & RBAC Role Switcher */}
      <div className="rounded-3xl p-4 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {!showDirectory ? (
            <button
              type="button"
              onClick={() => setShowDirectory(true)}
              aria-label="Back to 24 Visitor Modules Directory"
              className="w-9 h-9 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center hover:bg-indigo-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          ) : null}
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400">
                Visitor Management • 24 Modules
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-0.5">
              {showDirectory
                ? 'Enterprise Visitor, Security & Gate Pass Suite'
                : currentMeta.label}
            </h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDirectory((prev) => !prev)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 inline-flex items-center gap-1.5"
          >
            <Grid className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>{showDirectory ? 'Open Active Module' : 'All 24 Modules'}</span>
          </button>

          <select
            aria-label="Switch Visitor RBAC Role"
            value={activeRole}
            onChange={(e) => setActiveRole(e.target.value as VisitorRole)}
            className="h-9 px-3 rounded-xl bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs font-bold text-indigo-700 dark:text-indigo-300"
          >
            {(Object.keys(VISITOR_ROLE_LABELS) as VisitorRole[]).map((role) => (
              <option key={role} value={role}>
                Role: {VISITOR_ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 24-Module Vertical Grouped Directory (6 + 6 + 6 + 6 = 24) */}
      {showDirectory ? (
        <div className="space-y-3.5">
          {DIRECTORY_GROUPS.map((group, groupIdx) => (
            <div
              key={groupIdx}
              className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs divide-y divide-slate-100 dark:divide-slate-800/80 overflow-hidden"
            >
              {group.map((mod) => {
                const IconComp = mod.icon;
                const hasAccess = canVisitorRoleAccessModule(
                  activeRole,
                  mod.id
                );
                return (
                  <button
                    key={mod.id}
                    type="button"
                    onClick={() => handleSelectModule(mod.id)}
                    className="w-full px-4 py-3.5 flex items-center justify-between gap-3 text-left hover:bg-slate-50/90 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`w-11 h-11 rounded-2xl ${mod.iconBg} ${mod.iconColor} flex items-center justify-center shrink-0`}
                      >
                        <IconComp className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {mod.label}
                          </p>
                          {!hasAccess ? (
                            <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold uppercase bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300">
                              Restricted
                            </span>
                          ) : null}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {mod.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-indigo-50/80 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      ) : (
        renderActiveModule()
      )}
    </div>
  );
}
