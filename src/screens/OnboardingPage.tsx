'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast, Toaster } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  Settings2,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  X,
} from 'lucide-react';
import { Stepper, StepItem } from '../components/aurix/Stepper';
import { CountrySelect } from '../components/common/CountrySelect';
import { TimezoneSelect } from '../components/common/TimezoneSelect';
import { Button, Card, Input, Label, Switch } from '../components/ui';
import {
  CompanyDetailsStepData,
  HrAdminOnboardingDraft,
  HrAdminProfileStepData,
  loadOnboardingDraft,
  markOnboardingCompleted,
  saveOnboardingDraft,
  validateAdminProfileStep,
  validateCompanyStep,
  validateWorkspaceConfigStep,
  WorkspaceConfigStepData,
} from '../lib/auth-bootstrap';
import { settingsApi } from '../services/settingsApi';
import { profileApi } from '../services/profileApi';

const ONBOARDING_STEPS: StepItem[] = [
  {
    id: 1,
    title: 'Company & Legal',
    subtitle: 'Entity, address & tax IDs',
  },
  {
    id: 2,
    title: 'HR Admin Profile',
    subtitle: 'Identity, role & alerts',
  },
  {
    id: 3,
    title: 'Workspace Config',
    subtitle: 'Departments, shifts & leave',
  },
  {
    id: 4,
    title: 'Review & Launch',
    subtitle: 'Verify & open dashboard',
  },
];

const INDUSTRY_CATEGORIES = [
  'Information Technology & SaaS',
  'Banking, Financial Services & Insurance (BFSI)',
  'Healthcare & Pharmaceuticals',
  'Manufacturing & Engineering',
  'Retail & E-Commerce',
  'Education & EdTech',
  'Consulting & Professional Services',
  'Logistics & Supply Chain',
];

const HEADCOUNT_RANGES: CompanyDetailsStepData['headcountSize'][] = [
  '1-10',
  '11-50',
  '51-200',
  '201-500',
  '500+',
];

const DEFAULT_DEPARTMENT_SUGGESTIONS = [
  'Engineering',
  'HR',
  'Sales',
  'Operations',
  'Finance',
];

