"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/components/landing/landing-page";
import Dashboard from "@/components/dashboard/dashboard";
import SetupModal from "@/components/setup/setup-modal";

type Screen = "landing" | "setup" | "dashboard";

export default function CifraApp() {
  const { user, userProfile, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [showSetup, setShowSetup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Handle OAuth callback if code is present
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code) {
      // Redirect to the proper callback route to handle the OAuth code
      window.location.href = `/auth/callback?code=${code}`;
      return;
    }

    // Clean URL parameters after authentication callback
    if (urlParams.get("auth") === "success") {
      // Remove parameter from URL without reloading the page
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      if (!user) {
        setCurrentScreen("landing");
      } else if (userProfile && !userProfile.configurado) {
        setCurrentScreen("setup");
        setShowSetup(true);
      } else if (userProfile) {
        setCurrentScreen("dashboard");
      }
    }
  }, [user, userProfile, loading, mounted]);

  // Memoize callbacks to avoid unnecessary re-renders
  const handleStartApp = useCallback(() => {
    setCurrentScreen("setup");
    setShowSetup(true);
  }, []);

  const handleSetupComplete = useCallback(() => {
    setShowSetup(false);
    setCurrentScreen("dashboard");
  }, []);

  const handleCloseSetupModal = useCallback((open: boolean) => {
    setShowSetup(open);
  }, []);

  if (!mounted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-orange-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Iniciando Cifra...</p>
        </div>
      </div>
    );
  }

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

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {currentScreen === "landing" && (
        <LandingPage onStartApp={handleStartApp} />
      )}

      {currentScreen === "dashboard" && <Dashboard />}

      <SetupModal
        open={showSetup}
        onOpenChange={handleCloseSetupModal}
        onComplete={handleSetupComplete}
      />
    </motion.div>
  );
}
