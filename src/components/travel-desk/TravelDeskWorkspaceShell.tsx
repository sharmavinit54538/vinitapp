'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Bell,
  ShieldAlert,
  Home,
  Briefcase,
  CreditCard,
  FileText,
  User,
  Users,
  CheckCircle2,
  Calendar,
  Layers,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Plus,
  Plane,
  X,
} from 'lucide-react';
import {
  BookingRecord,
  ExpenseClaimRecord,
  TravelActivityLog,
  TravelAttachment,
  TravelDeskSettings,
  TravelNotificationItem,
  TravelPolicyRule,
  TravelRequestRecord,
  TravelRole,
} from '../../types/travelDesk';
import {
  INITIAL_ACTIVITY_LOGS,
  INITIAL_BOOKINGS,
  INITIAL_EXPENSES,
  INITIAL_NOTIFICATIONS,
  INITIAL_TRAVEL_POLICIES,
  INITIAL_TRAVEL_REQUESTS,
  INITIAL_TRAVEL_SETTINGS,
} from '../../services/travel-desk/travelDeskEngine';
import { EmployeeTravelView } from './EmployeeTravelView';
import { ManagerTravelView } from './ManagerTravelView';
import { HrAdminTravelView } from './HrAdminTravelView';
import { ExecutiveTravelView } from './ExecutiveTravelView';
import {
  ApprovalReviewModal,
  CreateTravelRequestModal,
  DocumentPreviewModal,
  SubmitExpenseModal,
} from './TravelDeskModals';

interface TravelDeskWorkspaceShellProps {
  embedded?: boolean;
  startInDirectory?: boolean;
  onBackFromEmbedded?: () => void;
}

