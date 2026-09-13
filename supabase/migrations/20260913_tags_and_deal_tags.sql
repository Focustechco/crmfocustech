-- Tabela de Etiquetas (Tags)
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#FF6B00',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own tags" ON public.tags FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Tabela de Junção Relacional Deal_Tags (Muitos para Muitos)
CREATE TABLE IF NOT EXISTS public.deal_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id UUID NOT NULL REFERENCES public.deals(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(deal_id, tag_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.deal_tags TO authenticated;
GRANT ALL ON public.deal_tags TO service_role;
ALTER TABLE public.deal_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own deal_tags" ON public.deal_tags FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE public.deals.id = deal_tags.deal_id 
      AND public.deals.user_id = auth.uid()
    )
  ) 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.deals 
      WHERE public.deals.id = deal_tags.deal_id 
      AND public.deals.user_id = auth.uid()
    )
  );

CREATE INDEX IF NOT EXISTS idx_deal_tags_deal ON public.deal_tags(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_tags_tag ON public.deal_tags(tag_id);
