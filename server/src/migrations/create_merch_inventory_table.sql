-- =========================================================================
-- AWS SCD DHULE 2026 - MERCHANDISE INVENTORY SCHEMA MIGRATION
-- Run this in your Supabase SQL Editor to initialize the merch_inventory table
-- =========================================================================

-- 1. Create merch_inventory table
CREATE TABLE IF NOT EXISTS public.merch_inventory (
  id text PRIMARY KEY, -- 'bag', 'welcome-kit', 'combo'
  title text NOT NULL,
  capacity integer NOT NULL DEFAULT 100,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Seed initial capacity limits
INSERT INTO public.merch_inventory (id, title, capacity)
VALUES 
  ('bag', 'SCD Official Bag + Bottle', 150),
  ('welcome-kit', 'SCD Official Welcome Kit', 150),
  ('combo', 'SCD Bag + Welcome Kit Combo', 200)
ON CONFLICT (id) DO NOTHING;


-- 3. Setup Row Level Security (RLS)
ALTER TABLE public.merch_inventory ENABLE ROW LEVEL SECURITY;

-- Allow public anonymous read access (so frontend can check remaining stock)
DROP POLICY IF EXISTS "Allow public read merch_inventory" ON public.merch_inventory;
CREATE POLICY "Allow public read merch_inventory" 
ON public.merch_inventory FOR SELECT 
TO anon, authenticated, service_role 
USING (true);

-- Allow service_role full write/admin access
DROP POLICY IF EXISTS "Allow service role write merch_inventory" ON public.merch_inventory;
CREATE POLICY "Allow service role write merch_inventory" 
ON public.merch_inventory FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- 4. Enable Realtime updates for live stock synchronization
ALTER PUBLICATION supabase_realtime ADD TABLE public.merch_inventory;