export const TravelDeskWorkspaceShell: React.FC<TravelDeskWorkspaceShellProps> = ({
  embedded = false,
  startInDirectory = false,
  onBackFromEmbedded,
}) => {
  // Current active role
  const [activeRole, setActiveRole] = useState<TravelRole>('employee');
  const [activeSubTab, setActiveSubTab] = useState<string>('home');

  // Core Data Collections
  const [requests, setRequests] = useState<TravelRequestRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ofc360_travel_requests');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_TRAVEL_REQUESTS;
  });

  const [bookings, setBookings] = useState<BookingRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ofc360_travel_bookings');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_BOOKINGS;
  });

  const [expenses, setExpenses] = useState<ExpenseClaimRecord[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ofc360_travel_expenses');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_EXPENSES;
  });

  const [notifications, setNotifications] = useState<TravelNotificationItem[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('ofc360_travel_notifications');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error(e);
        }
      }
    }
    return INITIAL_NOTIFICATIONS;
  });

  const [settings, setSettings] = useState<TravelDeskSettings>(INITIAL_TRAVEL_SETTINGS);
  const [policies] = useState<TravelPolicyRule[]>(INITIAL_TRAVEL_POLICIES);
  const [activityLogs, setActivityLogs] = useState<TravelActivityLog[]>(INITIAL_ACTIVITY_LOGS);

  // Sync to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ofc360_travel_requests', JSON.stringify(requests));
    }
  }, [requests]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ofc360_travel_bookings', JSON.stringify(bookings));
    }
  }, [bookings]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('ofc360_travel_expenses', JSON.stringify(expenses));
    }
  }, [expenses]);

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [reviewRequestItem, setReviewRequestItem] = useState<TravelRequestRecord | null>(null);
  const [previewDocItem, setPreviewDocItem] = useState<TravelAttachment | null>(null);
  const [selectedTripDetails, setSelectedTripDetails] = useState<TravelRequestRecord | null>(null);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [showSosModal, setShowSosModal] = useState(false);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Switch role and reset subTab to default for that role
  const handleRoleChange = (newRole: TravelRole) => {
    setActiveRole(newRole);
    if (newRole === 'employee') setActiveSubTab('home');
    else if (newRole === 'manager') setActiveSubTab('dashboard');
    else if (newRole === 'hr_admin') setActiveSubTab('dashboard');
    else if (newRole === 'executive') setActiveSubTab('overview');
  };

  // Add new request handler
  const handleCreateRequest = (newReqData: Partial<TravelRequestRecord>) => {
    const id = `TRV-2026-00${requests.length + 1}`;
    const newRecord: TravelRequestRecord = {
      id,
      employeeId: newReqData.employeeId || 'EMP-1001',
      employeeName: newReqData.employeeName || 'Aarav Sharma',
      department: newReqData.department || 'Engineering',
      designation: newReqData.designation || 'Principal Product Engineer',
      reportingManager: newReqData.reportingManager || 'Vikramaditya Nair',
      tripType: newReqData.tripType || 'domestic',
      purpose: newReqData.purpose || 'Client Meeting',
      sourceCity: newReqData.sourceCity || 'Bengaluru',
      destinationCity: newReqData.destinationCity || 'Mumbai',
      departureDate: newReqData.departureDate || '2026-11-20',
      returnDate: newReqData.returnDate || '2026-11-22',
      travelMode: newReqData.travelMode || 'flight',
      travelClass: newReqData.travelClass || 'Economy',
      hotelRequired: Boolean(newReqData.hotelRequired),
      accommodationType: newReqData.accommodationType || 'Business Hotel',
      projectCostCenter: newReqData.projectCostCenter || 'CC-ENG-FINTECH',
      estimatedBudget: Number(newReqData.estimatedBudget) || 25000,
      emergencyContact: newReqData.emergencyContact || '+91 98765 43210',
      notes: newReqData.notes || '',
      status: newReqData.status || 'pending_manager',
      policyViolation: Boolean(newReqData.policyViolation),
      policyViolationReason: newReqData.policyViolationReason,
      submittedAt: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
      approvalHistory: [
        {
          id: `APH-${Date.now()}`,
          actor: newReqData.employeeName || 'Aarav Sharma',
          role: 'Employee',
          action: 'Submitted',
          timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          comments: newReqData.notes || 'Travel request submitted via mobile app.',
        },
      ],
      attachments: [],
    };

    setRequests([newRecord, ...requests]);

    // Add activity log
    const newLog: TravelActivityLog = {
      id: `LOG-${Date.now()}`,
      actor: newRecord.employeeName,
      action: 'Travel Request Created',
      targetId: id,
      details: `${newRecord.tripType.toUpperCase()} trip to ${newRecord.destinationCity} (₹${newRecord.estimatedBudget.toLocaleString()})`,
      timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
    };
    setActivityLogs([newLog, ...activityLogs]);

    // Push notification for manager
    const newNotif: TravelNotificationItem = {
      id: `NTF-${Date.now()}`,
      type: 'request_submitted',
      title: 'New Trip Request Pending Approval',
      message: `${newRecord.employeeName} submitted a request to ${newRecord.destinationCity}.`,
      timestamp: 'Just now',
      read: false,
      relatedRequestId: id,
    };
    setNotifications([newNotif, ...notifications]);
  };

  // Approval Decision Handler
  const handleApprovalDecision = (
    requestId: string,
    action: 'Approved' | 'Rejected' | 'Sent Back',
    comments: string
  ) => {
    setRequests(
      requests.map((r) => {
        if (r.id !== requestId) return r;

        let nextStatus = r.status;
        if (action === 'Rejected') nextStatus = 'rejected';
        else if (action === 'Sent Back') nextStatus = 'sent_back';
        else if (action === 'Approved') {
          if (r.status === 'pending_manager') {
            nextStatus = r.policyViolation ? 'pending_executive' : 'pending_hr';
          } else if (r.status === 'pending_executive') {
            nextStatus = 'pending_hr';
          } else if (r.status === 'pending_hr') {
            nextStatus = 'approved';
          }
        }

        const newHistoryItem = {
          id: `APH-${Date.now()}`,
          actor:
            activeRole === 'manager'
              ? 'Vikramaditya Nair'
              : activeRole === 'hr_admin'
              ? 'Priya Krishnan'
              : 'Executive Board',
          role:
            activeRole === 'manager'
              ? 'Manager'
              : activeRole === 'hr_admin'
              ? 'HR Admin'
              : 'Executive',
          action: action,
          timestamp: new Date().toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }),
          comments: comments || `${action} by ${activeRole.toUpperCase()}`,
        };

        return {
          ...r,
          status: nextStatus,
          approvalHistory: [...r.approvalHistory, newHistoryItem],
        };
      })
    );

    // Notify employee
    const notif: TravelNotificationItem = {
      id: `NTF-${Date.now()}`,
      type: action === 'Approved' ? 'request_approved' : 'request_rejected',
      title: `Travel Request ${action}`,
      message: `Your trip ${requestId} was ${action.toLowerCase()} by ${activeRole.toUpperCase()}.`,
      timestamp: 'Just now',
      read: false,
      relatedRequestId: requestId,
    };
    setNotifications([notif, ...notifications]);
  };

  // Expense Submission Handler
  const handleCreateExpense = (newExp: Partial<ExpenseClaimRecord>) => {
    const id = `EXP-2026-${expenses.length + 105}`;
    const claim: ExpenseClaimRecord = {
      id,
      travelRequestId: newExp.travelRequestId || 'TRV-2026-001',
      employeeName: newExp.employeeName || 'Aarav Sharma',
      employeeId: newExp.employeeId || 'EMP-1001',
      category: newExp.category || 'Meals',
      amount: Number(newExp.amount) || 1500,
      expenseDate: newExp.expenseDate || '2026-11-15',
      description: newExp.description || 'Business travel expenses',
      receiptName: newExp.receiptName || 'receipt.pdf',
      approvalStatus: newExp.approvalStatus || 'Submitted',
    };
    setExpenses([claim, ...expenses]);
  };

  // HR Reimbursement Handler
  const handleMarkReimbursed = (expenseId: string) => {
    setExpenses(
      expenses.map((e) =>
        e.id === expenseId
          ? {
              ...e,
              approvalStatus: 'Reimbursed',
              reimbursedDate: new Date().toISOString().split('T')[0],
            }
          : e
      )
    );
  };

  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  // Get subtabs for current active role
  const getRoleTabs = (role: TravelRole) => {
    if (role === 'employee') {
      return [
        { id: 'home', label: 'Home' },
        { id: 'my_trips', label: 'My Trips' },
        { id: 'expenses', label: 'Expenses' },
        { id: 'documents', label: 'Documents' },
      ];
    }
    if (role === 'manager') {
      return [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'approvals', label: 'Approvals' },
        { id: 'team_trips', label: 'Team Trips' },
        { id: 'expenses', label: 'Expenses' },
      ];
    }
    if (role === 'hr_admin') {
      return [
        { id: 'dashboard', label: 'Dashboard' },
        { id: 'requests', label: 'Requests' },
        { id: 'bookings', label: 'Bookings' },
        { id: 'expenses', label: 'Expenses' },
        { id: 'more', label: 'More (19)' },
      ];
    }
    if (role === 'executive') {
      return [
        { id: 'overview', label: 'Overview' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'approvals', label: 'Approvals' },
        { id: 'reports', label: 'Reports' },
      ];
    }
    return [];
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col items-center">
      {/* Mobile Shell Container */}
      <div className="w-full max-w-[440px] min-h-screen bg-slate-50 flex flex-col relative shadow-xl border-x border-slate-200/80">
        
        {/* Navigation & Controls */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200/80 px-4 py-2">
          {/* Top Subtab Navigation Pills */}
          <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium text-slate-600 overflow-x-auto no-scrollbar">
            {getRoleTabs(activeRole).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex-1 min-w-[60px] py-1.5 px-2 rounded-lg text-center transition-all ${
                  activeSubTab === tab.id
                    ? 'bg-white text-indigo-600 font-bold shadow-xs'
                    : 'hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {/* Main Content Area per Active Role */}
        <main className="flex-1 p-4 pb-8">
          {activeRole === 'employee' && (
            <EmployeeTravelView
              requests={requests}
              bookings={bookings}
              expenses={expenses}
              activeSubTab={activeSubTab}
              onSelectSubTab={setActiveSubTab}
              onRequestNewTrip={() => setIsCreateModalOpen(true)}
              onRequestNewExpense={() => setIsExpenseModalOpen(true)}
              onPreviewDocument={setPreviewDocItem}
              onViewTripDetails={setSelectedTripDetails}
            />
          )}

          {activeRole === 'manager' && (
            <ManagerTravelView
              requests={requests}
              expenses={expenses}
              activeSubTab={activeSubTab}
              onSelectSubTab={setActiveSubTab}
              onReviewRequest={setReviewRequestItem}
              onViewTripDetails={setSelectedTripDetails}
            />
          )}

          {activeRole === 'hr_admin' && (
            <HrAdminTravelView
              requests={requests}
              bookings={bookings}
              expenses={expenses}
              settings={settings}
              policies={policies}
              activeSubTab={activeSubTab}
              onSelectSubTab={setActiveSubTab}
              onReviewRequest={setReviewRequestItem}
              onViewTripDetails={setSelectedTripDetails}
              onAddNewBooking={() => setShowBookingModal(true)}
              onMarkReimbursed={handleMarkReimbursed}
              onPreviewDocument={setPreviewDocItem}
            />
          )}

          {activeRole === 'executive' && (
            <ExecutiveTravelView
              requests={requests}
              expenses={expenses}
              settings={settings}
              activeSubTab={activeSubTab}
              onSelectSubTab={setActiveSubTab}
              onReviewRequest={setReviewRequestItem}
              onViewTripDetails={setSelectedTripDetails}
            />
          )}
        </main>
      </div>

      {/* MODAL 1: Create Travel Request Modal */}
      <CreateTravelRequestModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateRequest}
        settings={settings}
      />

      {/* MODAL 2: Submit Expense Modal */}
      <SubmitExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onSubmit={handleCreateExpense}
        activeTrips={requests}
      />

      {/* MODAL 3: Approval Review Modal */}
      <ApprovalReviewModal
        request={reviewRequestItem}
        actorRole={activeRole}
        onClose={() => setReviewRequestItem(null)}
        onAction={(id, action, comments) => {
          const actionMap: Record<string, 'Approved' | 'Rejected' | 'Sent Back'> = {
            approve: 'Approved',
            reject: 'Rejected',
            send_back: 'Sent Back',
          };
          handleApprovalDecision(id, actionMap[action] || 'Approved', comments);
        }}
      />

      {/* MODAL 4: Document Preview Modal */}
      <DocumentPreviewModal
        attachment={previewDocItem}
        onClose={() => setPreviewDocItem(null)}
      />

      {/* MODAL 5: Trip Details Drawer Modal */}
      {selectedTripDetails && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-[440px] max-h-[85vh] rounded-t-3xl sm:rounded-2xl p-5 overflow-y-auto space-y-4">
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-mono font-medium text-slate-400">
                  {selectedTripDetails.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">
                  {selectedTripDetails.sourceCity} → {selectedTripDetails.destinationCity}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedTripDetails.purpose} · {selectedTripDetails.tripType.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => setSelectedTripDetails(null)}
                className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl">
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Traveller</span>
                <p className="font-semibold text-slate-900">{selectedTripDetails.employeeName}</p>
                <p className="text-[10px] text-slate-500">{selectedTripDetails.designation}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Dates</span>
                <p className="font-semibold text-slate-900">
                  {selectedTripDetails.departureDate} to {selectedTripDetails.returnDate}
                </p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Cost Center</span>
                <p className="font-semibold text-slate-900">{selectedTripDetails.projectCostCenter}</p>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase">Estimated Budget</span>
                <p className="font-bold text-indigo-600">
                  ₹{selectedTripDetails.estimatedBudget.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Approval Workflow Stepper */}
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                Approval Workflow History
              </h4>
              <div className="space-y-2 border-l-2 border-indigo-200 ml-2 pl-3">
                {selectedTripDetails.approvalHistory.map((step) => (
                  <div key={step.id} className="relative text-xs">
                    <div className="absolute -left-[19px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-600" />
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">
                        {step.action} by {step.actor} ({step.role})
                      </span>
                      <span className="text-[10px] text-slate-400">{step.timestamp}</span>
                    </div>
                    {step.comments && (
                      <p className="text-slate-600 text-[11px] mt-0.5">&quot;{step.comments}&quot;</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedTripDetails(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Close Details
            </button>
          </div>
        </div>
      )}

      {/* MODAL 6: Notifications Center */}
      {showNotificationsModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full max-w-[440px] max-h-[85vh] rounded-t-3xl sm:rounded-2xl p-5 overflow-y-auto space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Travel Notifications</h3>
              <button
                onClick={() => setShowNotificationsModal(false)}
                className="p-1 rounded-full hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    setNotifications(
                      notifications.map((item) =>
                        item.id === n.id ? { ...item, read: true } : item
                      )
                    );
                  }}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    n.read
                      ? 'bg-white border-slate-200'
                      : 'bg-indigo-50/70 border-indigo-200 font-medium'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{n.title}</span>
                    <span className="text-[10px] text-slate-400">{n.timestamp}</span>
                  </div>
                  <p className="text-slate-600 mt-1">{n.message}</p>
                </div>
              ))}
            </div>

            <button
              onClick={() => {
                setNotifications(notifications.map((n) => ({ ...n, read: true })));
              }}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs"
            >
              Mark All as Read
            </button>
          </div>
        </div>
      )}

      {/* MODAL 7: Emergency SOS Modal */}
      {showSosModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-950">24x7 Corporate SOS Desk</h3>
              <p className="text-xs text-rose-700 mt-1">
                Emergency travel incident response, medical assistance & repatriation.
              </p>
            </div>
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 font-mono font-bold">
              {settings.emergencyTravelHotline}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowSosModal(false)}
                className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Connecting to Corporate 24x7 SOS Travel Operator...');
                  setShowSosModal(false);
                }}
                className="flex-1 py-2 bg-rose-600 text-white rounded-xl text-xs font-semibold hover:bg-rose-700"
              >
                Call Operator
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: HR Quick Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Issue Corporate Ticket</h3>
              <button onClick={() => setShowBookingModal(false)}>
                <X className="w-4 h-4 text-slate-500" />
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Simulate instant booking confirmation and PNR issuance through corporate travel agency.
            </p>
            <div className="space-y-2 text-xs">
              <input
                type="text"
                placeholder="Vendor (e.g. IndiGo, IRCTC, Taj Hotels)"
                defaultValue="IndiGo Corporate 6E"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
              <input
                type="text"
                placeholder="PNR / Reference Number"
                defaultValue="PNR: 6E-9042A"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
              <input
                type="number"
                placeholder="Actual Cost (₹)"
                defaultValue="14500"
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <button
              onClick={() => {
                const newBkg: BookingRecord = {
                  id: `BKG-FL-${Date.now().toString().slice(-4)}`,
                  travelRequestId: 'TRV-2026-003',
                  employeeName: 'Elena Rostova',
                  mode: 'flight',
                  vendor: 'IndiGo Corporate 6E',
                  bookingReference: 'PNR: 6E-9042A',
                  bookingDate: '2026-11-15',
                  travelDate: '2026-12-05',
                  estimatedCost: 15000,
                  actualCost: 14500,
                  status: 'Confirmed',
                  details: 'BLR -> DEL · 07:00 AM - 09:45 AM · Seat 3A',
                };
                setBookings([newBkg, ...bookings]);
                setShowBookingModal(false);
              }}
              className="w-full py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700"
            >
              Confirm & Issue Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
