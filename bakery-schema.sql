-- ============================================================
-- Bakery Manager — Run this in Supabase SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS bakery_products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  cost NUMERIC(10,2) DEFAULT 0,
  stock INTEGER DEFAULT 0,
  unit TEXT DEFAULT 'piece',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bakery_customers (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT DEFAULT '',
  phone TEXT DEFAULT '',
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bakery_staff (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'staff' CHECK (role IN ('admin', 'staff')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bakery_orders (
  id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES bakery_customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL DEFAULT 'Walk-in',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','preparing','ready','completed','cancelled')),
  total NUMERIC(10,2) DEFAULT 0,
  notes TEXT DEFAULT '',
  created_by_id INTEGER REFERENCES bakery_staff(id) ON DELETE SET NULL,
  created_by_name TEXT,
  created_by_role TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bakery_order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES bakery_orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES bakery_products(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC(10,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS bakery_activity (
  id SERIAL PRIMARY KEY,
  staff_id INTEGER REFERENCES bakery_staff(id) ON DELETE SET NULL,
  staff_name TEXT NOT NULL,
  staff_role TEXT NOT NULL,
  action TEXT NOT NULL,
  order_id INTEGER REFERENCES bakery_orders(id) ON DELETE SET NULL,
  detail TEXT,
  photo_url TEXT,
  old_status TEXT,
  new_status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE bakery_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakery_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakery_staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakery_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakery_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE bakery_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bakery_products_all" ON bakery_products FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bakery_customers_all" ON bakery_customers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bakery_staff_all" ON bakery_staff FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bakery_orders_all" ON bakery_orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bakery_order_items_all" ON bakery_order_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "bakery_activity_all" ON bakery_activity FOR ALL USING (true) WITH CHECK (true);

-- Storage bucket for activity photos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('bakery-photos', 'bakery-photos', true, 10485760,
  ARRAY['image/jpeg','image/jpg','image/png','image/webp'])
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "bakery_photos_read" ON storage.objects FOR SELECT USING (bucket_id = 'bakery-photos');
CREATE POLICY "bakery_photos_insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'bakery-photos');
CREATE POLICY "bakery_photos_update" ON storage.objects FOR UPDATE USING (bucket_id = 'bakery-photos');
CREATE POLICY "bakery_photos_delete" ON storage.objects FOR DELETE USING (bucket_id = 'bakery-photos');

-- Seed products
INSERT INTO bakery_products (name, category, price, cost, stock, unit) VALUES
  ('Sourdough Loaf','Bread',8.50,2.50,20,'loaf'),
  ('Croissant','Pastry',3.50,0.80,30,'piece'),
  ('Chocolate Cake','Cake',32.00,10.00,5,'whole'),
  ('Cinnamon Roll','Pastry',4.00,1.00,24,'piece'),
  ('Baguette','Bread',4.50,1.20,15,'loaf'),
  ('Blueberry Muffin','Muffin',3.00,0.70,18,'piece'),
  ('Cheesecake Slice','Cake',6.50,2.00,10,'slice'),
  ('Pretzel','Bread',2.50,0.60,25,'piece')
ON CONFLICT DO NOTHING;

-- Seed customers
INSERT INTO bakery_customers (name, email, phone) VALUES
  ('Alice Johnson','alice@email.com','555-0101'),
  ('Bob Martinez','bob@email.com','555-0102'),
  ('Carol White','carol@email.com','555-0103')
ON CONFLICT DO NOTHING;

-- Seed staff (passwords hashed by setup script — run scripts/seed-bakery-staff.mjs)
-- Default: admin/admin123  staff1/staff123
