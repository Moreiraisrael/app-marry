-- Remove a constraint de FK que exige auth.users para criar perfis de cliente
-- Isso permite criar perfis de cliente diretamente sem conta de autenticação
-- O cliente poderá vincular a conta depois via email/convite

-- 1. Cria nova tabela profiles sem a FK constraint no id
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. O id agora é gerado pela aplicação (UUID)
-- Clientes sem conta auth podem ter id gerado por gen_random_uuid()
-- Consultores mantêm id vinculado ao auth.uid() via trigger

-- 3. Atualiza a RPC para funcionar com a nova estrutura  
CREATE OR REPLACE FUNCTION public.create_client_profile(
  p_full_name TEXT,
  p_email TEXT,
  p_consultant_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_client_id UUID;
BEGIN
  v_client_id := gen_random_uuid();

  INSERT INTO public.profiles (id, full_name, email, user_type, consultant_id, created_at)
  VALUES (v_client_id, p_full_name, p_email, 'client', p_consultant_id, NOW());

  RETURN v_client_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_client_profile TO authenticated;
