export interface Category {
  id: string;
  user_id: string;
  name: string;
  slug: string;
  icon: string | null;
  color: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  icon?: string;
  color: string;
  description?: string;
  display_order?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  icon?: string;
  color?: string;
  description?: string;
  display_order?: number;
}
