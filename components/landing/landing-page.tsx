"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BarChart3,
  ArrowRight,
  TrendingUp,
  Shield,
  CreditCard,
  Calculator,
  Search,
  Heart,
  Database,
  Download,
  PieChart,
  Calendar,
  Tags,
} from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { useState } from "react";

interface LandingPageProps {
  onStartApp: () => void;
}

export default function LandingPage({ onStartApp }: LandingPageProps) {
  const [supabase] = useState(() => createSupabaseBrowserClient());

  const handleGoogleAuth = async () => {
    // Detect if we're in production (Vercel) or development
    const getBaseUrl = () => {
      if (typeof window === "undefined") return "";

      // If we have the env var, use it
      if (process.env.NEXT_PUBLIC_SITE_URL) {
        return process.env.NEXT_PUBLIC_SITE_URL;
      }

      // Auto-detect production URLs
      const origin = window.location.origin;
      if (origin.includes("vercel.app") || origin.includes("cifrafinance")) {
        return origin;
      }

      // Default to current origin for development
      return origin;
    };

    const baseUrl = getBaseUrl();
    const redirectUrl = `${baseUrl}/auth/callback`;

    console.log("Google OAuth Debug:", {
      baseUrl,
      redirectUrl,
      windowOrigin:
        typeof window !== "undefined" ? window.location.origin : "undefined",
      envVar: process.env.NEXT_PUBLIC_SITE_URL || "not set",
    });

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: redirectUrl,
      },
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="sticky top-0 w-full bg-background/95 backdrop-blur border-b z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between max-w-7xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">Cifra</span>
          </div>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button
              onClick={handleGoogleAuth}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Continuar con Google
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-6 bg-gradient-to-br from-background via-orange-50/20 to-background">
          <div className="container mx-auto max-w-7xl">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-5xl lg:text-6xl font-bold leading-tight">
                    <span className="text-foreground">Tu plata, </span>
                    <span className="text-orange-500">bajo control</span>
                  </h1>
                </motion.div>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-xl text-muted-foreground max-w-lg"
                >
                  Cifra es una app para ayudarte a entender y organizar tus
                  gastos mensuales de forma simple, rápida y visual.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col sm:flex-row gap-4"
                >
                  <Button
                    onClick={handleGoogleAuth}
                    size="lg"
                    className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6"
                  >
                    Continuar con Google
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </motion.div>
              </div>

              {/* Right Mockup */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-3xl p-8 shadow-2xl">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">Resumen</h3>
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <CardContent className="p-0">
                          <div className="text-sm text-muted-foreground">
                            Control mensual
                          </div>
                          <div className="text-2xl font-bold">85%</div>
                          <div className="text-lg font-semibold">$45,000</div>
                        </CardContent>
                      </Card>
                      <Card className="p-4">
                        <CardContent className="p-0">
                          <div className="text-sm text-muted-foreground">
                            Categorías
                          </div>
                          <div className="text-2xl font-bold">9</div>
                          <div className="text-sm text-muted-foreground">
                            Organizadas
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="bg-background rounded-xl p-4">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-sm text-muted-foreground">
                          Tendencia mensual
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          +15%
                        </span>
                      </div>
                      <div className="h-32 flex items-end justify-center gap-2 px-4">
                        {[
                          { height: 60, color: "bg-orange-300", delay: 0 },
                          { height: 80, color: "bg-orange-400", delay: 0.1 },
                          { height: 45, color: "bg-orange-300", delay: 0.2 },
                          { height: 95, color: "bg-orange-500", delay: 0.3 },
                          { height: 70, color: "bg-orange-400", delay: 0.4 },
                          { height: 110, color: "bg-orange-600", delay: 0.5 },
                          { height: 85, color: "bg-orange-500", delay: 0.6 },
                        ].map((bar, index) => (
                          <motion.div
                            key={index}
                            initial={{ height: 0 }}
                            animate={{ height: bar.height }}
                            transition={{
                              duration: 0.6,
                              delay: bar.delay,
                              ease: "easeOut",
                            }}
                            className={`w-4 ${bar.color} rounded-t-sm`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="container mx-auto max-w-7xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                ¿Qué podés hacer con Cifra?
              </h2>
              <p className="text-xl text-muted-foreground">
                Todo lo que necesitás para controlar tus finanzas personales en
                una sola app
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: <Tags className="w-8 h-8" />,
                  title: "Registrar gastos",
                  description:
                    "Elegí categoría, tipo de gasto, medio de pago y fecha. Simple y rápido.",
                },
                {
                  icon: <BarChart3 className="w-8 h-8" />,
                  title: "Ver finanzas mensuales",
                  description:
                    "Ingresos, egresos, ahorro estimado y cuánto representa cada gasto sobre tu sueldo.",
                },
                {
                  icon: <PieChart className="w-8 h-8" />,
                  title: "Visualizar datos",
                  description:
                    "Gráficos circulares por categoría, actividad reciente y comparaciones.",
                },
                {
                  icon: <Calendar className="w-8 h-8" />,
                  title: "Crear nuevos meses",
                  description:
                    "Los gastos fijos y en cuotas se mantienen automáticamente.",
                },
                {
                  icon: <Shield className="w-8 h-8" />,
                  title: "Guardado automático",
                  description:
                    "No necesitás registrarte. Todo se guarda en tu dispositivo.",
                },
                {
                  icon: <Download className="w-8 h-8" />,
                  title: "Importar y exportar",
                  description:
                    "Hacé backups o llevá tus finanzas a otra herramienta.",
                },
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="h-full border-0 bg-background hover:shadow-lg transition-all duration-300">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-orange-600">
                        {feature.icon}
                      </div>
                      <h3 className="text-xl font-semibold mb-4">
                        {feature.title}
                      </h3>
                      <p className="text-muted-foreground leading-relaxed">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Target Audience Section */}
        <section className="py-24 px-6">
          <div className="container mx-auto max-w-7xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mb-16"
            >
              <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                ¿Para quién es esta app?
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              {[
                {
                  icon: <Search className="w-10 h-10" />,
                  title: "Entender gastos",
                  description: "Personas que quieren entender en qué gastan",
                  color: "bg-blue-500",
                },
                {
                  icon: <TrendingUp className="w-10 h-10" />,
                  title: "Ahorrar",
                  description: "Quienes buscan ahorrar todos los meses",
                  color: "bg-green-500",
                },
                {
                  icon: <Heart className="w-10 h-10" />,
                  title: "Simplicidad",
                  description: "Los que quieren control sin complicaciones",
                  color: "bg-purple-500",
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2 }}
                  className="text-center group"
                >
                  <div
                    className={`w-20 h-20 ${item.color} rounded-full flex items-center justify-center text-white mx-auto mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg`}
                  >
                    {item.icon}
                  </div>
                  <h3 className="text-2xl font-semibold mb-4">{item.title}</h3>
                  <p className="text-muted-foreground text-lg">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="py-24 px-6 bg-muted/30">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Cifra te muestra lo que importa
              </h2>
              <p className="text-2xl text-muted-foreground mb-12">
                💡 Visual. Rápida. Sin vueltas. Sin logins.
              </p>

              <Button
                onClick={handleGoogleAuth}
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-lg px-8 py-6"
              >
                Continuar con Google
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t">
        <div className="container mx-auto max-w-7xl text-center">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold">Cifra</span>
          </div>
          <p className="text-muted-foreground">Tu plata, bajo control.</p>
        </div>
      </footer>
    </div>
  );
}
