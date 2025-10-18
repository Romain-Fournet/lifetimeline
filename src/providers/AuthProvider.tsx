import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { AuthContext, type SignUpCredentials } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import type {
  User,
  Session,
  SignInWithPasswordCredentials,
} from "@supabase/supabase-js";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Récupération de la session initiale
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Écoute des changements d'authentification
    const { data } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Cleanup: désabonnement lors du démontage
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (credentials: SignUpCredentials) => {
    console.log("Signing up with credentials:", credentials);

    // Extraire les données du formulaire
    const { email, password, name, username } = credentials;

    // Construire l'objet avec les métadonnées dans le bon format pour Supabase
    const response = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          username: username || name?.toLowerCase().replace(/\s+/g, "_"),
        },
      },
    });
    console.log("Signed up successfully");
    return response;
  };

  const logIn = async (credentials: SignInWithPasswordCredentials) => {
    console.log("Logging in with credentials:", credentials);
    const response = await supabase.auth.signInWithPassword(credentials);
    console.log("Logged in successfully");
    return response;
  };

  const signOut = async () => {
    console.log("Signing out");
    const { error } = await supabase.auth.signOut();
    console.log("Signed out successfully");
    return { error };
  };

  const value = {
    signUp,
    logIn,
    signOut,
    user,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
