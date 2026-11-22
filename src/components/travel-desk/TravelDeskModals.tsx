'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileCheck2,
  FileText,
  Hotel,
  MapPin,
  Plane,
  Receipt,
  Send,
  Shield,
  Train,
  Upload,
  User,
  X,
} from 'lucide-react';
import {
  BookingRecord,
  ExpenseCategory,
  ExpenseClaimRecord,
  TravelDeskSettings,
  TravelMode,
  TravelPurpose,
  TravelRequestRecord,
} from '../../types/travelDesk';
import { checkPolicyViolation, validateTravelRequestForm } from '../../services/travel-desk/travelDeskEngine';

interface CreateTravelRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Partial<TravelRequestRecord>) => void;
  settings?: TravelDeskSettings;
  defaultEmployee?: {
    id: string;
    name: string;
    department: string;
    designation: string;
    manager: string;
  };
}

export function CreateTravelRequestModal({
  isOpen,
  onClose,
  onSubmit,
  settings,
  defaultEmployee = {
    id: 'EMP-1001',
    name: 'Aarav Sharma',
    department: 'Engineering',
    designation: 'Principal Product Engineer',
    manager: 'Vikramaditya Nair',
  },
}: CreateTravelRequestModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Travel Information
  const [tripType, setTripType] = useState<'domestic' | 'international'>('domestic');
  const [purpose, setPurpose] = useState<TravelPurpose>('Client Meeting');
  const [sourceCity, setSourceCity] = useState('Bengaluru');
  const [destinationCity, setDestinationCity] = useState('');
  const [departureDate, setDepartureDate] = useState('2026-11-24');
  const [returnDate, setReturnDate] = useState('2026-11-26');

  // Step 2: Travel Preferences
  const [travelMode, setTravelMode] = useState<TravelMode>('flight');
  const [travelClass, setTravelClass] = useState('Economy');
  const [hotelRequired, setHotelRequired] = useState(true);
  const [accommodationType, setAccommodationType] = useState('4-Star Business Hotel');

  // Step 3: Employee & Budget Details
  const [costCenter, setCostCenter] = useState('CC-ENG-FINTECH');
  const [estimatedBudget, setEstimatedBudget] = useState(25000);
  const [emergencyContact, setEmergencyContact] = useState('+91 98765 43210 (Pooja Sharma)');

  // Step 4: Documents & Confirmation
  const [notes, setNotes] = useState('');
  const [attachedDocName, setAttachedDocName] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleNextStep1 = () => {
    if (!sourceCity.trim() || !destinationCity.trim()) {
      setErrorMsg('Please specify both departure and destination cities.');
      return;
    }
    if (sourceCity.toLowerCase().trim() === destinationCity.toLowerCase().trim()) {
      setErrorMsg('Source and destination cities cannot be the same.');
      return;
    }
    if (departureDate > returnDate) {
      setErrorMsg('Return date cannot be earlier than departure date.');
      return;
    }
    setErrorMsg(null);
    setStep(2);
  };

  const handleNextStep2 = () => {
    setErrorMsg(null);
    setStep(3);
  };

  const handleNextStep3 = () => {
    if (estimatedBudget <= 0) {
      setErrorMsg('Estimated budget must be greater than zero.');
      return;
    }
    if (!emergencyContact.trim()) {
      setErrorMsg('Emergency contact is required.');
      return;
    }
    setErrorMsg(null);
    setStep(4);
  };

  const handleSubmit = (asDraft = false) => {
    const validation = validateTravelRequestForm({
      sourceCity,
      destinationCity,
      departureDate,
      returnDate,
      purpose,
      estimatedBudget,
      emergencyContact,
    });
    if (!validation.valid && !asDraft) {
      setErrorMsg(validation.error || 'Please fill required fields.');
      return;
    }

    const policy = checkPolicyViolation(tripType, estimatedBudget, {
      autoApprovalThreshold: 10000,
      executiveApprovalThreshold: 100000,
      maxAdvanceDaysBooking: 90,
      requireReceiptOverAmount: 500,
      allowSelfBooking: false,
      perDiemDomestic: 1500,
      perDiemInternational: 5500,
      emergencyTravelHotline: '+91 80 4567 8999',
    });

    onSubmit({
      employeeId: defaultEmployee.id,
      employeeName: defaultEmployee.name,
      department: defaultEmployee.department,
      designation: defaultEmployee.designation,
      reportingManager: defaultEmployee.manager,
      tripType,
      purpose,
      sourceCity,
      destinationCity,
      departureDate,
      returnDate,
      travelMode,
      travelClass: travelClass as any,
      hotelRequired,
      accommodationType,
      projectCostCenter: costCenter,
      estimatedBudget,
      emergencyContact,
      notes,
      status: asDraft ? 'draft' : 'pending_manager',
      policyViolation: policy.violation,
      policyViolationReason: policy.reason,
      attachments: attachedDocName
        ? [
            {
              id: 'ATT-' + Date.now(),
              name: attachedDocName,
              sizeFormatted: '480 KB',
              type: 'application/pdf',
              category: 'ticket',
            },
          ]
        : [],
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800 px-5 py-3.5 bg-slate-50/70 dark:bg-slate-900">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              New Travel Request
            </h2>
            <p className="text-[11px] text-slate-500">
              Step {step} of 4 · {step === 1 ? 'Trip Information' : step === 2 ? 'Preferences' : step === 3 ? 'Budget & Approver' : 'Confirmation'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full bg-indigo-600 transition-all"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
          {errorMsg && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 dark:bg-rose-950/50 p-3 text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Trip Type *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTripType('domestic')}
                    className={`rounded-xl border p-2.5 font-bold text-center ${
                      tripType === 'domestic'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600'
                    }`}
                  >
                    Domestic Trip
                  </button>
                  <button
                    type="button"
                    onClick={() => setTripType('international')}
                    className={`rounded-xl border p-2.5 font-bold text-center ${
                      tripType === 'international'
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        : 'border-slate-200 dark:border-slate-800 text-slate-600'
                    }`}
                  >
                    International Trip
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Travel Purpose *
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value as TravelPurpose)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Client Meeting">Client Meeting</option>
                  <option value="Conference / Seminar">Conference / Seminar</option>
                  <option value="Project Deployment">Project Deployment</option>
                  <option value="Internal Review">Internal Review</option>
                  <option value="Sales Pitch">Sales Pitch</option>
                  <option value="Training">Training</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Departure City *
                  </label>
                  <input
                    type="text"
                    value={sourceCity}
                    onChange={(e) => setSourceCity(e.target.value)}
                    placeholder="e.g. Bengaluru"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Destination City *
                  </label>
                  <input
                    type="text"
                    value={destinationCity}
                    onChange={(e) => setDestinationCity(e.target.value)}
                    placeholder="e.g. Mumbai, Singapore"
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Departure Date *
                  </label>
                  <input
                    type="date"
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Return Date *
                  </label>
                  <input
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-3.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Travel Mode
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'flight', label: 'Flight', icon: Plane },
                    { id: 'train', label: 'Train', icon: Train },
                    { id: 'bus', label: 'Bus', icon: MapPin },
                    { id: 'cab', label: 'Cab', icon: MapPin },
                  ].map((m) => {
                    const IconComponent = m.icon;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setTravelMode(m.id as TravelMode)}
                        className={`rounded-xl border p-2.5 flex flex-col items-center gap-1 text-center font-bold ${
                          travelMode === m.id
                            ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : 'border-slate-200 dark:border-slate-800 text-slate-600'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        <span className="text-[11px]">{m.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Preferred Travel Class
                </label>
                <select
                  value={travelClass}
                  onChange={(e) => setTravelClass(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                >
                  <option value="Economy">Economy</option>
                  <option value="Premium Economy">Premium Economy</option>
                  <option value="Business">Business (Requires L7+ or Approval)</option>
                  <option value="AC 1st Class">AC 1st Class (Train)</option>
                  <option value="AC 2-Tier">AC 2-Tier (Train)</option>
                  <option value="Sedan">Sedan (Cab)</option>
                </select>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-3 space-y-2">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    Hotel Accommodation Required?
                  </span>
                  <input
                    type="checkbox"
                    checked={hotelRequired}
                    onChange={(e) => setHotelRequired(e.target.checked)}
                    className="rounded text-indigo-600 h-4 w-4"
                  />
                </label>
                {hotelRequired && (
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">
                      Accommodation Preferences
                    </label>
                    <input
                      type="text"
                      value={accommodationType}
                      onChange={(e) => setAccommodationType(e.target.value)}
                      placeholder="e.g. Near client office, 4-star corporate rate"
                      className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3.5">
              <div className="rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3">
                <div className="text-[11px] text-slate-400">Employee Details</div>
                <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                  {defaultEmployee.name} ({defaultEmployee.id})
                </div>
                <div className="text-slate-500 text-[11px]">
                  {defaultEmployee.designation} · {defaultEmployee.department}
                </div>
                <div className="text-indigo-600 dark:text-indigo-400 text-[11px] mt-1 font-semibold">
                  Reporting Manager: {defaultEmployee.manager}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Project / Cost Center *
                </label>
                <input
                  type="text"
                  value={costCenter}
                  onChange={(e) => setCostCenter(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estimated Total Travel Budget (INR) *
                </label>
                <input
                  type="number"
                  value={estimatedBudget}
                  onChange={(e) => setEstimatedBudget(Number(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white font-bold tabular-nums"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Includes tickets, hotel, and local transit. Threshold over ₹80,000 flags policy audit.
                </span>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Emergency Contact Details *
                </label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="e.g. +91 98765 43210 (Name - Relationship)"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-3.5">
              <div className="rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/20 p-3.5 space-y-2">
                <div className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center justify-between">
                  <span>Trip Summary Review</span>
                  <span className="rounded bg-indigo-600 px-2 py-0.5 text-[10px] text-white font-semibold">
                    {tripType.toUpperCase()}
                  </span>
                </div>
                <div className="text-slate-700 dark:text-slate-300 text-xs">
                  <strong>{sourceCity}</strong> → <strong>{destinationCity}</strong>
                </div>
                <div className="text-[11px] text-slate-500">
                  {departureDate} to {returnDate} · {travelMode.toUpperCase()} ({travelClass})
                </div>
                <div className="text-[11px] text-slate-700 dark:text-slate-300 font-semibold">
                  Budget: ₹{estimatedBudget.toLocaleString()} · Cost Center: {costCenter}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Attach Supporting Documents (Agenda / Client Invite)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAttachedDocName('Client_Meeting_Brief_Agenda.pdf')}
                    className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                  >
                    <Upload className="inline h-3.5 w-3.5 mr-1 text-indigo-600" />
                    Attach Sample Agenda PDF
                  </button>
                  {attachedDocName && (
                    <span className="text-[11px] font-semibold text-emerald-600">
                      ✓ {attachedDocName}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Additional Notes / Special Instructions
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Preferred morning flight, early hotel check-in needed"
                  className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-slate-200/80 dark:border-slate-800 px-5 py-3.5 bg-slate-50/70 dark:bg-slate-900">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep((s) => (s - 1) as any)}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100"
            >
              ← Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            {step === 4 && (
              <button
                type="button"
                onClick={() => handleSubmit(true)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100"
              >
                Save Draft
              </button>
            )}

            {step < 4 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 1) handleNextStep1();
                  else if (step === 2) handleNextStep2();
                  else if (step === 3) handleNextStep3();
                }}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-700"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => handleSubmit(false)}
                className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700"
              >
                Submit Travel Request
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Expense Claim Submission Modal
interface SubmitExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (claim: Partial<ExpenseClaimRecord>) => void;
  activeTrips: TravelRequestRecord[];
}

export function SubmitExpenseModal({
  isOpen,
  onClose,
  onSubmit,
  activeTrips,
}: SubmitExpenseModalProps) {
  const [selectedTripId, setSelectedTripId] = useState(activeTrips[0]?.id || 'TRV-2026-001');
  const [category, setCategory] = useState<ExpenseCategory>('Meals');
  const [amount, setAmount] = useState<number>(1500);
  const [expenseDate, setExpenseDate] = useState('2026-11-15');
  const [description, setDescription] = useState('');
  const [receiptName, setReceiptName] = useState('Receipt_Scan_Nov2026.pdf');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trip = activeTrips.find((t) => t.id === selectedTripId) || activeTrips[0];
    onSubmit({
      travelRequestId: trip?.id || 'TRV-2026-001',
      employeeName: trip?.employeeName || 'Aarav Sharma',
      employeeId: trip?.employeeId || 'EMP-1001',
      category,
      amount,
      expenseDate,
      description: description || `${category} expense during ${trip?.destinationCity || 'Mumbai'} business trip`,
      receiptName,
      approvalStatus: 'Submitted',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Submit Travel Expense Claim
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Associated Travel Trip
            </label>
            <select
              value={selectedTripId}
              onChange={(e) => setSelectedTripId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
            >
              {activeTrips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} · {t.destinationCity} ({t.departureDate})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
              >
                <option value="Flight">Flight</option>
                <option value="Train">Train</option>
                <option value="Hotel">Hotel</option>
                <option value="Meals">Meals</option>
                <option value="Cab">Cab</option>
                <option value="Fuel">Fuel</option>
                <option value="Parking">Parking</option>
                <option value="Miscellaneous">Miscellaneous</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Amount (INR) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value) || 0)}
                required
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs font-bold tabular-nums"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Expense Date
            </label>
            <input
              type="date"
              value={expenseDate}
              onChange={(e) => setExpenseDate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Description / Business Reason
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Client dinner with VP Engineering"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
              Receipt Attachment (Required for over ₹500)
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={receiptName}
                onChange={(e) => setReceiptName(e.target.value)}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
              />
              <button
                type="button"
                onClick={() => setReceiptName(`Receipt_${category}_${Date.now()}.pdf`)}
                className="rounded-xl border border-slate-200 dark:border-slate-700 px-2.5 py-2 text-xs font-semibold"
              >
                Attach
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
            >
              Submit Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Approval Review Modal (Approve / Reject / Send Back)
interface ApprovalReviewModalProps {
  request: TravelRequestRecord | null;
  onClose: () => void;
  onAction: (
    requestId: string,
    action: 'approve' | 'reject' | 'send_back',
    comments: string
  ) => void;
  actorRole: string;
}

export function ApprovalReviewModal({
  request,
  onClose,
  onAction,
  actorRole,
}: ApprovalReviewModalProps) {
  const [comments, setComments] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  if (!request) return null;

  const handleExecute = (action: 'approve' | 'reject' | 'send_back') => {
    if ((action === 'reject' || action === 'send_back') && !comments.trim()) {
      setActionError('Comments are mandatory when rejecting or sending back a request.');
      return;
    }
    setActionError(null);
    onAction(request.id, action, comments.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Travel Approval Review ({actorRole})
            </h3>
            <p className="text-[11px] text-slate-500 font-mono">{request.id}</p>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Request Details */}
        <div className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
            <span>{request.employeeName} ({request.employeeId})</span>
            <span className="text-indigo-600 dark:text-indigo-400 tabular-nums">
              ₹{request.estimatedBudget.toLocaleString()}
            </span>
          </div>
          <div className="text-slate-600 dark:text-slate-300">
            {request.designation} · {request.department}
          </div>
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-700/60 text-slate-700 dark:text-slate-300">
            <strong>{request.sourceCity}</strong> to <strong>{request.destinationCity}</strong> ({request.departureDate} - {request.returnDate})
          </div>
          <div className="text-[11px] text-slate-500">
            Purpose: {request.purpose} · Mode: {request.travelMode} ({request.travelClass})
          </div>
          {request.notes && (
            <div className="text-[11px] text-slate-500 italic">
              &ldquo;{request.notes}&rdquo;
            </div>
          )}
        </div>

        {request.policyViolation && (
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/40 p-3 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <strong>Policy Alert:</strong> {request.policyViolationReason}
            </div>
          </div>
        )}

        {/* Approval Timeline */}
        <div>
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            Approval Timeline
          </div>
          <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1 text-xs">
            {request.approvalHistory.map((h, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-[11px]">
                <span>
                  <strong>{h.actor}</strong> ({h.role}): {h.action}
                  {h.comments ? ` - "${h.comments}"` : ''}
                </span>
                <span className="text-slate-400 tabular-nums">{h.timestamp}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Comments input */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Reviewer Comments & Sign-off Notes
          </label>
          <textarea
            rows={2}
            value={comments}
            onChange={(e) => {
              setComments(e.target.value);
              setActionError(null);
            }}
            placeholder="Add approval remarks or specific correction guidance..."
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2 text-xs"
          />
        </div>

        {actionError && (
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
            {actionError}
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => handleExecute('send_back')}
            className="rounded-xl border border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 px-3 py-1.5 text-xs font-semibold hover:bg-amber-100"
          >
            Send Back for Correction
          </button>
          <button
            type="button"
            onClick={() => handleExecute('reject')}
            className="rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 px-3 py-1.5 text-xs font-semibold hover:bg-rose-100"
          >
            Reject Request
          </button>
          <button
            type="button"
            onClick={() => handleExecute('approve')}
            className="rounded-xl bg-emerald-600 text-white px-4 py-1.5 text-xs font-bold hover:bg-emerald-700"
          >
            Approve Request
          </button>
        </div>
      </div>
    </div>
  );
}

// Document Preview / Ticket Download Modal
interface DocumentPreviewModalProps {
  attachment: { name: string; sizeFormatted: string; type: string } | null;
  onClose: () => void;
  onSimulateDownload?: (name: string) => void;
}

export function DocumentPreviewModal({
  attachment,
  onClose,
  onSimulateDownload,
}: DocumentPreviewModalProps) {
  if (!attachment) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
              {attachment.name}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Document Canvas Preview */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 text-xs font-mono text-slate-300 space-y-2">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 text-[10px] text-slate-500">
            <span>OFC360 VERIFIED TRAVEL DOCUMENT</span>
            <span>{attachment.sizeFormatted}</span>
          </div>
          <p className="text-slate-200 leading-relaxed">
            Corporate Travel Desk E-Ticket / Voucher confirmed by OFC360 Technologies Pvt. Ltd.
            Flight / Hotel itinerary and tax invoice attached.
          </p>
          <div className="pt-2 border-t border-slate-800 text-[10px] text-emerald-400 font-bold">
            STATUS: ACTIVE / VERIFIED
          </div>
        </div>

        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-3.5 py-1.5 text-xs font-semibold"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              if (onSimulateDownload) {
                onSimulateDownload(attachment.name);
              }
              onClose();
            }}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-indigo-700"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
