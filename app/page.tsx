"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import LandingPage from "@/components/landing/landing-page";
import Dashboard from "@/components/dashboard/dashboard";
import AddExpenseModal from "@/components/dashboard/add-expense-modal";
import SetupModal from "@/components/setup/setup-modal";

type Screen = "landing" | "setup" | "dashboard";

export default function CifraApp() {
  const { user, userProfile, loading } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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

  // Memoizar callbacks para evitar re-renders innecesarios
  const handleAddExpense = useCallback(() => {
    setShowAddExpense(true);
  }, []);

  const handleCloseAddExpenseModal = useCallback((open: boolean) => {
    setShowAddExpense(open);
  }, []);

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

      {currentScreen === "dashboard" && (
        <>
          <Dashboard onAddExpense={handleAddExpense} />

          <AddExpenseModal
            open={showAddExpense}
            onOpenChange={handleCloseAddExpenseModal}
          />
        </>
      )}

      <SetupModal
        open={showSetup}
        onOpenChange={handleCloseSetupModal}
        onComplete={handleSetupComplete}
      />
    </motion.div>
  );
}
