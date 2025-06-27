"use client";

import { useAuth } from "@/hooks/useAuth";
import AuthComponent from "@/components/auth/auth-component";
import Dashboard from "@/components/dashboard/dashboard";

export default function CifraApp() {
  const { user, userProfile, loading } = useAuth();

  // Pantalla de carga
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si no hay usuario autenticado, mostrar pantalla de login
  if (!user) {
    return <AuthComponent />;
  }

  // Si el usuario no está configurado, AuthComponent lo maneja
  if (!userProfile?.configurado) {
    return <AuthComponent />;
  }

  // Dashboard principal
  return <Dashboard />;
}
