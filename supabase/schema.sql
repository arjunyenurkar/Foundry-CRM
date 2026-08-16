-- Supabase & PostgreSQL Production-Grade Database Schema
-- Designed for a Foundry Manufacturing Sales CRM

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =========================================================================
-- 1. PROFILES & ROLE-BASED ACCESS CONTROL
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('Admin', 'Sales Manager', 'Sales Executive', 'Technical User', 'Management')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 2. CUSTOMERS & PROSPECTS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_code TEXT UNIQUE NOT NULL,
  company_name TEXT NOT NULL UNIQUE,
  customer_type TEXT NOT NULL CHECK (customer_type IN ('OEM', 'Tier 1', 'Distributor', 'End User', 'Other')),
  industry TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  designation TEXT NOT NULL,
  mobile_number TEXT NOT NULL,
  alternate_mobile TEXT,
  email TEXT NOT NULL,
  alternate_email TEXT,
  website TEXT,
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'India',
  pin_code TEXT NOT NULL,
  gst_number TEXT,
  pan_number TEXT,
  source TEXT NOT NULL CHECK (source IN ('Website', 'Referral', 'Existing Customer', 'Sales Visit', 'Exhibition', 'Cold Call', 'Email', 'Other')),
  sales_person_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('Prospect', 'Lead', 'Active', 'Inactive', 'Lost')) DEFAULT 'Prospect',
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 3. ITEM MASTER (Reusable casting items catalog)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  item_code TEXT UNIQUE NOT NULL,
  item_name TEXT NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  drawing_number TEXT NOT NULL,
  drawing_revision TEXT NOT NULL DEFAULT 'Rev 0',
  material_grade TEXT NOT NULL,
  process TEXT NOT NULL,
  weight NUMERIC(10, 3) NOT NULL CHECK (weight > 0), -- weight in KG
  unit TEXT NOT NULL DEFAULT 'Pcs',
  pattern_status TEXT NOT NULL CHECK (pattern_status IN ('Available', 'Required', 'Under Development')) DEFAULT 'Required',
  machining_status TEXT NOT NULL CHECK (machining_status IN ('Machined', 'Unmachined', 'Proof Machined')) DEFAULT 'Unmachined',
  active_status BOOLEAN NOT NULL DEFAULT TRUE,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 4. ENQUIRIES (Customer requirements)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.enquiries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_code TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  enquiry_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  enquiry_source TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  requirement_description TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  expected_order_date TIMESTAMP WITH TIME ZONE,
  sales_person_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('New', 'Under Review', 'Technical Evaluation', 'Quotation Pending', 'Quotation Sent', 'Negotiation', 'Won', 'Lost', 'On Hold')) DEFAULT 'New',
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Parent-Child relationship: Enquiry Items
CREATE TABLE IF NOT EXISTS public.enquiry_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  annual_requirement INTEGER CHECK (annual_requirement >= 0),
  machining_required BOOLEAN DEFAULT FALSE NOT NULL,
  surface_treatment TEXT,
  pattern_available BOOLEAN DEFAULT FALSE NOT NULL,
  pattern_required BOOLEAN DEFAULT TRUE NOT NULL,
  tolerance TEXT,
  testing_requirement TEXT,
  inspection_requirement TEXT,
  packaging_requirement TEXT,
  special_requirement TEXT,
  remarks TEXT
);

