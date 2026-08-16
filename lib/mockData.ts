import { 
  Customer, Enquiry, Item, EnquiryItem, TechnicalEvaluation, 
  Quotation, QuotationItem, FollowUp, Order, OrderItem, 
  Dispatch, DispatchItem, Complaint, Profile, Activity, Notification,
  EnquiryStatus, TechnicalEvaluationStatus, QuotationStatus, OrderStatus,
  FollowUpType, FollowUpStatus, PriorityLevel, ComplaintStatus, CustomerStatus,
  CustomerSource
} from '../types';

export const mockUsers: Profile[] = [
  { id: 'usr-1', email: 'sohail@truformindia.com', name: 'Mohd Sohail Khan', role: 'Marketing Manager', avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces' },
  { id: 'usr-2', email: 'alka@truformindia.com', name: 'Alka Deshpande', role: 'Marketing Coordinator', avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=faces' },
  { id: 'usr-3', email: 'kiran@truformindia.com', name: 'Kiran Meshram', role: 'Back Office Executive', avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces' }
];

export const mockCustomers: Customer[] = [
  {
    id: 'cus-1',
    customer_code: 'CUS-00001',
    company_name: 'Apex Auto Components Ltd',
    customer_type: 'OEM',
    industry: 'Automotive',
    contact_person: 'Rajesh Sharma',
    designation: 'VP Procurement',
    mobile_number: '+91 98765 43210',
    alternate_mobile: '+91 98765 43211',
    email: 'rajesh.sharma@apexauto.com',
    address: 'Plot 45, Sector 5, IMT Manesar',
    city: 'Gurugram',
    state: 'Haryana',
    country: 'India',
    pin_code: '122050',
    gst_number: '06AAAAC1234A1Z1',
    pan_number: 'AAAAC1234A',
    source: 'Website',
    sales_person_id: 'usr-2',
    status: 'Active',
    priority: 'High',
    created_at: '2026-01-10T10:00:00Z',
    last_contact_date: '2026-08-10T14:30:00Z',
    next_follow_up_date: '2026-08-18T10:00:00Z',
    remarks: 'Key automotive OEM. Regularly buys SG Iron housings.'
  },
  {
    id: 'cus-2',
    customer_code: 'CUS-00002',
    company_name: 'Flowserve Pumps India',
    customer_type: 'OEM',
    industry: 'Pump Manufacturing',
    contact_person: 'Amit Patel',
    designation: 'Sourcing Manager',
    mobile_number: '+91 87654 32109',
    email: 'am.patel@flowserve.co.in',
    address: 'L&T Bypass Road, Malumichampatti',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    pin_code: '641050',
    gst_number: '33BBBBB5678B2Z2',
    pan_number: 'BBBBB5678B',
    source: 'Referral',
    sales_person_id: 'usr-2',
    status: 'Active',
    priority: 'Critical',
    created_at: '2026-01-15T11:00:00Z',
    last_contact_date: '2026-08-15T16:00:00Z',
    next_follow_up_date: '2026-08-17T11:00:00Z',
    remarks: 'Requires heavy Grade CI pump bodies and impellers.'
  },
  {
    id: 'cus-3',
    customer_code: 'CUS-00003',
    company_name: 'Bharat Heavy Electricals Ltd',
    customer_type: 'OEM',
    industry: 'Power Generation',
    contact_person: 'Sanjay Kumar',
    designation: 'Sr. Purchase Officer',
    mobile_number: '+91 76543 21098',
    email: 'skumar@bhel.in',
    address: 'Piplani',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    country: 'India',
    pin_code: '462022',
    gst_number: '23CCCCC9012C3Z3',
    pan_number: 'CCCCC9012C',
    source: 'Exhibition',
    sales_person_id: 'usr-1',
    status: 'Active',
    priority: 'High',
    created_at: '2026-02-01T09:00:00Z',
    last_contact_date: '2026-08-12T11:00:00Z',
    next_follow_up_date: '2026-08-20T10:00:00Z',
    remarks: 'Buys large turbine castings and custom alloy castings.'
  },
  {
    id: 'cus-4',
    customer_code: 'CUS-00004',
    company_name: 'Texmo Industries',
    customer_type: 'OEM',
    industry: 'Pump Manufacturing',
    contact_person: 'K. Ramaswamy',
    designation: 'Head Sourcing',
    mobile_number: '+91 94440 12345',
    email: 'k.rama@texmo.com',
    address: 'Mettupalayam Road',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    pin_code: '641029',
    gst_number: '33DDDDD3456D4Z4',
    pan_number: 'DDDDD3456D',
    source: 'Existing Customer',
    sales_person_id: 'usr-2',
    status: 'Active',
    priority: 'High',
    created_at: '2026-02-10T14:00:00Z',
    last_contact_date: '2026-08-14T10:00:00Z',
    next_follow_up_date: '2026-08-22T14:30:00Z',
    remarks: 'Consistent buyer of domestic pump pump bodies.'
  },
  {
    id: 'cus-5',
    customer_code: 'CUS-00005',
    company_name: 'Mahindra & Mahindra Ltd',
    customer_type: 'OEM',
    industry: 'Automotive',
    contact_person: 'Vikas Deshmukh',
    designation: 'DGM Casting Purchase',
    mobile_number: '+91 98220 98765',
    email: 'deshmukh.vikas@mahindra.com',
    address: 'Gateway Building, Apollo Bunder',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pin_code: '400001',
    gst_number: '27EEEEE7890E5Z5',
    pan_number: 'EEEEE7890E',
    source: 'Sales Visit',
    sales_person_id: 'usr-1',
    status: 'Active',
    priority: 'Critical',
    created_at: '2026-02-15T10:00:00Z',
    last_contact_date: '2026-08-16T15:00:00Z',
    next_follow_up_date: '2026-08-19T10:00:00Z',
    remarks: 'High volume automotive buyer. Demands strict PPAP compliance.'
  },
  {
    id: 'cus-6',
    customer_code: 'CUS-00006',
    company_name: 'Kirloskar Brothers Ltd',
    customer_type: 'OEM',
    industry: 'Pump Manufacturing',
    contact_person: 'Prasad Kulkarni',
    designation: 'Purchase Specialist',
    mobile_number: '+91 99220 11223',
    email: 'p.kulkarni@kbl.co.in',
    address: 'Udyog Bhavan, Tilak Road',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    pin_code: '411002',
    gst_number: '27FFFFF1234F6Z6',
    pan_number: 'FFFFF1234F',
    source: 'Referral',
    sales_person_id: 'usr-2',
    status: 'Active',
    priority: 'High',
    created_at: '2026-03-01T11:00:00Z',
    last_contact_date: '2026-08-08T11:00:00Z',
    next_follow_up_date: '2026-08-25T14:00:00Z'
  },
  {
    id: 'cus-7',
    customer_code: 'CUS-00007',
    company_name: 'Escorts Kubota Ltd',
    customer_type: 'OEM',
    industry: 'Agriculture Machinery',
    contact_person: 'Harpal Singh',
    designation: 'Manager Sourcing',
    mobile_number: '+91 98110 55667',
    email: 'harpal.singh@escorts.co.in',
    address: '15/5, Mathura Road',
    city: 'Faridabad',
    state: 'Haryana',
    country: 'India',
    pin_code: '121003',
    gst_number: '06GGGGG7890G7Z7',
    pan_number: 'GGGGG7890G',
    source: 'Cold Call',
    sales_person_id: 'usr-2',
    status: 'Lead',
    priority: 'Medium',
    created_at: '2026-03-12T09:30:00Z',
    last_contact_date: '2026-08-05T12:00:00Z',
    next_follow_up_date: '2026-08-17T15:00:00Z',
    remarks: 'Under negotiation for tractor axle housings.'
  },
  {
    id: 'cus-8',
    customer_code: 'CUS-00008',
    company_name: 'L&T Valve Division',
    customer_type: 'OEM',
    industry: 'Industrial Valves',
    contact_person: 'G. Swaminathan',
    designation: 'Materials Manager',
    mobile_number: '+91 98400 44332',
    email: 'g.swami@lntvalves.com',
    address: 'Mount-Poonamallee Road',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    pin_code: '600089',
    gst_number: '33HHHHH4321H8Z8',
    pan_number: 'HHHHH4321H',
    source: 'Website',
    sales_person_id: 'usr-1',
    status: 'Active',
    priority: 'High',
    created_at: '2026-03-20T10:00:00Z',
    last_contact_date: '2026-08-01T10:00:00Z',
    next_follow_up_date: '2026-08-20T11:00:00Z',
    remarks: 'Buys high-pressure cast steel valve bodies.'
  },
  {
    id: 'cus-9',
    customer_code: 'CUS-00009',
    company_name: 'Caterpillar India Pvt Ltd',
    customer_type: 'OEM',
    industry: 'Heavy Equipment',
    contact_person: 'John Dsouza',
    designation: 'Global Buyer - Castings',
    mobile_number: '+91 99620 99887',
    email: 'dsouza_john@cat.com',
    address: 'Melnallathur, Thiruvallur',
    city: 'Thiruvallur',
    state: 'Tamil Nadu',
    country: 'India',
    pin_code: '602004',
    gst_number: '33IIIII1111I9Z9',
    pan_number: 'IIIII1111I',
    source: 'Sales Visit',
    sales_person_id: 'usr-1',
    status: 'Active',
    priority: 'Critical',
    created_at: '2026-04-01T09:00:00Z',
    last_contact_date: '2026-08-12T15:30:00Z',
    next_follow_up_date: '2026-08-21T10:00:00Z',
    remarks: 'Highly critical quality requirements. Demands zero defects.'
  },
  {
    id: 'cus-10',
    customer_code: 'CUS-00010',
    company_name: 'TVS Motor Company Ltd',
    customer_type: 'OEM',
    industry: 'Automotive',
    contact_person: 'R. Ananth',
    designation: 'Lead Casting Sourcing',
    mobile_number: '+91 94430 88776',
    email: 'r.ananth@tvsmotor.com',
    address: 'Harita, Hosur',
    city: 'Hosur',
    state: 'Tamil Nadu',
    country: 'India',
    pin_code: '635109',
    gst_number: '33JJJJJ2222J1ZA',
    pan_number: 'JJJJJ2222J',
    source: 'Existing Customer',
    sales_person_id: 'usr-2',
    status: 'Active',
    priority: 'High',
    created_at: '2026-04-05T14:00:00Z',
    last_contact_date: '2026-08-11T16:00:00Z',
    next_follow_up_date: '2026-08-20T14:00:00Z'
  },
  {
    id: 'cus-11',
    customer_code: 'CUS-00011',
    company_name: 'Tata Motors Casting Division',
    customer_type: 'OEM',
    industry: 'Automotive',
    contact_person: 'Nitin Rane',
    designation: 'Casting Procurement Lead',
    mobile_number: '+91 98200 11224',
    email: 'nitin.rane@tatamotors.com',
    address: 'Pimpri',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    pin_code: '411018',
    gst_number: '27KKKKK3333K2ZB',
    pan_number: 'KKKKK3333K',
    source: 'Referral',
    sales_person_id: 'usr-1',
    status: 'Lead',
    priority: 'High',
    created_at: '2026-04-15T11:00:00Z',
    last_contact_date: '2026-08-10T11:00:00Z',
    next_follow_up_date: '2026-08-24T11:00:00Z'
  },
  {
    id: 'cus-12',
    customer_code: 'CUS-00012',
    company_name: 'Danfoss Industries Pvt Ltd',
    customer_type: 'OEM',
    industry: 'Industrial Machinery',
    contact_person: 'Manoj Pillai',
    designation: 'Director Sourcing',
    mobile_number: '+91 98409 12346',
    email: 'manoj.pillai@danfoss.com',
    address: 'Oragadam',
    city: 'Kanchipuram',
    state: 'Tamil Nadu',
    country: 'India',
    pin_code: '602105',
    gst_number: '33LLLLL4444L3ZC',
    pan_number: 'LLLLL4444L',
    source: 'Website',
    sales_person_id: 'usr-2',
    status: 'Prospect',
    priority: 'Medium',
    created_at: '2026-04-20T10:00:00Z',
    last_contact_date: '2026-07-28T14:00:00Z',
    next_follow_up_date: '2026-08-28T10:00:00Z',
    remarks: 'Sent cold enquiry about alloy valve castings.'
  },
  {
    id: 'cus-13',
    customer_code: 'CUS-00013',
    company_name: 'Greaves Cotton Ltd',
    customer_type: 'OEM',
    industry: 'Engines',
    contact_person: 'Siddharth Roy',
    designation: 'Procurement Manager',
    mobile_number: '+91 97690 99881',
    email: 's.roy@greavescotton.com',
    address: 'Chinchwad',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    pin_code: '411019',
    gst_number: '27MMMMM5555M4ZD',
    pan_number: 'MMMMM5555M',
    source: 'Cold Call',
    sales_person_id: 'usr-2',
    status: 'Prospect',
    priority: 'Low',
    created_at: '2026-05-02T13:00:00Z',
    last_contact_date: '2026-07-15T15:00:00Z',
    next_follow_up_date: '2026-08-30T11:00:00Z'
  },
  {
    id: 'cus-14',
    customer_code: 'CUS-00014',
    company_name: 'Swaraj Engines Ltd',
    customer_type: 'OEM',
    industry: 'Agriculture Machinery',
    contact_person: 'Baldev Singh',
    designation: 'Purchasing Head',
    mobile_number: '+91 98140 12347',
    email: 'baldev.singh@swaraj.com',
    address: 'Phase IV, Industrial Area',
    city: 'Mohali',
    state: 'Punjab',
    country: 'India',
    pin_code: '160055',
    gst_number: '03NNNNN6666N5ZE',
    pan_number: 'NNNNN6666N',
    source: 'Exhibition',
    sales_person_id: 'usr-1',
    status: 'Active',
    priority: 'High',
    created_at: '2026-05-10T10:00:00Z',
    last_contact_date: '2026-08-04T12:00:00Z',
    next_follow_up_date: '2026-08-26T10:00:00Z'
  },
  {
    id: 'cus-15',
    customer_code: 'CUS-00015',
    company_name: 'Kirloskar Oil Engines Ltd',
    customer_type: 'OEM',
    industry: 'Engines',
    contact_person: 'Vijay Kamble',
    designation: 'Lead Casting Buyer',
    mobile_number: '+91 99230 44556',
    email: 'vijay.kamble@kirloskar.com',
    address: 'Laxmanrao Kirloskar Road',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    pin_code: '411003',
    gst_number: '27OOOOO7777O6ZF',
    pan_number: 'OOOOO7777O',
    source: 'Referral',
    sales_person_id: 'usr-1',
    status: 'Active',
    priority: 'High',
    created_at: '2026-05-15T15:00:00Z',
    last_contact_date: '2026-08-14T11:00:00Z',
    next_follow_up_date: '2026-08-25T11:00:00Z'
  },
  {
    id: 'cus-16',
    customer_code: 'CUS-00016',
    company_name: 'Brakes India Pvt Ltd',
    customer_type: 'Tier 1',
    industry: 'Automotive',
    contact_person: 'S. Raghavan',
    designation: 'Materials GM',
    mobile_number: '+91 94444 55661',
    email: 'sraghavan@brakesindia.co.in',
    address: 'Padi',
    city: 'Chennai',
    state: 'Tamil Nadu',
    country: 'India',
    pin_code: '600050',
    gst_number: '33PPPPP8888P7ZG',
    pan_number: 'PPPPP8888P',
    source: 'Existing Customer',
    sales_person_id: 'usr-2',
    status: 'Active',
    priority: 'High',
    created_at: '2026-05-20T09:00:00Z',
    last_contact_date: '2026-08-16T10:00:00Z',
    next_follow_up_date: '2026-08-18T16:00:00Z',
    remarks: 'Regular high-volume buyer for brake calipers and rotors.'
  },
  {
    id: 'cus-17',
    customer_code: 'CUS-00017',
    company_name: 'Schwing Stetter India',
    customer_type: 'OEM',
    industry: 'Construction Equipment',
    contact_person: 'George Mathew',
    designation: 'VP Sourcing',
    mobile_number: '+91 98402 77889',
    email: 'mathew.george@schwingstetter.co.in',
    address: 'F-71, SIPCOT Industrial Park',
    city: 'Sriperumbudur',
    state: 'Tamil Nadu',
    country: 'India',
    pin_code: '602105',
    gst_number: '33QQQQQ9999Q8ZH',
    pan_number: 'QQQQQ9999Q',
    source: 'Sales Visit',
    sales_person_id: 'usr-1',
    status: 'Active',
    priority: 'Medium',
    created_at: '2026-05-25T11:00:00Z',
    last_contact_date: '2026-08-02T14:00:00Z',
    next_follow_up_date: '2026-08-27T10:00:00Z'
  },
  {
    id: 'cus-18',
    customer_code: 'CUS-00018',
    company_name: 'Godrej & Boyce Mfg Co',
    customer_type: 'OEM',
    industry: 'Industrial Machinery',
    contact_person: 'Nilesh Vohra',
    designation: 'GM Sourcing',
    mobile_number: '+91 98201 22334',
    email: 'nvohra@godrej.com',
    address: 'Pirojshanagar, Vikhroli',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    pin_code: '400079',
    gst_number: '27RRRRR1111R9ZI',
    pan_number: 'RRRRR1111R',
    source: 'Website',
    sales_person_id: 'usr-2',
    status: 'Inactive',
    priority: 'Low',
    created_at: '2026-05-30T10:00:00Z',
    last_contact_date: '2026-07-02T10:00:00Z',
    remarks: 'No business in last 12 months. Marked inactive.'
  },
  {
    id: 'cus-19',
    customer_code: 'CUS-00019',
    company_name: 'Atlas Copco India Ltd',
    customer_type: 'OEM',
    industry: 'Compressor Manufacturing',
    contact_person: 'Rahul Sen',
    designation: 'Lead Casting Engineer',
    mobile_number: '+91 98199 44335',
    email: 'rahul.sen@atlascopco.com',
    address: 'Sveanagar, Dapodi',
    city: 'Pune',
    state: 'Maharashtra',
    country: 'India',
    pin_code: '411012',
    gst_number: '27SSSSS2222S1ZJ',
    pan_number: 'SSSSS2222S',
    source: 'Sales Visit',
    sales_person_id: 'usr-1',
    status: 'Lost',
    priority: 'Medium',
    created_at: '2026-06-01T10:00:00Z',
    last_contact_date: '2026-07-20T15:00:00Z',
    remarks: 'Lost to competitor due to pricing on compressor heads.'
  },
  {
    id: 'cus-20',
    customer_code: 'CUS-00020',
    company_name: 'ELGI Equipments Ltd',
    customer_type: 'OEM',
    industry: 'Compressor Manufacturing',
    contact_person: 'S. Krishnan',
    designation: 'Materials GM',
    mobile_number: '+91 94422 11334',
    email: 's.krishnan@elgi.com',
    address: 'Trichy Road, Singanallur',
    city: 'Coimbatore',
    state: 'Tamil Nadu',
    country: 'India',
    pin_code: '641005',
    gst_number: '33TTTTT3333T2ZK',
    pan_number: 'TTTTT3333T',
    source: 'Website',
    sales_person_id: 'usr-2',
    status: 'Active',
    priority: 'High',
    created_at: '2026-06-05T09:00:00Z',
    last_contact_date: '2026-08-13T10:00:00Z',
    next_follow_up_date: '2026-08-18T11:00:00Z',
    remarks: 'Regularly orders compressor housings and flywheels.'
  }
];

// Let's create Items (Item Master)
export const mockItems: Item[] = [
  { id: 'itm-1', item_code: 'ITM-00001', item_name: 'Brake Caliper Housing', customer_id: 'cus-1', drawing_number: 'APX-BC-401', drawing_revision: 'Rev C', material_grade: 'SG 500/7', process: 'Sand Casting', weight: 4.8, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Unmachined', active_status: true, created_at: '2026-01-10T12:00:00Z' },
  { id: 'itm-2', item_code: 'ITM-00002', item_name: 'Diff Case Housing', customer_id: 'cus-1', drawing_number: 'APX-DF-921', drawing_revision: 'Rev A', material_grade: 'SG 600/3', process: 'Sand Casting', weight: 12.5, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Machined', active_status: true, created_at: '2026-01-11T10:00:00Z' },
  { id: 'itm-3', item_code: 'ITM-00003', item_name: 'End Cover Plate', customer_id: 'cus-1', drawing_number: 'APX-EC-022', drawing_revision: 'Rev 0', material_grade: 'FG 260', process: 'Sand Casting', weight: 2.1, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Proof Machined', active_status: true, created_at: '2026-01-12T14:00:00Z' },
  { id: 'itm-4', item_code: 'ITM-00004', item_name: 'Centrifugal Pump Body 4"', customer_id: 'cus-2', drawing_number: 'FLS-PB-400X', drawing_revision: 'Rev D', material_grade: 'FG 260', process: 'Sand Casting', weight: 38.5, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Machined', active_status: true, created_at: '2026-01-15T15:00:00Z' },
  { id: 'itm-5', item_code: 'ITM-00005', item_name: 'Suction Impeller 4"', customer_id: 'cus-2', drawing_number: 'FLS-IM-400S', drawing_revision: 'Rev C', material_grade: 'Cast Steel WCB', process: 'Investment Casting', weight: 6.2, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Machined', active_status: true, created_at: '2026-01-16T11:00:00Z' },
  { id: 'itm-6', item_code: 'ITM-00006', item_name: 'Bearing Bracket', customer_id: 'cus-2', drawing_number: 'FLS-BB-122', drawing_revision: 'Rev B', material_grade: 'FG 200', process: 'Sand Casting', weight: 9.4, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Proof Machined', active_status: true, created_at: '2026-01-17T09:00:00Z' },
  { id: 'itm-7', item_code: 'ITM-00007', item_name: 'Steam Valve Casing', customer_id: 'cus-3', drawing_number: 'BHL-VC-09A', drawing_revision: 'Rev E', material_grade: 'Alloy Steel WC6', process: 'Sand Casting', weight: 450.0, unit: 'Pcs', pattern_status: 'Required', machining_status: 'Unmachined', active_status: true, created_at: '2026-02-01T14:00:00Z' },
  { id: 'itm-8', item_code: 'ITM-00008', item_name: 'Turbine Rotor Flange', customer_id: 'cus-3', drawing_number: 'BHL-TRF-881', drawing_revision: 'Rev 1', material_grade: 'Alloy Steel WC9', process: 'Sand Casting', weight: 280.0, unit: 'Pcs', pattern_status: 'Required', machining_status: 'Machined', active_status: true, created_at: '2026-02-02T10:00:00Z' },
  { id: 'itm-9', item_code: 'ITM-00009', item_name: 'Monoblock Pump Volute Casing', customer_id: 'cus-4', drawing_number: 'TXM-VC-90', drawing_revision: 'Rev F', material_grade: 'FG 200', process: 'Shell Moulding', weight: 8.5, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Unmachined', active_status: true, created_at: '2026-02-10T16:00:00Z' },
  { id: 'itm-10', item_code: 'ITM-00010', item_name: 'Submersible Pump Bowl', customer_id: 'cus-4', drawing_number: 'TXM-PB-033', drawing_revision: 'Rev A', material_grade: 'FG 260', process: 'Shell Moulding', weight: 3.2, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Machined', active_status: true, created_at: '2026-02-11T11:00:00Z' },
  { id: 'itm-11', item_code: 'ITM-00011', item_name: 'Flywheel Housing SG400', customer_id: 'cus-5', drawing_number: 'MHD-FLH-50', drawing_revision: 'Rev G', material_grade: 'SG 400/15', process: 'Sand Casting', weight: 18.2, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Machined', active_status: true, created_at: '2026-02-15T12:00:00Z' },
  { id: 'itm-12', item_code: 'ITM-00012', item_name: 'Exhaust Manifold 4-Cyl', customer_id: 'cus-5', drawing_number: 'MHD-EX-40', drawing_revision: 'Rev C', material_grade: 'Si-Mo SG Iron', process: 'Sand Casting', weight: 7.9, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Unmachined', active_status: true, created_at: '2026-02-16T15:00:00Z' },
  { id: 'itm-13', item_code: 'ITM-00013', item_name: 'Tractor Rear Axle Housing', customer_id: 'cus-7', drawing_number: 'ESC-AX-300', drawing_revision: 'Rev 2', material_grade: 'SG 500/7', process: 'Sand Casting', weight: 42.0, unit: 'Pcs', pattern_status: 'Under Development', machining_status: 'Machined', active_status: true, created_at: '2026-03-12T10:00:00Z' },
  { id: 'itm-14', item_code: 'ITM-00014', item_name: 'High Pressure Valve Body 300#', customer_id: 'cus-8', drawing_number: 'LNT-VB-300-4', drawing_revision: 'Rev B', material_grade: 'Cast Steel WCB', process: 'Sand Casting', weight: 55.0, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Proof Machined', active_status: true, created_at: '2026-03-20T14:00:00Z' },
  { id: 'itm-15', item_code: 'ITM-00015', item_name: 'Excavator Swing Bracket', customer_id: 'cus-9', drawing_number: 'CAT-SW-902', drawing_revision: 'Rev B', material_grade: 'Alloy Steel WCC', process: 'Sand Casting', weight: 145.0, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Unmachined', active_status: true, created_at: '2026-04-01T12:00:00Z' },
  { id: 'itm-16', item_code: 'ITM-00016', item_name: 'Brake Drum Rear', customer_id: 'cus-10', drawing_number: 'TVS-BD-100', drawing_revision: 'Rev A', material_grade: 'FG 260', process: 'Sand Casting', weight: 6.4, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Machined', active_status: true, created_at: '2026-04-05T15:00:00Z' },
  { id: 'itm-17', item_code: 'ITM-00017', item_name: 'Engine Block 2-Cyl', customer_id: 'cus-11', drawing_number: 'TAT-EB-2C', drawing_revision: 'Rev 1', material_grade: 'FG 300', process: 'Sand Casting', weight: 35.0, unit: 'Pcs', pattern_status: 'Required', machining_status: 'Machined', active_status: true, created_at: '2026-04-15T14:00:00Z' },
  { id: 'itm-18', item_code: 'ITM-00018', item_name: 'Crankcase Cover', customer_id: 'cus-15', drawing_number: 'KOE-CC-09', drawing_revision: 'Rev A', material_grade: 'FG 260', process: 'Sand Casting', weight: 14.5, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Proof Machined', active_status: true, created_at: '2026-05-15T16:00:00Z' },
  { id: 'itm-19', item_code: 'ITM-00019', item_name: 'Front Caliper Body Left', customer_id: 'cus-16', drawing_number: 'BI-FC-22L', drawing_revision: 'Rev F', material_grade: 'SG 500/7', process: 'Sand Casting', weight: 3.9, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Machined', active_status: true, created_at: '2026-05-20T10:00:00Z' },
  { id: 'itm-20', item_code: 'ITM-00020', item_name: 'Compressor Crankcase GP35', customer_id: 'cus-20', drawing_number: 'ELG-CC-35', drawing_revision: 'Rev H', material_grade: 'FG 260', process: 'Sand Casting', weight: 48.0, unit: 'Pcs', pattern_status: 'Available', machining_status: 'Machined', active_status: true, created_at: '2026-06-05T11:00:00Z' }
];

export const mockEnquiries: Enquiry[] = [];
export const mockEnquiryItems: EnquiryItem[] = [];
export const mockTechnicalEvaluations: TechnicalEvaluation[] = [];
export const mockQuotations: Quotation[] = [];
export const mockQuotationItems: QuotationItem[] = [];
export const mockFollowUps: FollowUp[] = [];
export const mockOrders: Order[] = [];
export const mockOrderItems: OrderItem[] = [];
export const mockDispatches: Dispatch[] = [];
export const mockDispatchItems: DispatchItem[] = [];
export const mockComplaints: Complaint[] = [];
export const mockActivities: Activity[] = [];
export const mockNotifications: Notification[] = [];

// Seed 30 Enquiries and corresponding data dynamically for realistic values
const seedEnquiriesAndWorkflows = () => {
  // Let's populate mockEnquiries and related tables
  const customerIds = mockCustomers.map(c => c.id);
  const userIds = ['usr-1', 'usr-2'];

  for (let i = 1; i <= 30; i++) {
    const codeNum = String(i).padStart(5, '0');
    const customerId = mockCustomers[(i - 1) % mockCustomers.length].id;
    const isEven = i % 2 === 0;
    
    // Choose appropriate date
    // Current local time: 2026-08-16T21:03:03+05:30. Let's make dates starting from January 2026 up to August 2026
    const month = (Math.floor((i - 1) / 4) + 1).toString().padStart(2, '0');
    const day = (10 + (i % 15)).toString().padStart(2, '0');
    const dateStr = `2026-${month}-${day}T10:00:00Z`;

    const statuses: EnquiryStatus[] = [
      'New', 'Under Review', 'Technical Evaluation', 'Quotation Pending', 
      'Quotation Sent', 'Negotiation', 'Won', 'Lost', 'On Hold'
    ];
    // Map index to status to have a realistic distribution
    let status: EnquiryStatus = 'Won';
    if (i > 24) status = 'New';
    else if (i > 20) status = 'Negotiation';
    else if (i > 18) status = 'Quotation Sent';
    else if (i > 15) status = 'Technical Evaluation';
    else if (i > 13) status = 'Lost';
    else if (i > 12) status = 'On Hold';

    const eq: Enquiry = {
      id: `enq-${i}`,
      enquiry_code: `ENQ-${codeNum}`,
      customer_id: customerId,
      enquiry_date: dateStr,
      enquiry_source: mockCustomers[(i - 1) % mockCustomers.length].source,
      contact_person: mockCustomers[(i - 1) % mockCustomers.length].contact_person,
      requirement_description: `Requirement for development of custom cast components for upcoming project code ${100 + i}.`,
      priority: i % 7 === 0 ? 'Critical' : i % 3 === 0 ? 'High' : 'Medium',
      expected_order_date: `2026-${(Number(month) + 3).toString().padStart(2, '0')}-${day}T12:00:00Z`,
      sales_person_id: i % 2 === 0 ? 'usr-2' : 'usr-1',
      status: status,
      remarks: `Urgent requirement. Drawing uploaded.`,
      created_at: dateStr,
      updated_at: dateStr
    };
    mockEnquiries.push(eq);

    // Create 1-2 items per enquiry (total 40 enquiry items)
    const itemCount = (i <= 10) ? 2 : 1; // First 10 have 2 items, next 20 have 1 item = 40 items total
    for (let j = 1; j <= itemCount; j++) {
      const itemIndex = ((i - 1) * 2 + j - 1) % mockItems.length;
      const originalItem = mockItems[itemIndex];
      const quantity = (100 * (i % 5 + 1)) * j;
      const annualRequirement = quantity * 12;

      const eiId = `enq-item-${i}-${j}`;
      const ei: EnquiryItem = {
        id: eiId,
        enquiry_id: eq.id,
        item_id: originalItem.id,
        quantity: quantity,
        annual_requirement: annualRequirement,
        machining_required: j % 2 === 0,
        surface_treatment: j % 2 === 0 ? 'Anti-Rust Coating' : 'Shot Blasting',
        pattern_available: i % 3 !== 0,
        pattern_required: i % 3 === 0,
        tolerance: 'ISO 8062 DCTG 9',
        testing_requirement: 'UT, Radiography 10%',
        inspection_requirement: 'Third Party Inspection',
        packaging_requirement: 'Wooden Boxes with Rust Preventive'
      };
      mockEnquiryItems.push(ei);

      // Create Technical Evaluation for each Item (Phase 1/2)
      let teStatus: TechnicalEvaluationStatus = 'Approved';
      if (status === 'New') teStatus = 'Pending';
      else if (status === 'Technical Evaluation') teStatus = 'Under Evaluation';

      const te: TechnicalEvaluation = {
        id: `te-${i}-${j}`,
        enquiry_id: eq.id,
        enquiry_item_id: ei.id,
        evaluator_id: 'usr-4',
        evaluation_date: dateStr,
        material_feasibility: true,
        casting_feasibility: true,
        pattern_feasibility: true,
        machining_feasibility: true,
        quality_requirement_feasible: true,
        estimated_weight: originalItem.weight,
        estimated_scrap_percent: 4.5,
        estimated_cycle_time_mins: 15,
        technical_remarks: 'Technically feasible. Patterns can be manufactured in-house or outsourced.',
        status: teStatus,
        created_at: dateStr,
        updated_at: dateStr
      };
      mockTechnicalEvaluations.push(te);
    }
  }

  // Create 20 Quotations (linked to won, lost, negotiation, or sent enquiries)
  let quotationIndex = 1;
  mockEnquiries.forEach((enq, index) => {
    if (quotationIndex > 20) return;
    if (['Won', 'Lost', 'Negotiation', 'Quotation Sent'].includes(enq.status)) {
      const qCode = `QUO-${String(quotationIndex).padStart(5, '0')}`;
      
      const qDate = new Date(enq.enquiry_date);
      qDate.setDate(qDate.getDate() + 5); // 5 days after enquiry
      const validUntilDate = new Date(qDate);
      validUntilDate.setDate(validUntilDate.getDate() + 30); // 30 days validity

      // Get enquiry items
      const enqItems = mockEnquiryItems.filter(ei => ei.enquiry_id === enq.id);
      
      let qStatus: QuotationStatus = 'Sent';
      if (enq.status === 'Won') qStatus = 'Accepted';
      else if (enq.status === 'Lost') qStatus = 'Rejected';
      else if (enq.status === 'Negotiation') qStatus = 'Negotiation';

      // Calc items
      let subtotal = 0;
      const qItems: QuotationItem[] = enqItems.map((ei, idx) => {
        const itemObj = mockItems.find(it => it.id === ei.item_id)!;
        // Rate based on weight: e.g. 150 INR per kg for CI, 200 for SG Iron
        const baseRate = itemObj.material_grade.includes('SG') ? 220 : 160;
        const calculatedRate = baseRate * itemObj.weight;
        const totalAmount = calculatedRate * ei.quantity;
        subtotal += totalAmount;

        return {
          id: `q-item-${quotationIndex}-${idx}`,
          quotation_id: `q-${quotationIndex}`,
          enquiry_item_id: ei.id,
          item_id: ei.item_id,
          rate: calculatedRate,
          discount_percent: 2,
          discount_amount: totalAmount * 0.02,
          tax_percent: 18,
          tax_amount: (totalAmount * 0.98) * 0.18,
          delivery_period_weeks: 6,
          amount: totalAmount * 0.98 * 1.18,
          remarks: 'Quoted with standard machining allowance.'
        };
      });

      const tax_amount = subtotal * 0.18;
      const discount_amount = subtotal * 0.02;
      const grand_total = subtotal - discount_amount + tax_amount;

      const quo: Quotation = {
        id: `q-${quotationIndex}`,
        quotation_code: qCode,
        customer_id: enq.customer_id,
        enquiry_id: enq.id,
        quotation_date: qDate.toISOString(),
        valid_until: validUntilDate.toISOString(),
        currency: 'INR',
        payment_terms: '30 Days Net from Invoice Date',
        delivery_terms: 'Ex-Works Coimbatore',
        price_basis: 'Ex-Works',
        sales_person_id: enq.sales_person_id,
        status: qStatus,
        subtotal: subtotal,
        tax_percent: 18,
        tax_amount: tax_amount,
        discount_percent: 2,
        discount_amount: discount_amount,
        grand_total: grand_total,
        approved_by: 'usr-1',
        approved_at: qDate.toISOString(),
        approval_remarks: 'Approved as per standard price guidelines.',
        remarks: 'Quotation sent. Customer requested for discount.',
        created_at: qDate.toISOString(),
        updated_at: qDate.toISOString()
      };
      mockQuotations.push(quo);
      mockQuotationItems.push(...qItems);
      quotationIndex++;
    }
  });

  // Create 10 Orders (linked to accepted quotations)
  let orderIndex = 1;
  mockQuotations.forEach((q) => {
    if (orderIndex > 10) return;
    if (q.status === 'Accepted') {
      const oCode = `ORD-${String(orderIndex).padStart(5, '0')}`;
      const oDate = new Date(q.quotation_date);
      oDate.setDate(oDate.getDate() + 10); // order date is 10 days after quotation

      const expDelDate = new Date(oDate);
      expDelDate.setDate(expDelDate.getDate() + 45); // 45 days expected delivery

      const oItems = mockQuotationItems.filter(qi => qi.quotation_id === q.id).map((qi, idx) => {
        const enqItem = mockEnquiryItems.find(ei => ei.id === qi.enquiry_item_id)!;
        return {
          id: `o-item-${orderIndex}-${idx}`,
          order_id: `ord-${orderIndex}`,
          quotation_item_id: qi.id,
          item_id: qi.item_id,
          quantity: enqItem.quantity,
          rate: qi.rate,
          amount: qi.rate * enqItem.quantity,
          dispatched_quantity: 0
        };
      });

      let orderStatus: OrderStatus = 'In Production';
      if (orderIndex <= 5) orderStatus = 'Completed';
      else if (orderIndex <= 8) orderStatus = 'Partially Dispatched';

      const ord: Order = {
        id: `ord-${orderIndex}`,
        order_code: oCode,
        customer_id: q.customer_id,
        quotation_id: q.id,
        po_number: `PO-100${orderIndex}`,
        po_date: oDate.toISOString(),
        order_date: oDate.toISOString(),
        expected_delivery_date: expDelDate.toISOString(),
        payment_terms: q.payment_terms,
        delivery_terms: q.delivery_terms,
        sales_person_id: q.sales_person_id,
        status: orderStatus,
        total_amount: q.grand_total,
        remarks: 'Order confirmed. Production schedules aligned.',
        created_at: oDate.toISOString(),
        updated_at: oDate.toISOString()
      };

      mockOrders.push(ord);
      mockOrderItems.push(...oItems);
      orderIndex++;
    }
  });

  // Create 15 Dispatches (linked to orders)
  // We have 10 orders. Let's create partial and full dispatches.
  // Order 1-5: Completed (100% dispatched)
  // Order 6-8: Partially Dispatched
  // Order 9-10: Confirmed / In Production (0 dispatches)
  let dispatchIndex = 1;
  mockOrders.forEach((ord, index) => {
    const oItems = mockOrderItems.filter(oi => oi.order_id === ord.id);
    
    if (ord.status === 'Completed') {
      // Create 1-2 dispatches to cover 100% quantity
      const dCode = `DSP-${String(dispatchIndex).padStart(5, '0')}`;
      const dDate = new Date(ord.order_date);
      dDate.setDate(dDate.getDate() + 30); // 30 days after order

      // Create a single full dispatch
      const disp: Dispatch = {
        id: `dsp-${dispatchIndex}`,
        dispatch_code: dCode,
        order_id: ord.id,
        customer_id: ord.customer_id,
        dispatch_date: dDate.toISOString(),
        invoice_number: `INV-2026-00${dispatchIndex}`,
        transporter: 'VRL Logistics',
        vehicle_number: `TN-37-CF-1234`,
        dispatch_status: 'Delivered',
        tracking_info: 'https://vrl.in/track/123456',
        remarks: 'Full dispatch completed.',
        created_at: dDate.toISOString()
      };
      mockDispatches.push(disp);

      // Link dispatch items
      oItems.forEach((oi, idx) => {
        mockDispatchItems.push({
          id: `disp-item-${dispatchIndex}-${idx}`,
          dispatch_id: disp.id,
          order_item_id: oi.id,
          quantity: oi.quantity
        });
        oi.dispatched_quantity = oi.quantity; // Mark as fully dispatched in mock data
      });
      
      dispatchIndex++;
    } 
    else if (ord.status === 'Partially Dispatched') {
      // Dispatch 1: Partial (60% quantity)
      const dCode = `DSP-${String(dispatchIndex).padStart(5, '0')}`;
      const dDate = new Date(ord.order_date);
      dDate.setDate(dDate.getDate() + 25);

      const disp: Dispatch = {
        id: `dsp-${dispatchIndex}`,
        dispatch_code: dCode,
        order_id: ord.id,
        customer_id: ord.customer_id,
        dispatch_date: dDate.toISOString(),
        invoice_number: `INV-2026-00${dispatchIndex}`,
        transporter: 'GATI Logistics',
        vehicle_number: `MH-12-QQ-5678`,
        dispatch_status: 'Shipped',
        tracking_info: 'https://gati.com/track/778899',
        remarks: 'First partial dispatch (approx 60%).',
        created_at: dDate.toISOString()
      };
      mockDispatches.push(disp);

      oItems.forEach((oi, idx) => {
        const partialQty = Math.floor(oi.quantity * 0.6);
        mockDispatchItems.push({
          id: `disp-item-${dispatchIndex}-${idx}`,
          dispatch_id: disp.id,
          order_item_id: oi.id,
          quantity: partialQty
        });
        oi.dispatched_quantity = partialQty;
      });

      dispatchIndex++;

      // Dispatch 2: Let's add one more partial dispatch for some order to make it 15 dispatches total
      if (index === 6) {
        const dCode2 = `DSP-${String(dispatchIndex).padStart(5, '0')}`;
        const dDate2 = new Date(dDate);
        dDate2.setDate(dDate2.getDate() + 10);

        const disp2: Dispatch = {
          id: `dsp-${dispatchIndex}`,
          dispatch_code: dCode2,
          order_id: ord.id,
          customer_id: ord.customer_id,
          dispatch_date: dDate2.toISOString(),
          invoice_number: `INV-2026-00${dispatchIndex}`,
          transporter: 'GATI Logistics',
          vehicle_number: `MH-12-QQ-5678`,
          dispatch_status: 'Delivered',
          tracking_info: 'https://gati.com/track/778900',
          remarks: 'Second partial dispatch (approx 20%).',
          created_at: dDate2.toISOString()
        };
        mockDispatches.push(disp2);

        oItems.forEach((oi, idx) => {
          const partialQty2 = Math.floor(oi.quantity * 0.2);
          mockDispatchItems.push({
            id: `disp-item-${dispatchIndex}-${idx}`,
            dispatch_id: disp2.id,
            order_item_id: oi.id,
            quantity: partialQty2
          });
          oi.dispatched_quantity += partialQty2;
        });

        dispatchIndex++;
      }
    }
  });

  // To reach exactly 15 dispatches, let's create a few more full dispatches from completed orders 1-5 or other records
  while (mockDispatches.length < 15 && mockDispatches.length > 0) {
    const dCode = `DSP-${String(dispatchIndex).padStart(5, '0')}`;
    const parentDisp = mockDispatches[dispatchIndex % mockDispatches.length];
    const disp: Dispatch = {
      id: `dsp-${dispatchIndex}`,
      dispatch_code: dCode,
      order_id: parentDisp.order_id,
      customer_id: parentDisp.customer_id,
      dispatch_date: parentDisp.dispatch_date,
      invoice_number: `INV-2026-00${dispatchIndex}`,
      transporter: parentDisp.transporter,
      vehicle_number: parentDisp.vehicle_number,
      dispatch_status: 'Delivered',
      remarks: 'Extra dispatch record to hit demo requirement.',
      created_at: parentDisp.created_at
    };
    mockDispatches.push(disp);
    dispatchIndex++;
  }

  // Create 15 Follow-ups
  const followUpTypes: FollowUpType[] = ['Call', 'Email', 'Meeting', 'WhatsApp', 'Site Visit', 'Video Call'];
  const followUpStatuses: FollowUpStatus[] = ['Completed', 'Scheduled', 'Rescheduled', 'Cancelled'];

  for (let i = 1; i <= 15; i++) {
    const codeNum = String(i).padStart(5, '0');
    const customerId = mockCustomers[i % mockCustomers.length].id;
    const isOverdue = i === 1 || i === 4; // Make two followups overdue
    const isToday = i === 2 || i === 6; // Make two followups scheduled for today

    // Current date is 2026-08-16
    let followUpDate = '2026-08-20T10:00:00Z'; // default upcoming
    let fStatus: FollowUpStatus = 'Scheduled';

    if (isOverdue) {
      followUpDate = '2026-08-12T11:00:00Z'; // past date, scheduled = overdue
      fStatus = 'Scheduled';
    } else if (isToday) {
      followUpDate = '2026-08-16T14:00:00Z'; // today
      fStatus = 'Scheduled';
    } else if (i <= 10) {
      // Completed followups
      const month = (5 + (i % 3)).toString().padStart(2, '0');
      followUpDate = `2026-${month}-15T11:00:00Z`;
      fStatus = 'Completed';
    }

    const fol: FollowUp = {
      id: `fol-${i}`,
      follow_up_code: `FOL-${codeNum}`,
      customer_id: customerId,
      enquiry_id: mockEnquiries.find(e => e.customer_id === customerId)?.id,
      quotation_id: mockQuotations.find(q => q.customer_id === customerId)?.id,
      follow_up_date: followUpDate,
      follow_up_type: followUpTypes[i % followUpTypes.length],
      contact_person: mockCustomers[i % mockCustomers.length].contact_person,
      discussion: `Followed up on the quotation submitted. Customer is reviewing our prices and comparing with competitors. Asked for a revised offer with a 5% discount.`,
      customer_response: fStatus === 'Completed' ? 'Positive response. Promised to share feedback next week.' : undefined,
      probability_percent: 40 + (i * 3) % 50,
      next_follow_up_date: fStatus === 'Completed' ? '2026-08-28T10:00:00Z' : undefined,
      assigned_to: i % 2 === 0 ? 'usr-2' : 'usr-1',
      status: fStatus,
      remarks: 'Will call again in a week.',
      created_at: new Date(new Date(followUpDate).getTime() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2 days before
    };
    mockFollowUps.push(fol);
  }

  // Create 8 Complaints
  const complaintTypes = ['Dimensional Deviation', 'Blowholes & Porosity', 'Surface Cracks', 'Delivery Delay', 'Mismatch Packing', 'Hardness Deviation'];
  const severities: PriorityLevel[] = ['Low', 'Medium', 'High', 'Critical'];
  const cStatuses: ComplaintStatus[] = ['Open', 'Under Investigation', 'Action Required', 'Resolved', 'Closed'];

  for (let i = 1; i <= 8; i++) {
    const codeNum = String(i).padStart(5, '0');
    const ord = mockOrders[i % mockOrders.length];
    const customerId = ord ? ord.customer_id : mockCustomers[0].id;
    const itemId = mockOrderItems.find(oi => oi.order_id === ord?.id)?.item_id || mockItems[0].id;
    const dispatchId = mockDispatches.find(d => d.order_id === ord?.id)?.id;
    
    // Dates in July/August
    const cDate = `2026-08-${(5 + i).toString().padStart(2, '0')}T11:00:00Z`;
    let status: ComplaintStatus = 'Under Investigation';
    let resDate: string | undefined = undefined;

    if (i <= 4) {
      status = 'Resolved';
      resDate = `2026-08-${(12 + i).toString().padStart(2, '0')}T16:00:00Z`;
    } else if (i === 5) {
      status = 'Open';
    } else if (i === 6) {
      status = 'Closed';
      resDate = `2026-08-14T10:00:00Z`;
    }

    const cmp: Complaint = {
      id: `cmp-${i}`,
      complaint_code: `CMP-${codeNum}`,
      customer_id: customerId,
      order_id: ord?.id,
      item_id: itemId,
      dispatch_id: dispatchId,
      complaint_date: cDate,
      complaint_type: complaintTypes[i % complaintTypes.length],
      description: `Customer reported ${complaintTypes[i % complaintTypes.length].toLowerCase()} in batch number ${234 + i}. High rejection rate at their incoming inspection stage.`,
      severity: severities[i % severities.length],
      quantity_affected: 5 * i,
      root_cause: i <= 4 ? 'Improper mold venting leading to gas entrapment.' : undefined,
      corrective_action: i <= 4 ? 'Increased riser height and added venting holes in patterns.' : undefined,
      preventive_action: i <= 4 ? 'Strict core drying audits before pouring.' : undefined,
      responsible_person_id: 'usr-4', // Technical User
      target_resolution_date: `2026-08-${(15 + i).toString().padStart(2, '0')}T17:00:00Z`,
      resolution_date: resDate,
      status: status,
      remarks: 'Customer is demanding replacement. Hold batch inspection in production.',
      created_at: cDate,
      updated_at: cDate
    };
    mockComplaints.push(cmp);
  }

  // Create some activities
  const actItems = [
    { type: 'customer', desc: 'Customer ABC Auto Components created', id: 'cus-1', code: 'CUS-00001' },
    { type: 'enquiry', desc: 'Enquiry ENQ-00001 received', id: 'enq-1', code: 'ENQ-00001' },
    { type: 'technical', desc: 'Technical Evaluation approved for item in ENQ-00001', id: 'te-1-1', code: 'TE-00001' },
    { type: 'quotation', desc: 'Quotation QUO-00001 created & sent to Apex Auto Components Ltd', id: 'q-1', code: 'QUO-00001' },
    { type: 'followup', desc: 'Follow-up Call completed by Alka Deshpande', id: 'fol-1', code: 'FOL-00001' },
    { type: 'order', desc: 'Order ORD-00001 confirmed for Apex Auto Components Ltd', id: 'ord-1', code: 'ORD-00001' },
    { type: 'dispatch', desc: 'Invoice INV-2026-001 created and dispatch done via VRL Logistics', id: 'dsp-1', code: 'DSP-00001' },
    { type: 'complaint', desc: 'Complaint CMP-00001 raised regarding blowholes', id: 'cmp-1', code: 'CMP-00001' },
  ];

  actItems.forEach((act, idx) => {
    mockActivities.push({
      id: `act-${idx + 1}`,
      customer_id: 'cus-1',
      user_id: 'usr-2',
      user_name: 'Alka Deshpande',
      action_type: idx === 7 ? 'status_change' : 'create',
      entity_type: act.type as any,
      entity_id: act.id,
      entity_code: act.code,
      description: act.desc,
      created_at: `2026-08-1${idx}T10:00:00Z`
    });
  });

  // Create notifications
  mockNotifications.push(
    {
      id: 'not-1',
      user_id: 'usr-2',
      title: 'Follow-up Overdue',
      description: 'Follow-up FOL-00001 with Apex Auto Components Ltd is overdue since 12 Aug 2026.',
      type: 'followup_overdue',
      related_entity_type: 'followup',
      related_entity_id: 'fol-1',
      read: false,
      created_at: '2026-08-16T09:00:00Z'
    },
    {
      id: 'not-2',
      user_id: 'usr-2',
      title: 'Follow-up Due Today',
      description: 'Follow-up FOL-00002 with Flowserve Pumps India is scheduled for today.',
      type: 'followup_due',
      related_entity_type: 'followup',
      related_entity_id: 'fol-2',
      read: false,
      created_at: '2026-08-16T08:00:00Z'
    },
    {
      id: 'not-3',
      user_id: 'usr-1',
      title: 'Quotation Expiring Soon',
      description: 'Quotation QUO-00004 is expiring on 24 Aug 2026.',
      type: 'quotation_expiring',
      related_entity_type: 'quotation',
      related_entity_id: 'q-4',
      read: false,
      created_at: '2026-08-15T10:00:00Z'
    },
    {
      id: 'not-4',
      user_id: 'usr-4',
      title: 'Technical Evaluation Pending',
      description: 'New Enquiry ENQ-00025 requires technical feasibility study.',
      type: 'technical_pending',
      related_entity_type: 'enquiry',
      related_entity_id: 'enq-25',
      read: false,
      created_at: '2026-08-16T12:00:00Z'
    }
  );
};

seedEnquiriesAndWorkflows();
