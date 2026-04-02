-- Função para criar perfil de cliente sem exigir conta auth.users
-- A consultora cria o perfil; o cliente pode vincular a conta depois
-- Usa SECURITY DEFINER para bypassar RLS

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
  -- Gera um UUID para o cliente (não vinculado a auth.users ainda)
  v_client_id := gen_random_uuid();

  -- Insere diretamente na tabela profiles 
  -- O cliente poderá vincular sua conta de auth depois via claim
  INSERT INTO public.profiles (id, full_name, email, user_type, consultant_id, created_at)
  VALUES (v_client_id, p_full_name, p_email, 'client', p_consultant_id, NOW());

  RETURN v_client_id;
END;
$$;

-- Garante que a função é acessível pela service role e pelo usuário autenticado
GRANT EXECUTE ON FUNCTION public.create_client_profile TO authenticated;
