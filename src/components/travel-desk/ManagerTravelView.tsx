'use client';

import React, { useState } from 'react';
import {
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  AlertTriangle,
  Calendar,
  Building,
  Plane,
  ChevronRight,
  TrendingUp,
  DollarSign,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import {
  ExpenseClaimRecord,
  TravelRequestRecord,
} from '../../types/travelDesk';

interface ManagerTravelViewProps {
  requests: TravelRequestRecord[];
  expenses: ExpenseClaimRecord[];
  activeSubTab: string;
  onSelectSubTab: (tab: string) => void;
  onReviewRequest: (request: TravelRequestRecord) => void;
  onViewTripDetails: (trip: TravelRequestRecord) => void;
}

export const ManagerTravelView: React.FC<ManagerTravelViewProps> = ({
  requests,
  expenses,
  activeSubTab,
  onSelectSubTab,
  onReviewRequest,
  onViewTripDetails,
}) => {
  const [filterDept, setFilterDept] = useState<string>('all');

  // Requests requiring manager approval
  const pendingManagerApprovals = requests.filter(
    (r) => r.status === 'pending_manager'
  );

  const teamTrips = requests.filter(
    (r) => r.reportingManager === 'Vikramaditya Nair' || r.department === 'Engineering' || r.department === 'Product & Design'
  );

  const teamExpenses = expenses.filter(
    (e) => e.approvalStatus === 'Submitted' || e.approvalStatus === 'Manager Approved'
  );

  const totalTeamCommittedBudget = teamTrips
    .filter((r) => r.status !== 'rejected' && r.status !== 'cancelled')
    .reduce((acc, curr) => acc + (curr.actualCost || curr.estimatedBudget), 0);

  // TAB 1: DASHBOARD
  if (activeSubTab === 'dashboard') {
    return (
      <div className="space-y-4 pb-20">
        {/* Manager Header Banner */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-300">
                Team Travel Desk · Manager View
              </span>
              <h2 className="text-xl font-bold mt-0.5">Vikramaditya Nair</h2>
              <p className="text-xs text-slate-300 mt-1">
                Engineering & Product Team Lead (6 Direct Reports)
              </p>
            </div>
            {pendingManagerApprovals.length > 0 && (
              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold animate-pulse">
                <Clock className="w-3.5 h-3.5" /> {pendingManagerApprovals.length} Pending
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-700/60 text-center">
            <div>
              <p className="text-lg font-bold text-amber-400">
                {pendingManagerApprovals.length}
              </p>
              <p className="text-[10px] text-slate-300">Awaiting You</p>
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-400">{teamTrips.length}</p>
              <p className="text-[10px] text-slate-300">Team Trips</p>
            </div>
            <div>
              <p className="text-lg font-bold text-white">
                ₹{Math.round(totalTeamCommittedBudget / 1000)}k
              </p>
              <p className="text-[10px] text-slate-300">Q4 Committed</p>
            </div>
          </div>
        </div>

        {/* Priority Approvals Queue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Requires Your Action ({pendingManagerApprovals.length})
            </h3>
            {pendingManagerApprovals.length > 0 && (
              <button
                onClick={() => onSelectSubTab('approvals')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
              >
                Review All
              </button>
            )}
          </div>

          {pendingManagerApprovals.length === 0 ? (
            <div className="bg-white rounded-2xl p-6 text-center border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">Inbox Zero!</p>
              <p className="text-xs text-slate-500 mt-1">
                You have approved all pending travel requests for your team.
              </p>
            </div>
          ) : (
            pendingManagerApprovals.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">{req.id}</span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {req.employeeName}
                    </h4>
                    <p className="text-xs text-slate-500">{req.designation}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Needs Sign-Off
                  </span>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Destination:</span>
                    <span className="font-semibold text-slate-800">
                      {req.sourceCity} → {req.destinationCity}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Dates:</span>
                    <span className="font-semibold text-slate-800">
                      {req.departureDate} to {req.returnDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Estimated Budget:</span>
                    <span className="font-bold text-indigo-600">
                      ₹{req.estimatedBudget.toLocaleString()}
                    </span>
                  </div>
                </div>

                {req.policyViolation && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-2.5 text-xs text-rose-700 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <span>{req.policyViolationReason || 'Policy check requires review.'}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onReviewRequest(req)}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-indigo-700 active:scale-95 transition-all text-center"
                  >
                    Review Request
                  </button>
                  <button
                    onClick={() => onViewTripDetails(req)}
                    className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-200"
                  >
                    Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Team Travel Overview */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Direct Reports On Travel / Scheduled
            </h3>
            <button
              onClick={() => onSelectSubTab('team_trips')}
              className="text-xs font-semibold text-indigo-600"
            >
              View Schedule
            </button>
          </div>
          <div className="space-y-2">
            {teamTrips.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                onClick={() => onViewTripDetails(trip)}
                className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-all cursor-pointer flex items-center justify-between text-xs"
              >
                <div>
                  <p className="font-bold text-slate-900">{trip.employeeName}</p>
                  <p className="text-slate-500 text-[11px]">
                    {trip.destinationCity} · {trip.departureDate}
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-semibold text-slate-800">
                    ₹{trip.estimatedBudget.toLocaleString()}
                  </span>
                  <p className="text-[10px] text-slate-400 capitalize">{trip.status.replace('_', ' ')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // TAB 2: APPROVALS QUEUE
  if (activeSubTab === 'approvals') {
    return (
      <div className="space-y-3 pb-20">
        <div>
          <h2 className="text-base font-bold text-slate-900">Manager Approvals Queue</h2>
          <p className="text-xs text-slate-500">
            Review, approve, reject, or request revisions on team travel
          </p>
        </div>

        <div className="space-y-3">
          {pendingManagerApprovals.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-800">All caught up!</p>
              <p className="text-xs text-slate-500 mt-1">
                No travel requests are currently pending your approval.
              </p>
            </div>
          ) : (
            pendingManagerApprovals.map((req) => (
              <div
                key={req.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">{req.id}</span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{req.employeeName}</h3>
                    <p className="text-xs text-slate-500">
                      {req.department} · {req.designation}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                    Pending Manager
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Route</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {req.sourceCity} → {req.destinationCity}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Dates</span>
                    <p className="font-semibold text-slate-900 mt-0.5">
                      {req.departureDate} to {req.returnDate}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Mode & Class</span>
                    <p className="font-semibold text-slate-900 mt-0.5 capitalize">
                      {req.travelMode} ({req.travelClass})
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase">Estimated Cost</span>
                    <p className="font-bold text-indigo-600 mt-0.5">
                      ₹{req.estimatedBudget.toLocaleString()}
                    </p>
                  </div>
                </div>

                {req.notes && (
                  <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                    &quot;{req.notes}&quot;
                  </p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => onReviewRequest(req)}
                    className="flex-1 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 text-center"
                  >
                    Open Decision Modal
                  </button>
                  <button
                    onClick={() => onViewTripDetails(req)}
                    className="px-3 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-medium hover:bg-slate-200"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // TAB 3: TEAM TRIPS
  if (activeSubTab === 'team_trips') {
    return (
      <div className="space-y-3 pb-20">
        <div>
          <h2 className="text-base font-bold text-slate-900">Team Travel Calendar</h2>
          <p className="text-xs text-slate-500">Scheduled and ongoing trips for your reports</p>
        </div>

        <div className="space-y-2.5">
          {teamTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => onViewTripDetails(trip)}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm cursor-pointer hover:border-slate-300 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{trip.employeeName}</h4>
                  <p className="text-[11px] text-slate-500">
                    {trip.sourceCity} → {trip.destinationCity}
                  </p>
                </div>
                <span className="text-xs font-bold text-slate-900">
                  ₹{trip.estimatedBudget.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                <span>{trip.departureDate} to {trip.returnDate}</span>
                <span className="capitalize font-medium text-slate-700">
                  {trip.status.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TAB 4: EXPENSES REVIEW
  if (activeSubTab === 'expenses') {
    return (
      <div className="space-y-3 pb-20">
        <div>
          <h2 className="text-base font-bold text-slate-900">Team Expense Claims</h2>
          <p className="text-xs text-slate-500">Review receipts and sign off for payroll settlement</p>
        </div>

        <div className="space-y-2.5">
          {teamExpenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{exp.employeeName}</h4>
                  <p className="text-[11px] text-slate-500">{exp.category} · {exp.expenseDate}</p>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  ₹{exp.amount.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-600">{exp.description}</p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">{exp.receiptName}</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                  {exp.approvalStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TAB 5: PROFILE
  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-indigo-900 text-white flex items-center justify-center font-bold text-lg">
          VN
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Vikramaditya Nair</h2>
          <p className="text-xs text-slate-500">EMP-1003 · Lead Product Designer & Mgr</p>
          <span className="inline-block mt-1 text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            Approval Limit: Up to ₹1,00,000 / trip
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Delegation of Approval Authority
        </h3>
        <p className="text-xs text-slate-600">
          When out of office, delegate travel approval decisions to a peer manager:
        </p>
        <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
          <p className="font-semibold text-slate-800">Delegate: Elena Rostova (Staff Architect)</p>
          <p className="text-slate-500 text-[11px]">Active when Vikramaditya status is On Leave</p>
        </div>
      </div>
    </div>
  );
};
