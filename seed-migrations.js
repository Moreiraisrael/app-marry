/**
 * seed-migrations.js
 * Executa as migrations necessárias via Supabase como usuário autenticado.
 * A função create_client_profile usa SECURITY DEFINER, então só precisa
 * ser criada uma vez com a service role key ou via SQL Editor do Supabase.
 * 
 * PARA EXECUTAR AS MIGRATIONS MANUALMENTE:
 * Acesse https://supabase.com/dashboard/project/gklikyemhahjgjcqkwja/sql/new
 * e cole o SQL abaixo:
 */

const SQL_TO_RUN = `
-- 1. Remove FK constraint para permitir perfis sem conta auth
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- 2. Cria função RPC para criar perfil de cliente
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
`;

console.log('='.repeat(60));
console.log('COPY O SQL ABAIXO E EXECUTE NO SQL EDITOR DO SUPABASE:');
console.log('https://supabase.com/dashboard/project/gklikyemhahjgjcqkwja/sql/new');
console.log('='.repeat(60));
console.log(SQL_TO_RUN);
console.log('='.repeat(60));
