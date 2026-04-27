-- Create the promotions_coupons table
CREATE TABLE IF NOT EXISTS public.promotions_coupons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES public.partner_stores(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    discount_amount TEXT NOT NULL,
    coupon_code TEXT,
    valid_until TIMESTAMP WITH TIME ZONE,
    is_highlighted BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Protect the table using RLS
ALTER TABLE public.promotions_coupons ENABLE ROW LEVEL SECURITY;

-- Everyone can view active promotions
CREATE POLICY "Anyone can view active promotions" ON public.promotions_coupons
    FOR SELECT
    USING (true);

-- Create the analytics_clicks table
CREATE TABLE IF NOT EXISTS public.analytics_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES auth.users(id),
    destination_url TEXT NOT NULL,
    item_type TEXT NOT NULL, -- e.g., 'store', 'coupon', 'product'
    item_id UUID, -- Optional reference to the item
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Clients can only insert clicks for themselves
ALTER TABLE public.analytics_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can insert clicks" ON public.analytics_clicks
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = client_id OR client_id IS NULL);

CREATE POLICY "Users can see their own clicks" ON public.analytics_clicks
    FOR SELECT
    TO authenticated
    USING (auth.uid() = client_id);
    
-- Consultants / Admins can see all clicks - assuming RLS allows consultants if implemented, but adding a general one for simplicity or we can assume it follows crm_rls.sql
-- In a real scenario, you'd add policies for admin access. Let's add a simple one for authenticated users to view all for dashboard purposes (if dashboard uses a service_role key, it bypasses RLS anyway).
