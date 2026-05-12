-- ============================================================
-- Appetie Restaurant - Supabase Schema + Seed Data
-- Run this entire file in your Supabase SQL Editor
-- ============================================================

-- Enable UUID extension (already enabled by default in Supabase)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABLES
-- ============================================================

CREATE TABLE IF NOT EXISTS branches (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS menu_items (
  id INT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  calories NUMERIC(10,1),
  category_id INT REFERENCES categories(id) ON DELETE SET NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS employees (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  iqama TEXT,
  iban TEXT,
  basic_salary NUMERIC(10,2) NOT NULL DEFAULT 0,
  position TEXT,
  branch TEXT,
  shift TEXT,
  ot_hours NUMERIC(10,2) DEFAULT 0,
  ot_rate NUMERIC(10,4) DEFAULT 0,
  ot_pay NUMERIC(10,2) DEFAULT 0,
  net_pay NUMERIC(10,2) DEFAULT 0,
  salary_paid BOOLEAN DEFAULT false,
  vacation_status TEXT DEFAULT 'none' CHECK (vacation_status IN ('none','on_vacation','taken')),
  restaurant TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- RLS (Row Level Security) - Disable for admin access without auth
-- ============================================================
ALTER TABLE branches ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Allow public read for menu items and categories (customer menu)
CREATE POLICY "Public read menu_items" ON menu_items FOR SELECT USING (true);
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);

-- Allow all operations (no auth required - admin panel is internal)
CREATE POLICY "Admin all menu_items" ON menu_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin all categories" ON categories FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin all employees" ON employees FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Admin all branches" ON branches FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- STORAGE BUCKET for menu images
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'menu-images',
  'menu-images',
  true,
  5242880,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp','image/gif']
) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read menu-images" ON storage.objects
  FOR SELECT USING (bucket_id = 'menu-images');

CREATE POLICY "Admin upload menu-images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'menu-images');

CREATE POLICY "Admin update menu-images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'menu-images');

CREATE POLICY "Admin delete menu-images" ON storage.objects
  FOR DELETE USING (bucket_id = 'menu-images');

-- ============================================================
-- SEED DATA - BRANCHES
-- ============================================================
INSERT INTO branches (id, name, location, is_active) VALUES
  (1, 'Ar Rayyan', 'Ar Rayyan, Riyadh', true),
  (2, 'Hittin', 'Hittin, Riyadh', true),
  (3, 'Malqa', 'Al Malqa, Riyadh', true)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA - CATEGORIES
-- ============================================================
INSERT INTO categories (id, name_en, name_ar, sort_order) VALUES
  (1, 'Rice Plates', 'أطباق الأرز', 1),
  (2, 'Salads', 'السلطات', 2),
  (3, 'Sandwiches', 'الساندويشات', 3),
  (4, 'Chips', 'الشبس', 4),
  (5, 'Granola & Yogurt', 'جرانولا وزبادي', 5),
  (6, 'Dips', 'التغميسات', 6),
  (7, 'Crunches', 'المقرمشات', 7),
  (8, 'Healthy Sweets', 'الحلويات الصحية', 8),
  (9, 'Sauces', 'الصوصات', 9),
  (10, 'Beverages', 'المشروبات', 10),
  (11, 'Pickles', 'المخللات', 11)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA - MENU ITEMS
-- ============================================================
INSERT INTO menu_items (id, name_en, name_ar, price, calories, category_id, is_available, sort_order) VALUES
  (100, 'Ground Beef with Brown Rice', 'لحم مفروم مع رز بني', 29, 455, 1, true, 1),
  (72, 'Chicken Rice', 'دجاج مع رز', 28, 394, 1, true, 2),
  (74, 'Salmon Rice', 'سالمون مع رز', 34, 437, 1, true, 3),
  (10, 'Chicken Crunch Salad', 'سلطة تشيكن كرانش', 27, 244, 2, true, 4),
  (9, 'Avocado Salad', 'سلطة الافوكادو', 27, 304, 2, true, 5),
  (4, 'Crisp Salad', 'سلطة كريسب', 27, 380, 2, true, 6),
  (11, 'Shrimp Salad', 'سلطة الروبيان', 28, 276.5, 2, true, 7),
  (8, 'Crab Salad', 'سلطة كراب', 28, 180, 2, true, 8),
  (3, 'Lentil Salad', 'سلطة العدس', 21, 347, 2, true, 9),
  (5, 'Mexican Salad', 'سلطة مكسيكية', 27, 304, 2, true, 10),
  (15, 'Grilled Chicken', 'ساندوتش الدجاج المشوي', 18, 295, 3, true, 11),
  (14, 'Spicy Grilled Chicken', 'سبايسي الدجاج المشوي', 18, 300, 3, true, 12),
  (103, 'Pesto Chicken Grill Sandwich', 'ساندويتش بيستو دجاج مشوي', 20, 485, 3, true, 13),
  (18, 'Tuna Sandwich', 'تونا ساندوتش', 18, 375, 3, true, 14),
  (102, 'Egg Salad Sandwich', 'ساندويتش سلطة بيض', 14, 580, 3, true, 15),
  (101, 'Burrata Sandwich', 'بوراتا ساندويتش', 17, 454, 3, true, 16),
  (22, 'Cheesy Turkey', 'ساندوتش تركي', 18, 508, 3, true, 17),
  (21, 'Halloumi Sandwich', 'ساندوتش حلومي', 17, 464, 3, true, 18),
  (19, 'PB & Strawberry Jam', 'فول سوداني مربى فراولة', 12, 537, 3, true, 19),
  (20, 'PB & Blueberry Jam', 'فول سوداني مربى بلو بيري', 13, 540, 3, true, 20),
  (16, 'Spicy Tuna', 'سبايسي تونا', 18, 375, 3, true, 21),
  (23, 'Sweet Potato Chips', 'رقائق البطاطس الحلوة', 8, 23, 4, true, 22),
  (25, 'Beetroot Chips', 'رقائق الشمندر', 8, 32, 4, false, 23),
  (24, 'Mix Chips', 'مكس شبس', 9, 28, 4, false, 24),
  (30, 'Strawberry Yogurt Granola', 'زبادي جرانولا مع الفراولة', 12, 479, 5, true, 25),
  (29, 'Blueberry Yogurt Granola', 'زبادي جرانولا مع بلوبيري', 12, 561, 5, true, 26),
  (27, 'Granola', 'جرانولا', 14, 340, 5, true, 27),
  (28, 'Chocolate Granola', 'جرانولا الشوكولاتة', 14, 350, 5, true, 28),
  (37, 'Hummus', 'الحمص', 10, 454, 6, false, 29),
  (36, 'Hummus Avocado', 'حمص افوكادو', 13, 442, 6, false, 30),
  (35, 'Beetroot Hummus', 'حمص شمندر', 13, 490, 6, false, 31),
  (33, 'Labneh Dip', 'تغميسة لبنة', 12, 608, 6, false, 32),
  (34, 'Jalapeno Dip', 'تغميسة هالبينو', 12, 608, 6, false, 33),
  (31, 'Guacamole Dip', 'تغميسة جواكامولي', 10, 608, 6, false, 34),
  (42, 'Protein Crackers', 'مقرمشات بروتين', 11, 194, 7, true, 35),
  (43, 'Za''atar Crackers', 'مقرمشات زعتر', 7, 230, 7, true, 36),
  (44, 'Za''atar Chocolate Crackers', 'مقرمشات زعتر شوكولاتة', 9, 240, 7, true, 37),
  (48, 'Crunchy Corn', 'ذرة مقرمشة', 7, 250, 7, true, 38),
  (45, 'Chocolate Biscuit', 'بسكويت شوكولاتة', 9, 280, 7, true, 39),
  (104, 'Chocolate Protein Sticks', 'عيدان بروتين شوكولاتة', 13, 250, 7, true, 40),
  (47, 'Rusk Finger Chocolate', 'أصابع شابورة شوكولاتة', 9, 300, 7, false, 41),
  (46, 'Cake Rusk', 'شابورة كيك', 9, 482, 7, false, 42),
  (99, 'Overnight Tiramisu', 'تيراميسو أوفرنايت', 16, 225, 8, true, 43),
  (105, 'Chocolate Pudding', 'شوكولاتة بودينق', 15, 290, 8, true, 44),
  (106, 'Chocolate Pudding With Peanut Butter', 'شوكولاتة بودينق مع فول سوادني', 17, 390, 8, true, 45),
  (52, 'Healthy Snickers Cake', 'كيكة سنيكرز الصحية', 11, 317, 8, true, 46),
  (55, 'Protein Butter Bar', 'بروتين بار بتر', 7, 280, 8, true, 47),
  (53, 'Protein Crunchy Rice', 'كرنشي رايز بروتين بار', 8, 194, 8, true, 48),
  (107, 'Dark Protein Rocky Road', 'دارك بروتين روكي رود', 12, 300, 8, true, 49),
  (108, 'Dark Chocolate Protein Bar', 'دارك شوكولاتة بروتين بار', 9, 190, 8, true, 50),
  (109, 'Brownie Balls', 'براونيز', 14, 200, 8, true, 51),
  (51, 'Jam Strawberry', 'مربى فراولة', 14, 195, 8, false, 52),
  (50, 'Jam Blueberry', 'مربى بلوبيري', 14, 195, 8, false, 53),
  (49, 'Jam Fig', 'مربى تين', 14, 186, 8, false, 54),
  (54, 'Coconut Protein Bar', 'بروتين جوز الهند', 9, 231, 8, false, 55),
  (56, 'Caesar Sauce', 'سيزر صوص', 4, 290, 9, true, 56),
  (58, 'Avo Sauce', 'افو صوص', 4, 192, 9, true, 57),
  (59, 'Crab Sauce', 'كراب صوص', 4, 100, 9, false, 58),
  (60, 'Asian Sauce', 'صوص اسيوي', 4, 230, 9, true, 59),
  (57, 'Green Sauce', 'قرين صوص', 4, 278, 9, true, 60),
  (61, 'Viney Sauce', 'فيني صوص', 4, 182, 9, true, 61),
  (63, 'Fresh Green Juice', 'عصير اخضر طبيعي', 10, 123, 10, true, 62),
  (64, 'Beetroot Juice', 'عصير شمندر', 10, 138, 10, true, 63),
  (65, 'Fresh Orange Juice', 'عصير برتقال طبيعي', 11, 163, 10, true, 64),
  (66, 'Protein Avocado Smoothie', 'سموذي بروتين افوكادو', 13, 399, 10, true, 65),
  (67, 'Protein Dates Smoothie', 'سموذي بروتين التمر', 13, 416, 10, true, 66),
  (68, 'Coca Cola Zero', 'كوكاكولا زيرو', 4, 60, 10, true, 67),
  (69, 'Coca Cola Light', 'كوكاكولا لايت', 4, 60, 10, true, 68),
  (70, 'Perrier Sparkling Water', 'بيريه ماء غازية', 6, 1, 10, true, 69),
  (62, 'Ginger Lemon', 'زنجبيل ليمون', 10, 123, 10, false, 70),
  (71, 'Still Water', 'ماء معدنية', 1, 1, 10, true, 71),
  (38, 'Halloumi Olives Plate', 'طبق حلومي و زيتون', 15, 325, 11, false, 72),
  (39, 'Small Cucumber Pickle', 'مخلل الخيار الصغير', 8, 10, 11, false, 73),
  (40, 'Mix Pickles', 'مخلل منوع', 8, 12, 11, false, 74),
  (41, 'Pepper Pickles', 'مخلل فلفل', 8, 22, 11, false, 75)
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- SEED DATA - EMPLOYEES
-- ============================================================
INSERT INTO employees (id, name, iqama, iban, basic_salary, ot_hours, position, branch, shift, salary_paid, vacation_status, restaurant) VALUES
  (1, 'Asjad Puthuparambil Ayoob', '2512263506', 'SA4405000068204791913000', 1800, 0, 'Operation Manager', 'Ar Rayyan', 'Morning', false, 'none', 'Ghabashi'),
  (2, 'Abdul Sattar', '2547796033', 'SA6080000331608016563777', 3000, 0, 'Manager', 'Hittin', 'Morning', false, 'none', 'Appetie'),
  (3, 'Mohammed Arman Uddin', '2499854418', 'SA4505000068204453945000', 1600, 39.96, 'Pie / Cashier', 'Ar Rayyan', 'Night', false, 'none', 'Ghabashi'),
  (4, 'Mohin Uddin RONY', '2533087983', 'SA3430100942000145005306', 1600, 25.97, 'Pie / Grill / Cashier', 'Malqa', 'Night', false, 'none', 'Ghabashi'),
  (5, 'Shanavas Aliyarukunju', '2512279700', 'SA5305000068204840815000', 1600, 39.96, 'Grill', 'Ar Rayyan', 'Night', false, 'none', 'Ghabashi'),
  (6, 'Razwan Sulaiman', '2548287891', 'SA2430100942000163761309', 1500, 48, 'Cashier / Salad / Prep', 'Ar Rayyan', 'Double Shift', false, 'none', 'Appetie'),
  (7, 'Yeasin Hossain', '2540739717', 'SA8880000996608016448058', 2000, 25, 'Pie / Grill / Cashier', 'Malqa', 'Morning', false, 'none', 'Ghabashi'),
  (8, 'MD Abdullah Mia', '2513753190', 'SA8480000355608018485558', 1500, 26.64, 'Pie', 'Malqa', 'Morning', false, 'none', 'Ghabashi'),
  (9, 'Mohammad Hasnain Nizamuddin Pathan', '2540243629', 'SA3780000640608018938239', 1500, 0, 'Preparation', 'Ar Rayyan', 'Morning', false, 'none', 'Ghabashi'),
  (10, 'Opendra Giri', '2513564753', 'SA7180000609608016080199', 1700, 25, '', '', '', false, 'none', 'Ghabashi'),
  (11, 'MD Zakaria Saleh Ahmed', '2510824879', 'SA2810000011100291917500', 1500, 48, 'Cashier / Salad / Prep', 'Ar Rayyan', 'Night', false, 'none', 'Appetie'),
  (12, 'Muhammad Amjad Sulaiman', '2531090419', 'SA1930100942000151942628', 1600, 67.5, 'Pie / Grill / Cashier', 'Hittin', 'Morning', false, 'none', 'Ghabashi'),
  (13, 'Jahid Hossen Joni', '2496241569', '', 2500, 7, 'Bakery Chef', 'Hittin', 'Evening', false, 'none', 'Bakery'),
  (14, 'Shahidul Islam', '2538972593', 'SA0380000640608018181087', 1600, 24.9, 'Pie / Grill / Cashier', 'Hittin', 'Night', false, 'none', 'Ghabashi'),
  (15, 'Tipusulthan Nizamuddin Pathan', '2547796561', 'SA4830100942000163458043', 1500, 26.64, 'Grill', 'Hittin', 'Double Shift', false, 'none', 'Ghabashi'),
  (16, 'MD Monoar Hossain', '2531395412', 'SA8580000640608016822872', 1500, 26.64, 'Pie', 'Hittin', 'Night', false, 'none', 'Ghabashi'),
  (17, 'Kawsar Hossain', '2554728341', 'SA3330100942000173841969', 1500, 75, 'Cashier / Salad / Prep', 'Ar Rayyan', 'Double Shift', false, 'none', 'Appetie'),
  (18, 'Shanto', '2558857922', 'BY CASH', 2100, 31.97, 'Cashier / Salad / Prep', 'Hittin', 'Double Shift', false, 'none', 'Appetie'),
  (19, 'Ansar Mohammed Mutam', '2530995782', 'BY CASH', 2500, 0, '', '', '', false, 'none', 'Ghabashi'),
  (20, 'Harshith Janardhana', '2562898698', 'BY CASH', 1500, 26.64, '', 'Malqa', 'Double Shift', false, 'none', 'Ghabashi'),
  (21, 'Sunaif Hyder', '2562589321', 'BY CASH', 1500, 27, 'Bakery Chef', 'Hittin', 'Evening', false, 'none', 'Bakery'),
  (22, 'Roopith Kumar-Kaniyoor', '2580639652', 'BY CASH', 1500, 0, 'Cashier / Salad / Prep', 'Hittin', 'Night', false, 'none', 'Appetie'),
  (23, 'Niyas', '2610944007', 'BY CASH', 2100, 0, 'Salad / Preparation', 'Hittin', 'Night', false, 'none', 'Appetie'),
  (24, 'Irshad', '', 'BY CASH', 2100, 40, 'Grill', 'Malqa', 'Night', false, 'none', 'Ghabashi'),
  (25, 'Taha', '2543190991', 'BY CASH', 3000, 0, 'Head Chef', 'Hittin', 'Morning', false, 'none', 'Bakery'),
  (26, 'Riyadh', '', 'BY CASH', 2100, 34.23, '', '', '', false, 'none', 'Ghabashi'),
  (27, 'Refad', '', 'BY CASH', 2100, 25, '', '', '', false, 'none', 'Ghabashi'),
  (28, 'Abdul Malik', '', 'BY CASH', 2100, 25, '', '', '', false, 'none', 'Ghabashi'),
  (29, 'Ashraf', '', 'BY CASH', 2100, 25, '', '', '', false, 'none', 'Ghabashi'),
  (30, 'Baizid', '', 'BY CASH', 2100, 75.06, '', '', '', false, 'none', 'Ghabashi'),
  (31, 'Shah Alam', '', 'BY CASH', 2100, 25, '', '', '', false, 'none', 'Ghabashi'),
  (32, 'Abu Sayed', '', 'BY CASH', 2100, 9.52, '', '', '', false, 'none', 'Ghabashi'),
  (33, 'Rifat Bhuiyan', '', 'BY CASH', 2500, 7, '', '', '', false, 'none', 'Ghabashi'),
  (34, 'Nazim', '', 'BY CASH', 2500, 8, '', '', '', false, 'none', 'Ghabashi'),
  (35, 'Sheik Mohammed Arif', '2540243959', 'SA1405000068205780555000', 1500, 0, '', 'Ar Rayyan', 'Morning', false, 'none', 'Ghabashi'),
  (36, 'Aboobakkar Siddiq', '2548287602', 'SA8630100942000163647382', 1500, 0, 'Pie', 'Hittin', 'Morning', false, 'none', 'Ghabashi')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Update computed OT fields using Saudi Labor Law formula
-- Basic ÷ 30 ÷ 8 × 1.25 × OT hours
-- ============================================================
UPDATE employees SET
  ot_rate = ROUND(basic_salary / 30.0 / 8.0 * 1.25, 4),
  ot_pay = ROUND(basic_salary / 30.0 / 8.0 * 1.25 * ot_hours, 2),
  net_pay = basic_salary + ROUND(basic_salary / 30.0 / 8.0 * 1.25 * ot_hours, 2);
