/**
 * Appetie Database Setup Script
 * Run: node scripts/setup-db.mjs
 *
 * Creates tables via Supabase Management API and seeds all data.
 */

const SUPABASE_URL = 'https://glmkqlpmrbixbuyecupi.supabase.co'
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdsbWtxbHBtcmJpeGJ1eWVjdXBpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODU5MjY2MywiZXhwIjoyMDk0MTY4NjYzfQ._Z_30ctLAYhvs-JhBbjeZaAXgCIDkWPBUdGqssuJA6Y'

const headers = {
  'apikey': SERVICE_KEY,
  'Authorization': `Bearer ${SERVICE_KEY}`,
  'Content-Type': 'application/json',
  'Prefer': 'return=representation',
}

async function sql(query) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ sql: query }),
  })
  const text = await res.text()
  if (!res.ok) {
    // Try alternative endpoint
    const res2 = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })
    return res2
  }
  return { ok: res.ok, text }
}

async function insert(table, rows, conflictCol = 'id') {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    method: 'POST',
    headers: {
      ...headers,
      'Prefer': `resolution=ignore-duplicates,return=minimal`,
    },
    body: JSON.stringify(rows),
  })
  const text = await res.text()
  console.log(`  ${table}: ${res.status} - ${res.ok ? 'OK' : text.slice(0, 200)}`)
  return res.ok
}

// ---- SEED DATA ----

const categories = [
  { id: 1, name_en: 'Rice Plates', name_ar: 'أطباق الأرز', sort_order: 1 },
  { id: 2, name_en: 'Salads', name_ar: 'السلطات', sort_order: 2 },
  { id: 3, name_en: 'Sandwiches', name_ar: 'الساندويشات', sort_order: 3 },
  { id: 4, name_en: 'Chips', name_ar: 'الشبس', sort_order: 4 },
  { id: 5, name_en: 'Granola & Yogurt', name_ar: 'جرانولا وزبادي', sort_order: 5 },
  { id: 6, name_en: 'Dips', name_ar: 'التغميسات', sort_order: 6 },
  { id: 7, name_en: 'Crunches', name_ar: 'المقرمشات', sort_order: 7 },
  { id: 8, name_en: 'Healthy Sweets', name_ar: 'الحلويات الصحية', sort_order: 8 },
  { id: 9, name_en: 'Sauces', name_ar: 'الصوصات', sort_order: 9 },
  { id: 10, name_en: 'Beverages', name_ar: 'المشروبات', sort_order: 10 },
  { id: 11, name_en: 'Pickles', name_ar: 'المخللات', sort_order: 11 },
]

