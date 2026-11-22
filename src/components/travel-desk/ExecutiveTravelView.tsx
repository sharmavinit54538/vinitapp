'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  PieChart,
  BarChart3,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  ShieldCheck,
  ChevronRight,
  Globe,
  Plane,
} from 'lucide-react';
import {
  ExpenseClaimRecord,
  TravelDeskSettings,
  TravelRequestRecord,
} from '../../types/travelDesk';
import { calculateTravelKpis } from '../../services/travel-desk/travelDeskEngine';

interface ExecutiveTravelViewProps {
  requests: TravelRequestRecord[];
  expenses: ExpenseClaimRecord[];
  settings: TravelDeskSettings;
  activeSubTab: string;
  onSelectSubTab: (tab: string) => void;
  onReviewRequest: (request: TravelRequestRecord) => void;
  onViewTripDetails: (trip: TravelRequestRecord) => void;
}

export const ExecutiveTravelView: React.FC<ExecutiveTravelViewProps> = ({
  requests,
  expenses,
  settings,
  activeSubTab,
  onSelectSubTab,
  onReviewRequest,
  onViewTripDetails,
}) => {
  const [reportExportSuccess, setReportExportSuccess] = useState(false);
  const kpis = calculateTravelKpis(requests, expenses);

  // Trips requiring executive sign-off (either status 'pending_executive' or budget > executiveApprovalThreshold)
  const executiveEscalations = requests.filter(
    (r) =>
      r.status === 'pending_executive' ||
      (r.estimatedBudget >= settings.executiveApprovalThreshold && r.status.startsWith('pending'))
  );

  const domesticSpend = requests
    .filter((r) => r.tripType === 'domestic')
    .reduce((acc, c) => acc + (c.actualCost || c.estimatedBudget), 0);
  const internationalSpend = requests
    .filter((r) => r.tripType === 'international')
    .reduce((acc, c) => acc + (c.actualCost || c.estimatedBudget), 0);

  const handleExportCsv = () => {
    setReportExportSuccess(true);
    setTimeout(() => setReportExportSuccess(false), 3000);
  };

  // TAB 1: OVERVIEW
  if (activeSubTab === 'overview') {
    return (
      <div className="space-y-4 pb-20">
        {/* Executive Banner */}
        <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-300">
                C-Suite Executive Overview
              </span>
              <h2 className="text-xl font-bold mt-0.5">Corporate Travel Spend</h2>
              <p className="text-xs text-slate-300 mt-1">
                FY26 Corporate Travel Portfolio · Policy Adherence: 94%
              </p>
            </div>
            {executiveEscalations.length > 0 && (
              <span className="px-2.5 py-1 bg-rose-500/20 border border-rose-400/40 rounded-xl text-xs font-semibold text-rose-300">
                {executiveEscalations.length} Escalations
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs">
            <div>
              <span className="text-slate-400">Total Committed Spend</span>
              <p className="text-xl font-bold text-white mt-0.5">
                ₹{(kpis.totalCommittedBudget / 100000).toFixed(2)} Lakhs
              </p>
            </div>
            <div>
              <span className="text-slate-400">Annual Budget Cap</span>
              <p className="text-xl font-bold text-indigo-300 mt-0.5">
                ₹{(kpis.budgetAnnual / 100000).toFixed(2)} Lakhs
              </p>
            </div>
          </div>
        </div>

        {/* Domestic vs International Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Domestic vs International Split
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[10px] text-slate-500 font-semibold uppercase">Domestic</span>
              <p className="text-base font-bold text-slate-900 mt-0.5">
                ₹{domesticSpend.toLocaleString()}
              </p>
              <p className="text-[10px] text-slate-400">
                {requests.filter((r) => r.tripType === 'domestic').length} trips
              </p>
            </div>
            <div className="p-3 bg-indigo-50/60 rounded-xl">
              <span className="text-[10px] text-indigo-700 font-semibold uppercase">International</span>
              <p className="text-base font-bold text-indigo-950 mt-0.5">
                ₹{internationalSpend.toLocaleString()}
              </p>
              <p className="text-[10px] text-indigo-600">
                {requests.filter((r) => r.tripType === 'international').length} trip (High ROI)
              </p>
            </div>
          </div>
        </div>

        {/* Executive Approvals Queue Highlight */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              High-Value Approvals ({executiveEscalations.length})
            </h3>
            <button
              onClick={() => onSelectSubTab('approvals')}
              className="text-xs font-semibold text-indigo-600"
            >
              View Queue
            </button>
          </div>

          {executiveEscalations.map((req) => (
            <div
              key={req.id}
              className="bg-white p-4 rounded-2xl border border-rose-200 shadow-sm space-y-2.5"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">{req.id}</span>
                  <h4 className="text-xs font-bold text-slate-900">{req.employeeName}</h4>
                  <p className="text-[11px] text-slate-500">
                    {req.sourceCity} → {req.destinationCity} ({req.purpose})
                  </p>
                </div>
                <span className="text-sm font-bold text-rose-600">
                  ₹{req.estimatedBudget.toLocaleString()}
                </span>
              </div>

              <div className="bg-rose-50 p-2.5 rounded-xl border border-rose-100 text-xs text-rose-800">
                {req.policyViolationReason || 'Threshold escalation for C-suite approval.'}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onReviewRequest(req)}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                >
                  Executive Review
                </button>
                <button
                  onClick={() => onViewTripDetails(req)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium"
                >
                  ROI Brief
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TAB 2: ANALYTICS
  if (activeSubTab === 'analytics') {
    return (
      <div className="space-y-4 pb-20">
        <div>
          <h2 className="text-base font-bold text-slate-900">Spend Analytics & Insights</h2>
          <p className="text-xs text-slate-500">Interactive corporate travel financial metrics</p>
        </div>

        {/* Department Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Spend by Department
          </h3>
          <div className="space-y-2 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Sales & GTM (APAC Expansion)</span>
                <span className="font-bold text-slate-900">₹1,45,000 (58%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full" style={{ width: '58%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Engineering & Cloud</span>
                <span className="font-bold text-slate-900">₹60,500 (24%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '24%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Product & UX Research</span>
                <span className="font-bold text-slate-900">₹34,500 (14%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '14%' }} />
              </div>
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-semibold text-slate-700">Finance & Compliance</span>
                <span className="font-bold text-slate-900">₹12,000 (4%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: '4%' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Travel Mode Breakdown */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Travel Modes & Green Impact
          </h3>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-3 bg-slate-50 rounded-xl">
              <Plane className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
              <p className="font-bold text-slate-900">67%</p>
              <p className="text-[10px] text-slate-400">Flights</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-900">22%</span>
              <p className="text-[10px] text-slate-400">Rail (Eco)</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="font-bold text-slate-900">11%</span>
              <p className="text-[10px] text-slate-400">Cabs/Other</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // TAB 3: APPROVALS
  if (activeSubTab === 'approvals') {
    return (
      <div className="space-y-3 pb-20">
        <div>
          <h2 className="text-base font-bold text-slate-900">Executive Approvals</h2>
          <p className="text-xs text-slate-500">
            Escalations requiring C-suite or Board authorization
          </p>
        </div>

        <div className="space-y-3">
          {executiveEscalations.map((req) => (
            <div
              key={req.id}
              className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">{req.id}</span>
                  <h3 className="text-sm font-bold text-slate-900 mt-0.5">{req.employeeName}</h3>
                  <p className="text-xs text-slate-500">{req.designation}</p>
                </div>
                <span className="text-base font-bold text-indigo-600">
                  ₹{req.estimatedBudget.toLocaleString()}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
                <p>
                  <strong>Route:</strong> {req.sourceCity} → {req.destinationCity}
                </p>
                <p>
                  <strong>Dates:</strong> {req.departureDate} to {req.returnDate}
                </p>
                <p>
                  <strong>Cost Center:</strong> {req.projectCostCenter}
                </p>
              </div>

              <div className="bg-amber-50 p-2.5 rounded-xl text-xs text-amber-800">
                <strong>Justification:</strong> &quot;{req.notes}&quot;
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => onReviewRequest(req)}
                  className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
                >
                  Approve / Sign Off
                </button>
                <button
                  onClick={() => onViewTripDetails(req)}
                  className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium"
                >
                  Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TAB 4: REPORTS
  if (activeSubTab === 'reports') {
    return (
      <div className="space-y-4 pb-20">
        <div>
          <h2 className="text-base font-bold text-slate-900">Executive Reports & Audit</h2>
          <p className="text-xs text-slate-500">Board briefings, GST recovery & audit packs</p>
        </div>

        {reportExportSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Executive Travel Report exported successfully as CSV!
          </div>
        )}

        <div className="space-y-2">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <FileSpreadsheet className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Monthly Travel MIS & Spend Report</p>
                <p className="text-[11px] text-slate-500">November 2026 · Includes GST breakdown</p>
              </div>
            </div>
            <button
              onClick={handleExportCsv}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>

          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">ESG Carbon Emissions Offset Pack</p>
                <p className="text-[11px] text-slate-500">Scope 3 Business Travel Emissions</p>
              </div>
            </div>
            <button
              onClick={handleExportCsv}
              className="p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-700"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TAB 5: PROFILE
  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-indigo-950 text-white flex items-center justify-center font-bold text-lg">
          EX
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Executive Director</h2>
          <p className="text-xs text-slate-500">Corporate Board & Executive Committee</p>
          <span className="inline-block mt-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            Executive Tier: Business Class & Uncapped Threshold
          </span>
        </div>
      </div>
    </div>
  );
};
