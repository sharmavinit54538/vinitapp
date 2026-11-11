'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  FileSignature,
  Car,
  Truck,
  DoorOpen,
  PackageCheck,
  HeartPulse,
  Siren,
  Plus,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import {
  WatchlistRecord,
  VisitorDocumentNdaRecord,
  VehicleParkingRecord,
  ContractorDeliveryRecord,
  AreaAccessZoneRecord,
  MaterialGatePassRecord,
  HealthSafetyDeclarationRecord,
  EmergencyEvacuationStatusResponse,
} from '../../types/visitors';
import {
  visitorWatchlistApi,
  visitorDocumentsNdaApi,
  visitorVehiclesParkingApi,
  visitorContractorsDeliveriesApi,
  visitorAreaAccessApi,
  visitorMaterialGatePassApi,
  visitorHealthSafetyApi,
  visitorEvacuationApi,
} from '../../services/visitors';
import {
  VisitorApiError,
  maskSensitivePii,
} from '../../services/visitors/client';
import { useVisitorPermission } from '../../hooks/useVisitorPermission';
import {
  VisitorSkeletonBlock,
  VisitorPermissionDeniedState,
  VisitorErrorState,
  VisitorEmptyState,
  VisitorModal,
} from './VisitorPrimitives';
import { VisitorModuleProps } from './VisitorCoreAndCheckInModules';

