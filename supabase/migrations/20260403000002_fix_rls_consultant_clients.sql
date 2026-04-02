-- Adiciona políticas RLS para permitir consultoras criarem perfis de clientes
-- e criarem/lerem/gerenciarem dados de suas clientes

-- 1. Permite consultoras inserirem perfis de clientes (sem exigir auth.uid() = id)
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Consultants can insert client profiles" ON public.profiles 
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL AND 
    user_type = 'client'
  );

-- 2. Permite consultoras atualizarem perfis de suas clientes
CREATE POLICY IF NOT EXISTS "Consultants can update their clients" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR
    auth.uid() = consultant_id
  );

-- 3. Permite consultoras lerem dados das cápsulas de suas clientes
DROP POLICY IF EXISTS "Consultants can view capsules" ON public.look_capsules;
CREATE POLICY "Consultants can view capsules" ON public.look_capsules
  FOR ALL USING (
    auth.uid() IN (
      SELECT consultant_id FROM public.profiles WHERE id = client_id
    ) OR auth.uid() = client_id
  );

-- 4. Permite consultoras gerenciarem shopping lists das suas clientes  
DROP POLICY IF EXISTS "Consultants can manage shopping lists" ON public.shopping_lists;
CREATE POLICY "Consultants can manage shopping lists" ON public.shopping_lists
  FOR ALL USING (
    auth.uid() = consultant_id OR auth.uid() = client_id
  );
