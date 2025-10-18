import { createContext } from "react";
import type { User, AuthResponse, AuthError } from "@supabase/supabase-js";

export interface SignUpCredentials {
  email: string;
  password: string;
  name?: string;
  username?: string;
}

export interface AuthContextType {
  signUp: (credentials: SignUpCredentials) => Promise<AuthResponse>;
  logIn: (credentials: {
    email: string;
    password: string;
  }) => Promise<AuthResponse>;
  signOut: () => Promise<{ error: AuthError | null }>;
  user: User | null;
}

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
