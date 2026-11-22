'use client';

import React, { useState } from 'react';
import {
  Plane,
  Train,
  Building,
  Car,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Plus,
  ArrowRight,
  Download,
  Eye,
  MapPin,
  CreditCard,
  User,
  ShieldAlert,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import {
  BookingRecord,
  ExpenseClaimRecord,
  TravelAttachment,
  TravelRequestRecord,
} from '../../types/travelDesk';

interface EmployeeTravelViewProps {
  requests: TravelRequestRecord[];
  bookings: BookingRecord[];
  expenses: ExpenseClaimRecord[];
  activeSubTab: string;
  onSelectSubTab: (tab: string) => void;
  onRequestNewTrip: () => void;
  onRequestNewExpense: () => void;
  onPreviewDocument: (att: TravelAttachment) => void;
  onViewTripDetails: (trip: TravelRequestRecord) => void;
}

export const EmployeeTravelView: React.FC<EmployeeTravelViewProps> = ({
  requests,
  bookings,
  expenses,
  activeSubTab,
  onSelectSubTab,
  onRequestNewTrip,
  onRequestNewExpense,
  onPreviewDocument,
  onViewTripDetails,
}) => {
  const [tripFilter, setTripFilter] = useState<'all' | 'upcoming' | 'pending' | 'completed'>('all');

  // Filter for employee trips (Aarav Sharma EMP-1001 or active logged in profile)
  const employeeRequests = requests.filter(
    (r) => r.employeeId === 'EMP-1001' || r.employeeName === 'Aarav Sharma'
  );

  const upcomingTrips = employeeRequests.filter(
    (r) => (r.status === 'booked' || r.status === 'approved') && r.departureDate >= '2026-11-15'
  );
  const pendingTrips = employeeRequests.filter((r) =>
    r.status.startsWith('pending')
  );
  const completedTrips = employeeRequests.filter((r) => r.status === 'completed');

  const filteredTrips = employeeRequests.filter((r) => {
    if (tripFilter === 'upcoming')
      return (r.status === 'booked' || r.status === 'approved') && r.departureDate >= '2026-11-15';
    if (tripFilter === 'pending') return r.status.startsWith('pending');
    if (tripFilter === 'completed') return r.status === 'completed';
    return true;
  });

  const employeeExpenses = expenses.filter(
    (e) => e.employeeId === 'EMP-1001' || e.employeeName === 'Aarav Sharma'
  );

  const allDocuments: TravelAttachment[] = employeeRequests.flatMap((r) => r.attachments);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'booked':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Booked
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 text-blue-600" /> Approved
          </span>
        );
      case 'pending_manager':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" /> Pending Manager
          </span>
        );
      case 'pending_hr':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <Clock className="w-3 h-3 text-purple-600" /> Pending HR
          </span>
        );
      case 'pending_executive':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Pending Exec
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  // TAB 1: HOME
  if (activeSubTab === 'home') {
    const nextTrip = upcomingTrips[0] || employeeRequests[0];

    return (
      <div className="space-y-4 pb-20">
        {/* Welcome & Quick Action Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-indigo-950 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-start justify-between relative z-10">
            <div>
              <p className="text-xs uppercase tracking-wider text-indigo-200 font-semibold">Corporate Travel Desk</p>
              <h2 className="text-xl font-bold mt-0.5">Welcome, Aarav!</h2>
              <p className="text-xs text-indigo-100/80 mt-1">
                L5 Principal Engineer · Fintech Core CC
              </p>
            </div>
            <button
              onClick={onRequestNewTrip}
              className="flex items-center gap-1.5 px-3 py-2 bg-white text-indigo-700 rounded-xl font-semibold text-xs shadow hover:bg-indigo-50 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              New Trip
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-indigo-700/50">
            <div className="text-center">
              <p className="text-lg font-bold">{employeeRequests.length}</p>
              <p className="text-[10px] text-indigo-200">Total Trips</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-amber-300">{pendingTrips.length}</p>
              <p className="text-[10px] text-indigo-200">Pending</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-emerald-300">{upcomingTrips.length}</p>
              <p className="text-[10px] text-indigo-200">Upcoming</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-blue-200">{employeeExpenses.length}</p>
              <p className="text-[10px] text-indigo-200">Claims</p>
            </div>
          </div>
        </div>

        {/* Featured Upcoming Trip Card */}
        {nextTrip && (
          <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                  {nextTrip.travelMode === 'flight' && <Plane className="w-4 h-4" />}
                  {nextTrip.travelMode === 'train' && <Train className="w-4 h-4" />}
                  {nextTrip.travelMode === 'cab' && <Car className="w-4 h-4" />}
                </span>
                <div>
                  <span className="text-xs font-bold text-slate-900">Next Upcoming Trip</span>
                  <p className="text-[11px] text-slate-500">{nextTrip.id}</p>
                </div>
              </div>
              {getStatusBadge(nextTrip.status)}
            </div>

            <div className="py-3 flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs text-slate-500 font-medium">Departure</p>
                <p className="text-base font-bold text-slate-900">{nextTrip.sourceCity}</p>
                <p className="text-[11px] text-slate-500">{nextTrip.departureDate}</p>
              </div>
              <div className="flex flex-col items-center px-3">
                <div className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mb-1">
                  {nextTrip.purpose}
                </div>
                <div className="flex items-center gap-1 text-slate-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                  <div className="w-10 border-t border-dashed border-indigo-300" />
                  <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5">{nextTrip.travelClass}</span>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500 font-medium">Arrival</p>
                <p className="text-base font-bold text-slate-900">{nextTrip.destinationCity}</p>
                <p className="text-[11px] text-slate-500">{nextTrip.returnDate}</p>
              </div>
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
              <span className="text-slate-600 font-medium">
                Est. Budget: <strong className="text-slate-900">₹{nextTrip.estimatedBudget.toLocaleString()}</strong>
              </span>
              <button
                onClick={() => onViewTripDetails(nextTrip)}
                className="text-indigo-600 font-semibold hover:text-indigo-700 flex items-center gap-1 text-xs"
              >
                View Details <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Quick Actions Carousel */}
        <div>
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onRequestNewTrip}
              className="p-3 bg-white border border-slate-200 rounded-xl text-left hover:border-indigo-300 hover:shadow-sm transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2">
                <Plane className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Request Travel</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Flights, train & hotels</p>
            </button>
            <button
              onClick={onRequestNewExpense}
              className="p-3 bg-white border border-slate-200 rounded-xl text-left hover:border-emerald-300 hover:shadow-sm transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
                <CreditCard className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-900">Claim Expense</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Upload receipts</p>
            </button>
          </div>
        </div>

        {/* Recent Travel Activity List */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recent Requests
            </h3>
            <button
              onClick={() => onSelectSubTab('my_trips')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All ({employeeRequests.length})
            </button>
          </div>

          <div className="space-y-2">
            {employeeRequests.slice(0, 3).map((trip) => (
              <div
                key={trip.id}
                onClick={() => onViewTripDetails(trip)}
                className="bg-white p-3 rounded-xl border border-slate-200 hover:border-slate-300 transition-all cursor-pointer flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
                    {trip.travelMode === 'flight' && <Plane className="w-4 h-4 text-indigo-600" />}
                    {trip.travelMode === 'train' && <Train className="w-4 h-4 text-blue-600" />}
                    {trip.travelMode === 'cab' && <Car className="w-4 h-4 text-amber-600" />}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">
                      {trip.sourceCity} → {trip.destinationCity}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {trip.departureDate} · {trip.purpose}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(trip.status)}
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency SOS Travel Card */}
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-rose-900">24x7 Corporate SOS Hotline</p>
              <p className="text-[11px] text-rose-700">+91 80 4567 8999 (Emergency Assist)</p>
            </div>
          </div>
          <span className="text-xs font-semibold px-2 py-1 bg-rose-600 text-white rounded-lg">
            Call SOS
          </span>
        </div>
      </div>
    );
  }

  // TAB 2: MY TRIPS
  if (activeSubTab === 'my_trips') {
    return (
      <div className="space-y-3 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">My Travel Requests</h2>
            <p className="text-xs text-slate-500">Track and manage business travel itineraries</p>
          </div>
          <button
            onClick={onRequestNewTrip}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-indigo-700"
          >
            <Plus className="w-3.5 h-3.5" /> New Trip
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {(['all', 'upcoming', 'pending', 'completed'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setTripFilter(key)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
                tripFilter === key
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {key === 'all'
                ? `All (${employeeRequests.length})`
                : key === 'upcoming'
                ? `Upcoming (${upcomingTrips.length})`
                : key === 'pending'
                ? `Pending (${pendingTrips.length})`
                : `Completed (${completedTrips.length})`}
            </button>
          ))}
        </div>

        {/* List of Trip Cards */}
        <div className="space-y-3">
          {filteredTrips.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <Plane className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No travel requests found</p>
              <p className="text-xs text-slate-500 mt-1">
                You have no trips under the &quot;{tripFilter}&quot; filter.
              </p>
              <button
                onClick={onRequestNewTrip}
                className="mt-3 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold"
              >
                Create Request
              </button>
            </div>
          ) : (
            filteredTrips.map((trip) => (
              <div
                key={trip.id}
                className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono font-medium text-slate-400">
                      {trip.id} · {trip.tripType.toUpperCase()}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                      {trip.sourceCity} → {trip.destinationCity}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{trip.purpose}</p>
                  </div>
                  {getStatusBadge(trip.status)}
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-xl p-2.5 text-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Dates</span>
                    <p className="font-semibold text-slate-800 text-[11px] mt-0.5">
                      {trip.departureDate.slice(5)} to {trip.returnDate.slice(5)}
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Mode</span>
                    <p className="font-semibold text-slate-800 text-[11px] mt-0.5 capitalize">
                      {trip.travelMode} ({trip.travelClass})
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-medium">Budget</span>
                    <p className="font-semibold text-slate-800 text-[11px] mt-0.5">
                      ₹{trip.estimatedBudget.toLocaleString()}
                    </p>
                  </div>
                </div>

                {trip.attachments.length > 0 && (
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                    <FileText className="w-3.5 h-3.5 text-indigo-600" />
                    <span className="text-xs text-slate-600">
                      {trip.attachments.length} attachment(s) available
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => onViewTripDetails(trip)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                  >
                    View Details & Workflow <ArrowRight className="w-3 h-3" />
                  </button>
                  {trip.status === 'booked' && trip.attachments[0] && (
                    <button
                      onClick={() => onPreviewDocument(trip.attachments[0])}
                      className="px-2.5 py-1 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-medium flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" /> Ticket
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // TAB 3: EXPENSES
  if (activeSubTab === 'expenses') {
    const totalClaimed = employeeExpenses.reduce((acc, c) => acc + c.amount, 0);
    const totalReimbursed = employeeExpenses
      .filter((e) => e.approvalStatus === 'Reimbursed')
      .reduce((acc, c) => acc + c.amount, 0);

    return (
      <div className="space-y-4 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Travel Expenses</h2>
            <p className="text-xs text-slate-500">Reimbursements & claims management</p>
          </div>
          <button
            onClick={onRequestNewExpense}
            className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-emerald-700"
          >
            <Plus className="w-3.5 h-3.5" /> Submit Claim
          </button>
        </div>

        {/* Expense Metrics Card */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
            <span className="text-[10px] text-slate-500 uppercase font-semibold">Total Claimed</span>
            <p className="text-lg font-bold text-slate-900 mt-0.5">
              ₹{totalClaimed.toLocaleString()}
            </p>
            <p className="text-[10px] text-slate-500">{employeeExpenses.length} total receipt(s)</p>
          </div>
          <div className="bg-emerald-50/70 p-3.5 rounded-2xl border border-emerald-200 shadow-sm">
            <span className="text-[10px] text-emerald-700 uppercase font-semibold">Reimbursed</span>
            <p className="text-lg font-bold text-emerald-800 mt-0.5">
              ₹{totalReimbursed.toLocaleString()}
            </p>
            <p className="text-[10px] text-emerald-600">Direct to payroll</p>
          </div>
        </div>

        {/* Expense Claims List */}
        <div className="space-y-2.5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Expense Records
          </h3>
          {employeeExpenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900">{exp.category}</span>
                  <span className="text-[11px] text-slate-400 ml-2 font-mono">{exp.id}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  ₹{exp.amount.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-slate-600">{exp.description}</p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <span className="text-slate-500 text-[11px] flex items-center gap-1">
                  <Calendar className="w-3 h-3 text-slate-400" /> {exp.expenseDate}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                    exp.approvalStatus === 'Reimbursed'
                      ? 'bg-emerald-100 text-emerald-800'
                      : exp.approvalStatus === 'Manager Approved'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {exp.approvalStatus}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TAB 4: DOCUMENTS
  if (activeSubTab === 'documents') {
    return (
      <div className="space-y-3 pb-20">
        <div>
          <h2 className="text-base font-bold text-slate-900">Travel Documents & Tickets</h2>
          <p className="text-xs text-slate-500">Boarding passes, hotel vouchers & approvals</p>
        </div>

        <div className="space-y-2">
          {allDocuments.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-slate-200">
              <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-slate-700">No documents issued yet</p>
              <p className="text-xs text-slate-500 mt-1">
                Your tickets and vouchers will appear here once booked by HR Admin.
              </p>
            </div>
          ) : (
            allDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    {doc.category === 'ticket' ? (
                      <Plane className="w-4 h-4" />
                    ) : doc.category === 'hotel' ? (
                      <Building className="w-4 h-4" />
                    ) : (
                      <FileText className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 line-clamp-1">{doc.name}</p>
                    <p className="text-[11px] text-slate-500">
                      {doc.sizeFormatted} · Category: <span className="capitalize">{doc.category}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => onPreviewDocument(doc)}
                    className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => onPreviewDocument(doc)}
                    className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // TAB 5: PROFILE
  return (
    <div className="space-y-4 pb-20">
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-indigo-800 text-white flex items-center justify-center font-bold text-lg">
          AS
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Aarav Sharma</h2>
          <p className="text-xs text-slate-500">EMP-1001 · Principal Product Engineer</p>
          <span className="inline-block mt-1 text-[10px] font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">
            Travel Tier: L5 Lead (Domestic Flights & 4-Star)
          </span>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Frequent Flyer & Travel Preferences
        </h3>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">IndiGo 6E Rewards</span>
            <span className="font-semibold text-slate-800">6E-8892104</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Air India Flying Returns</span>
            <span className="font-semibold text-slate-800">AI-90214890</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Flight Seat Preference</span>
            <span className="font-semibold text-slate-800">Aisle (Forward)</span>
          </div>
          <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
            <span className="text-slate-500">Meal Preference</span>
            <span className="font-semibold text-slate-800">Vegetarian Hindu Meal (AVML)</span>
          </div>
          <div className="flex items-center justify-between py-1.5">
            <span className="text-slate-500">Passport Number</span>
            <span className="font-semibold text-slate-800">Z3891044 (Valid till 2031)</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
          Emergency Travel Contacts
        </h3>
        <div className="text-xs space-y-2">
          <div className="p-2.5 rounded-xl bg-slate-50">
            <p className="font-semibold text-slate-900">Pooja Sharma (Spouse)</p>
            <p className="text-slate-500 text-[11px] mt-0.5">+91 98765 43210 · Bengaluru</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-50">
            <p className="font-semibold text-slate-900">Reporting Manager: Vikramaditya Nair</p>
            <p className="text-slate-500 text-[11px] mt-0.5">+91 98110 09988 · vikram@ofc360.internal</p>
          </div>
        </div>
      </div>
    </div>
  );
};
