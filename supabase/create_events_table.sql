-- Script pour créer la table events (timeline_events)
-- Exécutez ce script dans le SQL Editor de Supabase

-- 1. Créer la table events
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  category TEXT NOT NULL CHECK (category IN ('work', 'housing', 'vehicle', 'relationship', 'travel', 'milestone')),
  location TEXT,
  photos TEXT[], -- Array de URLs d'images
  metadata JSONB, -- Données additionnelles flexibles
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Activer Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- 3. Policies RLS - Les utilisateurs peuvent voir et modifier leurs propres événements
CREATE POLICY "Users can view own events"
  ON public.events
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own events"
  ON public.events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own events"
  ON public.events
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own events"
  ON public.events
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER on_event_updated
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS events_user_id_idx ON public.events(user_id);
CREATE INDEX IF NOT EXISTS events_start_date_idx ON public.events(start_date);
CREATE INDEX IF NOT EXISTS events_category_idx ON public.events(category);
CREATE INDEX IF NOT EXISTS events_user_id_start_date_idx ON public.events(user_id, start_date DESC);

-- Confirmation
SELECT 'Table events créée avec succès!' as status;
