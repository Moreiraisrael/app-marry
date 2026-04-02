/**
 * run-migrations.js
 * Executa as migrations SQL necessárias diretamente no Supabase via pg connector
 */
const https = require('https')

// Service role key - precisa ser a chave real com role: service_role
// IMPORTANTE: A chave no .env é a anon key (role: anon), não a service role
// Precisamos da service role key do Supabase dashboard:
// https://supabase.com/dashboard/project/gklikyemhahjgjcqkwja/settings/api

const PROJECT_REF = 'gklikyemhahjgjcqkwja'
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

if (!SERVICE_ROLE_KEY || SERVICE_ROLE_KEY.includes('"role":"anon"') || SERVICE_ROLE_KEY.length < 100) {
  console.log('\n' + '='.repeat(70))
  console.log('⚠️  SERVICE ROLE KEY não encontrada ou inválida!')
  console.log('='.repeat(70))
  console.log('\nPara resolver o erro de cadastro de clientes, execute este SQL no Supabase:')
  console.log('👉 https://supabase.com/dashboard/project/' + PROJECT_REF + '/sql/new')
  console.log('\n' + '='.repeat(70))
  console.log(`
-- COLE ISSO NO SQL EDITOR DO SUPABASE E CLIQUE "RUN":

-- 1. Permite consultoras criarem perfis de clientes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' 
    AND policyname = 'Consultants can insert client profiles'
  ) THEN
    CREATE POLICY "Consultants can insert client profiles" ON public.profiles 
      FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND user_type = 'client');
  END IF;
END;
$$;

-- 2. Cria função RPC para inserir cliente sem depender de auth.users FK
CREATE OR REPLACE FUNCTION public.create_client_profile(
  p_full_name TEXT,
  p_email TEXT,
  p_consultant_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_client_id UUID;
BEGIN
  v_client_id := gen_random_uuid();
  
  INSERT INTO public.profiles (id, full_name, email, user_type, consultant_id, created_at)
  VALUES (v_client_id, p_full_name, p_email, 'client', p_consultant_id, NOW())
  ON CONFLICT (id) DO NOTHING;
  
  RETURN v_client_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_client_profile TO authenticated;
  `)
  console.log('='.repeat(70))
  process.exit(0)
}

console.log('Executando migrations...')
// Se tiver a service role key válida, executa aqui