-- =========================================================================
-- 5. TECHNICAL FEASIBILITY EVALUATION
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.technical_evaluations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE CASCADE NOT NULL,
  enquiry_item_id UUID REFERENCES public.enquiry_items(id) ON DELETE CASCADE NOT NULL,
  evaluator_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  evaluation_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  material_feasibility BOOLEAN DEFAULT FALSE NOT NULL,
  casting_feasibility BOOLEAN DEFAULT FALSE NOT NULL,
  pattern_feasibility BOOLEAN DEFAULT FALSE NOT NULL,
  machining_feasibility BOOLEAN DEFAULT FALSE NOT NULL,
  quality_requirement_feasible BOOLEAN DEFAULT FALSE NOT NULL,
  estimated_weight NUMERIC(10,3) DEFAULT 0 CHECK (estimated_weight >= 0),
  estimated_scrap_percent NUMERIC(5,2) DEFAULT 0 CHECK (estimated_scrap_percent >= 0),
  estimated_cycle_time_mins INTEGER DEFAULT 0 CHECK (estimated_cycle_time_mins >= 0),
  technical_remarks TEXT,
  status TEXT NOT NULL CHECK (status IN ('Pending', 'Under Evaluation', 'Approved', 'Rejected', 'Revision Required')) DEFAULT 'Pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 6. QUOTATIONS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.quotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_code TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE SET NULL,
  quotation_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  valid_until TIMESTAMP WITH TIME ZONE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  payment_terms TEXT NOT NULL,
  delivery_terms TEXT NOT NULL,
  price_basis TEXT NOT NULL,
  sales_person_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('Draft', 'Under Approval', 'Approved', 'Sent', 'Negotiation', 'Accepted', 'Rejected', 'Expired')) DEFAULT 'Draft',
  subtotal NUMERIC(15,2) NOT NULL DEFAULT 0,
  tax_percent NUMERIC(5,2) NOT NULL DEFAULT 18,
  tax_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  discount_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(15,2) NOT NULL DEFAULT 0,
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_remarks TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Quotation Line Items
CREATE TABLE IF NOT EXISTS public.quotation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE CASCADE NOT NULL,
  enquiry_item_id UUID REFERENCES public.enquiry_items(id) ON DELETE CASCADE NOT NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE RESTRICT NOT NULL,
  rate NUMERIC(15,2) NOT NULL CHECK (rate >= 0),
  discount_percent NUMERIC(5,2) DEFAULT 0,
  discount_amount NUMERIC(15,2) DEFAULT 0,
  tax_percent NUMERIC(5,2) DEFAULT 18,
  tax_amount NUMERIC(15,2) DEFAULT 0,
  delivery_period_weeks INTEGER NOT NULL CHECK (delivery_period_weeks > 0),
  amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
  remarks TEXT
);

-- =========================================================================
-- 7. FOLLOW-UPS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.follow_ups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follow_up_code TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  enquiry_id UUID REFERENCES public.enquiries(id) ON DELETE SET NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  follow_up_date TIMESTAMP WITH TIME ZONE NOT NULL,
  follow_up_type TEXT NOT NULL CHECK (follow_up_type IN ('Call', 'Email', 'Meeting', 'WhatsApp', 'Site Visit', 'Video Call', 'Other')),
  contact_person TEXT NOT NULL,
  discussion TEXT NOT NULL,
  customer_response TEXT,
  probability_percent INTEGER CHECK (probability_percent BETWEEN 0 AND 100),
  next_follow_up_date TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('Scheduled', 'Completed', 'Rescheduled', 'Cancelled')) DEFAULT 'Scheduled',
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 8. SALES ORDERS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_code TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  quotation_id UUID REFERENCES public.quotations(id) ON DELETE SET NULL,
  po_number TEXT NOT NULL,
  po_date TIMESTAMP WITH TIME ZONE NOT NULL,
  order_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expected_delivery_date TIMESTAMP WITH TIME ZONE NOT NULL,
  payment_terms TEXT NOT NULL,
  delivery_terms TEXT NOT NULL,
  sales_person_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL CHECK (status IN ('Confirmed', 'In Production', 'Partially Dispatched', 'Completed', 'Cancelled')) DEFAULT 'Confirmed',
  total_amount NUMERIC(15,2) NOT NULL DEFAULT 0,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Sales Order Line Items (Keep track of partial dispatches)
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  quotation_item_id UUID REFERENCES public.quotation_items(id) ON DELETE SET NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE RESTRICT NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  rate NUMERIC(15,2) NOT NULL CHECK (rate >= 0),
  amount NUMERIC(15,2) NOT NULL CHECK (amount >= 0),
  dispatched_quantity INTEGER NOT NULL DEFAULT 0 CHECK (dispatched_quantity >= 0)
);

-- =========================================================================
-- 9. DISPATCH & LOGISTICS (Partial delivery logs)
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.dispatches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispatch_code TEXT UNIQUE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  dispatch_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  transporter TEXT NOT NULL,
  vehicle_number TEXT NOT NULL,
  dispatch_status TEXT NOT NULL CHECK (dispatch_status IN ('Shipped', 'Delivered', 'Returned', 'Cancelled')) DEFAULT 'Shipped',
  tracking_info TEXT,
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Child items actually sent in this invoice shipment
CREATE TABLE IF NOT EXISTS public.dispatch_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  dispatch_id UUID REFERENCES public.dispatches(id) ON DELETE CASCADE NOT NULL,
  order_item_id UUID REFERENCES public.order_items(id) ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

