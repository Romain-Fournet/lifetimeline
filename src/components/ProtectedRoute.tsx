import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
  pageName: string;
}

export function ProtectedRoute({ children, pageName }: ProtectedRouteProps) {
  const { user } = useAuth();

  if (user && pageName == "Login") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && pageName == "Signup") {
    return <Navigate to="/dashboard" replace />;
  }

  if (user && pageName == "Landing") {
    return <Navigate to="/dashboard" replace />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  //if (user) {
  //  return <Navigate to="/dashboard" replace />;
  //}

  return <>{children}</>;
}
