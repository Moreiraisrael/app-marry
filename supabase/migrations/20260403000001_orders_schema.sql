-- Migration: Create Orders Table and RLS
-- Description: Adds the orders table to track consultant commissions and client purchases.

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_name TEXT,
  external_order_id TEXT,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  commission DECIMAL(10, 2) NOT NULL DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  withdrawal_status TEXT DEFAULT 'available' CHECK (withdrawal_status IN ('available', 'requested', 'withdrawn')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Consultants can view their own orders
CREATE POLICY "Consultants can view own orders" 
ON public.orders FOR SELECT 
USING (auth.uid() = consultant_id);

-- Consultants can insert their own orders
CREATE POLICY "Consultants can insert own orders" 
ON public.orders FOR INSERT 
WITH CHECK (auth.uid() = consultant_id);

-- Consultants can update their own orders
CREATE POLICY "Consultants can update own orders" 
ON public.orders FOR UPDATE 
USING (auth.uid() = consultant_id);

-- Consultants can delete their own orders
CREATE POLICY "Consultants can delete own orders" 
ON public.orders FOR DELETE 
USING (auth.uid() = consultant_id);
