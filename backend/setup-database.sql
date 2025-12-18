-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  image TEXT,
  ingredients TEXT[],
  portion_size TEXT,
  available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow public read access
CREATE POLICY "Allow public read access" ON menu_items
  FOR SELECT USING (true);

-- Allow authenticated users to insert/update/delete
CREATE POLICY "Allow authenticated users full access" ON menu_items
  FOR ALL USING (auth.role() = 'authenticated');

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  special_instructions TEXT,
  total_amount DECIMAL(10, 2) NOT NULL,
  status TEXT DEFAULT 'received' CHECK (status IN ('received', 'preparing', 'out_for_delivery', 'delivered')),
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id UUID REFERENCES menu_items(id),
  name TEXT NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Allow public to create orders
CREATE POLICY "Allow public to create orders" ON orders
  FOR INSERT WITH CHECK (true);

-- Allow public to read orders
CREATE POLICY "Allow public read access" ON orders
  FOR SELECT USING (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to order items" ON order_items
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users full access to order items" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');


-- Feedback Table
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT DEFAULT 'Anonymous',
  email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT NOT NULL DEFAULT 'general',
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- Allow public to create feedback
CREATE POLICY "Allow public to create feedback" ON feedback
  FOR INSERT WITH CHECK (true);

-- Allow authenticated users to read feedback
CREATE POLICY "Allow authenticated users to read feedback" ON feedback
  FOR SELECT USING (auth.role() = 'authenticated');
