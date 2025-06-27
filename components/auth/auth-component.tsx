"use client";

import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthComponentProps {
  onAuthSuccess?: (user: User) => void;
}

export default function AuthComponent({ onAuthSuccess }: AuthComponentProps) {
  const [supabase] = useState(() => createSupabaseBrowserClient());

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        onAuthSuccess?.(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth, onAuthSuccess]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-500 text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold">Cifra</CardTitle>
          <CardDescription>
            Tu plata, bajo control. Inicia sesión para gestionar tus finanzas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: "#f97316",
                    brandAccent: "#ea580c",
                  },
                },
              },
              className: {
                container: "auth-container",
                button: "auth-button",
                input: "auth-input",
              },
            }}
            providers={["google"]}
            redirectTo={`${
              process.env.NEXT_PUBLIC_SITE_URL || window.location.origin
            }/auth/callback`}
            onlyThirdPartyProviders
            localization={{
              variables: {
                sign_in: {
                  email_label: "Correo electrónico",
                  password_label: "Contraseña",
                  button_label: "Iniciar sesión",
                  loading_button_label: "Iniciando sesión...",
                  social_provider_text: "Continuar con {{provider}}",
                  link_text: "¿Ya tienes una cuenta? Inicia sesión",
                },
                sign_up: {
                  email_label: "Correo electrónico",
                  password_label: "Contraseña",
                  button_label: "Registrarse",
                  loading_button_label: "Registrándose...",
                  social_provider_text: "Continuar con {{provider}}",
                  link_text: "¿No tienes una cuenta? Regístrate",
                },
              },
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
