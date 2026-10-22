// Complete and maintained Indian States, Union Territories and Districts/Cities dataset
export interface PostalLocation {
  name: string; // Locality or Post Office Name
  district: string; // District or City
  state: string; // State
  pincode: string; // 6-digit PIN code
}

export const INDIAN_STATES_AND_UT: string[] = [
  'Andaman and Nicobar Islands',
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chandigarh',
  'Chhattisgarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jammu and Kashmir',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Ladakh',
  'Lakshadweep',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Puducherry',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

export const STATE_CITIES_MAP: Record<string, string[]> = {
  'Andaman and Nicobar Islands': [
    'Port Blair', 'Car Nicobar', 'Diglipur', 'Mayabunder', 'Rangat', 'Hut Bay'
  ],
  'Andhra Pradesh': [
    'Visakhapatnam', 'Vijayawada', 'Guntur', 'Nellore', 'Kurnool', 'Rajahmundry',
    'Tirupati', 'Kadapa', 'Kakinada', 'Anantapur', 'Eluru', 'Vizianagaram',
    'Ongole', 'Nandyal', 'Machilipatnam', 'Adoni', 'Tenali', 'Proddatur',
    'Chittoor', 'Hindupur', 'Bhimavaram', 'Madanapalle', 'Guntakal', 'Srikakulam',
    'Dharmavaram', 'Gudivada', 'Narasaraopet', 'Tadipatri', 'Mangalagiri'
  ],
  'Arunachal Pradesh': [
    'Itanagar', 'Naharlagun', 'Pasighat', 'Namsai', 'Tawang', 'Ziro', 'Bomdila', 'Tezu', 'Along (Aalo)', 'Roing'
  ],
  'Assam': [
    'Guwahati', 'Silchar', 'Dibrugarh', 'Jorhat', 'Nagaon', 'Tinsukia', 'Tezpur',
    'Bongaigaon', 'Dhubri', 'Diphu', 'North Lakhimpur', 'Karimganj', 'Sivasagar',
    'Goalpara', 'Barpeta', 'Hailakandi', 'Lumding', 'Mangaldai', 'Hojai'
  ],
  'Bihar': [
    'Patna', 'Gaya', 'Bhagalpur', 'Muzaffarpur', 'Purnia', 'Darbhanga', 'Bihar Sharif',
    'Arrah', 'Begusarai', 'Katihar', 'Munger', 'Chhapra', 'Danapur', 'Bettiah',
    'Saharsa', 'Sasaram', 'Hajipur', 'Dehri', 'Siwan', 'Motihari', 'Nawada',
    'Bagaha', 'Buxar', 'Kishanganj', 'Sitamarhi', 'Jamalpur', 'Jehanabad', 'Aurangabad'
  ],
  'Chandigarh': [
    'Chandigarh'
  ],
  'Chhattisgarh': [
    'Raipur', 'Bhilai', 'Bilaspur', 'Korba', 'Rajnandgaon', 'Raigarh', 'Jagdalpur',
    'Ambikapur', 'Dhamtari', 'Chirmiri', 'Mahasamund', 'Durg', 'Kanker', 'Kawardha'
  ],
  'Dadra and Nagar Haveli and Daman and Diu': [
    'Daman', 'Diu', 'Silvassa'
  ],
  'Delhi': [
    'Central Delhi', 'East Delhi', 'New Delhi', 'North Delhi', 'North East Delhi',
    'North West Delhi', 'Shahdara', 'South Delhi', 'South East Delhi', 'South West Delhi',
    'West Delhi', 'Connaught Place', 'Dwarka', 'Rohini', 'Saket', 'Karol Bagh',
    'Lajpat Nagar', 'Janakpuri', 'Vasant Kunj', 'Chandni Chowk', 'Okhla'
  ],
  'Goa': [
    'Panaji', 'Margao', 'Vasco da Gama', 'Mapusa', 'Ponda', 'Bicholim', 'Curchorem', 'Cuncolim'
  ],
  'Gujarat': [
    'Ahmedabad', 'Surat', 'Vadodara', 'Rajkot', 'Bhavnagar', 'Jamnagar', 'Junagadh',
    'Gandhinagar', 'Gandhidham', 'Anand', 'Navsari', 'Morbi', 'Nadiad', 'Surendranagar',
    'Bharuch', 'Mehsana', 'Bhuj', 'Porbandar', 'Palanpur', 'Valsad', 'Vapi',
    'Gondal', 'Veraval', 'Godhra', 'Patan', 'Kalol', 'Dahod', 'Botad', 'Amreli',
    'Deesa', 'Jetpur', 'Anjar', 'Bardoli', 'Dholka', 'Sanand', 'Halol'
  ],
  'Haryana': [
    'Faridabad', 'Gurugram (Gurgaon)', 'Panipat', 'Ambala', 'Yamunanagar', 'Rohtak',
    'Hisar', 'Karnal', 'Sonipat', 'Panchkula', 'Bhiwani', 'Sirsa', 'Bahadurgarh',
    'Jind', 'Thanesar', 'Kaithal', 'Rewari', 'Palwal', 'Hansi', 'Narnaul', 'Manesar'
  ],
  'Himachal Pradesh': [
    'Shimla', 'Dharamshala', 'Mandi', 'Solan', 'Kullu', 'Manali', 'Baddi', 'Nahan',
    'Una', 'Bilaspur', 'Hamirpur', 'Chamba', 'Paonta Sahib'
  ],
  'Jammu and Kashmir': [
    'Srinagar', 'Jammu', 'Anantnag', 'Baramulla', 'Kathua', 'Udhampur', 'Sopore',
    'Rajouri', 'Poonch', 'Pulwama', 'Kupwara', 'Budgam'
  ],
  'Jharkhand': [
    'Ranchi', 'Jamshedpur', 'Dhanbad', 'Bokaro Steel City', 'Deoghar', 'Phusro',
    'Hazaribagh', 'Giridih', 'Ramgarh', 'Medininagar (Daltonganj)', 'Chirkunda',
    'Chaibasa', 'Dumka', 'Sahibganj'
  ],
  'Karnataka': [
    'Bengaluru (Bangalore)', 'Mysuru (Mysore)', 'Hubballi-Dharwad', 'Mangaluru (Mangalore)',
    'Belagavi (Belgaum)', 'Kalaburagi (Gulbarga)', 'Davanagere', 'Ballari (Bellary)',
    'Vijayapura (Bijapur)', 'Shivamogga (Shimoga)', 'Tumakuru (Tumkur)', 'Raichur',
    'Bidar', 'Hosapete', 'Gadag-Betageri', 'Robertsonpet', 'Hassan', 'Bhadravati',
    'Chitradurga', 'Udupi', 'Kolar', 'Mandya', 'Chikkamagaluru', 'Bagalkot', 'Ranebennur'
  ],
  'Kerala': [
    'Thiruvananthapuram', 'Kochi (Cochin)', 'Kozhikode (Calicut)', 'Kollam', 'Thrissur',
    'Kannur', 'Alappuzha', 'Kottayam', 'Palakkad', 'Manjeri', 'Thalassery', 'Ponnani',
    'Vatakara', 'Kanhangad', 'Payyanur', 'Koyilandy', 'Neyyattinkara', 'Malappuram'
  ],
  'Ladakh': [
    'Leh', 'Kargil'
  ],
  'Lakshadweep': [
    'Kavaratti', 'Agatti', 'Amini', 'Andrott', 'Minicoy'
  ],
  'Madhya Pradesh': [
    'Indore', 'Bhopal', 'Jabalpur', 'Gwalior', 'Ujjain', 'Sagar', 'Dewas', 'Satna',
    'Ratlam', 'Rewa', 'Murwara (Katni)', 'Singrauli', 'Burhanpur', 'Khandwa',
    'Bhind', 'Chhindwara', 'Guna', 'Shivpuri', 'Vidisha', 'Chhatarpur', 'Damoh',
    'Mandsaur', 'Khargone', 'Neemuch', 'Pithampur', 'Hoshangabad (Narmadapuram)'
  ],
  'Maharashtra': [
    'Mumbai', 'Pune', 'Nagpur', 'Thane', 'Nashik', 'Kalyan-Dombivli', 'Vasai-Virar',
    'Aurangabad (Chhatrapati Sambhajinagar)', 'Navi Mumbai', 'Solapur', 'Mira-Bhayandar',
    'Bhiwandi', 'Amravati', 'Nanded', 'Kolhapur', 'Akola', 'Panvel', 'Ulhasnagar',
    'Sangli', 'Malegaon', 'Jalgaon', 'Latur', 'Dhule', 'Ahmednagar', 'Satara',
    'Chandrapur', 'Parbhani', 'Ichalkaranji', 'Jalna', 'Ambarnath', 'Bhusawal',
    'Ratnagiri', 'Beed', 'Gondia', 'Baramati', 'Wardha', 'Yavatmal', 'Achalpur',
    'Osmanabad (Dharashiv)', 'Nandurbar', 'Miraj'
  ],
  'Manipur': [
    'Imphal', 'Thoubal', 'Bishnupur', 'Churachandpur', 'Kakching', 'Ukhrul', 'Senapati'
  ],
  'Meghalaya': [
    'Shillong', 'Tura', 'Nongpoh', 'Jowai', 'Baghmara', 'Williamnagar', 'Resubelpara'
  ],
  'Mizoram': [
    'Aizawl', 'Lunglei', 'Champhai', 'Serchhip', 'Kolasib', 'Lawngtlai', 'Saiha'
  ],
  'Nagaland': [
    'Kohima', 'Dimapur', 'Mokokchung', 'Tuensang', 'Wokha', 'Zunheboto', 'Mon', 'Phek'
  ],
  'Odisha': [
    'Bhubaneswar', 'Cuttack', 'Rourkela', 'Berhampur', 'Sambalpur', 'Puri', 'Balasore',
    'Bhadrak', 'Baripada', 'Jharsuguda', 'Jeypore', 'Bargarh', 'Rayagada', 'Bolangir',
    'Dhenkanal', 'Kendrapara', 'Angul', 'Paradeep'
  ],
  'Puducherry': [
    'Puducherry', 'Karaikal', 'Mahe', 'Yanam', 'Ozhukarai'
  ],
  'Punjab': [
    'Ludhiana', 'Amritsar', 'Jalandhar', 'Patiala', 'Bathinda', 'Hoshiarpur',
    'Mohali (SAS Nagar)', 'Batala', 'Pathankot', 'Moga', 'Abohar', 'Malerkotla',
    'Khanna', 'Muktsar', 'Barnala', 'Firozpur', 'Kapurthala', 'Phagwara'
  ],
  'Rajasthan': [
    'Jaipur', 'Jodhpur', 'Kota', 'Bikaner', 'Ajmer', 'Udaipur', 'Bhilwara', 'Alwar',
    'Bharatpur', 'Sri Ganganagar', 'Sikar', 'Pali', 'Tonk', 'Kishangarh', 'Beawar',
    'Hanumangarh', 'Dholpur', 'Sawai Madhopur', 'Churu', 'Gangapur City', 'Jhunjhunu',
    'Barmer', 'Chittorgarh', 'Makrana', 'Nagaur', 'Bhiwadi', 'Neemrana'
  ],
  'Sikkim': [
    'Gangtok', 'Namchi', 'Geyzing', 'Mangan', 'Rangpo', 'Singtam', 'Jorethang'
  ],
  'Tamil Nadu': [
    'Chennai', 'Coimbatore', 'Madurai', 'Tiruchirappalli', 'Salem', 'Tiruppur', 'Erode',
    'Tirunelveli', 'Vellore', 'Thoothukudi', 'Dindigul', 'Thanjavur', 'Ranipet',
    'Sivakasi', 'Karur', 'Udhagamandalam (Ooty)', 'Hosur', 'Nagercoil', 'Kanchipuram',
    'Kumarapalayam', 'Karaikkudi', 'Neyveli', 'Cuddalore', 'Kumbakonam', 'Tiruvannamalai',
    'Pollachi', 'Rajapalayam', 'Gudiyatham', 'Pudukkottai', 'Vaniyambadi', 'Ambur',
    'Nagapattinam', 'Namakkal', 'Krishnagiri', 'Dharmapuri', 'Perambalur'
  ],
  'Telangana': [
    'Hyderabad', 'Warangal', 'Nizamabad', 'Khammam', 'Karimnagar', 'Ramagundam',
    'Mahbubnagar', 'Nalgonda', 'Adilabad', 'Suryapet', 'Miryalaguda', 'Siddipet',
    'Jagtial', 'Mancherial', 'Nirmal', 'Kothagudem', 'Secunderabad'
  ],
  'Tripura': [
    'Agartala', 'Dharmanagar', 'Udaipur', 'Kailashahar', 'Teliamura', 'Khowai', 'Belonia', 'Ambassa'
  ],
  'Uttar Pradesh': [
    'Lucknow', 'Kanpur', 'Ghaziabad', 'Agra', 'Varanasi', 'Meerut', 'Prayagraj (Allahabad)',
    'Bareilly', 'Aligarh', 'Moradabad', 'Saharanpur', 'Gorakhpur', 'Noida', 'Firozabad',
    'Jhansi', 'Muzaffarnagar', 'Mathura', 'Budaun', 'Rampur', 'Shahjahanpur', 'Farrukhabad',
    'Ayodhya (Faizabad)', 'Hapur', 'Etawah', 'Mirzapur', 'Bulandshahr', 'Sambhal', 'Amroha',
    'Hardoi', 'Fatehpur', 'Raebareli', 'Orai', 'Sitapur', 'Bahraich', 'Modinagar', 'Unnao',
    'Jaunpur', 'Lakhimpur', 'Hathras', 'Banda', 'Greater Noida'
  ],
  'Uttarakhand': [
    'Dehradun', 'Haridwar', 'Roorkee', 'Haldwani', 'Rudrapur', 'Kashipur', 'Rishikesh',
    'Kotdwar', 'Pithoragarh', 'Ramnagar', 'Pantnagar', 'Manglaur', 'Mussoorie'
  ],
  'West Bengal': [
    'Kolkata', 'Howrah', 'Asansol', 'Siliguri', 'Durgapur', 'Bardhaman', 'Malda',
    'Baharampur', 'Habra', 'Kharagpur', 'Shantipur', 'Dankuni', 'Dhulian', 'Ranaghat',
    'Haldia', 'Raiganj', 'Krishnanagar', 'Nabadwip', 'Medinipur', 'Jalpaiguri',
    'Balurghat', 'Basirhat', 'Bankura', 'Chakdaha', 'Darjeeling', 'Alipurduar', 'Purulia'
  ]
};

// Common city to PIN code mapping presets for instant, reliable offline response
export const COMMON_PINCODES: Record<string, string[]> = {
  'Sangli': ['416416', '416415', '416436', '416410', '415302', '415413'],
  'Miraj': ['416410', '416414', '416416'],
  'Mumbai': ['400001', '400002', '400013', '400050', '400076', '400093'],
  'Pune': ['411001', '411002', '411004', '411014', '411038', '411057'],
  'Nagpur': ['440001', '440002', '440008', '440010', '440022', '440030'],
  'Nashik': ['422001', '422002', '422003', '422005', '422007', '422010'],
  'Kolhapur': ['416001', '416002', '416003', '416008', '416012'],
  'Ahmedabad': ['380001', '380006', '380009', '380015', '380054'],
  'Surat': ['395001', '395002', '395003', '395007', '395009'],
  'Vadodara': ['390001', '390002', '390007', '390011', '390020'],
  'Rajkot': ['360001', '360002', '360004', '360005'],
  'Chennai': ['600001', '600002', '600004', '600028', '600034', '600096'],
  'Coimbatore': ['641001', '641002', '641014', '641018', '641021', '641050'],
  'Madurai': ['625001', '625002', '625009', '625016', '625020'],
  'Salem': ['636001', '636002', '636004', '636007'],
  'Bengaluru (Bangalore)': ['560001', '560002', '560004', '560025', '560038', '560100'],
  'Mysuru (Mysore)': ['570001', '570002', '570004', '570012'],
  'Hyderabad': ['500001', '500002', '500003', '500034', '500081'],
  'New Delhi': ['110001', '110002', '110003', '110005', '110011'],
  'Connaught Place': ['110001'],
  'Kolkata': ['700001', '700002', '700006', '700019', '700091'],
  'Jaipur': ['302001', '302002', '302004', '302015', '302020'],
  'Indore': ['452001', '452002', '452003', '452010', '452016'],
  'Bhopal': ['462001', '462002', '462003', '462016', '462023'],
  'Lucknow': ['226001', '226002', '226003', '226010', '226016'],
  'Kanpur': ['208001', '208002', '208004', '208012'],
  'Chandigarh': ['160001', '160002', '160017', '160022', '160036']
};
