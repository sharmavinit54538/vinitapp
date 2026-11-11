'use client';

import React, { useState } from 'react';
import { toast, Toaster } from 'sonner';
import {
  BellRing,
  Building2,
  CalendarClock,
  Camera,
  CheckCircle2,
  GitBranch,
  Globe,
  KeyRound,
  Plus,
  RefreshCw,
  Stamp,
  Trash2,
  Upload,
  User,
} from 'lucide-react';
import { Button, Input, Label } from '@/src/components/ui';

export type SettingsTabId = 'company' | 'my_profile' | 'leave';

export interface LeaveTypeConfig {
  id: string;
  name: string;
  code: string;
  annualDays: number;
  maxDays: number;
  isPaid: boolean;
}

const INITIAL_LEAVE_TYPES: LeaveTypeConfig[] = [
  {
    id: 'lt-1',
    name: 'Annual / Privilege Leave',
    code: 'EL',
    annualDays: 18,
    maxDays: 10,
    isPaid: true,
  },
  {
    id: 'lt-2',
    name: 'Casual Leave',
    code: 'CL',
    annualDays: 12,
    maxDays: 3,
    isPaid: true,
  },
  {
    id: 'lt-3',
    name: 'Sick / Medical Leave',
    code: 'SL',
    annualDays: 10,
    maxDays: 5,
    isPaid: true,
  },
  {
    id: 'lt-4',
    name: 'Loss of Pay (Unpaid)',
    code: 'LOP',
    annualDays: 30,
    maxDays: 15,
    isPaid: false,
  },
];

export interface SettingsWorkspaceShellProps {
  initialTab?: SettingsTabId;
  onSuccessToast?: (msg: string) => void;
}

