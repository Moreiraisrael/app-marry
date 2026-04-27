-- RLS Fix for Appointments Table
-- Explicitly separates operations to prevent "new row violates row-level security policy" errors

DROP POLICY IF EXISTS "Consultants can manage their appointments" ON public.appointments;

CREATE POLICY "Consultants can insert their appointments"
ON public.appointments 
FOR INSERT 
WITH CHECK (auth.uid() = consultant_id);

CREATE POLICY "Consultants can select their appointments"
ON public.appointments 
FOR SELECT 
USING (auth.uid() = consultant_id);

CREATE POLICY "Consultants can update their appointments"
ON public.appointments 
FOR UPDATE 
USING (auth.uid() = consultant_id) 
WITH CHECK (auth.uid() = consultant_id);

CREATE POLICY "Consultants can delete their appointments"
ON public.appointments 
FOR DELETE 
USING (auth.uid() = consultant_id);
