export type UserRole = 'Admin' | 'Sales Manager' | 'Sales Executive' | 'Technical User' | 'Management' | 'Marketing Manager' | 'Marketing Coordinator' | 'Back Office Executive';

export interface Profile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar_url?: string;
}

export type CustomerStatus = 'Prospect' | 'Lead' | 'Active' | 'Inactive' | 'Lost';
export type CustomerSource = 'Website' | 'Referral' | 'Existing Customer' | 'Sales Visit' | 'Exhibition' | 'Cold Call' | 'Email' | 'Other';
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Customer {
  id: string; // UUID
  customer_code: string; // CUS-XXXXX
  company_name: string;
  customer_type: 'OEM' | 'Tier 1' | 'Distributor' | 'End User' | 'Other';
  industry: string;
  contact_person: string;
  designation: string;
  mobile_number: string;
  alternate_mobile?: string;
  email: string;
  alternate_email?: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pin_code: string;
  gst_number?: string;
  pan_number?: string;
  source: CustomerSource;
  sales_person_id: string; // User ID
  status: CustomerStatus;
  priority: PriorityLevel;
  created_at: string;
  last_contact_date?: string;
  next_follow_up_date?: string;
  remarks?: string;
}

export type EnquiryStatus = 'New' | 'Under Review' | 'Technical Evaluation' | 'Quotation Pending' | 'Quotation Sent' | 'Negotiation' | 'Won' | 'Lost' | 'On Hold';

