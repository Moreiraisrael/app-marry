-- Add RLS policy for partner_stores to allow reading for everyone
CREATE POLICY "Anyone can view partner stores" ON public.partner_stores
    FOR SELECT
    USING (true);
