-- Ensure pgcrypto extension is available for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================================================================
-- 0. PRE-SEED AUTH USERS (Satisfies foreign key constraint)
-- =========================================================================

INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
) VALUES 
('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sohail@truformindia.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
('00000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alka@truformindia.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now()),
('00000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'kiran@truformindia.com', crypt('password123', gen_salt('bf')), now(), '{"provider":"email","providers":["email"]}', '{}', now(), now())
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 1. SEED PROFILES
-- =========================================================================

INSERT INTO public.profiles (id, email, name, role, avatar_url) VALUES
('00000000-0000-0000-0000-000000000001', 'sohail@truformindia.com', 'Mohd Sohail Khan', 'Marketing Manager', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces'),
('00000000-0000-0000-0000-000000000002', 'alka@truformindia.com', 'Alka Deshpande', 'Marketing Coordinator', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces'),
('00000000-0000-0000-0000-000000000003', 'kiran@truformindia.com', 'Kiran Meshram', 'Back Office Executive', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces')
ON CONFLICT (id) DO UPDATE 
SET email = EXCLUDED.email, 
    name = EXCLUDED.name, 
    role = EXCLUDED.role, 
    avatar_url = EXCLUDED.avatar_url;

-- =========================================================================
-- 2. SEED CUSTOMERS
-- =========================================================================

INSERT INTO public.customers (id, customer_code, company_name, customer_type, industry, contact_person, designation, mobile_number, email, address, city, state, country, pin_code, gst_number, pan_number, source, sales_person_id, status, priority, remarks) VALUES
('11111111-1111-1111-1111-111111110001', 'CUS-00001', 'Apex Auto Components Ltd', 'OEM', 'Automotive', 'Rajesh Sharma', 'VP Procurement', '+91 98765 43210', 'rajesh.sharma@apexauto.com', 'Plot 45, Sector 5, IMT Manesar', 'Gurugram', 'Haryana', 'India', '122050', '06AAAAC1234A1Z1', 'AAAAC1234A', 'Website', '00000000-0000-0000-0000-000000000002', 'Active', 'High', 'Key automotive OEM. Regularly buys SG Iron housings.'),
('11111111-1111-1111-1111-111111110002', 'CUS-00002', 'Flowserve Pumps India', 'OEM', 'Pump Manufacturing', 'Amit Patel', 'Sourcing Manager', '+91 87654 32109', 'am.patel@flowserve.co.in', 'L&T Bypass Road, Malumichampatti', 'Coimbatore', 'Tamil Nadu', 'India', '641050', '33BBBBB5678B2Z2', 'BBBBB5678B', 'Referral', '00000000-0000-0000-0000-000000000002', 'Active', 'Critical', 'Requires heavy Grade CI pump bodies and impellers.'),
('11111111-1111-1111-1111-111111110003', 'CUS-00003', 'Bharat Heavy Electricals Ltd', 'OEM', 'Power Generation', 'Sanjay Kumar', 'Sr. Purchase Officer', '+91 76543 21098', 'skumar@bhel.in', 'Piplani', 'Bhopal', 'Madhya Pradesh', 'India', '462022', '23CCCCC9012C3Z3', 'CCCCC9012C', 'Exhibition', '00000000-0000-0000-0000-000000000001', 'Active', 'High', 'Buys large turbine castings and custom alloy castings.'),
('11111111-1111-1111-1111-111111110004', 'CUS-00004', 'Texmo Industries', 'OEM', 'Pump Manufacturing', 'K. Ramaswamy', 'Head Sourcing', '+91 94440 12345', 'k.rama@texmo.com', 'Mettupalayam Road', 'Coimbatore', 'Tamil Nadu', 'India', '641029', '33DDDDD3456D4Z4', 'DDDDD3456D', 'Existing Customer', '00000000-0000-0000-0000-000000000002', 'Active', 'High', 'Consistent buyer of domestic pump pump bodies.'),
('11111111-1111-1111-1111-111111110005', 'CUS-00005', 'Mahindra & Mahindra Ltd', 'OEM', 'Automotive', 'Vikas Deshmukh', 'DGM Casting Purchase', '+91 98220 98765', 'deshmukh.vikas@mahindra.com', 'Gateway Building, Apollo Bunder', 'Mumbai', 'Maharashtra', 'India', '400001', '27EEEEE7890E5Z5', 'EEEEE7890E', 'Sales Visit', '00000000-0000-0000-0000-000000000001', 'Active', 'Critical', 'High volume automotive buyer. Demands strict PPAP compliance.')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 3. SEED ITEMS
-- =========================================================================

INSERT INTO public.items (id, item_code, item_name, customer_id, drawing_number, drawing_revision, material_grade, process, weight, unit, pattern_status, machining_status, active_status) VALUES
('22222222-2222-2222-2222-222222220001', 'ITM-00001', 'Brake Caliper Housing', '11111111-1111-1111-1111-111111110001', 'APX-BC-401', 'Rev C', 'SG 500/7', 'Sand Casting', 4.8, 'Pcs', 'Available', 'Unmachined', TRUE),
('22222222-2222-2222-2222-222222220002', 'ITM-00002', 'Diff Case Housing', '11111111-1111-1111-1111-111111110001', 'APX-DF-921', 'Rev A', 'SG 600/3', 'Sand Casting', 12.5, 'Pcs', 'Available', 'Machined', TRUE),
('22222222-2222-2222-2222-222222220003', 'ITM-00003', 'Centrifugal Pump Body 4"', '11111111-1111-1111-1111-111111110002', 'FLS-PB-400X', 'Rev D', 'FG 260', 'Sand Casting', 38.5, 'Pcs', 'Available', 'Machined', TRUE),
('22222222-2222-2222-2222-222222220004', 'ITM-00004', 'Suction Impeller 4"', '11111111-1111-1111-1111-111111110002', 'FLS-IM-400S', 'Rev C', 'Cast Steel WCB', 'Investment Casting', 6.2, 'Pcs', 'Available', 'Machined', TRUE),
('22222222-2222-2222-2222-222222220005', 'ITM-00005', 'Steam Valve Casing', '11111111-1111-1111-1111-111111110003', 'BHL-VC-09A', 'Rev E', 'Alloy Steel WC6', 'Sand Casting', 450.0, 'Pcs', 'Required', 'Unmachined', TRUE)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 4. SEED ENQUIRIES & FEASIBILITIES
-- =========================================================================

INSERT INTO public.enquiries (id, enquiry_code, customer_id, enquiry_date, enquiry_source, contact_person, requirement_description, priority, sales_person_id, status) VALUES
('33333333-3333-3333-3333-333333330001', 'ENQ-00001', '11111111-1111-1111-1111-111111110001', '2026-08-01T10:00:00Z', 'Website', 'Rajesh Sharma', 'Requirements for custom automotive caliper SG housing.', 'High', '00000000-0000-0000-0000-000000000002', 'Quotation Pending'),
('33333333-3333-3333-3333-333333330002', 'ENQ-00002', '11111111-1111-1111-1111-111111110002', '2026-08-02T11:00:00Z', 'Referral', 'Amit Patel', 'Requirements for double suction impellers & pump body casting.', 'Critical', '00000000-0000-0000-0000-000000000002', 'Won')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.enquiry_items (id, enquiry_id, item_id, quantity, annual_requirement, machining_required, pattern_available, pattern_required) VALUES
('44444444-4444-4444-4444-444444440001', '33333333-3333-3333-3333-333333330001', '22222222-2222-2222-2222-222222220001', 500, 6000, FALSE, TRUE, FALSE),
('44444444-4444-4444-4444-444444440002', '33333333-3333-3333-3333-333333330002', '22222222-2222-2222-2222-222222220003', 200, 2400, TRUE, FALSE, TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.technical_evaluations (id, enquiry_id, enquiry_item_id, evaluator_id, evaluation_date, material_feasibility, casting_feasibility, pattern_feasibility, machining_feasibility, quality_requirement_feasible, estimated_weight, estimated_scrap_percent, estimated_cycle_time_mins, status) VALUES
('55555555-5555-5555-5555-555555550001', '33333333-3333-3333-3333-333333330001', '44444444-4444-4444-4444-444444440001', '00000000-0000-0000-0000-000000000004', '2026-08-04T10:00:00Z', TRUE, TRUE, TRUE, TRUE, TRUE, 4.8, 4.0, 12, 'Approved'),
('55555555-5555-5555-5555-555555550002', '33333333-3333-3333-3333-333333330002', '44444444-4444-4444-4444-444444440002', '00000000-0000-0000-0000-000000000004', '2026-08-05T14:00:00Z', TRUE, TRUE, TRUE, TRUE, TRUE, 38.5, 4.5, 20, 'Approved')
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 5. SEED QUOTATIONS
-- =========================================================================

INSERT INTO public.quotations (id, quotation_code, customer_id, enquiry_id, quotation_date, valid_until, payment_terms, delivery_terms, price_basis, sales_person_id, status, subtotal, tax_amount, discount_amount, grand_total) VALUES
('66666666-6666-6666-6666-666666660001', 'QUO-00001', '11111111-1111-1111-1111-111111110001', '33333333-3333-3333-3333-333333330001', '2026-08-06T10:00:00Z', '2026-09-06T10:00:00Z', '30 Days Net', 'Ex-Works Coimbatore', 'Ex-Works', '00000000-0000-0000-0000-000000000002', 'Sent', 528000.00, 95040.00, 10560.00, 612480.00),
('66666666-6666-6666-6666-666666660002', 'QUO-00002', '11111111-1111-1111-1111-111111110002', '33333333-3333-3333-3333-333333330002', '2026-08-07T12:00:00Z', '2026-09-07T12:00:00Z', '30 Days Net', 'Ex-Works Coimbatore', 'Ex-Works', '00000000-0000-0000-0000-000000000002', 'Accepted', 1232000.00, 221760.00, 24640.00, 1429120.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.quotation_items (id, quotation_id, enquiry_item_id, item_id, rate, discount_percent, discount_amount, tax_percent, tax_amount, delivery_period_weeks, amount) VALUES
('77777777-7777-7777-7777-777777770001', '66666666-6666-6666-6666-666666660001', '44444444-4444-4444-4444-444444440001', '22222222-2222-2222-2222-222222220001', 1056.00, 2.0, 10560.00, 18.0, 95040.00, 6, 612480.00),
('77777777-7777-7777-7777-777777770002', '66666666-6666-6666-6666-666666660002', '44444444-4444-4444-4444-444444440002', '22222222-2222-2222-2222-222222220003', 6160.00, 2.0, 24640.00, 18.0, 221760.00, 7, 1429120.00)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 6. SEED ORDERS
-- =========================================================================

INSERT INTO public.orders (id, order_code, customer_id, quotation_id, po_number, po_date, order_date, expected_delivery_date, payment_terms, delivery_terms, sales_person_id, status, total_amount) VALUES
('88888888-8888-8888-8888-888888880001', 'ORD-00001', '11111111-1111-1111-1111-111111110002', '66666666-6666-6666-6666-666666660002', 'PO-FLS-10022', '2026-08-10T10:00:00Z', '2026-08-10T12:00:00Z', '2026-09-25T17:00:00Z', '30 Days Net', 'Ex-Works Coimbatore', '00000000-0000-0000-0000-000000000002', 'Partially Dispatched', 1429120.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.order_items (id, order_id, quotation_item_id, item_id, quantity, rate, amount, dispatched_quantity) VALUES
('99999999-9999-9999-9999-999999990001', '88888888-8888-8888-8888-888888880001', '77777777-7777-7777-7777-777777770002', '22222222-2222-2222-2222-222222220003', 200, 6160.00, 1232000.00, 120)
ON CONFLICT (id) DO NOTHING;

-- =========================================================================
-- 7. SEED DISPATCHES & COMPLAINTS
-- =========================================================================

INSERT INTO public.dispatches (id, dispatch_code, order_id, customer_id, dispatch_date, invoice_number, transporter, vehicle_number, dispatch_status, tracking_info, remarks) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', 'DSP-00001', '88888888-8888-8888-8888-888888880001', '11111111-1111-1111-1111-111111110002', '2026-08-14T10:00:00Z', 'INV-2026-0001', 'VRL Logistics', 'TN-37-CF-1234', 'Shipped', 'https://vrl.in/track/123456', 'First partial delivery (120 pcs).')
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.dispatch_items (id, dispatch_id, order_item_id, quantity) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbb0001', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaa0001', '99999999-9999-9999-9999-999999990001', 120)
ON CONFLICT (id) DO NOTHING;