const menuItems = [
  { id: 100, name_en: 'Ground Beef with Brown Rice', name_ar: 'لحم مفروم مع رز بني', price: 29, calories: 455, category_id: 1, is_available: true, sort_order: 1 },
  { id: 72, name_en: 'Chicken Rice', name_ar: 'دجاج مع رز', price: 28, calories: 394, category_id: 1, is_available: true, sort_order: 2 },
  { id: 74, name_en: 'Salmon Rice', name_ar: 'سالمون مع رز', price: 34, calories: 437, category_id: 1, is_available: true, sort_order: 3 },
  { id: 10, name_en: 'Chicken Crunch Salad', name_ar: 'سلطة تشيكن كرانش', price: 27, calories: 244, category_id: 2, is_available: true, sort_order: 4 },
  { id: 9, name_en: 'Avocado Salad', name_ar: 'سلطة الافوكادو', price: 27, calories: 304, category_id: 2, is_available: true, sort_order: 5 },
  { id: 4, name_en: 'Crisp Salad', name_ar: 'سلطة كريسب', price: 27, calories: 380, category_id: 2, is_available: true, sort_order: 6 },
  { id: 11, name_en: 'Shrimp Salad', name_ar: 'سلطة الروبيان', price: 28, calories: 276.5, category_id: 2, is_available: true, sort_order: 7 },
  { id: 8, name_en: 'Crab Salad', name_ar: 'سلطة كراب', price: 28, calories: 180, category_id: 2, is_available: true, sort_order: 8 },
  { id: 3, name_en: 'Lentil Salad', name_ar: 'سلطة العدس', price: 21, calories: 347, category_id: 2, is_available: true, sort_order: 9 },
  { id: 5, name_en: 'Mexican Salad', name_ar: 'سلطة مكسيكية', price: 27, calories: 304, category_id: 2, is_available: true, sort_order: 10 },
  { id: 15, name_en: 'Grilled Chicken', name_ar: 'ساندوتش الدجاج المشوي', price: 18, calories: 295, category_id: 3, is_available: true, sort_order: 11 },
  { id: 14, name_en: 'Spicy Grilled Chicken', name_ar: 'سبايسي الدجاج المشوي', price: 18, calories: 300, category_id: 3, is_available: true, sort_order: 12 },
  { id: 103, name_en: 'Pesto Chicken Grill Sandwich', name_ar: 'ساندويتش بيستو دجاج مشوي', price: 20, calories: 485, category_id: 3, is_available: true, sort_order: 13 },
  { id: 18, name_en: 'Tuna Sandwich', name_ar: 'تونا ساندوتش', price: 18, calories: 375, category_id: 3, is_available: true, sort_order: 14 },
  { id: 102, name_en: 'Egg Salad Sandwich', name_ar: 'ساندويتش سلطة بيض', price: 14, calories: 580, category_id: 3, is_available: true, sort_order: 15 },
  { id: 101, name_en: 'Burrata Sandwich', name_ar: 'بوراتا ساندويتش', price: 17, calories: 454, category_id: 3, is_available: true, sort_order: 16 },
  { id: 22, name_en: 'Cheesy Turkey', name_ar: 'ساندوتش تركي', price: 18, calories: 508, category_id: 3, is_available: true, sort_order: 17 },
  { id: 21, name_en: 'Halloumi Sandwich', name_ar: 'ساندوتش حلومي', price: 17, calories: 464, category_id: 3, is_available: true, sort_order: 18 },
  { id: 19, name_en: 'PB & Strawberry Jam', name_ar: 'فول سوداني مربى فراولة', price: 12, calories: 537, category_id: 3, is_available: true, sort_order: 19 },
  { id: 20, name_en: 'PB & Blueberry Jam', name_ar: 'فول سوداني مربى بلو بيري', price: 13, calories: 540, category_id: 3, is_available: true, sort_order: 20 },
  { id: 16, name_en: 'Spicy Tuna', name_ar: 'سبايسي تونا', price: 18, calories: 375, category_id: 3, is_available: true, sort_order: 21 },
  { id: 23, name_en: 'Sweet Potato Chips', name_ar: 'رقائق البطاطس الحلوة', price: 8, calories: 23, category_id: 4, is_available: true, sort_order: 22 },
  { id: 25, name_en: 'Beetroot Chips', name_ar: 'رقائق الشمندر', price: 8, calories: 32, category_id: 4, is_available: false, sort_order: 23 },
  { id: 24, name_en: 'Mix Chips', name_ar: 'مكس شبس', price: 9, calories: 28, category_id: 4, is_available: false, sort_order: 24 },
  { id: 30, name_en: 'Strawberry Yogurt Granola', name_ar: 'زبادي جرانولا مع الفراولة', price: 12, calories: 479, category_id: 5, is_available: true, sort_order: 25 },
  { id: 29, name_en: 'Blueberry Yogurt Granola', name_ar: 'زبادي جرانولا مع بلوبيري', price: 12, calories: 561, category_id: 5, is_available: true, sort_order: 26 },
  { id: 27, name_en: 'Granola', name_ar: 'جرانولا', price: 14, calories: 340, category_id: 5, is_available: true, sort_order: 27 },
  { id: 28, name_en: 'Chocolate Granola', name_ar: 'جرانولا الشوكولاتة', price: 14, calories: 350, category_id: 5, is_available: true, sort_order: 28 },
  { id: 37, name_en: 'Hummus', name_ar: 'الحمص', price: 10, calories: 454, category_id: 6, is_available: false, sort_order: 29 },
  { id: 36, name_en: 'Hummus Avocado', name_ar: 'حمص افوكادو', price: 13, calories: 442, category_id: 6, is_available: false, sort_order: 30 },
  { id: 35, name_en: 'Beetroot Hummus', name_ar: 'حمص شمندر', price: 13, calories: 490, category_id: 6, is_available: false, sort_order: 31 },
  { id: 33, name_en: 'Labneh Dip', name_ar: 'تغميسة لبنة', price: 12, calories: 608, category_id: 6, is_available: false, sort_order: 32 },
  { id: 34, name_en: 'Jalapeno Dip', name_ar: 'تغميسة هالبينو', price: 12, calories: 608, category_id: 6, is_available: false, sort_order: 33 },
  { id: 31, name_en: 'Guacamole Dip', name_ar: 'تغميسة جواكامولي', price: 10, calories: 608, category_id: 6, is_available: false, sort_order: 34 },
  { id: 42, name_en: 'Protein Crackers', name_ar: 'مقرمشات بروتين', price: 11, calories: 194, category_id: 7, is_available: true, sort_order: 35 },
  { id: 43, name_en: "Za'atar Crackers", name_ar: 'مقرمشات زعتر', price: 7, calories: 230, category_id: 7, is_available: true, sort_order: 36 },
  { id: 44, name_en: "Za'atar Chocolate Crackers", name_ar: 'مقرمشات زعتر شوكولاتة', price: 9, calories: 240, category_id: 7, is_available: true, sort_order: 37 },
  { id: 48, name_en: 'Crunchy Corn', name_ar: 'ذرة مقرمشة', price: 7, calories: 250, category_id: 7, is_available: true, sort_order: 38 },
  { id: 45, name_en: 'Chocolate Biscuit', name_ar: 'بسكويت شوكولاتة', price: 9, calories: 280, category_id: 7, is_available: true, sort_order: 39 },
  { id: 104, name_en: 'Chocolate Protein Sticks', name_ar: 'عيدان بروتين شوكولاتة', price: 13, calories: 250, category_id: 7, is_available: true, sort_order: 40 },
  { id: 47, name_en: 'Rusk Finger Chocolate', name_ar: 'أصابع شابورة شوكولاتة', price: 9, calories: 300, category_id: 7, is_available: false, sort_order: 41 },
  { id: 46, name_en: 'Cake Rusk', name_ar: 'شابورة كيك', price: 9, calories: 482, category_id: 7, is_available: false, sort_order: 42 },
  { id: 99, name_en: 'Overnight Tiramisu', name_ar: 'تيراميسو أوفرنايت', price: 16, calories: 225, category_id: 8, is_available: true, sort_order: 43 },
  { id: 105, name_en: 'Chocolate Pudding', name_ar: 'شوكولاتة بودينق', price: 15, calories: 290, category_id: 8, is_available: true, sort_order: 44 },
  { id: 106, name_en: 'Chocolate Pudding With Peanut Butter', name_ar: 'شوكولاتة بودينق مع فول سوادني', price: 17, calories: 390, category_id: 8, is_available: true, sort_order: 45 },
  { id: 52, name_en: 'Healthy Snickers Cake', name_ar: 'كيكة سنيكرز الصحية', price: 11, calories: 317, category_id: 8, is_available: true, sort_order: 46 },
  { id: 55, name_en: 'Protein Butter Bar', name_ar: 'بروتين بار بتر', price: 7, calories: 280, category_id: 8, is_available: true, sort_order: 47 },
  { id: 53, name_en: 'Protein Crunchy Rice', name_ar: 'كرنشي رايز بروتين بار', price: 8, calories: 194, category_id: 8, is_available: true, sort_order: 48 },
  { id: 107, name_en: 'Dark Protein Rocky Road', name_ar: 'دارك بروتين روكي رود', price: 12, calories: 300, category_id: 8, is_available: true, sort_order: 49 },
  { id: 108, name_en: 'Dark Chocolate Protein Bar', name_ar: 'دارك شوكولاتة بروتين بار', price: 9, calories: 190, category_id: 8, is_available: true, sort_order: 50 },
  { id: 109, name_en: 'Brownie Balls', name_ar: 'براونيز', price: 14, calories: 200, category_id: 8, is_available: true, sort_order: 51 },
  { id: 51, name_en: 'Jam Strawberry', name_ar: 'مربى فراولة', price: 14, calories: 195, category_id: 8, is_available: false, sort_order: 52 },
  { id: 50, name_en: 'Jam Blueberry', name_ar: 'مربى بلوبيري', price: 14, calories: 195, category_id: 8, is_available: false, sort_order: 53 },
  { id: 49, name_en: 'Jam Fig', name_ar: 'مربى تين', price: 14, calories: 186, category_id: 8, is_available: false, sort_order: 54 },
  { id: 54, name_en: 'Coconut Protein Bar', name_ar: 'بروتين جوز الهند', price: 9, calories: 231, category_id: 8, is_available: false, sort_order: 55 },
  { id: 56, name_en: 'Caesar Sauce', name_ar: 'سيزر صوص', price: 4, calories: 290, category_id: 9, is_available: true, sort_order: 56 },
  { id: 58, name_en: 'Avo Sauce', name_ar: 'افو صوص', price: 4, calories: 192, category_id: 9, is_available: true, sort_order: 57 },
  { id: 59, name_en: 'Crab Sauce', name_ar: 'كراب صوص', price: 4, calories: 100, category_id: 9, is_available: false, sort_order: 58 },
  { id: 60, name_en: 'Asian Sauce', name_ar: 'صوص اسيوي', price: 4, calories: 230, category_id: 9, is_available: true, sort_order: 59 },
  { id: 57, name_en: 'Green Sauce', name_ar: 'قرين صوص', price: 4, calories: 278, category_id: 9, is_available: true, sort_order: 60 },
  { id: 61, name_en: 'Viney Sauce', name_ar: 'فيني صوص', price: 4, calories: 182, category_id: 9, is_available: true, sort_order: 61 },
  { id: 63, name_en: 'Fresh Green Juice', name_ar: 'عصير اخضر طبيعي', price: 10, calories: 123, category_id: 10, is_available: true, sort_order: 62 },
  { id: 64, name_en: 'Beetroot Juice', name_ar: 'عصير شمندر', price: 10, calories: 138, category_id: 10, is_available: true, sort_order: 63 },
  { id: 65, name_en: 'Fresh Orange Juice', name_ar: 'عصير برتقال طبيعي', price: 11, calories: 163, category_id: 10, is_available: true, sort_order: 64 },
  { id: 66, name_en: 'Protein Avocado Smoothie', name_ar: 'سموذي بروتين افوكادو', price: 13, calories: 399, category_id: 10, is_available: true, sort_order: 65 },
  { id: 67, name_en: 'Protein Dates Smoothie', name_ar: 'سموذي بروتين التمر', price: 13, calories: 416, category_id: 10, is_available: true, sort_order: 66 },
  { id: 68, name_en: 'Coca Cola Zero', name_ar: 'كوكاكولا زيرو', price: 4, calories: 60, category_id: 10, is_available: true, sort_order: 67 },
  { id: 69, name_en: 'Coca Cola Light', name_ar: 'كوكاكولا لايت', price: 4, calories: 60, category_id: 10, is_available: true, sort_order: 68 },
  { id: 70, name_en: 'Perrier Sparkling Water', name_ar: 'بيريه ماء غازية', price: 6, calories: 1, category_id: 10, is_available: true, sort_order: 69 },
  { id: 62, name_en: 'Ginger Lemon', name_ar: 'زنجبيل ليمون', price: 10, calories: 123, category_id: 10, is_available: false, sort_order: 70 },
  { id: 71, name_en: 'Still Water', name_ar: 'ماء معدنية', price: 1, calories: 1, category_id: 10, is_available: true, sort_order: 71 },
  { id: 38, name_en: 'Halloumi Olives Plate', name_ar: 'طبق حلومي و زيتون', price: 15, calories: 325, category_id: 11, is_available: false, sort_order: 72 },
  { id: 39, name_en: 'Small Cucumber Pickle', name_ar: 'مخلل الخيار الصغير', price: 8, calories: 10, category_id: 11, is_available: false, sort_order: 73 },
  { id: 40, name_en: 'Mix Pickles', name_ar: 'مخلل منوع', price: 8, calories: 12, category_id: 11, is_available: false, sort_order: 74 },
  { id: 41, name_en: 'Pepper Pickles', name_ar: 'مخلل فلفل', price: 8, calories: 22, category_id: 11, is_available: false, sort_order: 75 },
]

