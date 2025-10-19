import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";
import { useProfile } from "../hooks/useProfile";

interface ProtectedRouteProps {
  children: ReactNode;
  pageName: string;
}

export function ProtectedRoute({ children, pageName }: ProtectedRouteProps) {
  const { user } = useAuth();
  const { profile } = useProfile();

  // Rediriger vers l'onboarding si le profil n'est pas complété
  if (
    user &&
    profile?.onboarding_completed === false &&
    pageName !== "Onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  if (user && pageName == "Login") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && pageName == "Signup") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && pageName == "Landing") {
    return <Navigate to="/dashboard" replace />;
  }

  if (
    !user &&
    pageName !== "Login" &&
    pageName !== "Signup" &&
    pageName !== "Landing"
  ) {
    return <Navigate to="/login" replace />;
  }

  //if (user) {
  //  return <Navigate to="/dashboard" replace />;
  //}

  return <>{children}</>;
}