export function SettingsWorkspaceShell({
  initialTab = 'company',
  onSuccessToast,
}: SettingsWorkspaceShellProps) {
  const [activeTab, setActiveTab] = useState<SettingsTabId>(initialTab);

  // 1. COMPANY STATE
  const [companyName, setCompanyName] = useState(
    'OFC360 Technologies Pvt. Ltd.'
  );
  const [logoDataUrl, setLogoDataUrl] = useState<string>('');
  const [stampDataUrl, setStampDataUrl] = useState<string>('');
  const [streetAddress, setStreetAddress] = useState(
    'Tower B, 9th Floor, Outer Ring Road, Bellandur'
  );
  const [city, setCity] = useState('Bengaluru');
  const [stateName, setStateName] = useState('Karnataka');
  const [country, setCountry] = useState('India');
  const [pincode, setPincode] = useState('560103');
  const [contactEmail, setContactEmail] = useState('hr@ofc360.com');
  const [contactPhone, setContactPhone] = useState('+91 80 4567 8900');
  const [website, setWebsite] = useState('https://www.ofc360.com');
  const [timezone, setTimezone] = useState('Asia/Kolkata (IST, UTC+05:30)');
  const [currency, setCurrency] = useState('INR (₹) - Indian Rupee');
  const [fyStartMonth, setFyStartMonth] = useState('April');
  const [fyEndMonth, setFyEndMonth] = useState('March');

  // 2. MY PROFILE STATE
  const [profileName, setProfileName] = useState('Aarav Sharma');
  const [profileEmail, setProfileEmail] = useState('aarav.sharma@ofc360.com');
  const [profilePhone, setProfilePhone] = useState('+91 98201 11223');
  const [profileAvatarUrl, setProfileAvatarUrl] = useState<string>('');
  const [profileDesignation, setProfileDesignation] = useState(
    'VP People Operations'
  );
  const [profileDepartment, setProfileDepartment] =
    useState('People Operations');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // 3. LEAVE STATE
  const [leaveTypes, setLeaveTypes] =
    useState<LeaveTypeConfig[]>(INITIAL_LEAVE_TYPES);
  const [newLeaveName, setNewLeaveName] = useState('');
  const [newLeaveCode, setNewLeaveCode] = useState('');
  const [newLeaveAnnualDays, setNewLeaveAnnualDays] = useState('12');
  const [newLeaveMaxDays, setNewLeaveMaxDays] = useState('5');
  const [newLeaveIsPaid, setNewLeaveIsPaid] = useState(true);
  const [isAddingLeaveType, setIsAddingLeaveType] = useState(false);

  // Carry-Forward Rules
  const [carryForwardEnabled, setCarryForwardEnabled] = useState(true);
  const [maxCarryForwardDays, setMaxCarryForwardDays] = useState('12');
  const [carryForwardExpiry, setCarryForwardExpiry] = useState(
    'Expire after 6 months'
  );
  const [leaveEncashmentAllowed, setLeaveEncashmentAllowed] = useState(true);

  // Leave Approval Hierarchy
  const [level1Approver, setLevel1Approver] = useState('Reporting Manager');
  const [level2Approver, setLevel2Approver] = useState('Department Head');
  const [level2ThresholdDays, setLevel2ThresholdDays] = useState('3');
  const [finalHrApprover, setFinalHrApprover] = useState('HR Admin');
  const [autoEscalationHours, setAutoEscalationHours] = useState('48 hours');

  // Absence Alerts
  const [unplannedAbsenceAlert, setUnplannedAbsenceAlert] = useState(true);
  const [awolConsecutiveDays, setAwolConsecutiveDays] = useState('2');
  const [lowBalanceAlert, setLowBalanceAlert] = useState(true);
  const [lowBalanceThreshold, setLowBalanceThreshold] = useState('2');
  const [dailyAbsenceDigest, setDailyAbsenceDigest] = useState(true);

  const notifySuccess = (msg: string) => {
    toast.success(msg);
    if (onSuccessToast) {
      onSuccessToast(msg);
    }
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (dataUrl: string) => void,
    label: string
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setter(reader.result);
        notifySuccess(`${label} uploaded!`);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCompany = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error('Company Name is required.');
      return;
    }
    notifySuccess(
      `Company settings saved (${companyName.trim()} · FY ${fyStartMonth}–${fyEndMonth})`
    );
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim() || !profileEmail.trim()) {
      toast.error('Name and Email are required.');
      return;
    }
    notifySuccess('My Profile details updated!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password.');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New password and confirm password do not match.');
      return;
    }
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    notifySuccess('Password changed successfully!');
  };

  const handleAddLeaveType = () => {
    if (!newLeaveName.trim() || !newLeaveCode.trim()) {
      toast.error('Please enter leave type name and code.');
      return;
    }
    const created: LeaveTypeConfig = {
      id: `lt-${Date.now()}`,
      name: newLeaveName.trim(),
      code: newLeaveCode.trim().toUpperCase(),
      annualDays: Math.max(1, Number(newLeaveAnnualDays) || 12),
      maxDays: Math.max(1, Number(newLeaveMaxDays) || 5),
      isPaid: newLeaveIsPaid,
    };
    setLeaveTypes((prev) => [...prev, created]);
    setNewLeaveName('');
    setNewLeaveCode('');
    setNewLeaveAnnualDays('12');
    setNewLeaveMaxDays('5');
    setNewLeaveIsPaid(true);
    setIsAddingLeaveType(false);
    notifySuccess(`Leave type "${created.name} (${created.code})" added!`);
  };

  const handleDeleteLeaveType = (id: string, name: string) => {
    setLeaveTypes((prev) => prev.filter((item) => item.id !== id));
    notifySuccess(`Leave type "${name}" removed.`);
  };

  const handleToggleLeavePaid = (id: string) => {
    setLeaveTypes((prev) =>
      prev.map((lt) => (lt.id === id ? { ...lt, isPaid: !lt.isPaid } : lt))
    );
  };

  const handleUpdateLeaveDays = (
    id: string,
    field: 'annualDays' | 'maxDays',
    val: string
  ) => {
    const num = Math.max(0, Number(val) || 0);
    setLeaveTypes((prev) =>
      prev.map((lt) => (lt.id === id ? { ...lt, [field]: num } : lt))
    );
  };

  const handleSaveLeaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    notifySuccess(
      'Leave types, carry-forward rules, approval hierarchy & absence alerts saved!'
    );
  };

  return (
    <div className="space-y-4" data-testid="settings-workspace-shell">
      <Toaster position="top-right" richColors />

      {/* Section Segmented Navigation Tabs: Company | My Profile | Leave */}
      <div className="grid grid-cols-3 gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs">
        {(
          [
            { id: 'company', label: 'Company', Icon: Building2 },
            { id: 'my_profile', label: 'My Profile', Icon: User },
            { id: 'leave', label: 'Leave', Icon: CalendarClock },
          ] as const
        ).map((tab) => {
          const active = activeTab === tab.id;
          const IconComp = tab.Icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              data-testid={`settings-tab-${tab.id}`}
              className={`flex h-10 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition-all cursor-pointer ${
                active
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <IconComp className="h-4 w-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* 1. COMPANY SETTINGS SECTION                               */}
      {/* ========================================================= */}
      {activeTab === 'company' && (
        <form
          onSubmit={handleSaveCompany}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Company Profile &amp; Statutory Identity
            </h3>
            <p className="text-xs text-slate-500">
              Company name, logo, stamp/seal, address, contact details,
              timezone, currency &amp; financial year
            </p>
          </div>

          {/* Company Name */}
          <div>
            <Label htmlFor="settings-company-name" required>
              Company Name
            </Label>
            <Input
              id="settings-company-name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g., OFC360 Technologies Pvt. Ltd."
            />
          </div>

          {/* Logo & Stamp/Seal Upload Row */}
          <div className="grid grid-cols-1 gap-3">
            {/* Company Logo */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <Label>Company Logo</Label>
              <div className="mt-2 flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-indigo-600 shadow-2xs">
                  {logoDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={logoDataUrl}
                      alt="Company Logo"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Building2 className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    <Upload className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                    <span>Upload Logo</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(e, setLogoDataUrl, 'Company Logo')
                      }
                    />
                  </label>
                  <p className="mt-1 text-[11px] text-slate-500">
                    PNG / SVG (Payslips &amp; Header)
                  </p>
                </div>
              </div>
            </div>

            {/* Company Stamp / Seal */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <Label>Official Stamp / Seal</Label>
              <div className="mt-2 flex items-center gap-3.5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-white text-emerald-600 shadow-2xs">
                  {stampDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={stampDataUrl}
                      alt="Company Stamp"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <Stamp className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <label className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
                    <Upload className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span>Upload Stamp / Seal</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        handleImageUpload(
                          e,
                          setStampDataUrl,
                          'Company Stamp / Seal'
                        )
                      }
                    />
                  </label>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Used on Offer Letters &amp; Form-16
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Registered Address: Street, City, State, Country, Pincode */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold tracking-wide text-slate-700 uppercase">
              Registered Office Address
            </h4>
            <div>
              <Label htmlFor="settings-street">Street / Building Address</Label>
              <Input
                id="settings-street"
                value={streetAddress}
                onChange={(e) => setStreetAddress(e.target.value)}
                placeholder="Building, Street, Area"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="settings-city" required>
                  City
                </Label>
                <Input
                  id="settings-city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Bengaluru"
                />
              </div>
              <div>
                <Label htmlFor="settings-state" required>
                  State
                </Label>
                <Input
                  id="settings-state"
                  value={stateName}
                  onChange={(e) => setStateName(e.target.value)}
                  placeholder="Karnataka"
                />
              </div>
              <div>
                <Label htmlFor="settings-country" required>
                  Country
                </Label>
                <Input
                  id="settings-country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="India"
                />
              </div>
              <div>
                <Label htmlFor="settings-pincode" required>
                  Pincode
                </Label>
                <Input
                  id="settings-pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="560103"
                />
              </div>
            </div>
          </div>

          {/* Contact Email, Phone & Website */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <div>
              <Label htmlFor="settings-contact-email" required>
                Contact Email
              </Label>
              <Input
                id="settings-contact-email"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="hr@ofc360.com"
              />
            </div>
            <div>
              <Label htmlFor="settings-contact-phone" required>
                Contact Phone
              </Label>
              <Input
                id="settings-contact-phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 80 4567 8900"
              />
            </div>
            <div>
              <Label htmlFor="settings-website">Website</Label>
              <div className="relative">
                <Input
                  id="settings-website"
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  placeholder="https://www.ofc360.com"
                />
              </div>
            </div>
          </div>

          {/* Timezone, Default Currency & Financial Year Start/End */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <div>
              <Label htmlFor="settings-timezone">Timezone</Label>
              <select
                id="settings-timezone"
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                <option value="Asia/Kolkata (IST, UTC+05:30)">
                  Asia/Kolkata (IST, UTC+05:30)
                </option>
                <option value="UTC (Coordinated Universal Time)">
                  UTC (Coordinated Universal Time)
                </option>
                <option value="Asia/Dubai (GST, UTC+04:00)">
                  Asia/Dubai (GST, UTC+04:00)
                </option>
                <option value="Asia/Singapore (SGT, UTC+08:00)">
                  Asia/Singapore (SGT, UTC+08:00)
                </option>
                <option value="Europe/London (GMT/BST)">
                  Europe/London (GMT/BST)
                </option>
                <option value="America/New_York (EST/EDT)">
                  America/New_York (EST/EDT)
                </option>
              </select>
            </div>

            <div>
              <Label htmlFor="settings-currency">Default Currency</Label>
              <select
                id="settings-currency"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
              >
                <option value="INR (₹) - Indian Rupee">
                  INR (₹) - Indian Rupee
                </option>
                <option value="USD ($) - US Dollar">USD ($) - US Dollar</option>
                <option value="EUR (€) - Euro">EUR (€) - Euro</option>
                <option value="GBP (£) - British Pound">
                  GBP (£) - British Pound
                </option>
                <option value="AED - UAE Dirham">AED - UAE Dirham</option>
                <option value="SGD (S$) - Singapore Dollar">
                  SGD (S$) - Singapore Dollar
                </option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="settings-fy-start">Financial Year Start</Label>
                <select
                  id="settings-fy-start"
                  value={fyStartMonth}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFyStartMonth(val);
                    if (val === 'April') setFyEndMonth('March');
                    if (val === 'January') setFyEndMonth('December');
                    if (val === 'July') setFyEndMonth('June');
                    if (val === 'October') setFyEndMonth('September');
                  }}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="April">April (India Standard FY)</option>
                  <option value="January">January (Calendar Year)</option>
                  <option value="July">July</option>
                  <option value="October">October</option>
                </select>
              </div>

              <div>
                <Label htmlFor="settings-fy-end">Financial Year End</Label>
                <select
                  id="settings-fy-end"
                  value={fyEndMonth}
                  onChange={(e) => setFyEndMonth(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="March">March (April–March Cycle)</option>
                  <option value="December">December (Jan–Dec Cycle)</option>
                  <option value="June">June (July–June Cycle)</option>
                  <option value="September">September (Oct–Sep Cycle)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 pt-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500">
              <Globe className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
              Active Cycle: {fyStartMonth} – {fyEndMonth}
            </span>
            <Button type="submit" variant="primary" className="w-full sm:w-auto justify-center">
              <CheckCircle2 className="h-4 w-4" />
              Save Company Settings
            </Button>
          </div>
        </form>
      )}

      {/* ========================================================= */}
      {/* 2. MY PROFILE SETTINGS SECTION                            */}
      {/* ========================================================= */}
      {activeTab === 'my_profile' && (
        <div className="space-y-4">
          <form
            onSubmit={handleSaveProfile}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-sm font-bold text-slate-900">
                My Personal &amp; Work Profile
              </h3>
              <p className="text-xs text-slate-500">
                Update your name, email, phone, avatar, designation &amp;
                department
              </p>
            </div>

            {/* Avatar Upload */}
            <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-indigo-600 text-base font-bold text-white">
                {profileAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profileAvatarUrl}
                    alt={profileName}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  profileName
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase() || 'AS'
                )}
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-slate-900">
                  Profile Avatar
                </p>
                <p className="text-[11px] text-slate-500">
                  JPG, PNG or WebP (Displayed across approvals &amp; directory)
                </p>
                <label className="mt-1.5 inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                  <Camera className="h-3.5 w-3.5 text-indigo-600" />
                  Change Avatar
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleImageUpload(e, setProfileAvatarUrl, 'Avatar photo')
                    }
                  />
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <Label htmlFor="settings-profile-name" required>
                  Full Name
                </Label>
                <Input
                  id="settings-profile-name"
                  value={profileName}
                  onChange={(e) => setProfileName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="settings-profile-email" required>
                  Email Address
                </Label>
                <Input
                  id="settings-profile-email"
                  type="email"
                  value={profileEmail}
                  onChange={(e) => setProfileEmail(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="settings-profile-phone" required>
                  Phone Number
                </Label>
                <Input
                  id="settings-profile-phone"
                  type="tel"
                  value={profilePhone}
                  onChange={(e) => setProfilePhone(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="settings-profile-designation">
                  Designation
                </Label>
                <Input
                  id="settings-profile-designation"
                  value={profileDesignation}
                  onChange={(e) => setProfileDesignation(e.target.value)}
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="settings-profile-department">Department</Label>
                <Input
                  id="settings-profile-department"
                  value={profileDepartment}
                  onChange={(e) => setProfileDepartment(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <Button type="submit" variant="primary">
                <CheckCircle2 className="h-4 w-4" />
                Save Profile
              </Button>
            </div>
          </form>

          {/* Password Change Card */}
          <form
            onSubmit={handleChangePassword}
            className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs"
          >
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                <KeyRound className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Change Password
                </h3>
                <p className="text-xs text-slate-500">
                  Update your account password for workspace login
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="settings-curr-pwd" required>
                  Current Password
                </Label>
                <Input
                  id="settings-curr-pwd"
                  type="password"
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="settings-new-pwd" required>
                  New Password
                </Label>
                <Input
                  id="settings-new-pwd"
                  type="password"
                  placeholder="Min 6 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="settings-confirm-pwd" required>
                  Confirm Password
                </Label>
                <Input
                  id="settings-confirm-pwd"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <Button type="submit" variant="primary" className="w-full sm:w-auto justify-center">
                <KeyRound className="h-4 w-4" />
                Update Password
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. LEAVE SETTINGS SECTION                                 */}
      {/* ========================================================= */}
      {activeTab === 'leave' && (
        <form onSubmit={handleSaveLeaveSettings} className="space-y-4">
          {/* 3A. Leave Types (annual days, max days, paid ya unpaid) */}
          <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Leave Types &amp; Quotas
                </h3>
                <p className="text-xs text-slate-500">
                  Configure annual quota days, max consecutive days &amp; Paid /
                  Unpaid status
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddingLeaveType((prev) => !prev)}
                className="inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 text-xs font-bold text-white hover:bg-indigo-700 cursor-pointer self-start sm:self-auto shadow-xs active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Leave Type</span>
              </button>
            </div>

            {isAddingLeaveType && (
              <div className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-3.5">
                <p className="text-xs font-bold text-indigo-950">
                  Create New Leave Type
                </p>
                <div className="space-y-3">
                  <div>
                    <Label required>Leave Name</Label>
                    <Input
                      placeholder="e.g., Paternity Leave"
                      value={newLeaveName}
                      onChange={(e) => setNewLeaveName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <Label required>Code</Label>
                      <Input
                        placeholder="PL"
                        value={newLeaveCode}
                        onChange={(e) =>
                          setNewLeaveCode(e.target.value.toUpperCase())
                        }
                      />
                    </div>
                    <div>
                      <Label>Annual</Label>
                      <Input
                        type="number"
                        min={1}
                        value={newLeaveAnnualDays}
                        onChange={(e) => setNewLeaveAnnualDays(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Max Days</Label>
                      <Input
                        type="number"
                        min={1}
                        value={newLeaveMaxDays}
                        onChange={(e) => setNewLeaveMaxDays(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setNewLeaveIsPaid(true)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer ${
                        newLeaveIsPaid
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Paid Leave
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewLeaveIsPaid(false)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer ${
                        !newLeaveIsPaid
                          ? 'bg-amber-600 text-white'
                          : 'bg-white text-slate-600 border border-slate-200'
                      }`}
                    >
                      Unpaid Leave
                    </button>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsAddingLeaveType(false)}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      onClick={handleAddLeaveType}
                    >
                      Save Type
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Mobile Native Leave Type Cards */}
            <div className="space-y-2.5">
              {leaveTypes.map((lt) => (
                <div
                  key={lt.id}
                  className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 transition-colors hover:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-bold text-slate-900">{lt.name}</p>
                        <span className="rounded-md bg-slate-200/80 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-700">
                          {lt.code}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleLeavePaid(lt.id)}
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase cursor-pointer ${
                          lt.isPaid
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-amber-200 bg-amber-50 text-amber-700'
                        }`}
                      >
                        {lt.isPaid ? 'PAID' : 'UNPAID'}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteLeaveType(lt.id, lt.name)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-rose-500 hover:bg-rose-50 cursor-pointer"
                        title="Delete Leave Type"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-2.5 grid grid-cols-2 gap-2 border-t border-slate-200/60 pt-2.5">
                    <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 border border-slate-200 shadow-2xs">
                      <span className="text-[11px] font-medium text-slate-500">Annual Days</span>
                      <input
                        type="number"
                        min={0}
                        value={lt.annualDays}
                        onChange={(e) =>
                          handleUpdateLeaveDays(
                            lt.id,
                            'annualDays',
                            e.target.value
                          )
                        }
                        className="h-7 w-14 rounded-md border border-slate-200 px-1.5 text-right font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 border border-slate-200 shadow-2xs">
                      <span className="text-[11px] font-medium text-slate-500">Max at Once</span>
                      <input
                        type="number"
                        min={1}
                        value={lt.maxDays}
                        onChange={(e) =>
                          handleUpdateLeaveDays(
                            lt.id,
                            'maxDays',
                            e.target.value
                          )
                        }
                        className="h-7 w-14 rounded-md border border-slate-200 px-1.5 text-right font-mono text-xs font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 3B. Carry-Forward Rules */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <RefreshCw className="h-4 w-4 text-indigo-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Carry-Forward Rules
                </h3>
                <p className="text-xs text-slate-500">
                  Year-end unused leave rollover limits, expiry &amp; encashment
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:bg-slate-50 transition-colors">
                <div className="pr-3">
                  <p className="text-xs font-bold text-slate-900">
                    Allow Year-End Carry Forward
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Roll over unused Earned Leave into next FY
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={carryForwardEnabled}
                  onChange={(e) => setCarryForwardEnabled(e.target.checked)}
                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:bg-slate-50 transition-colors">
                <div className="pr-3">
                  <p className="text-xs font-bold text-slate-900">
                    Leave Encashment Allowed
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Permit payout of excess earned leave balance
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={leaveEncashmentAllowed}
                  onChange={(e) => setLeaveEncashmentAllowed(e.target.checked)}
                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600"
                />
              </label>

              <div className="pt-1 space-y-3">
                <div>
                  <Label>Max Carry-Forward Days</Label>
                  <Input
                    type="number"
                    min={0}
                    value={maxCarryForwardDays}
                    onChange={(e) => setMaxCarryForwardDays(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Carried-Forward Leave Expiry</Label>
                  <select
                    value={carryForwardExpiry}
                    onChange={(e) => setCarryForwardExpiry(e.target.value)}
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="No Expiry">No Expiry</option>
                    <option value="Expire after 3 months">
                      Expire after 3 months
                    </option>
                    <option value="Expire after 6 months">
                      Expire after 6 months
                    </option>
                    <option value="Expire at next FY end">
                      Expire at next FY end
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* 3C. Leave Approval Hierarchy */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <GitBranch className="h-4 w-4 text-indigo-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Leave Approval Hierarchy
                </h3>
                <p className="text-xs text-slate-500">
                  Multi-stage approval routing &amp; SLA escalation chain
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <Label>Level 1 Approver (Primary)</Label>
                <select
                  value={level1Approver}
                  onChange={(e) => setLevel1Approver(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="Reporting Manager">Reporting Manager</option>
                  <option value="Team Lead">Team Lead</option>
                  <option value="Department Head">Department Head</option>
                </select>
              </div>

              <div>
                <Label>Level 2 Approver (Extended Leaves)</Label>
                <select
                  value={level2Approver}
                  onChange={(e) => setLevel2Approver(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="Department Head">Department Head</option>
                  <option value="HR Admin">HR Admin</option>
                  <option value="VP / Executive">VP / Executive</option>
                </select>
              </div>

              <div>
                <Label>Require Level 2 When Leave Exceeds (Days)</Label>
                <Input
                  type="number"
                  min={1}
                  value={level2ThresholdDays}
                  onChange={(e) => setLevel2ThresholdDays(e.target.value)}
                />
              </div>

              <div>
                <Label>Final Sign-Off &amp; Auto-Escalation SLA</Label>
                <select
                  value={`${finalHrApprover} (${autoEscalationHours})`}
                  onChange={(e) => {
                    if (e.target.value.includes('24')) {
                      setFinalHrApprover('HR Admin');
                      setAutoEscalationHours('24 hours');
                    } else {
                      setFinalHrApprover('HR Admin');
                      setAutoEscalationHours('48 hours');
                    }
                  }}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-900 focus:border-indigo-600 focus:outline-none"
                >
                  <option value="HR Admin (48 hours)">
                    HR Admin (Auto-escalate after 48 hours)
                  </option>
                  <option value="HR Admin (24 hours)">
                    HR Admin (Auto-escalate after 24 hours)
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* 3D. Absence Alerts */}
          <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <BellRing className="h-4 w-4 text-rose-600 shrink-0" />
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Absence Alerts &amp; Notifications
                </h3>
                <p className="text-xs text-slate-500">
                  Automated alerts for unplanned absences, AWOL thresholds &amp;
                  low balances
                </p>
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:bg-slate-50 transition-colors">
                <div className="pr-3">
                  <p className="text-xs font-bold text-slate-900">
                    Unplanned Absence Alert
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Notify Reporting Manager when no check-in by 11:00 AM
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={unplannedAbsenceAlert}
                  onChange={(e) => setUnplannedAbsenceAlert(e.target.checked)}
                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600"
                />
              </label>

              <label className="flex cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-slate-50/60 p-3 hover:bg-slate-50 transition-colors">
                <div className="pr-3">
                  <p className="text-xs font-bold text-slate-900">
                    Daily Department Absence Digest
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Morning email summary of employees on leave today
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={dailyAbsenceDigest}
                  onChange={(e) => setDailyAbsenceDigest(e.target.checked)}
                  className="h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600"
                />
              </label>

              <div className="pt-1 space-y-3">
                <div>
                  <Label>Consecutive Uninformed Absence (AWOL Days)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={awolConsecutiveDays}
                    onChange={(e) => setAwolConsecutiveDays(e.target.value)}
                  />
                </div>

                <div>
                  <Label>Low Leave Balance Alert Threshold (Days)</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      value={lowBalanceThreshold}
                      onChange={(e) => setLowBalanceThreshold(e.target.value)}
                    />
                    <input
                      type="checkbox"
                      checked={lowBalanceAlert}
                      onChange={(e) => setLowBalanceAlert(e.target.checked)}
                      title="Enable Low Leave Balance Alert"
                      className="h-4 w-4 shrink-0 rounded border-slate-300 text-indigo-600"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-3">
              <Button type="submit" variant="primary" className="w-full sm:w-auto justify-center">
                <CheckCircle2 className="h-4 w-4" />
                Save Leave Settings
              </Button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
