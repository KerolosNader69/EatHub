# Supabase Setup Guide for Eat Hub

## Step 1: Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - Project name: `eat-hub`
   - Database password: (generate a strong password)
   - Region: Choose closest to your users
5. Click "Create new project"

## Step 2: Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon public** key
   - **service_role** key (keep this secret!)

## Step 3: Update Environment Variables

### Local Development (.env file)
```env
SUPABASE_URL=your_project_url_here
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_KEY=your_service_role_key_here
```

### Vercel Deployment
Add these environment variables in Vercel dashboard:
1. Go to your project → Settings → Environment Variables
2. Add:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_KEY`

## Step 4: Create Admin User

1. In Supabase dashboard, go to **Authentication** → **Users**
2. Click "Add user" → "Create new user"
3. Fill in:
   - Email: your admin email
   - Password: your admin password
   - Auto Confirm User: ✓ (check this)
4. Click "Create user"

## Step 5: Set Up Database Tables

Go to **SQL Editor** in Supabase and run these queries:

### Menu Items Table
```sql
CREATE TABLE menu_items (
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
```

### Orders Table
```sql
CREATE TABLE orders (
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

CREATE TABLE order_items (
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

-- Allow public to read their own orders (by order_number)
CREATE POLICY "Allow public read access" ON orders
  FOR SELECT USING (true);

-- Allow authenticated users full access
CREATE POLICY "Allow authenticated users full access" ON orders
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow public read access to order items" ON order_items
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users full access to order items" ON order_items
  FOR ALL USING (auth.role() = 'authenticated');
```

## Step 6: Test the Setup

1. Start your backend: `npm run dev` (in backend folder)
2. Test login endpoint:
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your-admin@email.com","password":"your-password"}'
```

## Step 7: Deploy to Vercel

1. Push your changes to GitHub
2. Vercel will automatically redeploy
3. Make sure environment variables are set in Vercel
4. Test the deployed API

## Next Steps

- The backend now uses Supabase for authentication
- Menu and order routes need to be updated to use Supabase (next task)
- Frontend needs to be updated to use email instead of username for login

## Benefits of Supabase

✅ Works perfectly with Vercel serverless
✅ Built-in authentication
✅ Real-time subscriptions (for order updates)
✅ Auto-generated REST API
✅ PostgreSQL database (more reliable than MongoDB for this use case)
✅ Free tier is generous