const employees = [
  { id: 1, name: 'Asjad Puthuparambil Ayoob', iqama: '2512263506', iban: 'SA4405000068204791913000', basic_salary: 1800, ot_hours: 0, position: 'Operation Manager', branch: 'Ar Rayyan', shift: 'Morning', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 2, name: 'Abdul Sattar', iqama: '2547796033', iban: 'SA6080000331608016563777', basic_salary: 3000, ot_hours: 0, position: 'Manager', branch: 'Hittin', shift: 'Morning', salary_paid: false, vacation_status: 'none', restaurant: 'Appetie' },
  { id: 3, name: 'Mohammed Arman Uddin', iqama: '2499854418', iban: 'SA4505000068204453945000', basic_salary: 1600, ot_hours: 39.96, position: 'Pie / Cashier', branch: 'Ar Rayyan', shift: 'Night', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 4, name: 'Mohin Uddin RONY', iqama: '2533087983', iban: 'SA3430100942000145005306', basic_salary: 1600, ot_hours: 25.97, position: 'Pie / Grill / Cashier', branch: 'Malqa', shift: 'Night', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 5, name: 'Shanavas Aliyarukunju', iqama: '2512279700', iban: 'SA5305000068204840815000', basic_salary: 1600, ot_hours: 39.96, position: 'Grill', branch: 'Ar Rayyan', shift: 'Night', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 6, name: 'Razwan Sulaiman', iqama: '2548287891', iban: 'SA2430100942000163761309', basic_salary: 1500, ot_hours: 48, position: 'Cashier / Salad / Prep', branch: 'Ar Rayyan', shift: 'Double Shift', salary_paid: false, vacation_status: 'none', restaurant: 'Appetie' },
  { id: 7, name: 'Yeasin Hossain', iqama: '2540739717', iban: 'SA8880000996608016448058', basic_salary: 2000, ot_hours: 25, position: 'Pie / Grill / Cashier', branch: 'Malqa', shift: 'Morning', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 8, name: 'MD Abdullah Mia', iqama: '2513753190', iban: 'SA8480000355608018485558', basic_salary: 1500, ot_hours: 26.64, position: 'Pie', branch: 'Malqa', shift: 'Morning', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 9, name: 'Mohammad Hasnain Nizamuddin Pathan', iqama: '2540243629', iban: 'SA3780000640608018938239', basic_salary: 1500, ot_hours: 0, position: 'Preparation', branch: 'Ar Rayyan', shift: 'Morning', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 10, name: 'Opendra Giri', iqama: '2513564753', iban: 'SA7180000609608016080199', basic_salary: 1700, ot_hours: 25, position: '', branch: '', shift: '', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 11, name: 'MD Zakaria Saleh Ahmed', iqama: '2510824879', iban: 'SA2810000011100291917500', basic_salary: 1500, ot_hours: 48, position: 'Cashier / Salad / Prep', branch: 'Ar Rayyan', shift: 'Night', salary_paid: false, vacation_status: 'none', restaurant: 'Appetie' },
  { id: 12, name: 'Muhammad Amjad Sulaiman', iqama: '2531090419', iban: 'SA1930100942000151942628', basic_salary: 1600, ot_hours: 67.5, position: 'Pie / Grill / Cashier', branch: 'Hittin', shift: 'Morning', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 13, name: 'Jahid Hossen Joni', iqama: '2496241569', iban: '', basic_salary: 2500, ot_hours: 7, position: 'Bakery Chef', branch: 'Hittin', shift: 'Evening', salary_paid: false, vacation_status: 'none', restaurant: 'Bakery' },
  { id: 14, name: 'Shahidul Islam', iqama: '2538972593', iban: 'SA0380000640608018181087', basic_salary: 1600, ot_hours: 24.9, position: 'Pie / Grill / Cashier', branch: 'Hittin', shift: 'Night', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 15, name: 'Tipusulthan Nizamuddin Pathan', iqama: '2547796561', iban: 'SA4830100942000163458043', basic_salary: 1500, ot_hours: 26.64, position: 'Grill', branch: 'Hittin', shift: 'Double Shift', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 16, name: 'MD Monoar Hossain', iqama: '2531395412', iban: 'SA8580000640608016822872', basic_salary: 1500, ot_hours: 26.64, position: 'Pie', branch: 'Hittin', shift: 'Night', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 17, name: 'Kawsar Hossain', iqama: '2554728341', iban: 'SA3330100942000173841969', basic_salary: 1500, ot_hours: 75, position: 'Cashier / Salad / Prep', branch: 'Ar Rayyan', shift: 'Double Shift', salary_paid: false, vacation_status: 'none', restaurant: 'Appetie' },
  { id: 18, name: 'Shanto', iqama: '2558857922', iban: 'BY CASH', basic_salary: 2100, ot_hours: 31.97, position: 'Cashier / Salad / Prep', branch: 'Hittin', shift: 'Double Shift', salary_paid: false, vacation_status: 'none', restaurant: 'Appetie' },
  { id: 19, name: 'Ansar Mohammed Mutam', iqama: '2530995782', iban: 'BY CASH', basic_salary: 2500, ot_hours: 0, position: '', branch: '', shift: '', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 20, name: 'Harshith Janardhana', iqama: '2562898698', iban: 'BY CASH', basic_salary: 1500, ot_hours: 26.64, position: '', branch: 'Malqa', shift: 'Double Shift', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 21, name: 'Sunaif Hyder', iqama: '2562589321', iban: 'BY CASH', basic_salary: 1500, ot_hours: 27, position: 'Bakery Chef', branch: 'Hittin', shift: 'Evening', salary_paid: false, vacation_status: 'none', restaurant: 'Bakery' },
  { id: 22, name: 'Roopith Kumar-Kaniyoor', iqama: '2580639652', iban: 'BY CASH', basic_salary: 1500, ot_hours: 0, position: 'Cashier / Salad / Prep', branch: 'Hittin', shift: 'Night', salary_paid: false, vacation_status: 'none', restaurant: 'Appetie' },
  { id: 23, name: 'Niyas', iqama: '2610944007', iban: 'BY CASH', basic_salary: 2100, ot_hours: 0, position: 'Salad / Preparation', branch: 'Hittin', shift: 'Night', salary_paid: false, vacation_status: 'none', restaurant: 'Appetie' },
  { id: 24, name: 'Irshad', iqama: '', iban: 'BY CASH', basic_salary: 2100, ot_hours: 40, position: 'Grill', branch: 'Malqa', shift: 'Night', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 25, name: 'Taha', iqama: '2543190991', iban: 'BY CASH', basic_salary: 3000, ot_hours: 0, position: 'Head Chef', branch: 'Hittin', shift: 'Morning', salary_paid: false, vacation_status: 'none', restaurant: 'Bakery' },
  { id: 26, name: 'Riyadh', iqama: '', iban: 'BY CASH', basic_salary: 2100, ot_hours: 34.23, position: '', branch: '', shift: '', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 27, name: 'Refad', iqama: '', iban: 'BY CASH', basic_salary: 2100, ot_hours: 25, position: '', branch: '', shift: '', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 28, name: 'Abdul Malik', iqama: '', iban: 'BY CASH', basic_salary: 2100, ot_hours: 25, position: '', branch: '', shift: '', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 29, name: 'Ashraf', iqama: '', iban: 'BY CASH', basic_salary: 2100, ot_hours: 25, position: '', branch: '', shift: '', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 30, name: 'Baizid', iqama: '', iban: 'BY CASH', basic_salary: 2100, ot_hours: 75.06, position: '', branch: '', shift: '', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 31, name: 'Shah Alam', iqama: '', iban: 'BY CASH', basic_salary: 2100, ot_hours: 25, position: '', branch: '', shift: '', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 32, name: 'Abu Sayed', iqama: '', iban: 'BY CASH', basic_salary: 2100, ot_hours: 9.52, position: '', branch: '', shift: '', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 33, name: 'Rifat Bhuiyan', iqama: '', iban: 'BY CASH', basic_salary: 2500, ot_hours: 7, position: '', branch: '', shift: '', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 34, name: 'Nazim', iqama: '', iban: 'BY CASH', basic_salary: 2500, ot_hours: 8, position: '', branch: '', shift: '', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 35, name: 'Sheik Mohammed Arif', iqama: '2540243959', iban: 'SA1405000068205780555000', basic_salary: 1500, ot_hours: 0, position: '', branch: 'Ar Rayyan', shift: 'Morning', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
  { id: 36, name: 'Aboobakkar Siddiq', iqama: '2548287602', iban: 'SA8630100942000163647382', basic_salary: 1500, ot_hours: 0, position: 'Pie', branch: 'Hittin', shift: 'Morning', salary_paid: false, vacation_status: 'none', restaurant: 'Ghabashi' },
]

// Compute OT fields
const MULT = 1.25
employees.forEach(e => {
  e.ot_rate = e.basic_salary / 30 / 8 * MULT
  e.ot_pay = e.ot_rate * e.ot_hours
  e.net_pay = e.basic_salary + e.ot_pay
})

const branches = [
  { id: 1, name: 'Ar Rayyan', location: 'Ar Rayyan, Riyadh', is_active: true },
  { id: 2, name: 'Hittin', location: 'Hittin, Riyadh', is_active: true },
  { id: 3, name: 'Malqa', location: 'Al Malqa, Riyadh', is_active: true },
]

console.log('🚀 Appetie DB Setup - Seeding data...\n')
console.log('📌 Tables must already exist. If not, run supabase-schema.sql first.\n')

console.log('Inserting branches...')
await insert('branches', branches)

console.log('Inserting categories...')
await insert('categories', categories)

console.log('Inserting menu items (75 items)...')
// Insert in batches of 20
for (let i = 0; i < menuItems.length; i += 20) {
  const batch = menuItems.slice(i, i + 20)
  await insert('menu_items', batch)
  process.stdout.write('.')
}
console.log()

console.log('Inserting employees (36)...')
await insert('employees', employees)

console.log('\n✅ Done! Check your Supabase dashboard to verify.')
console.log(`🔗 ${SUPABASE_URL}/project/default/editor`)
