-- Script pour créer des événements de test
-- Exécutez ce script dans le SQL Editor de Supabase

-- ID de l'utilisateur de test
-- Remplacez par votre user_id si nécessaire

INSERT INTO public.events (user_id, title, description, start_date, end_date, category, location) VALUES
-- Événements professionnels
(
  '748c1858-687d-4426-9674-e39abb2d430c',
  'Développeur Frontend',
  'Développement d''applications web modernes avec React et TypeScript',
  '2022-01-15 09:00:00+00',
  '2024-06-30 18:00:00+00',
  'work',
  'Paris, France'
),
(
  '748c1858-687d-4426-9674-e39abb2d430c',
  'Ingénieur Full-Stack',
  'Promotion et nouvelles responsabilités',
  '2024-07-01 09:00:00+00',
  NULL,
  'work',
  'Paris, France'
),

-- Logements
(
  '748c1858-687d-4426-9674-e39abb2d430c',
  'Appartement Centre-Ville',
  'Premier appartement en location dans le centre historique',
  '2021-09-01 00:00:00+00',
  '2023-12-31 23:59:59+00',
  'housing',
  'Lyon, France'
),
(
  '748c1858-687d-4426-9674-e39abb2d430c',
  'Maison avec jardin',
  'Achat de ma première maison',
  '2024-01-01 00:00:00+00',
  NULL,
  'housing',
  'Bordeaux, France'
),

-- Véhicules
(
  '748c1858-687d-4426-9674-e39abb2d430c',
  'Renault Clio',
  'Première voiture personnelle',
  '2020-07-15 00:00:00+00',
  '2024-03-20 00:00:00+00',
  'vehicle',
  'France'
),
(
  '748c1858-687d-4426-9674-e39abb2d430c',
  'Tesla Model 3',
  'Passage à l''électrique',
  '2024-03-20 00:00:00+00',
  NULL,
  'vehicle',
  'France'
),

-- Voyages
(
  '748c1858-687d-4426-9674-e39abb2d430c',
  'Voyage au Japon',
  'Découverte de Tokyo, Kyoto et Osaka pendant 3 semaines',
  '2023-04-10 00:00:00+00',
  '2023-05-02 00:00:00+00',
  'travel',
  'Japon'
),
(
  '748c1858-687d-4426-9674-e39abb2d430c',
  'Road trip en Italie',
  'De Rome à Venise en passant par Florence',
  '2022-08-05 00:00:00+00',
  '2022-08-20 00:00:00+00',
  'travel',
  'Italie'
),
(
  '748c1858-687d-4426-9674-e39abb2d430c',
  'Séjour à New York',
  'Première visite aux États-Unis',
  '2023-12-20 00:00:00+00',
  '2024-01-05 00:00:00+00',
  'travel',
  'New York, USA'
),

-- Relations
(
  '748c1858-687d-4426-9674-e39abb2d430c',
  'Relation avec Marie',
  'Rencontre et début de la relation',
  '2022-03-14 00:00:00+00',
  NULL,
  'relationship',
  NULL
),

-- Jalons importants
(
  '748c1858-687d-4426-9674-e39abb2d430c',
  'Diplôme d''ingénieur',
  'Obtention du diplôme d''ingénieur informatique',
  '2021-06-30 00:00:00+00',
  NULL,
  'milestone',
  'Paris, France'
),
(
  '748c1858-687d-4426-9674-e39abb2d430c',
  'Marathon de Paris',
  'Premier marathon terminé en 3h45',
  '2023-04-02 08:00:00+00',
  '2023-04-02 11:45:00+00',
  'milestone',
  'Paris, France'
);

-- Confirmation
SELECT
  COUNT(*) as total_events,
  category,
  COUNT(*) as count_by_category
FROM public.events
WHERE user_id = '748c1858-687d-4426-9674-e39abb2d430c'
GROUP BY category
ORDER BY category;