export interface Enquiry {
  id: string; // UUID
  enquiry_code: string; // ENQ-XXXXX
  customer_id: string; // Customer UUID
  enquiry_date: string;
  enquiry_source: CustomerSource;
  contact_person: string;
  requirement_description: string;
  priority: PriorityLevel;
  expected_order_date?: string;
  sales_person_id: string; // User ID
  status: EnquiryStatus;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface Item {
  id: string; // UUID
  item_code: string; // ITM-XXXXX
  item_name: string;
  customer_id?: string; // Optional links to customer
  drawing_number: string;
  drawing_revision: string;
  material_grade: string;
  process: string; // Casting process: e.g. Sand Casting, Shell Moulding, HPDC
  weight: number; // in KG
  unit: string; // e.g. Pcs, Tons
  pattern_status: 'Available' | 'Required' | 'Under Development';
  machining_status: 'Machined' | 'Unmachined' | 'Proof Machined';
  active_status: boolean;
  remarks?: string;
  created_at: string;
}

export interface EnquiryItem {
  id: string; // UUID
  enquiry_id: string; // Enquiry UUID
  item_id: string; // Item UUID
  quantity: number;
  annual_requirement?: number;
  machining_required: boolean;
  surface_treatment?: string;
  pattern_available: boolean;
  pattern_required: boolean;
  tolerance?: string;
  testing_requirement?: string;
  inspection_requirement?: string;
  packaging_requirement?: string;
  special_requirement?: string;
  remarks?: string;
}

export type TechnicalEvaluationStatus = 'Pending' | 'Under Evaluation' | 'Approved' | 'Rejected' | 'Revision Required';

export interface TechnicalEvaluation {
  id: string; // UUID
  enquiry_id: string; // Enquiry UUID
  enquiry_item_id: string; // EnquiryItem UUID
  evaluator_id: string; // User ID
  evaluation_date: string;
  material_feasibility: boolean;
  casting_feasibility: boolean;
  pattern_feasibility: boolean;
  machining_feasibility: boolean;
  quality_requirement_feasible: boolean;
  estimated_weight: number; // KG
  estimated_scrap_percent: number;
  estimated_cycle_time_mins: number;
  technical_remarks?: string;
  status: TechnicalEvaluationStatus;
  created_at: string;
  updated_at: string;
}

export type QuotationStatus = 'Draft' | 'Under Approval' | 'Approved' | 'Sent' | 'Negotiation' | 'Accepted' | 'Rejected' | 'Expired';

export interface Quotation {
  id: string; // UUID
  quotation_code: string; // QUO-XXXXX
  customer_id: string; // Customer UUID
  enquiry_id: string; // Enquiry UUID
  quotation_date: string;
  valid_until: string;
  currency: string;
  payment_terms: string;
  delivery_terms: string;
  price_basis: string; // e.g. Ex-Works, FOB, CIF
  sales_person_id: string; // User ID
  status: QuotationStatus;
  subtotal: number;
  tax_percent: number;
  tax_amount: number;
  discount_percent: number;
  discount_amount: number;
  grand_total: number;
  approved_by?: string; // User ID
  approved_at?: string;
  approval_remarks?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface QuotationItem {
  id: string; // UUID
  quotation_id: string; // Quotation UUID
  enquiry_item_id: string; // EnquiryItem UUID
  item_id: string; // Item UUID
  rate: number;
  discount_percent: number;
  discount_amount: number;
  tax_percent: number;
  tax_amount: number;
  delivery_period_weeks: number;
  amount: number;
  remarks?: string;
}

export type FollowUpType = 'Call' | 'Email' | 'Meeting' | 'WhatsApp' | 'Site Visit' | 'Video Call' | 'Other';
export type FollowUpStatus = 'Scheduled' | 'Completed' | 'Rescheduled' | 'Cancelled';

export interface FollowUp {
  id: string; // UUID
  follow_up_code: string; // FOL-XXXXX
  customer_id: string; // Customer UUID
  enquiry_id?: string; // Optional
  quotation_id?: string; // Optional
  follow_up_date: string;
  follow_up_type: FollowUpType;
  contact_person: string;
  discussion: string;
  customer_response?: string;
  probability_percent?: number; // 0-100
  next_follow_up_date?: string;
  assigned_to: string; // User ID
  status: FollowUpStatus;
  remarks?: string;
  created_at: string;
}

export type OrderStatus = 'Confirmed' | 'In Production' | 'Partially Dispatched' | 'Completed' | 'Cancelled';

export interface Order {
  id: string; // UUID
  order_code: string; // ORD-XXXXX
  customer_id: string; // Customer UUID
  quotation_id?: string; // Quotation UUID
  po_number: string;
  po_date: string;
  order_date: string;
  expected_delivery_date: string;
  payment_terms: string;
  delivery_terms: string;
  sales_person_id?: string; // User ID
  status: OrderStatus;
  total_amount: number;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string; // UUID
  order_id: string; // Order UUID
  quotation_item_id: string; // QuotationItem UUID
  item_id: string; // Item UUID
  quantity: number;
  rate: number;
  amount: number;
  dispatched_quantity: number;
}

export type DispatchStatus = 'Shipped' | 'Delivered' | 'Returned' | 'Cancelled';

export interface Dispatch {
  id: string; // UUID
  dispatch_code: string; // DSP-XXXXX
  order_id: string; // Order UUID
  customer_id: string; // Customer UUID
  dispatch_date: string;
  invoice_number: string;
  transporter: string;
  vehicle_number: string;
  dispatch_status: DispatchStatus;
  tracking_info?: string;
  remarks?: string;
  created_at: string;
}

export interface DispatchItem {
  id: string; // UUID
  dispatch_id: string; // Dispatch UUID
  order_item_id: string; // OrderItem UUID
  quantity: number;
}

export type ComplaintStatus = 'Open' | 'Under Investigation' | 'Action Required' | 'Resolved' | 'Closed';

export interface Complaint {
  id: string; // UUID
  complaint_code: string; // CMP-XXXXX
  customer_id: string; // Customer UUID
  order_id?: string; // Optional
  item_id?: string; // Optional
  dispatch_id?: string; // Optional
  complaint_date: string;
  complaint_type: string; // e.g., Dimensional, Blowhole, Cracks, Delay, Billing
  description: string;
  severity: PriorityLevel;
  quantity_affected: number;
  root_cause?: string;
  corrective_action?: string;
  preventive_action?: string;
  responsible_person_id?: string; // User ID
  target_resolution_date?: string;
  resolution_date?: string;
  status: ComplaintStatus;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  customer_id: string;
  user_id: string;
  user_name: string;
  action_type: string; // 'create' | 'update' | 'delete' | 'status_change' | 'comment'
  entity_type: 'customer' | 'enquiry' | 'technical' | 'quotation' | 'followup' | 'order' | 'dispatch' | 'complaint';
  entity_id: string;
  entity_code: string;
  description: string;
  created_at: string;
}

export interface Attachment {
  id: string;
  entity_type: 'customer' | 'enquiry' | 'enquiry_item' | 'quotation' | 'order' | 'complaint';
  entity_id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_by: string; // User ID
  uploaded_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: 'followup_due' | 'followup_overdue' | 'quotation_expiring' | 'quotation_approved' | 'order_delivery' | 'complaint_overdue' | 'technical_pending';
  related_entity_type: string;
  related_entity_id: string;
  read: boolean;
  created_at: string;
}
