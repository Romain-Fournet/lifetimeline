-- Script pour créer la table categories et mettre à jour la table events
-- Exécutez ce script dans le SQL Editor de Supabase

-- 1. Créer la table categories
CREATE TABLE IF NOT EXISTS public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL, -- Identifiant technique (ex: 'work', 'travel')
  icon TEXT, -- Nom de l'icône Lucide (ex: 'Briefcase', 'Plane')
  color TEXT NOT NULL, -- Classe Tailwind pour la couleur (ex: 'bg-blue-500')
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, slug) -- Un slug unique par utilisateur
);

-- 2. Activer Row Level Security
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

-- 3. Policies RLS pour categories
CREATE POLICY "Users can view own categories"
  ON public.categories
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own categories"
  ON public.categories
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
  ON public.categories
  FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
  ON public.categories
  FOR DELETE
  USING (auth.uid() = user_id);

-- 4. Trigger pour mettre à jour automatiquement updated_at
CREATE TRIGGER on_category_updated
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 5. Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS categories_slug_idx ON public.categories(slug);

-- 6. Insérer les catégories par défaut pour tous les utilisateurs existants
-- Cette fonction crée les catégories par défaut pour un utilisateur
CREATE OR REPLACE FUNCTION public.create_default_categories(p_user_id UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, slug, icon, color, description) VALUES
    (p_user_id, 'Carrière', 'work', 'Briefcase', 'bg-blue-500', 'Emplois et expériences professionnelles'),
    (p_user_id, 'Logements', 'housing', 'Home', 'bg-green-500', 'Lieux de résidence'),
    (p_user_id, 'Véhicules', 'vehicle', 'Car', 'bg-orange-500', 'Voitures et moyens de transport'),
    (p_user_id, 'Voyages', 'travel', 'Plane', 'bg-purple-500', 'Voyages et destinations'),
    (p_user_id, 'Relations', 'relationship', 'Heart', 'bg-pink-500', 'Relations personnelles'),
    (p_user_id, 'Jalons', 'milestone', 'Star', 'bg-yellow-500', 'Moments importants et réalisations')
  ON CONFLICT (user_id, slug) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Créer les catégories par défaut pour tous les utilisateurs existants
DO $$
DECLARE
  user_record RECORD;
BEGIN
  FOR user_record IN SELECT id FROM public.users LOOP
    PERFORM create_default_categories(user_record.id);
  END LOOP;
END $$;

-- 8. Modifier le trigger handle_new_user pour créer aussi les catégories par défaut
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Créer le profil utilisateur
  INSERT INTO public.users (id, email, username)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    )
  );

  -- Créer les catégories par défaut
  PERFORM create_default_categories(NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Modifier la table events pour ajouter la relation avec categories
-- D'abord, ajouter la nouvelle colonne category_id (nullable temporairement)
ALTER TABLE public.events ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- 10. Créer un index sur category_id
CREATE INDEX IF NOT EXISTS events_category_id_idx ON public.events(category_id);

-- 11. Migrer les données existantes: associer les events aux nouvelles catégories
-- Cette requête mappe les anciennes valeurs 'category' (TEXT) aux nouveaux category_id (UUID)
UPDATE public.events e
SET category_id = c.id
FROM public.categories c
WHERE e.user_id = c.user_id
  AND e.category = c.slug
  AND e.category_id IS NULL;

-- 12. Maintenant, on peut rendre category_id NOT NULL si vous voulez forcer l'utilisation des catégories
-- Décommentez la ligne suivante si vous êtes sûr que tous les events ont été migrés
-- ALTER TABLE public.events ALTER COLUMN category_id SET NOT NULL;

-- Note: On garde temporairement la colonne 'category' (TEXT) pour compatibilité
-- Vous pourrez la supprimer plus tard avec: ALTER TABLE public.events DROP COLUMN category;

-- Confirmation
SELECT
  'Catégories créées!' as status,
  COUNT(*) as total_categories
FROM public.categories;
