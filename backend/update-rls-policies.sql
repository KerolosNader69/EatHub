-- Drop existing policies
DROP POLICY IF EXISTS "Allow public read access" ON menu_items;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON menu_items;
DROP POLICY IF EXISTS "Allow public to create orders" ON orders;
DROP POLICY IF EXISTS "Allow public read access" ON orders;
DROP POLICY IF EXISTS "Allow authenticated users full access" ON orders;
DROP POLICY IF EXISTS "Allow public read access to order items" ON order_items;
DROP POLICY IF EXISTS "Allow authenticated users full access to order items" ON order_items;

-- Menu Items Policies
-- Allow public to read available items
CREATE POLICY "Allow public read access to menu_items"
  ON menu_items FOR SELECT
  USING (true);

-- Allow service role full access (for admin operations)
CREATE POLICY "Allow service role full access to menu_items"
  ON menu_items FOR ALL
  USING (auth.role() = 'service_role');

-- Allow authenticated users full access (for admin operations)
CREATE POLICY "Allow authenticated full access to menu_items"
  ON menu_items FOR ALL
  USING (auth.role() = 'authenticated');

-- Orders Policies
-- Allow public to create orders
CREATE POLICY "Allow public to create orders"
  ON orders FOR INSERT
  WITH CHECK (true);

-- Allow public to read their own orders
CREATE POLICY "Allow public read access to orders"
  ON orders FOR SELECT
  USING (true);

-- Allow authenticated users full access (for admin operations)
CREATE POLICY "Allow authenticated full access to orders"
  ON orders FOR ALL
  USING (auth.role() = 'authenticated');

-- Order Items Policies
-- Allow public to read order items
CREATE POLICY "Allow public read access to order_items"
  ON order_items FOR SELECT
  USING (true);

-- Allow public to insert order items (when creating orders)
CREATE POLICY "Allow public to create order_items"
  ON order_items FOR INSERT
  WITH CHECK (true);

-- Allow authenticated users full access (for admin operations)
CREATE POLICY "Allow authenticated full access to order_items"
  ON order_items FOR ALL
  USING (auth.role() = 'authenticated');
