'use client';

import React, { useState } from 'react';
import {
  Plane,
  Train,
  Building,
  Car,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  DollarSign,
  AlertTriangle,
  ChevronRight,
  Layers,
  Shield,
  CreditCard,
  Briefcase,
  Globe,
  Compass,
  FileCheck,
  Check,
  Download,
} from 'lucide-react';
import {
  BookingMode,
  BookingRecord,
  ExpenseClaimRecord,
  TravelAttachment,
  TravelDeskSettings,
  TravelPolicyRule,
  TravelRequestRecord,
  TravelRequestStatus,
} from '../../types/travelDesk';
import { calculateTravelKpis } from '../../services/travel-desk/travelDeskEngine';

interface HrAdminTravelViewProps {
  requests: TravelRequestRecord[];
  bookings: BookingRecord[];
  expenses: ExpenseClaimRecord[];
  settings: TravelDeskSettings;
  policies: TravelPolicyRule[];
  activeSubTab: string;
  onSelectSubTab: (tab: string) => void;
  onReviewRequest: (request: TravelRequestRecord) => void;
  onViewTripDetails: (trip: TravelRequestRecord) => void;
  onAddNewBooking: (requestId?: string) => void;
  onMarkReimbursed: (expenseId: string) => void;
  onPreviewDocument: (att: TravelAttachment) => void;
}

