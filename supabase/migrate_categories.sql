-- Migration pour finaliser le passage aux catégories dynamiques
-- Exécutez ce script dans le SQL Editor de Supabase

-- 1. Vérifier que tous les événements ont bien été migrés vers category_id
SELECT
  COUNT(*) as events_without_category_id,
  COUNT(CASE WHEN category IS NOT NULL THEN 1 END) as events_with_old_category
FROM public.events
WHERE category_id IS NULL;

-- 2. Si des événements n'ont pas de category_id, les migrer maintenant
UPDATE public.events e
SET category_id = c.id
FROM public.categories c
WHERE e.user_id = c.user_id
  AND e.category = c.slug
  AND e.category_id IS NULL;

-- 3. Pour les événements qui n'ont toujours pas de category_id,
-- leur attribuer la première catégorie de l'utilisateur (par défaut)
UPDATE public.events e
SET category_id = (
  SELECT c.id
  FROM public.categories c
  WHERE c.user_id = e.user_id
  ORDER BY c.created_at
  LIMIT 1
)
WHERE e.category_id IS NULL;

-- 4. Maintenant que tous les événements ont un category_id, rendre la colonne NOT NULL
ALTER TABLE public.events ALTER COLUMN category_id SET NOT NULL;

-- 5. Supprimer l'ancienne colonne category (TEXT)
ALTER TABLE public.events DROP COLUMN IF EXISTS category;

-- 6. Vérification finale
SELECT
  COUNT(*) as total_events,
  COUNT(category_id) as events_with_category_id
FROM public.events;

-- Confirmation
SELECT 'Migration terminée! Tous les événements utilisent maintenant category_id' as status;
