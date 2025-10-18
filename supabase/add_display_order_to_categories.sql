-- Migration: Add display_order column to categories table
-- This allows users to customize the order of categories in their timeline

-- Add display_order column with default value
ALTER TABLE public.categories
ADD COLUMN IF NOT EXISTS display_order INTEGER;

-- Set initial display_order based on current created_at order
-- This ensures existing categories get sequential order numbers
WITH ordered_categories AS (
  SELECT
    id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at) - 1 AS order_num
  FROM public.categories
)
UPDATE public.categories c
SET display_order = oc.order_num
FROM ordered_categories oc
WHERE c.id = oc.id AND c.display_order IS NULL;

-- Set NOT NULL constraint after populating existing rows
ALTER TABLE public.categories
ALTER COLUMN display_order SET NOT NULL;

-- Set default value for new rows
ALTER TABLE public.categories
ALTER COLUMN display_order SET DEFAULT 0;

-- Create index for efficient ordering queries
CREATE INDEX IF NOT EXISTS categories_user_id_display_order_idx
ON public.categories(user_id, display_order);

-- Add comment for documentation
COMMENT ON COLUMN public.categories.display_order IS
'Display order of the category in the timeline. Lower numbers appear first. Per-user ordering.';