export const HrAdminTravelView: React.FC<HrAdminTravelViewProps> = ({
  requests,
  bookings,
  expenses,
  settings,
  policies,
  activeSubTab,
  onSelectSubTab,
  onReviewRequest,
  onViewTripDetails,
  onAddNewBooking,
  onMarkReimbursed,
  onPreviewDocument,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [bookingModeFilter, setBookingModeFilter] = useState<string>('all');
  const [selectedSubModule, setSelectedSubModule] = useState<string | null>(null);

  const kpis = calculateTravelKpis(requests, expenses);

  const filteredRequests = requests.filter((r) => {
    const matchesSearch =
      r.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.destinationCity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredBookings = bookings.filter((b) => {
    if (bookingModeFilter === 'all') return true;
    return b.mode === bookingModeFilter;
  });

  const pendingHrRequests = requests.filter((r) => r.status === 'pending_hr');

  // The 19 administrative sub-modules requested by user
  const adminSubModules = [
    { id: 'policy_engine', name: '1. Travel Policy Engine', desc: 'Rules, flight limits & approval matrices', icon: Shield },
    { id: 'corp_cards', name: '2. Corporate Card Integration', desc: 'Virtual Amex & HDFC auto-feed', icon: CreditCard },
    { id: 'preferred_vendors', name: '3. Preferred Vendors & Agencies', desc: 'MakeMyTrip, Yatra & Amadeus desks', icon: Briefcase },
    { id: 'carbon_esg', name: '4. Carbon Offset & ESG Tracker', desc: 'CO2 emissions and green travel scores', icon: Globe },
    { id: 'visa_immigration', name: '5. Visa, Passport & Immigration Desk', desc: 'Schengen, US B1/B2 & Singapore permits', icon: FileCheck },
    { id: 'per_diem_engine', name: '6. Per Diem & Daily Allowance Engine', desc: 'Tier-1/2 metro allowances & international rates', icon: DollarSign },
    { id: 'duty_of_care', name: '7. SOS & Duty of Care Tracker', desc: 'Live traveller location & incident safety', icon: Compass },
    { id: 'group_bookings', name: '8. Group & Team Booking Coordinator', desc: 'Offsites, hackathons & annual summit', icon: Layers },
    { id: 'multicity_planner', name: '9. Multi-City & Layover Planner', desc: 'Complex international multi-leg itineraries', icon: Plane },
    { id: 'travel_advances', name: '10. Travel Advance Disbursement', desc: 'Pre-trip cash allowances via UPI/NEFT', icon: CreditCard },
    { id: 'cancellation_refunds', name: '11. Cancellation & Refund Desk', desc: 'Ticket credit notes & fee recovery', icon: Clock },
    { id: 'loyalty_aggregator', name: '12. Corporate Loyalty Points Aggregator', desc: 'Marriott Bonvoy, Taj InnerCircle & Air India', icon: TrendingUp },
    { id: 'vip_concierge', name: '13. VIP / Executive Travel Concierge', desc: 'C-Suite airport lounge & chauffeur protocols', icon: Briefcase },
    { id: 'insurance_desk', name: '14. Travel Insurance Management', desc: 'Tata AIG global medical & baggage covers', icon: Shield },
    { id: 'live_flight_radar', name: '15. Real-Time Flight Tracker', desc: 'FlightRadar24 delays & gate updates', icon: Plane },
    { id: 'audit_compliance', name: '16. Audit & Compliance Log', desc: 'Immutable SOX-compliant approval logs', icon: FileText },
    { id: 'cost_center_gl', name: '17. Cost Center & GL Mapping', desc: 'SAP ERP & Oracle NetSuite account codes', icon: DollarSign },
    { id: 'sla_dashboard', name: '18. SLA & Resolution Dashboard', desc: 'HR ticketing TAT & employee satisfaction', icon: CheckCircle2 },
    { id: 'custom_reports', name: '19. Custom Travel Reports & Exports', desc: 'GST input tax credit & monthly MIS', icon: Download },
  ];

  // TAB 1: DASHBOARD
  if (activeSubTab === 'dashboard') {
    return (
      <div className="space-y-4 pb-20">
        {/* HR Admin KPI Banner */}
        <div className="bg-gradient-to-br from-purple-950 via-indigo-900 to-slate-900 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-purple-300">
                HR Travel Desk Administrator
              </span>
              <h2 className="text-xl font-bold mt-0.5">Enterprise Travel Hub</h2>
              <p className="text-xs text-purple-200/80 mt-1">
                OFC360 Corporate Mobility · {requests.length} Total Trips
              </p>
            </div>
            {pendingHrRequests.length > 0 && (
              <span className="px-3 py-1.5 bg-purple-500/30 border border-purple-400/40 rounded-xl text-xs font-semibold text-purple-200">
                {pendingHrRequests.length} Pending Booking
              </span>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-purple-800/60 text-center">
            <div>
              <p className="text-lg font-bold text-white">{kpis.totalRequests}</p>
              <p className="text-[10px] text-purple-200">All Trips</p>
            </div>
            <div>
              <p className="text-lg font-bold text-amber-300">{kpis.pendingApprovals}</p>
              <p className="text-[10px] text-purple-200">Pending</p>
            </div>
            <div>
              <p className="text-lg font-bold text-emerald-300">{kpis.approvedTrips}</p>
              <p className="text-[10px] text-purple-200">Booked/Appr</p>
            </div>
            <div>
              <p className="text-lg font-bold text-cyan-200">{kpis.upcomingTrips}</p>
              <p className="text-[10px] text-purple-200">Upcoming</p>
            </div>
          </div>
        </div>

        {/* Spend Overview Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">
                Corporate Travel Budget
              </span>
              <h3 className="text-base font-bold text-slate-900">
                ₹{kpis.totalCommittedBudget.toLocaleString()} / ₹{kpis.budgetAnnual.toLocaleString()}
              </h3>
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700">
              {kpis.budgetUtilizationPct}% Spent
            </span>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-indigo-600 h-2.5 rounded-full"
              style={{ width: `${kpis.budgetUtilizationPct}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Expenses Claimed: ₹{kpis.totalExpenseClaimed.toLocaleString()}</span>
            <span className="text-emerald-600 font-semibold">
              Reimbursed: ₹{kpis.totalExpenseReimbursed.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Pending HR Booking Queue */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pending HR Action ({pendingHrRequests.length})
            </h3>
            <button
              onClick={() => onSelectSubTab('requests')}
              className="text-xs font-semibold text-indigo-600"
            >
              View Requests
            </button>
          </div>

          {pendingHrRequests.length === 0 ? (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto mb-1" />
              <p className="text-xs font-bold text-emerald-900">No HR Actions Pending</p>
              <p className="text-[11px] text-emerald-700">All manager-approved trips have been processed.</p>
            </div>
          ) : (
            pendingHrRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white p-4 rounded-2xl border border-purple-200 shadow-sm space-y-2.5"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-mono text-slate-400">{req.id}</span>
                    <h4 className="text-xs font-bold text-slate-900">{req.employeeName}</h4>
                    <p className="text-[11px] text-slate-500">
                      {req.sourceCity} → {req.destinationCity} · {req.departureDate}
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-100 text-purple-800">
                    Awaiting Ticket Booking
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="font-semibold text-indigo-600">
                    Budget: ₹{req.estimatedBudget.toLocaleString()}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onAddNewBooking(req.id)}
                      className="px-2.5 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700"
                    >
                      Book Ticket
                    </button>
                    <button
                      onClick={() => onReviewRequest(req)}
                      className="px-2 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                    >
                      Action
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 19 Administrative Tools Showcase Grid */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              19 Administrative Tools
            </h3>
            <button
              onClick={() => onSelectSubTab('more')}
              className="text-xs font-semibold text-indigo-600"
            >
              See All (19)
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {adminSubModules.slice(0, 4).map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    setSelectedSubModule(mod.id);
                    onSelectSubTab('more');
                  }}
                  className="bg-white p-3 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer space-y-1"
                >
                  <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{mod.name.replace(/^\d+\.\s*/, '')}</p>
                  <p className="text-[10px] text-slate-500 line-clamp-1">{mod.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // TAB 2: REQUESTS REPOSITORY
  if (activeSubTab === 'requests') {
    return (
      <div className="space-y-3 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">All Travel Requests</h2>
            <p className="text-xs text-slate-500">Corporate repository of employee travel</p>
          </div>
          <button
            onClick={() => onAddNewBooking()}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-indigo-700"
          >
            <Plus className="w-3.5 h-3.5" /> Book Itinerary
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search employee, city, TRV-ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['all', 'pending_hr', 'pending_manager', 'booked', 'approved', 'completed'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
                statusFilter === st
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {st.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Requests List */}
        <div className="space-y-2.5">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">{req.id}</span>
                  <h4 className="text-xs font-bold text-slate-900">{req.employeeName}</h4>
                  <p className="text-[11px] text-slate-500">
                    {req.sourceCity} → {req.destinationCity} · {req.departureDate}
                  </p>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 capitalize">
                  {req.status.replace('_', ' ')}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="font-semibold text-slate-800">
                  ₹{req.estimatedBudget.toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onViewTripDetails(req)}
                    className="text-xs font-semibold text-indigo-600"
                  >
                    View Details
                  </button>
                  {req.status === 'pending_hr' && (
                    <button
                      onClick={() => onReviewRequest(req)}
                      className="px-2.5 py-1 bg-purple-600 text-white rounded-lg text-xs font-semibold"
                    >
                      Process
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TAB 3: BOOKINGS MANAGEMENT
  if (activeSubTab === 'bookings') {
    return (
      <div className="space-y-3 pb-20">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Corporate Bookings</h2>
            <p className="text-xs text-slate-500">Issued flights, hotels, trains & cabs</p>
          </div>
          <button
            onClick={() => onAddNewBooking()}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow hover:bg-indigo-700"
          >
            <Plus className="w-3.5 h-3.5" /> Issue Ticket
          </button>
        </div>

        {/* Mode filter pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {['all', 'flight', 'hotel', 'train', 'cab'].map((mode) => (
            <button
              key={mode}
              onClick={() => setBookingModeFilter(mode)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize whitespace-nowrap transition-all ${
                bookingModeFilter === mode
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="space-y-2.5">
          {filteredBookings.map((bkg) => (
            <div
              key={bkg.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    {bkg.mode === 'flight' && <Plane className="w-4 h-4" />}
                    {bkg.mode === 'hotel' && <Building className="w-4 h-4" />}
                    {bkg.mode === 'train' && <Train className="w-4 h-4" />}
                    {bkg.mode === 'cab' && <Car className="w-4 h-4" />}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{bkg.vendor}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">{bkg.bookingReference}</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                  {bkg.status}
                </span>
              </div>

              <p className="text-xs text-slate-600">{bkg.details}</p>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                <span className="text-slate-500">Traveller: <strong className="text-slate-800">{bkg.employeeName}</strong></span>
                <span className="font-bold text-slate-900">₹{bkg.actualCost.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TAB 4: EXPENSES QUEUE
  if (activeSubTab === 'expenses') {
    return (
      <div className="space-y-3 pb-20">
        <div>
          <h2 className="text-base font-bold text-slate-900">HR Expense Processor</h2>
          <p className="text-xs text-slate-500">Direct-to-payroll disbursement queue</p>
        </div>

        <div className="space-y-2.5">
          {expenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm space-y-2"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{exp.employeeName}</h4>
                  <p className="text-[11px] text-slate-500">{exp.category} · {exp.expenseDate}</p>
                </div>
                <span className="text-sm font-bold text-slate-900">₹{exp.amount.toLocaleString()}</span>
              </div>
              <p className="text-xs text-slate-600">{exp.description}</p>
              <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-mono text-[11px]">{exp.receiptName}</span>
                {exp.approvalStatus !== 'Reimbursed' ? (
                  <button
                    onClick={() => onMarkReimbursed(exp.id)}
                    className="flex items-center gap-1 px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700"
                  >
                    <Check className="w-3 h-3" /> Mark Reimbursed
                  </button>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800">
                    Reimbursed
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // TAB 5: MORE (19 Administrative Sub-Tools)
  return (
    <div className="space-y-4 pb-20">
      <div>
        <h2 className="text-base font-bold text-slate-900">19 Administrative Sub-Modules</h2>
        <p className="text-xs text-slate-500">
          Enterprise travel controls, policies, vendors & compliance tools
        </p>
      </div>

      {selectedSubModule ? (
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-xs font-bold text-indigo-700">
              {adminSubModules.find((m) => m.id === selectedSubModule)?.name}
            </h3>
            <button
              onClick={() => setSelectedSubModule(null)}
              className="text-xs font-medium text-slate-500 hover:text-slate-700"
            >
              ← Back to All Tools
            </button>
          </div>

          {selectedSubModule === 'policy_engine' && (
            <div className="space-y-2 text-xs">
              <p className="text-slate-600">Configured corporate grades and flight allowances:</p>
              {policies.map((p, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <p className="font-bold text-slate-900">{p.grade}</p>
                  <p className="text-slate-500">Flight Max: ₹{p.flightMaxBudget.toLocaleString()} · Hotel/Day: ₹{p.hotelDailyLimit.toLocaleString()}</p>
                  <p className="text-slate-500">Per Diem: ₹{p.perDiemLimit.toLocaleString()} / day</p>
                </div>
              ))}
            </div>
          )}

          {selectedSubModule === 'corp_cards' && (
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl">
                <p className="font-bold text-indigo-950">Amex Global Corporate Card (Ending 4099)</p>
                <p className="text-indigo-800 text-[11px] mt-0.5">Automated transaction matching active. 99.4% auto-reconciliation.</p>
              </div>
            </div>
          )}

          {selectedSubModule !== 'policy_engine' && selectedSubModule !== 'corp_cards' && (
            <div className="p-4 bg-slate-50 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-6 h-6 text-indigo-600 mx-auto" />
              <p className="text-xs font-bold text-slate-800">Operational & Synchronized</p>
              <p className="text-[11px] text-slate-500">
                This administrative module is active in frontend standalone mode for enterprise HR demo.
              </p>
            </div>
          )}
        </div>
      ) : null}

      <div className="bg-white rounded-2xl border border-zinc-200/80 divide-y divide-zinc-100 overflow-hidden">
        {adminSubModules.map((mod) => (
          <div
            key={mod.id}
            onClick={() => setSelectedSubModule(mod.id)}
            className="px-4 py-3.5 hover:bg-zinc-100/70 transition-colors cursor-pointer flex items-center justify-between gap-3"
          >
            <div className="min-w-0 flex-1">
              <p className="text-[14px] font-semibold text-zinc-950 truncate">{mod.name}</p>
              <p className="text-[12px] text-zinc-500 truncate mt-0.5">{mod.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
