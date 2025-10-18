export interface User {
  id: string;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  username?: string;
  avatar_url?: string;
}