export function OnboardingPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<HrAdminOnboardingDraft>(() =>
    loadOnboardingDraft()
  );
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [customDeptInput, setCustomDeptInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    saveOnboardingDraft(draft);
  }, [draft]);

  const currentStep = draft.currentStep;

  const updateCompany = <K extends keyof CompanyDetailsStepData>(
    key: K,
    value: CompanyDetailsStepData[K]
  ) => {
    setDraft((prev) => ({
      ...prev,
      company: {
        ...prev.company,
        [key]: value,
      },
    }));
    if (stepErrors[key]) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const updateAdmin = <K extends keyof HrAdminProfileStepData>(
    key: K,
    value: HrAdminProfileStepData[K]
  ) => {
    setDraft((prev) => ({
      ...prev,
      adminProfile: {
        ...prev.adminProfile,
        [key]: value,
      },
    }));
    if (stepErrors[key]) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const updateWorkspace = <K extends keyof WorkspaceConfigStepData>(
    key: K,
    value: WorkspaceConfigStepData[K]
  ) => {
    setDraft((prev) => ({
      ...prev,
      workspaceConfig: {
        ...prev.workspaceConfig,
        [key]: value,
      },
    }));
    if (stepErrors[key]) {
      setStepErrors((prev) => {
        const next = { ...prev };
        delete next[key];
        return next;
      });
    }
  };

  const handleFileUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    onLoaded: (dataUrl: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onLoaded(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const toggleDepartment = (deptName: string) => {
    const exists = draft.workspaceConfig.departments.includes(deptName);
    const nextDepts = exists
      ? draft.workspaceConfig.departments.filter((d) => d !== deptName)
      : [...draft.workspaceConfig.departments, deptName];
    updateWorkspace('departments', nextDepts);
  };

  const handleAddCustomDepartment = () => {
    const trimmed = customDeptInput.trim();
    if (!trimmed) return;
    if (!draft.workspaceConfig.departments.includes(trimmed)) {
      updateWorkspace('departments', [
        ...draft.workspaceConfig.departments,
        trimmed,
      ]);
    }
    setCustomDeptInput('');
  };

  const validateCurrentStep = (): boolean => {
    if (currentStep === 1) {
      const res = validateCompanyStep(draft.company);
      setStepErrors(res.errors);
      if (!res.valid) {
        toast.error('Please complete all required Company & Legal fields.');
      }
      return res.valid;
    }
    if (currentStep === 2) {
      const res = validateAdminProfileStep(draft.adminProfile);
      setStepErrors(res.errors);
      if (!res.valid) {
        toast.error('Please complete all required HR Admin Profile fields.');
      }
      return res.valid;
    }
    if (currentStep === 3) {
      const res = validateWorkspaceConfigStep(draft.workspaceConfig);
      setStepErrors(res.errors);
      if (!res.valid) {
        toast.error(
          'Please select Working Days and at least one Department.'
        );
      }
      return res.valid;
    }
    return true;
  };

  const handleNextStep = () => {
    if (!validateCurrentStep()) return;
    setStepErrors({});
    setDraft((prev) => ({
      ...prev,
      currentStep: Math.min(4, prev.currentStep + 1),
    }));
  };

  const handlePrevStep = () => {
    setStepErrors({});
    setDraft((prev) => ({
      ...prev,
      currentStep: Math.max(1, prev.currentStep - 1),
    }));
  };

  const goToStep = (stepNumber: number) => {
    setStepErrors({});
    setDraft((prev) => ({
      ...prev,
      currentStep: stepNumber,
    }));
  };

  const handleFinalSubmit = async () => {
    const step1Check = validateCompanyStep(draft.company);
    if (!step1Check.valid) {
      setStepErrors(step1Check.errors);
      goToStep(1);
      toast.error('Please fix required fields in Step 1 (Company Details).');
      return;
    }

    const step2Check = validateAdminProfileStep(draft.adminProfile);
    if (!step2Check.valid) {
      setStepErrors(step2Check.errors);
      goToStep(2);
      toast.error('Please fix required fields in Step 2 (HR Admin Profile).');
      return;
    }

    const step3Check = validateWorkspaceConfigStep(draft.workspaceConfig);
    if (!step3Check.valid) {
      setStepErrors(step3Check.errors);
      goToStep(3);
      toast.error(
        'Please fix required fields in Step 3 (Workspace Configuration).'
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await Promise.all([
        settingsApi.saveCompanyAndWorkspaceSettings({
          company: draft.company,
          workspaceConfig: draft.workspaceConfig,
        }),
        profileApi.saveHrAdminProfile(draft.adminProfile),
      ]);

      markOnboardingCompleted(draft);
      toast.success(
        `Workspace "${draft.company.companyName}" configured! Redirecting to HR Admin Dashboard...`
      );
      router.push('/dashboard');
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : 'Failed to complete workspace onboarding. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8">
      <Toaster position="top-right" richColors />

      <div className="mx-auto max-w-5xl space-y-6">
        {/* Top Banner */}
        <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-lg bg-indigo-600 px-2.5 py-1 text-[11px] font-bold text-white uppercase">
                <Sparkles className="h-3 w-3" />
                HR Admin Setup Wizard
              </span>
              <h1 className="text-lg font-bold text-slate-900">
                OFC360 Post-Registration Workspace Onboarding
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Complete your organization legal profile, HR Admin identity, and
              default shifts &amp; policies in 4 structured steps.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/onboarding/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              21-Module Employee Onboarding Suite
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100"
            >
              Skip to Dashboard
            </Link>
          </div>
        </div>

        {/* 4-Step Progress Stepper */}
        <Stepper
          steps={ONBOARDING_STEPS}
          currentStep={currentStep}
          onStepClick={(stepId) => goToStep(stepId)}
        />

        {/* Step 1: Company Details & Legal Info */}
        {currentStep === 1 && (
          <div className="space-y-5" data-testid="onboarding-step-1">
            <Card>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Building2 className="h-4 w-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  1A. Basic Company Profile
                </h2>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="company-name" required>
                    Company Name
                  </Label>
                  <Input
                    id="company-name"
                    placeholder="e.g., OFC360 Technologies"
                    value={draft.company.companyName}
                    onChange={(e) =>
                      updateCompany('companyName', e.target.value)
                    }
                    error={stepErrors.companyName}
                  />
                </div>

                <div>
                  <Label htmlFor="legal-entity-name">Legal Entity Name</Label>
                  <Input
                    id="legal-entity-name"
                    placeholder="e.g., OFC360 Technologies Pvt. Ltd."
                    value={draft.company.legalEntityName}
                    onChange={(e) =>
                      updateCompany('legalEntityName', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="industry-category">Industry Category</Label>
                  <select
                    id="industry-category"
                    value={draft.company.industryCategory}
                    onChange={(e) =>
                      updateCompany('industryCategory', e.target.value)
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
                  >
                    {INDUSTRY_CATEGORIES.map((ind) => (
                      <option key={ind} value={ind}>
                        {ind}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="headcount-size">
                    Employee Headcount Size
                  </Label>
                  <select
                    id="headcount-size"
                    value={draft.company.headcountSize}
                    onChange={(e) =>
                      updateCompany(
                        'headcountSize',
                        e.target.value as CompanyDetailsStepData['headcountSize']
                      )
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
                  >
                    {HEADCOUNT_RANGES.map((hc) => (
                      <option key={hc} value={hc}>
                        {hc} Employees
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="website-url">Website URL</Label>
                  <Input
                    id="website-url"
                    type="url"
                    placeholder="https://www.ofc360.com"
                    value={draft.company.websiteUrl}
                    onChange={(e) =>
                      updateCompany('websiteUrl', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="company-logo-upload">Company Logo</Label>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="company-logo-upload"
                      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Upload className="h-3.5 w-3.5 text-indigo-600" />
                      Upload Logo
                      <input
                        id="company-logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) =>
                            updateCompany('companyLogoDataUrl', url)
                          )
                        }
                      />
                    </label>
                    {draft.company.companyLogoDataUrl ? (
                      <span className="text-[11px] font-semibold text-emerald-700">
                        Logo Attached
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        PNG / SVG (Optional)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
                1B. Contact &amp; Registered Address
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="company-official-email" required>
                    Official Company Email
                  </Label>
                  <Input
                    id="company-official-email"
                    type="email"
                    placeholder="hr@ofc360.com"
                    value={draft.company.officialEmail}
                    onChange={(e) =>
                      updateCompany('officialEmail', e.target.value)
                    }
                    error={stepErrors.officialEmail}
                  />
                </div>

                <div>
                  <Label htmlFor="company-contact-number" required>
                    Contact Number
                  </Label>
                  <Input
                    id="company-contact-number"
                    type="tel"
                    placeholder="+91 80 4092 1100"
                    value={draft.company.contactNumber}
                    onChange={(e) =>
                      updateCompany('contactNumber', e.target.value)
                    }
                    error={stepErrors.contactNumber}
                  />
                </div>

                <div className="sm:col-span-2">
                  <Label htmlFor="street-address">Street Address</Label>
                  <Input
                    id="street-address"
                    placeholder="Plot 42, Outer Ring Road, Bellandur"
                    value={draft.company.streetAddress}
                    onChange={(e) =>
                      updateCompany('streetAddress', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="address-city">City</Label>
                  <Input
                    id="address-city"
                    placeholder="Bengaluru"
                    value={draft.company.city}
                    onChange={(e) => updateCompany('city', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="address-state">State / Province</Label>
                  <Input
                    id="address-state"
                    placeholder="Karnataka"
                    value={draft.company.state}
                    onChange={(e) => updateCompany('state', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="address-pincode">Pin Code / Postal Code</Label>
                  <Input
                    id="address-pincode"
                    placeholder="560102"
                    value={draft.company.pinCode}
                    onChange={(e) => updateCompany('pinCode', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="onboarding-country-select" required>
                    Country
                  </Label>
                  <CountrySelect
                    value={draft.company.country}
                    onChange={(countryName, option) => {
                      updateCompany('country', countryName);
                      if (option?.currency) {
                        updateCompany('baseCurrency', option.currency);
                      }
                    }}
                    error={stepErrors.country}
                  />
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
                1C. Regional Settings &amp; Tax / Compliance Identifiers
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="sm:col-span-2">
                  <Label htmlFor="onboarding-timezone-select" required>
                    Default Timezone
                  </Label>
                  <TimezoneSelect
                    value={draft.company.timezone}
                    onChange={(tz) => updateCompany('timezone', tz)}
                    error={stepErrors.timezone}
                  />
                </div>

                <div>
                  <Label htmlFor="base-currency">Base Currency</Label>
                  <select
                    id="base-currency"
                    value={draft.company.baseCurrency}
                    onChange={(e) =>
                      updateCompany('baseCurrency', e.target.value)
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
                  >
                    <option value="INR">INR (₹)</option>
                    <option value="USD">USD ($)</option>
                    <option value="GBP">GBP (£)</option>
                    <option value="AED">AED (د.إ)</option>
                    <option value="SGD">SGD (S$)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="date-format">Date Format</Label>
                  <select
                    id="date-format"
                    value={draft.company.dateFormat}
                    onChange={(e) =>
                      updateCompany(
                        'dateFormat',
                        e.target.value as CompanyDetailsStepData['dateFormat']
                      )
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="fy-start-month">
                    Financial Year Start Month
                  </Label>
                  <select
                    id="fy-start-month"
                    value={draft.company.financialYearStartMonth}
                    onChange={(e) =>
                      updateCompany('financialYearStartMonth', e.target.value)
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
                  >
                    <option value="April">April (India Standard)</option>
                    <option value="January">January (Calendar Year)</option>
                    <option value="July">July</option>
                    <option value="October">October</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="cin-number">Registration No. / CIN</Label>
                  <Input
                    id="cin-number"
                    placeholder="U72900KA2026PTC123456"
                    value={draft.company.cinNumber}
                    onChange={(e) => updateCompany('cinNumber', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="company-pan">Company PAN</Label>
                  <Input
                    id="company-pan"
                    placeholder="AABCO3600F"
                    value={draft.company.companyPan}
                    onChange={(e) =>
                      updateCompany('companyPan', e.target.value.toUpperCase())
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="company-tan">TAN</Label>
                  <Input
                    id="company-tan"
                    placeholder="BLRO12345F"
                    value={draft.company.tanNumber}
                    onChange={(e) =>
                      updateCompany('tanNumber', e.target.value.toUpperCase())
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="company-gstin">GSTIN</Label>
                  <Input
                    id="company-gstin"
                    placeholder="29AABCO3600F1Z5"
                    value={draft.company.gstin}
                    onChange={(e) =>
                      updateCompany('gstin', e.target.value.toUpperCase())
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="pf-est-id">PF Establishment ID</Label>
                  <Input
                    id="pf-est-id"
                    placeholder="PYKRP0012345000"
                    value={draft.company.pfEstablishmentId}
                    onChange={(e) =>
                      updateCompany('pfEstablishmentId', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="esic-number">ESIC Number</Label>
                  <Input
                    id="esic-number"
                    placeholder="53000123450000999"
                    value={draft.company.esicNumber}
                    onChange={(e) =>
                      updateCompany('esicNumber', e.target.value)
                    }
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Step 2: HR Admin Profile Setup */}
        {currentStep === 2 && (
          <div className="space-y-5" data-testid="onboarding-step-2">
            <Card>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <UserCheck className="h-4 w-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  2A. HR Admin Personal &amp; Role Details
                </h2>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="admin-full-name" required>
                    HR Admin Full Name
                  </Label>
                  <Input
                    id="admin-full-name"
                    placeholder="Aarav Sharma"
                    value={draft.adminProfile.fullName}
                    onChange={(e) => updateAdmin('fullName', e.target.value)}
                    error={stepErrors.fullName}
                  />
                </div>

                <div>
                  <Label htmlFor="admin-email" required>
                    Official Email
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="aarav.sharma@ofc360.com"
                    value={draft.adminProfile.officialEmail}
                    onChange={(e) =>
                      updateAdmin('officialEmail', e.target.value)
                    }
                    error={stepErrors.officialEmail}
                  />
                </div>

                <div>
                  <Label htmlFor="admin-mobile" required>
                    Mobile Number
                  </Label>
                  <Input
                    id="admin-mobile"
                    type="tel"
                    placeholder="+91 98201 11223"
                    value={draft.adminProfile.mobileNumber}
                    onChange={(e) =>
                      updateAdmin('mobileNumber', e.target.value)
                    }
                    error={stepErrors.mobileNumber}
                  />
                </div>

                <div>
                  <Label htmlFor="admin-photo-upload">Profile Photo</Label>
                  <div className="flex items-center gap-3">
                    <label
                      htmlFor="admin-photo-upload"
                      className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      <Upload className="h-3.5 w-3.5 text-indigo-600" />
                      Upload Photo
                      <input
                        id="admin-photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) =>
                          handleFileUpload(e, (url) =>
                            updateAdmin('profilePhotoDataUrl', url)
                          )
                        }
                      />
                    </label>
                    {draft.adminProfile.profilePhotoDataUrl ? (
                      <span className="text-[11px] font-semibold text-emerald-700">
                        Photo Attached
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        JPG / PNG (Optional)
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="admin-designation" required>
                    Designation
                  </Label>
                  <Input
                    id="admin-designation"
                    placeholder="Head of HR / HR Admin"
                    value={draft.adminProfile.designation}
                    onChange={(e) => updateAdmin('designation', e.target.value)}
                    error={stepErrors.designation}
                  />
                </div>

                <div>
                  <Label htmlFor="admin-employee-code" required>
                    Employee ID / Code
                  </Label>
                  <Input
                    id="admin-employee-code"
                    placeholder="EMP-001"
                    value={draft.adminProfile.employeeCode}
                    onChange={(e) =>
                      updateAdmin('employeeCode', e.target.value)
                    }
                    error={stepErrors.employeeCode}
                  />
                </div>

                <div>
                  <Label htmlFor="admin-department">Department</Label>
                  <Input
                    id="admin-department"
                    placeholder="Human Resources"
                    value={draft.adminProfile.department}
                    onChange={(e) => updateAdmin('department', e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="admin-doj">Date of Joining</Label>
                  <Input
                    id="admin-doj"
                    type="date"
                    value={draft.adminProfile.dateOfJoining}
                    onChange={(e) =>
                      updateAdmin('dateOfJoining', e.target.value)
                    }
                  />
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
                2B. Access, Government ID &amp; Emergency Info
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="gov-id-ref">
                    Government ID Reference (PAN / Aadhaar)
                  </Label>
                  <Input
                    id="gov-id-ref"
                    placeholder="ABCDE1234F"
                    value={draft.adminProfile.govIdReference}
                    onChange={(e) =>
                      updateAdmin('govIdReference', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="emergency-contact-name">
                    Emergency Contact Name
                  </Label>
                  <Input
                    id="emergency-contact-name"
                    placeholder="Meera Sharma"
                    value={draft.adminProfile.emergencyContactName}
                    onChange={(e) =>
                      updateAdmin('emergencyContactName', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="emergency-contact-phone">
                    Emergency Contact Phone
                  </Label>
                  <Input
                    id="emergency-contact-phone"
                    type="tel"
                    placeholder="+91 98201 99999"
                    value={draft.adminProfile.emergencyContactPhone}
                    onChange={(e) =>
                      updateAdmin('emergencyContactPhone', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Switch
                  label="In-App System Notifications"
                  description="Receive real-time attendance, approval, and compliance alerts"
                  checked={draft.adminProfile.systemNotificationsEnabled}
                  onCheckedChange={(val) =>
                    updateAdmin('systemNotificationsEnabled', val)
                  }
                />
                <Switch
                  label="Email Digest & Escalation Alerts"
                  description="Receive daily HR digests and approval reminders by email"
                  checked={draft.adminProfile.emailNotificationsEnabled}
                  onCheckedChange={(val) =>
                    updateAdmin('emailNotificationsEnabled', val)
                  }
                />
              </div>
            </Card>
          </div>
        )}

        {/* Step 3: Initial Workspace & HR Configuration */}
        {currentStep === 3 && (
          <div className="space-y-5" data-testid="onboarding-step-3">
            <Card>
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Settings2 className="h-4 w-4 text-indigo-600" />
                <h2 className="text-sm font-bold text-slate-900">
                  3A. Department Setup
                </h2>
              </div>

              <p className="mt-2 text-xs text-slate-500">
                Select default departments or add custom organizational units:
              </p>

              <div className="mt-3 flex flex-wrap gap-2">
                {Array.from(
                  new Set([
                    ...DEFAULT_DEPARTMENT_SUGGESTIONS,
                    ...draft.workspaceConfig.departments,
                  ])
                ).map((dept) => {
                  const selected =
                    draft.workspaceConfig.departments.includes(dept);
                  return (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => toggleDepartment(dept)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all ${
                        selected
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {dept}
                      {selected && <X className="h-3 w-3" />}
                    </button>
                  );
                })}
              </div>
              {stepErrors.departments ? (
                <p className="mt-1.5 text-[11px] font-medium text-rose-600">
                  {stepErrors.departments}
                </p>
              ) : null}

              <div className="mt-4 flex max-w-md gap-2">
                <Input
                  placeholder="Add custom department (e.g., Product & Design)"
                  value={customDeptInput}
                  onChange={(e) => setCustomDeptInput(e.target.value)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddCustomDepartment}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            </Card>

            <Card>
              <h2 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
                3B. Work Schedule, Shifts &amp; Attendance Grace Period
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <Label htmlFor="working-days-select" required>
                    Working Days
                  </Label>
                  <select
                    id="working-days-select"
                    value={draft.workspaceConfig.workingDays}
                    onChange={(e) =>
                      updateWorkspace(
                        'workingDays',
                        e.target.value as WorkspaceConfigStepData['workingDays']
                      )
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
                  >
                    <option value="Mon-Fri">Monday – Friday (5 Days)</option>
                    <option value="Mon-Sat">Monday – Saturday (6 Days)</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="shift-start-time" required>
                    Default Shift Start Time
                  </Label>
                  <Input
                    id="shift-start-time"
                    value={draft.workspaceConfig.shiftStartTime}
                    onChange={(e) =>
                      updateWorkspace('shiftStartTime', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="shift-end-time" required>
                    Default Shift End Time
                  </Label>
                  <Input
                    id="shift-end-time"
                    value={draft.workspaceConfig.shiftEndTime}
                    onChange={(e) =>
                      updateWorkspace('shiftEndTime', e.target.value)
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="grace-period-mins">
                    Attendance Grace Period (Minutes)
                  </Label>
                  <Input
                    id="grace-period-mins"
                    type="number"
                    min={0}
                    max={60}
                    value={String(draft.workspaceConfig.gracePeriodMinutes)}
                    onChange={(e) =>
                      updateWorkspace(
                        'gracePeriodMinutes',
                        Number(e.target.value) || 0
                      )
                    }
                  />
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="border-b border-slate-100 pb-3 text-sm font-bold text-slate-900">
                3C. Leave &amp; Payroll Defaults
              </h2>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="payroll-cycle-date">
                    Monthly Payroll Cycle Date
                  </Label>
                  <select
                    id="payroll-cycle-date"
                    value={draft.workspaceConfig.payrollCycleDate}
                    onChange={(e) =>
                      updateWorkspace('payrollCycleDate', e.target.value)
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
                  >
                    <option value="Last Working Day of Month">
                      Last Working Day of Month
                    </option>
                    <option value="1st of Following Month">
                      1st of Following Month
                    </option>
                    <option value="5th of Following Month">
                      5th of Following Month
                    </option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="probation-period">
                    Standard Probation Period
                  </Label>
                  <select
                    id="probation-period"
                    value={draft.workspaceConfig.probationPeriod}
                    onChange={(e) =>
                      updateWorkspace(
                        'probationPeriod',
                        e.target.value as WorkspaceConfigStepData['probationPeriod']
                      )
                    }
                    className="h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-xs text-slate-900"
                  >
                    <option value="3 months">3 months</option>
                    <option value="6 months">6 months</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Switch
                  label="Casual Leave (CL)"
                  description="Enable standard Casual Leave entitlement"
                  checked={draft.workspaceConfig.enableCasualLeave}
                  onCheckedChange={(val) =>
                    updateWorkspace('enableCasualLeave', val)
                  }
                />
                <Switch
                  label="Sick Leave (SL)"
                  description="Enable paid medical / Sick Leave"
                  checked={draft.workspaceConfig.enableSickLeave}
                  onCheckedChange={(val) =>
                    updateWorkspace('enableSickLeave', val)
                  }
                />
                <Switch
                  label="Earned / Privilege Leave (EL)"
                  description="Enable accruable Earned Leave"
                  checked={draft.workspaceConfig.enableEarnedLeave}
                  onCheckedChange={(val) =>
                    updateWorkspace('enableEarnedLeave', val)
                  }
                />
              </div>
            </Card>
          </div>
        )}

        {/* Step 4: Final Review & Submission */}
        {currentStep === 4 && (
          <div className="space-y-5" data-testid="onboarding-step-4">
            <Card>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Step 1 Summary: Company Details &amp; Legal Info
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToStep(1)}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Step 1
                </Button>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div>
                  <dt className="text-slate-500">Company Name</dt>
                  <dd className="font-bold text-slate-900">
                    {draft.company.companyName || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Official Email</dt>
                  <dd className="font-semibold text-slate-800">
                    {draft.company.officialEmail || '—'}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Country &amp; Timezone</dt>
                  <dd className="font-semibold text-slate-800">
                    {draft.company.country} ({draft.company.timezone})
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Currency &amp; FY Start</dt>
                  <dd className="font-semibold text-slate-800">
                    {draft.company.baseCurrency} ·{' '}
                    {draft.company.financialYearStartMonth}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Step 2 Summary: HR Admin Profile Setup
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToStep(2)}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Step 2
                </Button>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div>
                  <dt className="text-slate-500">HR Admin Name</dt>
                  <dd className="font-bold text-slate-900">
                    {draft.adminProfile.fullName}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Employee ID</dt>
                  <dd className="font-mono font-bold text-indigo-700">
                    {draft.adminProfile.employeeCode}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Designation</dt>
                  <dd className="font-semibold text-slate-800">
                    {draft.adminProfile.designation}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Department</dt>
                  <dd className="font-semibold text-slate-800">
                    {draft.adminProfile.department}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-indigo-600" />
                  <h2 className="text-sm font-bold text-slate-900">
                    Step 3 Summary: Initial Workspace &amp; HR Configuration
                  </h2>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => goToStep(3)}
                >
                  <Edit3 className="h-3.5 w-3.5" />
                  Edit Step 3
                </Button>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
                <div>
                  <dt className="text-slate-500">Departments</dt>
                  <dd className="font-bold text-slate-900">
                    {draft.workspaceConfig.departments.join(', ')}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Work Schedule</dt>
                  <dd className="font-semibold text-slate-800">
                    {draft.workspaceConfig.workingDays} (
                    {draft.workspaceConfig.shiftStartTime} –{' '}
                    {draft.workspaceConfig.shiftEndTime})
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Grace &amp; Probation</dt>
                  <dd className="font-semibold text-slate-800">
                    {draft.workspaceConfig.gracePeriodMinutes}m grace ·{' '}
                    {draft.workspaceConfig.probationPeriod}
                  </dd>
                </div>
                <div>
                  <dt className="text-slate-500">Payroll Cycle</dt>
                  <dd className="font-semibold text-slate-800">
                    {draft.workspaceConfig.payrollCycleDate}
                  </dd>
                </div>
              </dl>
            </Card>
          </div>
        )}

        {/* Bottom Wizard Navigation Bar */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <Button
            type="button"
            variant="outline"
            disabled={currentStep === 1 || isSubmitting}
            onClick={handlePrevStep}
          >
            <ArrowLeft className="h-4 w-4" />
            Previous Step
          </Button>

          <div className="text-xs font-semibold text-slate-500">
            Step {currentStep} of 4 · Draft auto-saved
          </div>

          {currentStep < 4 ? (
            <Button
              type="button"
              variant="primary"
              onClick={handleNextStep}
              data-testid="onboarding-next-btn"
            >
              Next Step
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="primary"
              disabled={isSubmitting}
              onClick={() => void handleFinalSubmit()}
              data-testid="onboarding-submit-btn"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving Workspace...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  Complete Setup &amp; Open Dashboard
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default OnboardingPage;
