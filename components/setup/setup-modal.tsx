"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { CheckCircle, User, DollarSign, Briefcase } from "lucide-react";

interface SetupModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete: () => void;
}

export default function SetupModal({
  open,
  onOpenChange,
  onComplete,
}: SetupModalProps) {
  const { userProfile, updateUserProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nombre: userProfile?.nombre || "",
    sueldo: "",
    tipo_sueldo: "" as "Fijo" | "Variable" | "",
  });

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    if (!formData.nombre || !formData.sueldo || !formData.tipo_sueldo) {
      return;
    }

    setLoading(true);
    try {
      const success = await updateUserProfile({
        nombre: formData.nombre,
        sueldo: parseFloat(formData.sueldo),
        tipo_sueldo: formData.tipo_sueldo,
        configurado: true,
      });

      if (success) {
        onComplete();
        onOpenChange(false);
      }
    } catch (error) {
      console.error("Error completing setup:", error);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return formData.nombre.trim().length > 0;
      case 2:
        return formData.sueldo && parseFloat(formData.sueldo) > 0;
      case 3:
        return formData.tipo_sueldo !== "";
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            Configuración Inicial
          </DialogTitle>
          <DialogDescription>
            Configura tu perfil para empezar a usar Cifra (Paso {currentStep} de{" "}
            {totalSteps})
          </DialogDescription>
        </DialogHeader>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <motion.div
            className="bg-orange-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="space-y-6">
          {/* Step 1: Nombre */}
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-orange-500" />
                    ¿Cómo te llamas?
                  </CardTitle>
                  <CardDescription>
                    Este nombre aparecerá en tu perfil y reportes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre completo</Label>
                    <Input
                      id="nombre"
                      value={formData.nombre}
                      onChange={(e) =>
                        setFormData({ ...formData, nombre: e.target.value })
                      }
                      placeholder="Ej: Juan Pérez"
                      className="text-lg"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Sueldo */}
          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-orange-500" />
                    ¿Cuál es tu sueldo mensual?
                  </CardTitle>
                  <CardDescription>
                    Esto nos ayudará a calcular el porcentaje de tus gastos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="sueldo">Sueldo mensual (ARS)</Label>
                    <Input
                      id="sueldo"
                      type="number"
                      value={formData.sueldo}
                      onChange={(e) =>
                        setFormData({ ...formData, sueldo: e.target.value })
                      }
                      placeholder="Ej: 150000"
                      className="text-lg"
                      min="0"
                      step="1000"
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Tipo de sueldo */}
          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-orange-500" />
                    ¿Cómo es tu sueldo?
                  </CardTitle>
                  <CardDescription>
                    Esto nos ayuda a hacer mejores recomendaciones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="tipo_sueldo">Tipo de sueldo</Label>
                    <Select
                      value={formData.tipo_sueldo}
                      onValueChange={(value: "Fijo" | "Variable") =>
                        setFormData({ ...formData, tipo_sueldo: value })
                      }
                    >
                      <SelectTrigger className="text-lg">
                        <SelectValue placeholder="Selecciona el tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fijo">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Fijo</span>
                            <span className="text-sm text-muted-foreground">
                              El mismo monto todos los meses
                            </span>
                          </div>
                        </SelectItem>
                        <SelectItem value="Variable">
                          <div className="flex flex-col items-start">
                            <span className="font-medium">Variable</span>
                            <span className="text-sm text-muted-foreground">
                              Cambia según comisiones, freelance, etc.
                            </span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Anterior
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="bg-orange-500 hover:bg-orange-600"
            >
              Siguiente
            </Button>
          ) : (
            <Button
              onClick={handleComplete}
              disabled={!isStepValid() || loading}
              className="bg-orange-500 hover:bg-orange-600"
            >
              {loading ? (
                "Guardando..."
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completar
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
