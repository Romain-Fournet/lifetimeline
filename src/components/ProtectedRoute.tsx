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
  const { profile, loading: profileLoading } = useProfile();

  // Wait for profile to load before making routing decisions
  if (user && profileLoading) {
    return null; // or a loading spinner
  }

  // Redirect to onboarding if user is logged in but hasn't completed onboarding
  if (
    user &&
    profile &&
    !profile.onboarding_completed &&
    pageName !== "Onboarding"
  ) {
    return <Navigate to="/onboarding" replace />;
  }

  // Prevent users who completed onboarding from accessing onboarding page again
  if (user && profile?.onboarding_completed && pageName === "Onboarding") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && pageName === "Login") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && pageName === "Signup") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && pageName === "Landing") {
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
