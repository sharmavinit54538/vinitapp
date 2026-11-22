export type TravelRole = 'employee' | 'manager' | 'hr_admin' | 'executive';

export type TripType = 'domestic' | 'international';

export type TravelPurpose =
  | 'Client Meeting'
  | 'Conference / Seminar'
  | 'Project Deployment'
  | 'Internal Review'
  | 'Sales Pitch'
  | 'Training';

export type TravelMode = 'flight' | 'train' | 'bus' | 'cab';

export type TravelClass =
  | 'Economy'
  | 'Premium Economy'
  | 'Business'
  | 'AC 1st Class'
  | 'AC 2-Tier'
  | 'Sedan'
  | 'SUV';

export type TravelRequestStatus =
  | 'draft'
  | 'pending_manager'
  | 'pending_hr'
  | 'pending_executive'
  | 'approved'
  | 'rejected'
  | 'sent_back'
  | 'booked'
  | 'completed'
  | 'cancelled';

export interface ApprovalHistoryItem {
  id: string;
  actor: string;
  role: string;
  action: 'Submitted' | 'Approved' | 'Rejected' | 'Sent Back' | 'Booked' | 'Cancelled';
  timestamp: string;
  comments?: string;
}

export interface TravelAttachment {
  id: string;
  name: string;
  sizeFormatted: string;
  type: string;
  category: 'ticket' | 'hotel' | 'invoice' | 'approval' | 'boarding_pass';
  downloadUrl?: string;
}

export interface TravelRequestRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  designation: string;
  reportingManager: string;
  tripType: TripType;
  purpose: TravelPurpose;
  sourceCity: string;
  destinationCity: string;
  departureDate: string; // YYYY-MM-DD
  returnDate: string; // YYYY-MM-DD
  travelMode: TravelMode;
  travelClass: TravelClass;
  hotelRequired: boolean;
  accommodationType?: string;
  projectCostCenter: string;
  estimatedBudget: number;
  actualCost?: number;
  emergencyContact: string;
  notes?: string;
  status: TravelRequestStatus;
  policyViolation?: boolean;
  policyViolationReason?: string;
  submittedAt: string;
  approvalHistory: ApprovalHistoryItem[];
  attachments: TravelAttachment[];
}

export type BookingMode = 'flight' | 'train' | 'bus' | 'hotel' | 'cab';
export type BookingStatus = 'Confirmed' | 'Pending' | 'Cancelled';

export interface BookingRecord {
  id: string;
  travelRequestId: string;
  employeeName: string;
  mode: BookingMode;
  vendor: string;
  bookingReference: string;
  bookingDate: string;
  travelDate: string;
  estimatedCost: number;
  actualCost: number;
  status: BookingStatus;
  details: string;
}

export type ExpenseCategory =
  | 'Flight'
  | 'Train'
  | 'Hotel'
  | 'Meals'
  | 'Cab'
  | 'Fuel'
  | 'Parking'
  | 'Miscellaneous';

export type ExpenseApprovalStatus =
  | 'Submitted'
  | 'Manager Approved'
  | 'HR Approved'
  | 'Reimbursed'
  | 'Rejected';

export interface ExpenseClaimRecord {
  id: string;
  travelRequestId: string;
  employeeName: string;
  employeeId: string;
  category: ExpenseCategory;
  amount: number;
  expenseDate: string;
  description: string;
  receiptName: string;
  approvalStatus: ExpenseApprovalStatus;
  reimbursedDate?: string;
}

export type TravelNotificationType =
  | 'request_submitted'
  | 'request_approved'
  | 'request_rejected'
  | 'booking_confirmed'
  | 'travel_reminder'
  | 'expense_approved'
  | 'reimbursement_processed'
  | 'policy_violation';

export interface TravelNotificationItem {
  id: string;
  type: TravelNotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  relatedRequestId?: string;
}

export interface TravelPolicyRule {
  grade: string;
  flightAllowed: boolean;
  flightMaxBudget: number;
  hotelDailyLimit: number;
  perDiemLimit: number;
  internationalRequiresExecutive: boolean;
}

export interface TravelDeskSettings {
  autoApprovalThreshold: number;
  executiveApprovalThreshold: number;
  maxAdvanceDaysBooking: number;
  requireReceiptOverAmount: number;
  allowSelfBooking: boolean;
  perDiemDomestic: number;
  perDiemInternational: number;
  emergencyTravelHotline: string;
}

export interface TravelActivityLog {
  id: string;
  actor: string;
  action: string;
  targetId: string;
  details: string;
  timestamp: string;
}
