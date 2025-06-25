"use client";

import { useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import { useExpenses, type Expense } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";

interface AddExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AddExpenseModal({
  open,
  onOpenChange,
}: AddExpenseModalProps) {
  const { user, userProfile } = useAuth();
  const { addExpense } = useExpenses(user?.id);
  const { categories } = useCategories(user?.id);

  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    importe: "",
    tipoGasto: "",
    medioPago: "",
    cuotas: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.nombre ||
      !formData.categoria ||
      !formData.importe ||
      !formData.tipoGasto ||
      !formData.medioPago
    ) {
      return;
    }

    setLoading(true);
    try {
      const importe = Number.parseFloat(formData.importe);
      const porcentajeSueldo = userProfile?.sueldo
        ? (importe / userProfile.sueldo) * 100
        : undefined;

      const expense: Omit<Expense, "id" | "fechaCreacion"> = {
        nombre: formData.nombre,
        categoria: formData.categoria,
        importe: importe,
        porcentajeSueldo: porcentajeSueldo,
        tipoGasto: formData.tipoGasto as Expense["tipoGasto"],
        medioPago: formData.medioPago as Expense["medioPago"],
        cuotas:
          formData.cuotas && formData.tipoGasto === "Cuotas"
            ? Number.parseInt(formData.cuotas)
            : undefined,
      };

      const success = await addExpense(expense);
      if (success) {
        setFormData({
          nombre: "",
          categoria: "",
          importe: "",
          tipoGasto: "",
          medioPago: "",
          cuotas: "",
        });
        onOpenChange(false);
      } else {
        alert("Error al agregar el gasto. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Error al agregar el gasto. Inténtalo de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e as any);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar Gasto</DialogTitle>
          <DialogDescription>
            Completa los datos del nuevo gasto
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre del gasto</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ej: Supermercado"
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">Categoría</Label>
            <Select
              value={formData.categoria}
              onValueChange={(value) =>
                setFormData({ ...formData, categoria: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una categoría" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="importe">Importe</Label>
            <Input
              id="importe"
              type="number"
              value={formData.importe}
              onChange={(e) =>
                setFormData({ ...formData, importe: e.target.value })
              }
              placeholder="0"
              min="0"
              step="0.01"
              onKeyPress={handleKeyPress}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="tipoGasto">Tipo de gasto</Label>
              <Select
                value={formData.tipoGasto}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipoGasto: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fijo">Fijo</SelectItem>
                  <SelectItem value="Variable">Variable</SelectItem>
                  <SelectItem value="Cuotas">Cuotas</SelectItem>
                  <SelectItem value="Única vez">Única vez</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medioPago">Medio de pago</Label>
              <Select
                value={formData.medioPago}
                onValueChange={(value) =>
                  setFormData({ ...formData, medioPago: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Medio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.tipoGasto === "Cuotas" && (
            <div className="space-y-2">
              <Label htmlFor="cuotas">Número de cuotas</Label>
              <Input
                id="cuotas"
                type="number"
                value={formData.cuotas}
                onChange={(e) =>
                  setFormData({ ...formData, cuotas: e.target.value })
                }
                placeholder="12"
                min="1"
                onKeyPress={handleKeyPress}
              />
            </div>
          )}

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-orange-500 hover:bg-orange-600"
              disabled={
                loading ||
                !formData.nombre ||
                !formData.categoria ||
                !formData.importe ||
                !formData.tipoGasto ||
                !formData.medioPago
              }
            >
              {loading ? "Agregando..." : "Agregar Gasto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
