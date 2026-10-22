import { z } from 'zod';

export const CustomerSchema = z.object({
  company_name: z.string().min(2, 'Company name must be at least 2 characters'),
  customer_type: z.enum(['OEM', 'Tier 1', 'Distributor', 'End User', 'Other']),
  industry: z.string().min(2, 'Industry must be at least 2 characters'),
  contact_person: z.string().min(2, 'Contact person name is required'),
  designation: z.string().min(2, 'Designation is required'),
  mobile_number: z.string().regex(/^\+?[0-9\s-]{10,15}$/, 'Invalid mobile number format'),
  alternate_mobile: z.string().optional().or(z.literal('')),
  email: z.string().email('Invalid email address'),
  alternate_email: z.string().optional().or(z.literal('')),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  country: z.string().min(2, 'Country is required'),
  pin_code: z.string().regex(/^[1-9][0-9]{5}$/, 'PIN code must be a valid 6-digit Indian postal code'),
  gst_number: z.string().optional().or(z.literal('')),
  pan_number: z.string().optional().or(z.literal('')),
  source: z.enum(['Website', 'Referral', 'Existing Customer', 'Sales Visit', 'Exhibition', 'Cold Call', 'Email', 'Other']),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  sales_person_id: z.string().min(1, 'Sales person assignment is required'),
  remarks: z.string().optional()
});

export const EnquiryItemSchema = z.object({
  item_id: z.string().min(1, 'Please select an item'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  annual_requirement: z.number().optional(),
  machining_required: z.boolean(),
  surface_treatment: z.string().optional(),
  pattern_available: z.boolean(),
  pattern_required: z.boolean(),
  tolerance: z.string().optional(),
  testing_requirement: z.string().optional(),
  inspection_requirement: z.string().optional(),
  packaging_requirement: z.string().optional(),
  special_requirement: z.string().optional(),
  remarks: z.string().optional()
});

export const EnquirySchema = z.object({
  customer_id: z.string().min(1, 'Customer selection is required'),
  enquiry_date: z.string().min(1, 'Enquiry date is required'),
  enquiry_source: z.enum(['Website', 'Referral', 'Existing Customer', 'Sales Visit', 'Exhibition', 'Cold Call', 'Email', 'Other']),
  contact_person: z.string().min(1, 'Contact person is required'),
  requirement_description: z.string().min(10, 'Description must be at least 10 characters'),
  priority: z.enum(['Low', 'Medium', 'High', 'Critical']),
  expected_order_date: z.string().optional(),
  sales_person_id: z.string().min(1, 'Sales person assignment is required'),
  remarks: z.string().optional()
});

export const QuotationItemSchema = z.object({
  enquiry_item_id: z.string().min(1),
  item_id: z.string().min(1),
  rate: z.number().min(1, 'Rate must be greater than 0'),
  discount_percent: z.number().min(0).max(100),
  tax_percent: z.number().min(0).max(100),
  delivery_period_weeks: z.number().min(1, 'Delivery period required'),
  remarks: z.string().optional()
});

export const QuotationSchema = z.object({
  customer_id: z.string().min(1, 'Customer selection is required'),
  enquiry_id: z.string().min(1, 'Enquiry reference is required'),
  quotation_date: z.string().min(1, 'Date is required'),
  valid_until: z.string().min(1, 'Expiry date is required'),
  currency: z.string().default('INR'),
  payment_terms: z.string().min(2, 'Payment terms required'),
  delivery_terms: z.string().min(2, 'Delivery terms required'),
  price_basis: z.string().min(2, 'Price basis required'),
  sales_person_id: z.string().min(1),
  remarks: z.string().optional()
});

export const FollowUpSchema = z.object({
  customer_id: z.string().min(1, 'Customer selection is required'),
  enquiry_id: z.string().optional(),
  quotation_id: z.string().optional(),
  follow_up_date: z.string().min(1, 'Follow-up date is required'),
  follow_up_type: z.enum(['Call', 'Email', 'Meeting', 'WhatsApp', 'Site Visit', 'Video Call', 'Other']),
  contact_person: z.string().min(2, 'Contact person is required'),
  discussion: z.string().min(5, 'Discussion details are required'),
  customer_response: z.string().optional(),
  probability_percent: z.number().min(0).max(100).optional(),
  next_follow_up_date: z.string().optional(),
  assigned_to: z.string().min(1),
  status: z.enum(['Scheduled', 'Completed', 'Rescheduled', 'Cancelled']),
  remarks: z.string().optional()
});

export const OrderSchema = z.object({
  customer_id: z.string().min(1, 'Customer is required'),
  quotation_id: z.string().min(1, 'Quotation reference is required'),
  po_number: z.string().min(2, 'PO Number is required'),
  po_date: z.string().min(1, 'PO Date is required'),
  order_date: z.string().min(1, 'Order confirmation date is required'),
  expected_delivery_date: z.string().min(1, 'Expected delivery date is required'),
  payment_terms: z.string().min(2),
  delivery_terms: z.string().min(2),
  sales_person_id: z.string().min(1),
  remarks: z.string().optional()
});

export const DispatchSchema = z.object({
  order_id: z.string().min(1, 'Order reference is required'),
  customer_id: z.string().min(1),
  dispatch_date: z.string().min(1, 'Dispatch date is required'),
  invoice_number: z.string().min(2, 'Invoice number is required'),
  transporter: z.string().min(2, 'Transporter name is required'),
  vehicle_number: z.string().min(5, 'Vehicle number is required'),
  remarks: z.string().optional()
});

export const ComplaintSchema = z.object({
  customer_id: z.string().min(1, 'Customer reference is required'),
  order_id: z.string().optional(),
  item_id: z.string().optional(),
  dispatch_id: z.string().optional(),
  complaint_date: z.string().min(1, 'Complaint date is required'),
  complaint_type: z.string().min(2, 'Complaint type is required'),
  description: z.string().min(5, 'Description is required'),
  severity: z.enum(['Low', 'Medium', 'High', 'Critical']),
  quantity_affected: z.number().min(1, 'Affected quantity must be at least 1'),
  remarks: z.string().optional()
});
