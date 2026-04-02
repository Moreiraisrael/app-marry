-- Script SQL para Marry Miele - RLS de Consulta e CRM (Fase 2)

-- 1. Certifique-se de que a tabela appointments possua a segurança RLS ativada
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- 2. Permite que Consultores gerenciem todos os seus próprios agendamentos (Insert, Select, Update, Delete)
DROP POLICY IF EXISTS "Consultants can manage their appointments" ON public.appointments;
CREATE POLICY "Consultants can manage their appointments" ON public.appointments
  FOR ALL USING (auth.uid() = consultant_id);

-- 3. Permite que Clientes visualizem apenas seus agendamentos
DROP POLICY IF EXISTS "Clients can view their appointments" ON public.appointments;
CREATE POLICY "Clients can view their appointments" ON public.appointments
  FOR SELECT USING (auth.uid() = client_id);

-- 4. Permite que Consultores insiram e visualizem na tabela profiles clientes que eles criaram ou administram
DROP POLICY IF EXISTS "Consultants can view their clients" ON public.profiles;
CREATE POLICY "Consultants can view their clients" ON public.profiles
  FOR SELECT USING (auth.uid() = consultant_id);

DROP POLICY IF EXISTS "Consultants can insert their clients" ON public.profiles;
CREATE POLICY "Consultants can insert their clients" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = consultant_id);
