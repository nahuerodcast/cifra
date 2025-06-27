"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";
import { getCurrentMonthKey } from "@/lib/date-utils";
import { toast } from "sonner";

type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];
type ExpenseInsert = Database["public"]["Tables"]["expenses"]["Insert"];
type ExpenseUpdate = Database["public"]["Tables"]["expenses"]["Update"];

export interface Expense {
  id: string;
  nombre: string;
  categoria: string;
  importe: number;
  porcentajeSueldo?: number;
  tipoGasto: "Fijo" | "Variable" | "Cuotas" | "Única vez";
  medioPago: "Tarjeta" | "Cash" | "Transferencia";
  cuotas?: number;
  fechaCreacion: string;
}

export function useExpenses(userId: string | undefined) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [currentMonth, setCurrentMonth] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createSupabaseBrowserClient());

  // Convertir de formato Supabase a formato de la app
  const convertFromSupabase = (expense: ExpenseRow): Expense => ({
    id: expense.id,
    nombre: expense.nombre,
    categoria: expense.categoria,
    importe: expense.importe,
    porcentajeSueldo: expense.porcentaje_sueldo || undefined,
    tipoGasto: expense.tipo_gasto,
    medioPago: expense.medio_pago,
    cuotas: expense.cuotas || undefined,
    fechaCreacion: expense.created_at,
  });

  // Convertir de formato de la app a formato Supabase
  const convertToSupabase = (
    expense: Partial<Expense>
  ): Partial<ExpenseInsert> => ({
    nombre: expense.nombre,
    categoria: expense.categoria,
    importe: expense.importe,
    porcentaje_sueldo: expense.porcentajeSueldo,
    tipo_gasto: expense.tipoGasto,
    medio_pago: expense.medioPago,
    cuotas: expense.cuotas,
  });

  useEffect(() => {
    if (userId) {
      loadAvailableMonths();
      const currentMonthKey = getCurrentMonthKey();
      setCurrentMonth(currentMonthKey);
      loadExpenses(currentMonthKey);
    }
  }, [userId]);

  const loadAvailableMonths = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("month_key")
        .eq("user_id", userId);

      if (error) {
        console.error("Error loading available months:", error);
        return;
      }

      const uniqueMonths = [...new Set(data.map((item) => item.month_key))]
        .sort()
        .reverse();
      setAvailableMonths(uniqueMonths);
    } catch (error) {
      console.error("Error in loadAvailableMonths:", error);
    }
  };

  const loadExpenses = async (monthKey: string) => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", userId)
        .eq("month_key", monthKey)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading expenses:", error);
        setExpenses([]);
        return;
      }

      const convertedExpenses = data.map(convertFromSupabase);
      setExpenses(convertedExpenses);
    } catch (error) {
      console.error("Error in loadExpenses:", error);
      setExpenses([]);
    } finally {
      setLoading(false);
    }
  };

  const addExpense = async (expense: Omit<Expense, "id" | "fechaCreacion">) => {
    if (!userId) return false;

    try {
      const newExpense: ExpenseInsert = {
        user_id: userId,
        month_key: currentMonth,
        nombre: expense.nombre,
        categoria: expense.categoria,
        importe: expense.importe,
        porcentaje_sueldo: expense.porcentajeSueldo,
        tipo_gasto: expense.tipoGasto,
        medio_pago: expense.medioPago,
        cuotas: expense.cuotas,
      };

      const { data, error } = await supabase
        .from("expenses")
        .insert([newExpense])
        .select()
        .single();

      if (error) {
        console.error("Error adding expense:", error);
        toast.error("Error al agregar el gasto");
        return false;
      }

      const convertedExpense = convertFromSupabase(data);
      setExpenses((prev) => [convertedExpense, ...prev]);

      // Actualizar meses disponibles si es necesario
      if (!availableMonths.includes(currentMonth)) {
        setAvailableMonths((prev) => [currentMonth, ...prev].sort().reverse());
      }

      toast.success("Gasto agregado exitosamente");
      return true;
    } catch (error) {
      console.error("Error in addExpense:", error);
      toast.error("Error al agregar el gasto");
      return false;
    }
  };

  const updateExpense = async (
    expenseId: string,
    updates: Partial<Expense>
  ) => {
    if (!userId) return false;

    try {
      const updateData: ExpenseUpdate = {
        ...convertToSupabase(updates),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("expenses")
        .update(updateData)
        .eq("id", expenseId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating expense:", error);
        toast.error("Error al actualizar el gasto");
        return false;
      }

      const convertedExpense = convertFromSupabase(data);
      setExpenses((prev) =>
        prev.map((expense) =>
          expense.id === expenseId ? convertedExpense : expense
        )
      );

      toast.success("Gasto actualizado exitosamente");
      return true;
    } catch (error) {
      console.error("Error in updateExpense:", error);
      toast.error("Error al actualizar el gasto");
      return false;
    }
  };

  const deleteExpense = async (expenseId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("id", expenseId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error deleting expense:", error);
        toast.error("Error al eliminar el gasto");
        return false;
      }

      setExpenses((prev) => prev.filter((expense) => expense.id !== expenseId));
      toast.success("Gasto eliminado exitosamente");
      return true;
    } catch (error) {
      console.error("Error in deleteExpense:", error);
      toast.error("Error al eliminar el gasto");
      return false;
    }
  };

  const changeMonth = (monthKey: string) => {
    setCurrentMonth(monthKey);
    loadExpenses(monthKey);
  };

  const createNewMonth = async (monthKey: string) => {
    if (!availableMonths.includes(monthKey)) {
      setAvailableMonths((prev) => [monthKey, ...prev].sort().reverse());
    }
    setCurrentMonth(monthKey);
    setExpenses([]);
    toast.success("Mes creado exitosamente");
  };

  const deleteMonth = async (monthKey: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from("expenses")
        .delete()
        .eq("user_id", userId)
        .eq("month_key", monthKey);

      if (error) {
        console.error("Error deleting month:", error);
        toast.error("Error al eliminar el mes");
        return false;
      }

      // Actualizar meses disponibles
      setAvailableMonths((prev) => prev.filter((month) => month !== monthKey));

      // Si es el mes actual, cambiar al más reciente disponible
      if (monthKey === currentMonth) {
        const remainingMonths = availableMonths.filter(
          (month) => month !== monthKey
        );
        if (remainingMonths.length > 0) {
          const newCurrentMonth = remainingMonths[0];
          setCurrentMonth(newCurrentMonth);
          loadExpenses(newCurrentMonth);
        } else {
          // Si no hay más meses, crear el mes actual
          const currentMonthKey = getCurrentMonthKey();
          setCurrentMonth(currentMonthKey);
          setExpenses([]);
        }
      }

      toast.success("Mes eliminado exitosamente");
      return true;
    } catch (error) {
      console.error("Error in deleteMonth:", error);
      toast.error("Error al eliminar el mes");
      return false;
    }
  };

  const getMonthStats = async (monthKey: string) => {
    if (!userId) return null;

    try {
      const { data, error } = await supabase
        .from("expenses")
        .select("importe")
        .eq("user_id", userId)
        .eq("month_key", monthKey);

      if (error) {
        console.error("Error getting month stats:", error);
        return null;
      }

      const total = data.reduce((sum, expense) => sum + expense.importe, 0);
      const count = data.length;

      return { total, count };
    } catch (error) {
      console.error("Error in getMonthStats:", error);
      return null;
    }
  };

  return {
    expenses,
    availableMonths,
    currentMonth,
    loading,
    addExpense,
    updateExpense,
    deleteExpense,
    changeMonth,
    createNewMonth,
    deleteMonth,
    getMonthStats,
    loadExpenses,
  };
}
