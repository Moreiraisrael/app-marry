-- Add missing tables for Marry Miele
-- 1. Color Analysis Requests
CREATE TABLE IF NOT EXISTS public.color_analysis_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  client_photo TEXT NOT NULL,
  additional_photos TEXT[] DEFAULT '{}',
  ai_suggested_season TEXT,
  consultant_season TEXT,
  consultant_notes TEXT,
  ai_analysis_data JSONB,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for Color Analysis
ALTER TABLE public.color_analysis_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view relevant color analysis" ON public.color_analysis_requests 
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = consultant_id);

-- 2. E-books
CREATE TABLE IF NOT EXISTS public.ebooks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  consultant_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content JSONB,
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS for E-books
ALTER TABLE public.ebooks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view relevant ebooks" ON public.ebooks 
  FOR SELECT USING (auth.uid() = client_id OR auth.uid() = consultant_id);

-- 3. Ensure profiles has season field
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='season') THEN
    ALTER TABLE public.profiles ADD COLUMN season TEXT;
  END IF;
END $$;