-- =========================================================================
-- 10. CUSTOMER QUALITY COMPLAINTS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.complaints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  complaint_code TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  item_id UUID REFERENCES public.items(id) ON DELETE SET NULL,
  dispatch_id UUID REFERENCES public.dispatches(id) ON DELETE SET NULL,
  complaint_date TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  complaint_type TEXT NOT NULL,
  description TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
  quantity_affected INTEGER NOT NULL CHECK (quantity_affected > 0),
  root_cause TEXT,
  corrective_action TEXT,
  preventive_action TEXT,
  responsible_person_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  target_resolution_date TIMESTAMP WITH TIME ZONE,
  resolution_date TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL CHECK (status IN ('Open', 'Under Investigation', 'Action Required', 'Resolved', 'Closed')) DEFAULT 'Open',
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- 11. AUDIT TRAIL & LOGS
-- =========================================================================

CREATE TABLE IF NOT EXISTS public.activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id UUID REFERENCES public.customers(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  action_type TEXT NOT NULL CHECK (action_type IN ('create', 'update', 'delete', 'status_change', 'comment')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'enquiry', 'technical', 'quotation', 'followup', 'order', 'dispatch', 'complaint')),
  entity_id UUID NOT NULL,
  entity_code TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Attachments mapping table
CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('customer', 'enquiry', 'enquiry_item', 'quotation', 'order', 'complaint')),
  entity_id UUID NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('followup_due', 'followup_overdue', 'quotation_expiring', 'quotation_approved', 'order_delivery', 'complaint_overdue', 'technical_pending')),
  related_entity_type TEXT NOT NULL,
  related_entity_id UUID NOT NULL,
  read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- =========================================================================
-- INDEXES FOR MAX QUERY PERFORMANCE
-- =========================================================================

CREATE INDEX idx_customers_code ON public.customers(customer_code);
CREATE INDEX idx_customers_name ON public.customers(company_name);
CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_enquiries_code ON public.enquiries(enquiry_code);
CREATE INDEX idx_enquiries_status ON public.enquiries(status);
CREATE INDEX idx_quotations_code ON public.quotations(quotation_code);
CREATE INDEX idx_quotations_status ON public.quotations(status);
CREATE INDEX idx_orders_code ON public.orders(order_code);
CREATE INDEX idx_orders_status ON public.orders(status);
CREATE INDEX idx_followups_date ON public.follow_ups(follow_up_date);
CREATE INDEX idx_complaints_status ON public.complaints(status);

-- =========================================================================
-- TIMESTAMPS HANDLERS TRIGGERS
-- =========================================================================

CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_modtime BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_customers_modtime BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_items_modtime BEFORE UPDATE ON public.items FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_enquiries_modtime BEFORE UPDATE ON public.enquiries FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_technical_evaluations_modtime BEFORE UPDATE ON public.technical_evaluations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_quotations_modtime BEFORE UPDATE ON public.quotations FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_orders_modtime BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE PROCEDURE update_modified_column();
CREATE TRIGGER update_complaints_modtime BEFORE UPDATE ON public.complaints FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =========================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enquiry_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.technical_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 1. Profiles policy (User can read all profiles, but only update their own)
CREATE POLICY "Profiles are readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can edit their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. General CRM access: Authenticated users can read all records
CREATE POLICY "Authenticated users can select customers" ON public.customers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select items" ON public.items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select enquiries" ON public.enquiries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select enquiry_items" ON public.enquiry_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select technical_evaluations" ON public.technical_evaluations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select quotations" ON public.quotations FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select quotation_items" ON public.quotation_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select follow_ups" ON public.follow_ups FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select orders" ON public.orders FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select order_items" ON public.order_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select dispatches" ON public.dispatches FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select dispatch_items" ON public.dispatch_items FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select complaints" ON public.complaints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select activities" ON public.activities FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can select attachments" ON public.attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can select their own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 3. Role-based insertion/modification rules
-- Managers & executives can manage sales records. Technical user handles technical evaluations.
CREATE POLICY "Sales team can insert customers" ON public.customers FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Sales Manager', 'Sales Executive')));

CREATE POLICY "Sales team can update customers" ON public.customers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Sales Manager', 'Sales Executive')));

CREATE POLICY "Sales team can insert enquiries" ON public.enquiries FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Sales Manager', 'Sales Executive')));

CREATE POLICY "Sales team can update enquiries" ON public.enquiries FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Sales Manager', 'Sales Executive')));

CREATE POLICY "Technical team can update technical_evaluations" ON public.technical_evaluations FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('Admin', 'Technical User')));