// ============================================================================
// 9. WATCHLIST, BLACKLIST & SCREENING MODULE
// ============================================================================
export function WatchlistBlacklistScreeningModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('watchlist', activeRole);
  const [items, setItems] = useState<WatchlistRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [personFullName, setPersonFullName] = useState<string>('');
  const [idOrPhoneIdentifier, setIdOrPhoneIdentifier] = useState<string>('');
  const [severityType, setSeverityType] = useState<
    'Blacklisted' | 'SecurityWatch' | 'RestrictedVendor'
  >('Blacklisted');
  const [reason, setReason] = useState<string>('');
  const [scopeLocation, setScopeLocation] = useState<string>('');
  const [validUntil, setValidUntil] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadWatchlist = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorWatchlistApi.listWatchlist();
      setItems(res.items);
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error('Failed to load watchlist')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadWatchlist();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadWatchlist]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Adding watchlist record...');
    try {
      await visitorWatchlistApi.addWatchlistEntry({
        personFullName,
        idOrPhoneIdentifier,
        severityType,
        reason,
        scopeLocation,
        validUntil,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadWatchlist();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Add failed');
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="9. Watchlist, Blacklist & Screening"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            9. Watchlist, Blacklist & Automated Security Screening
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Screen pre-registrations & walk-ins against security blacklists with supervisor override audit
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Watchlist Entry</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadWatchlist()}
          actionLabel={perm.canCreate ? 'Add Watchlist Entry' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : items.length === 0 ? (
        <VisitorEmptyState
          icon={ShieldAlert}
          title="No Active Watchlist or Blacklist Entries"
          description="Add restricted individuals or barred vendors to trigger real-time screening alerts at reception and kiosks."
          actionLabel={perm.canCreate ? 'Add Watchlist Entry' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((w) => (
            <div
              key={w.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {w.personFullName} ({w.maskedIdentifier}) — {w.severityType}
                </p>
                <p className="text-xs text-slate-500">
                  Reason: {w.reason} • Scope: {w.scopeLocation} • Hits:{' '}
                  {w.hitCount}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <VisitorModal
        open={modalOpen}
        title="Add Security Watchlist / Blacklist Entry"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleAdd} className="space-y-3">
          <input
            required
            value={personFullName}
            onChange={(e) => setPersonFullName(e.target.value)}
            placeholder="Full Name"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <input
            required
            value={idOrPhoneIdentifier}
            onChange={(e) => setIdOrPhoneIdentifier(e.target.value)}
            placeholder="ID Document Number or Phone Identifier"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <select
            value={severityType}
            onChange={(e) =>
              setSeverityType(
                e.target.value as
                  | 'Blacklisted'
                  | 'SecurityWatch'
                  | 'RestrictedVendor'
              )
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="Blacklisted">Blacklisted — Deny Entry</option>
            <option value="SecurityWatch">
              Security Watch — Require Supervisor Approval
            </option>
            <option value="RestrictedVendor">Restricted Vendor</option>
          </select>
          <input
            required
            value={scopeLocation}
            onChange={(e) => setScopeLocation(e.target.value)}
            placeholder="Scope (All Sites or Specific Location Code)"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <input
            required
            type="date"
            value={validUntil}
            onChange={(e) => setValidUntil(e.target.value)}
            aria-label="Valid until date"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <textarea
            required
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Security incident reference / reason"
            rows={2}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
          >
            Save Watchlist Record
          </button>
        </form>
      </VisitorModal>
    </div>
  );
}

// ============================================================================
// 10. DOCUMENT, ID CAPTURE & NDA / E-SIGN MODULE (WITH AUDITED PII REVEAL)
// ============================================================================
export function DocumentsIdNdaModule({ activeRole }: VisitorModuleProps) {
  const perm = useVisitorPermission('documents-nda', activeRole);
  const [records, setRecords] = useState<VisitorDocumentNdaRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);
  const [revealedMap, setRevealedMap] = useState<
    Record<string, { unmaskedIdNumber: string; unmaskedPhone: string }>
  >({});

  const loadRecords = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorDocumentsNdaApi.listDocumentsNda();
      setRecords(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load visitor ID & NDA vault')
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

  const handleRevealPii = async (id: string) => {
    try {
      const res = await visitorDocumentsNdaApi.revealMaskedPii(
        id,
        'Authorized security compliance audit'
      );
      setRevealedMap((prev) => ({ ...prev, [id]: res }));
    } catch {
      // Handled by API
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="10. Document, ID Capture & NDA / E-Sign"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            10. Document, ID Capture & NDA E-Sign Vault (DPDP / GDPR Masked)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Sensitive ID numbers and phones are masked by default (`••••••`) with audited reveal permission
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadRecords()}
          className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Refresh Vault
        </button>
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState error={error} onRetry={() => void loadRecords()} />
      ) : records.length === 0 ? (
        <VisitorEmptyState
          icon={FileSignature}
          title="No Visitor ID or NDA Documents Stored"
          description="Captured government IDs and e-signed NDAs appear here with DPDP/GDPR masking and scheduled retention purge dates."
          actionLabel="Refresh Vault"
          onAction={() => void loadRecords()}
        />
      ) : (
        <div className="space-y-2.5">
          {records.map((rec) => {
            const revealed = revealedMap[rec.id];
            return (
              <div
                key={rec.id}
                className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
              >
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">
                    {rec.visitorName} ({rec.visitorPassCode}) — NDA:{' '}
                    {rec.ndaSignedStatus}
                  </p>
                  <p className="text-xs text-slate-500">
                    {rec.idType}:{' '}
                    {revealed
                      ? revealed.unmaskedIdNumber
                      : maskSensitivePii(rec.maskedIdNumber)}{' '}
                    • Phone:{' '}
                    {revealed
                      ? revealed.unmaskedPhone
                      : maskSensitivePii(rec.maskedPhone)}{' '}
                    • Auto-Purge: {rec.retentionPurgeDate}
                  </p>
                </div>
                {perm.canRevealPii && !revealed ? (
                  <button
                    type="button"
                    onClick={() => void handleRevealPii(rec.id)}
                    className="h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Reveal PII (Audited)</span>
                  </button>
                ) : null}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 11. VEHICLE & PARKING MANAGEMENT MODULE
// ============================================================================
export function VehicleParkingManagementModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('vehicles-parking', activeRole);
  const [vehicles, setVehicles] = useState<VehicleParkingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [vehiclePlateNumber, setVehiclePlateNumber] = useState<string>('');
  const [vehicleType, setVehicleType] = useState<
    'Car' | 'TwoWheeler' | 'DeliveryVan' | 'HeavyTruck'
  >('Car');
  const [driverName, setDriverName] = useState<string>('');
  const [allocatedSlotCode, setAllocatedSlotCode] = useState<string>('');
  const [visitorPassCode, setVisitorPassCode] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadVehicles = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorVehiclesParkingApi.listVehicles();
      setVehicles(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load vehicle & parking logs')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadVehicles();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadVehicles]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Allocating parking bay...');
    try {
      await visitorVehiclesParkingApi.registerVehicle({
        vehiclePlateNumber,
        vehicleType,
        driverName,
        allocatedSlotCode,
        visitorPassCode,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadVehicles();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Allocation failed');
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="11. Vehicle & Parking Management"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            11. Vehicle Entry, ANPR & Visitor Parking Slots
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            License plate logging, ANPR camera verification, bay allocation & parking overstay tracking
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Vehicle & Parking Bay</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadVehicles()}
          actionLabel={
            perm.canCreate ? 'Log Vehicle & Parking Bay' : undefined
          }
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : vehicles.length === 0 ? (
        <VisitorEmptyState
          icon={Car}
          title="No Visitor Vehicles Logged"
          description="Log visitor vehicles, allocate parking bays, and monitor ANPRboom-barrier entry/exit timestamps."
          actionLabel={
            perm.canCreate ? 'Log Vehicle & Parking Bay' : undefined
          }
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {vehicles.map((v) => (
            <div
              key={v.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {v.vehiclePlateNumber} ({v.vehicleType}) — Bay{' '}
                  {v.allocatedSlotCode}
                </p>
                <p className="text-xs text-slate-500">
                  Driver: {v.driverName} • ANPR:{' '}
                  {v.anprVerified ? 'Verified' : 'Manual'} • {v.parkingStatus}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <VisitorModal
        open={modalOpen}
        title="Register Visitor Vehicle & Allocate Parking Slot"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleRegister} className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              value={vehiclePlateNumber}
              onChange={(e) => setVehiclePlateNumber(e.target.value)}
              placeholder="License Plate Number"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <select
              value={vehicleType}
              onChange={(e) =>
                setVehicleType(
                  e.target.value as
                    | 'Car'
                    | 'TwoWheeler'
                    | 'DeliveryVan'
                    | 'HeavyTruck'
                )
              }
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="Car">Passenger Car</option>
              <option value="TwoWheeler">Two-Wheeler</option>
              <option value="DeliveryVan">Delivery Van</option>
              <option value="HeavyTruck">Heavy Logistics Truck</option>
            </select>
          </div>
          <input
            required
            value={driverName}
            onChange={(e) => setDriverName(e.target.value)}
            placeholder="Driver Name"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              value={allocatedSlotCode}
              onChange={(e) => setAllocatedSlotCode(e.target.value)}
              placeholder="Parking Bay Code"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              value={visitorPassCode}
              onChange={(e) => setVisitorPassCode(e.target.value)}
              placeholder="Linked Visitor Pass Code"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Allocate Parking Slot
          </button>
        </form>
      </VisitorModal>
    </div>
  );
}

// ============================================================================
// 12. CONTRACTOR / VENDOR / DELIVERY MANAGEMENT MODULE
// ============================================================================
export function ContractorVendorDeliveryModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('contractors-deliveries', activeRole);
  const [records, setRecords] = useState<ContractorDeliveryRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [recordCategory, setRecordCategory] = useState<
    'ContractorWorkPermit' | 'VendorVisit' | 'CourierDelivery'
  >('ContractorWorkPermit');
  const [vendorOrCourierCompany, setVendorOrCourierCompany] =
    useState<string>('');
  const [contactOrWorkerName, setContactOrWorkerName] = useState<string>('');
  const [workPermitOrAwbCode, setWorkPermitOrAwbCode] = useState<string>('');
  const [recipientEmployeeName, setRecipientEmployeeName] =
    useState<string>('');
  const [insuranceAndSafetyValid, setInsuranceAndSafetyValid] =
    useState<boolean>(true);
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadRecords = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorContractorsDeliveriesApi.listRecords();
      setRecords(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load contractor & delivery logs')
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Saving contractor / delivery log...');
    try {
      await visitorContractorsDeliveriesApi.createRecord({
        recordCategory,
        vendorOrCourierCompany,
        contactOrWorkerName,
        workPermitOrAwbCode,
        insuranceAndSafetyValid,
        recipientEmployeeName,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadRecords();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Save failed');
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="12. Contractor / Vendor / Delivery Management"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            12. Contractor Work Permits, Vendors & Courier Deliveries
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Verify contractor insurance/safety permits, issue long-term passes & log parcel handover
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Contractor / Delivery</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadRecords()}
          actionLabel={
            perm.canCreate ? 'Log Contractor / Delivery' : undefined
          }
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : records.length === 0 ? (
        <VisitorEmptyState
          icon={Truck}
          title="No Contractor Permits or Deliveries Logged"
          description="Track contractor safety compliance, vendor work permits, and incoming courier parcels."
          actionLabel={
            perm.canCreate ? 'Log Contractor / Delivery' : undefined
          }
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {records.map((r) => (
            <div
              key={r.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  [{r.recordCategory}] {r.vendorOrCourierCompany} —{' '}
                  {r.contactOrWorkerName}
                </p>
                <p className="text-xs text-slate-500">
                  Permit/AWB: {r.workPermitOrAwbCode} • Recipient:{' '}
                  {r.recipientEmployeeName} • {r.handoverStatus}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <VisitorModal
        open={modalOpen}
        title="Log Contractor Work Permit or Courier Delivery"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <select
            value={recordCategory}
            onChange={(e) =>
              setRecordCategory(
                e.target.value as
                  | 'ContractorWorkPermit'
                  | 'VendorVisit'
                  | 'CourierDelivery'
              )
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="ContractorWorkPermit">Contractor Work Permit</option>
            <option value="VendorVisit">Vendor Service Visit</option>
            <option value="CourierDelivery">Courier / Parcel Delivery</option>
          </select>
          <input
            required
            value={vendorOrCourierCompany}
            onChange={(e) => setVendorOrCourierCompany(e.target.value)}
            placeholder="Vendor or Courier Company"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              value={contactOrWorkerName}
              onChange={(e) => setContactOrWorkerName(e.target.value)}
              placeholder="Worker / Courier Name"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              value={workPermitOrAwbCode}
              onChange={(e) => setWorkPermitOrAwbCode(e.target.value)}
              placeholder="Work Permit / AWB Number"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <input
            required
            value={recipientEmployeeName}
            onChange={(e) => setRecipientEmployeeName(e.target.value)}
            placeholder="Internal Host / Recipient Employee"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <label className="inline-flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={insuranceAndSafetyValid}
              onChange={(e) => setInsuranceAndSafetyValid(e.target.checked)}
            />
            <span>Insurance, License & Safety Induction Verified</span>
          </label>
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Save Record
          </button>
        </form>
      </VisitorModal>
    </div>
  );
}

// ============================================================================
// 13. MEETING ROOM & AREA ACCESS CONTROL MODULE
// ============================================================================
export function MeetingRoomAreaAccessModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('area-access', activeRole);
  const [zones, setZones] = useState<AreaAccessZoneRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);

  const loadZones = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorAreaAccessApi.listZones();
      setZones(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load area access zones')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadZones();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadZones]);

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="13. Meeting Room & Area Access Control"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            13. Meeting Room Linkage, Zones & Turnstile Access Control
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Lobby, office floor, R&D lab & server room access windows, mandatory escort rules & live occupancy
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadZones()}
          className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Refresh Zones
        </button>
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState error={error} onRetry={() => void loadZones()} />
      ) : zones.length === 0 ? (
        <VisitorEmptyState
          icon={DoorOpen}
          title="No Access Control Zones Returned"
          description="Configure lobby turnstiles, restricted server rooms, and meeting room bindings."
          actionLabel="Refresh Zones"
          onAction={() => void loadZones()}
        />
      ) : (
        <div className="space-y-2.5">
          {zones.map((z) => (
            <div
              key={z.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {z.zoneName} ({z.zoneCode}) — {z.securityLevel}
                </p>
                <p className="text-xs text-slate-500">
                  Occupancy: {z.liveOccupancyCount} • Escort Required:{' '}
                  {z.escortRequired ? 'Yes' : 'No'} • Turnstile:{' '}
                  {z.turnstileStatus}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 14. ASSET / MATERIAL GATE PASS MODULE
// ============================================================================
export function AssetMaterialGatePassModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('material-gate-pass', activeRole);
  const [passes, setPasses] = useState<MaterialGatePassRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [movementDirection, setMovementDirection] = useState<
    'Inward' | 'Outward'
  >('Inward');
  const [returnableType, setReturnableType] = useState<
    'Returnable' | 'NonReturnable'
  >('Returnable');
  const [itemDescription, setItemDescription] = useState<string>('');
  const [serialNumber, setSerialNumber] = useState<string>('');
  const [carriedByVisitorName, setCarriedByVisitorName] = useState<string>('');
  const [expectedReturnDate, setExpectedReturnDate] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  const loadGatePasses = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorMaterialGatePassApi.listGatePasses();
      setPasses(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load material gate passes')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadGatePasses();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadGatePasses]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus('Issuing material gate pass...');
    try {
      await visitorMaterialGatePassApi.createGatePass({
        movementDirection,
        returnableType,
        itemDescription,
        serialNumber,
        carriedByVisitorName,
        expectedReturnDate: expectedReturnDate || undefined,
      });
      setModalOpen(false);
      setSubmitStatus('');
      await loadGatePasses();
    } catch (err) {
      setSubmitStatus(err instanceof Error ? err.message : 'Issue failed');
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="14. Asset / Material Gate Pass"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            14. Inward / Outward Asset & Material Gate Pass
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Declare laptops, tools & equipment, serial numbers, returnable/non-returnable status & gate verification
          </p>
        </div>
        {perm.canCreate ? (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Issue Material Gate Pass</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadGatePasses()}
          actionLabel={perm.canCreate ? 'Issue Material Gate Pass' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : passes.length === 0 ? (
        <VisitorEmptyState
          icon={PackageCheck}
          title="No Material Gate Passes Logged"
          description="Record visitor laptops, test equipment, or returnable vendor tools at the security gate."
          actionLabel={perm.canCreate ? 'Issue Material Gate Pass' : undefined}
          onAction={perm.canCreate ? () => setModalOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-2.5">
          {passes.map((gp) => (
            <div
              key={gp.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {gp.gatePassCode} [{gp.movementDirection} •{' '}
                  {gp.returnableType}] — {gp.itemDescription}
                </p>
                <p className="text-xs text-slate-500">
                  Serial: {gp.serialNumber} • Carried by:{' '}
                  {gp.carriedByVisitorName} • {gp.status}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <VisitorModal
        open={modalOpen}
        title="Issue Inward / Outward Material Gate Pass"
        onClose={() => setModalOpen(false)}
      >
        <form onSubmit={handleCreate} className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <select
              value={movementDirection}
              onChange={(e) =>
                setMovementDirection(e.target.value as 'Inward' | 'Outward')
              }
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="Inward">Inward Material Entry</option>
              <option value="Outward">Outward Material Exit</option>
            </select>
            <select
              value={returnableType}
              onChange={(e) =>
                setReturnableType(
                  e.target.value as 'Returnable' | 'NonReturnable'
                )
              }
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <option value="Returnable">Returnable (RGP)</option>
              <option value="NonReturnable">Non-Returnable (NRGP)</option>
            </select>
          </div>
          <input
            required
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
            placeholder="Asset / Equipment / Tool Description"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              required
              value={serialNumber}
              onChange={(e) => setSerialNumber(e.target.value)}
              placeholder="Serial / Asset Tag Number"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
            <input
              required
              value={carriedByVisitorName}
              onChange={(e) => setCarriedByVisitorName(e.target.value)}
              placeholder="Carried By Visitor Name"
              className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
            />
          </div>
          <input
            type="date"
            value={expectedReturnDate}
            onChange={(e) => setExpectedReturnDate(e.target.value)}
            aria-label="Expected return date"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          {submitStatus ? (
            <p className="text-xs text-rose-600">{submitStatus}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold"
          >
            Issue Gate Pass
          </button>
        </form>
      </VisitorModal>
    </div>
  );
}

// ============================================================================
// 15. HEALTH, SAFETY & COMPLIANCE DECLARATIONS MODULE
// ============================================================================
export function HealthSafetyComplianceModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('health-safety', activeRole);
  const [declarations, setDeclarations] = useState<
    HealthSafetyDeclarationRecord[]
  >([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);

  const loadDeclarations = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorHealthSafetyApi.listDeclarations();
      setDeclarations(res.items);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load health & safety declarations')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDeclarations();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadDeclarations]);

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="15. Health, Safety & Compliance Declarations"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            15. EHS Safety Induction, PPE Checklist & Health Declarations
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Safety video completion, mandatory PPE verification & restricted-area entry compliance
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadDeclarations()}
          className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
        >
          Refresh Logs
        </button>
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadDeclarations()}
        />
      ) : declarations.length === 0 ? (
        <VisitorEmptyState
          icon={HeartPulse}
          title="No Health & Safety Declarations Logged"
          description="Visitor safety induction acknowledgements and PPE compliance checks appear here."
          actionLabel="Refresh Declarations"
          onAction={() => void loadDeclarations()}
        />
      ) : (
        <div className="space-y-2.5">
          {declarations.map((d) => (
            <div
              key={d.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {d.visitorName} ({d.visitorPassCode}) — {d.complianceStatus}
                </p>
                <p className="text-xs text-slate-500">
                  Safety Induction:{' '}
                  {d.safetyInductionVideoCompleted ? 'Done' : 'Pending'} • PPE:{' '}
                  {d.ppeChecklistVerified ? 'Verified' : 'N/A'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 16. EMERGENCY & EVACUATION (LIVE ROLL-CALL) MODULE
// ============================================================================
export function EmergencyEvacuationRollCallModule({
  activeRole,
}: VisitorModuleProps) {
  const perm = useVisitorPermission('evacuation', activeRole);
  const [rollCall, setRollCall] =
    useState<EmergencyEvacuationStatusResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<VisitorApiError | Error | null>(null);
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [mode, setMode] = useState<'Emergency' | 'Drill' | 'StandDown'>(
    'Drill'
  );
  const [assemblyPoint, setAssemblyPoint] = useState<string>('ASSEMBLY-NORTH');
  const [confirmationNote, setConfirmationNote] = useState<string>('');
  const [triggerMsg, setTriggerMsg] = useState<string>('');

  const loadRollCall = useCallback(async () => {
    if (!perm.canView) return;
    setLoading(true);
    setError(null);
    try {
      const res = await visitorEvacuationApi.getRollCall();
      setRollCall(res);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error('Failed to load emergency evacuation roll-call')
      );
    } finally {
      setLoading(false);
    }
  }, [perm.canView]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadRollCall();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadRollCall]);

  const handleTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    setTriggerMsg('Broadcasting evacuation mode...');
    try {
      const res = await visitorEvacuationApi.triggerMode({
        mode,
        assemblyPoint,
        confirmationNote,
      });
      setRollCall(res);
      setConfirmOpen(false);
      setTriggerMsg('');
    } catch (err) {
      setTriggerMsg(err instanceof Error ? err.message : 'Trigger failed');
    }
  };

  if (!perm.canView) {
    return (
      <VisitorPermissionDeniedState
        moduleName="16. Emergency & Evacuation (Live Roll-Call)"
        role={activeRole}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-rose-200/80 dark:border-rose-900/60 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            16. Emergency Evacuation & Live Muster Roll-Call
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time list of visitors, contractors & hosts inside by zone, assembly point check-in & drill mode
          </p>
        </div>
        {perm.canTriggerEmergency ? (
          <button
            type="button"
            onClick={() => setConfirmOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold inline-flex items-center gap-1.5"
          >
            <Siren className="w-3.5 h-3.5" />
            <span>Trigger Emergency / Drill</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <VisitorSkeletonBlock rows={4} />
      ) : error ? (
        <VisitorErrorState
          error={error}
          onRetry={() => void loadRollCall()}
          actionLabel={
            perm.canTriggerEmergency ? 'Trigger Emergency / Drill' : undefined
          }
          onAction={
            perm.canTriggerEmergency ? () => setConfirmOpen(true) : undefined
          }
        />
      ) : !rollCall ? (
        <VisitorEmptyState
          icon={Siren}
          title="No Active Evacuation Roll-Call Data"
          description="Monitor live zone occupancy and mark visitors safe at assembly points during drills or emergencies."
          actionLabel="Refresh Roll-Call"
          onAction={() => void loadRollCall()}
        />
      ) : (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <p className="text-xs text-slate-500">Total Inside</p>
              <p className="text-lg font-extrabold text-slate-900 dark:text-white">
                {rollCall.totalInsideCount}
              </p>
            </div>
            <div className="rounded-2xl p-4 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200">
              <p className="text-xs text-emerald-700">Safe at Assembly</p>
              <p className="text-lg font-extrabold text-emerald-700">
                {rollCall.safeCount}
              </p>
            </div>
            <div className="rounded-2xl p-4 bg-rose-50/70 dark:bg-rose-950/30 border border-rose-200">
              <p className="text-xs text-rose-700">Missing / Unaccounted</p>
              <p className="text-lg font-extrabold text-rose-700">
                {rollCall.missingCount}
              </p>
            </div>
          </div>

          {rollCall.rollCallList.map((person) => (
            <div
              key={person.id}
              className="rounded-2xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3"
            >
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  {person.fullName} ({person.personCategory})
                </p>
                <p className="text-xs text-slate-500">
                  Last Zone: {person.lastKnownZone} • {person.status}
                </p>
              </div>
              <button
                type="button"
                onClick={() =>
                  void visitorEvacuationApi
                    .markSafe({
                      personId: person.id,
                      assemblyPoint: person.assemblyPoint,
                    })
                    .then(() => loadRollCall())
                }
                className="h-8 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold inline-flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Mark Safe</span>
              </button>
            </div>
          ))}
        </div>
      )}

      <VisitorModal
        open={confirmOpen}
        title="Confirm Emergency / Evacuation Drill Mode"
        onClose={() => setConfirmOpen(false)}
      >
        <form onSubmit={handleTrigger} className="space-y-3">
          <select
            value={mode}
            onChange={(e) =>
              setMode(e.target.value as 'Emergency' | 'Drill' | 'StandDown')
            }
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          >
            <option value="Drill">Evacuation Drill Mode</option>
            <option value="Emergency">Live Emergency Evacuation</option>
            <option value="StandDown">All-Clear / Stand Down</option>
          </select>
          <input
            required
            value={assemblyPoint}
            onChange={(e) => setAssemblyPoint(e.target.value)}
            placeholder="Primary Muster Assembly Point"
            className="w-full h-10 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          <textarea
            required
            value={confirmationNote}
            onChange={(e) => setConfirmationNote(e.target.value)}
            placeholder="Authorization & broadcast instructions"
            rows={2}
            className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
          />
          {triggerMsg ? (
            <p className="text-xs text-rose-600">{triggerMsg}</p>
          ) : null}
          <button
            type="submit"
            className="w-full h-10 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
          >
            Confirm & Broadcast Roll-Call Alert
          </button>
        </form>
      </VisitorModal>
    </div>
  );
}
