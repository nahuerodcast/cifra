"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import type { Database } from "@/lib/supabase";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];
type CategoryInsert = Database["public"]["Tables"]["categories"]["Insert"];
type CategoryUpdate = Database["public"]["Tables"]["categories"]["Update"];

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const DEFAULT_CATEGORIES: Omit<Category, "id">[] = [
  { name: "Vivienda", icon: "Home", color: "#3b82f6" },
  { name: "Transporte", icon: "Car", color: "#64748b" },
  { name: "Alimentación", icon: "Utensils", color: "#6b7280" },
  { name: "Salud", icon: "Heart", color: "#9ca3af" },
  { name: "Entretenimiento", icon: "Gamepad2", color: "#d1d5db" },
  { name: "Educación", icon: "GraduationCap", color: "#3b82f6" },
  { name: "Ropa", icon: "Shirt", color: "#64748b" },
  { name: "Servicios", icon: "ShoppingCart", color: "#6b7280" },
  { name: "Otros", icon: "Wallet", color: "#9ca3af" },
];

export function useCategories(userId: string | undefined) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [supabase] = useState(() => createSupabaseBrowserClient());

  // Convertir de formato Supabase a formato de la app
  const convertFromSupabase = (category: CategoryRow): Category => ({
    id: category.id,
    name: category.name,
    icon: category.icon,
    color: category.color,
  });

  // Convertir de formato de la app a formato Supabase
  const convertToSupabase = (
    category: Partial<Category>
  ): Partial<CategoryInsert> => ({
    name: category.name,
    icon: category.icon,
    color: category.color,
  });

  useEffect(() => {
    if (userId) {
      loadCategories();
    }
  }, [userId]);

  const loadCategories = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading categories:", error);
        // Si hay error o no hay categorías, crear las por defecto
        await createDefaultCategories();
        return;
      }

      if (data.length === 0) {
        // Si no hay categorías, crear las por defecto
        await createDefaultCategories();
      } else {
        const convertedCategories = data.map(convertFromSupabase);
        setCategories(convertedCategories);
      }
    } catch (error) {
      console.error("Error in loadCategories:", error);
      await createDefaultCategories();
    } finally {
      setLoading(false);
    }
  };

  const createDefaultCategories = async () => {
    if (!userId) return;

    try {
      const defaultCategoriesWithUserId: CategoryInsert[] =
        DEFAULT_CATEGORIES.map((cat) => ({
          ...cat,
          user_id: userId,
        }));

      const { data, error } = await supabase
        .from("categories")
        .insert(defaultCategoriesWithUserId)
        .select();

      if (error) {
        console.error("Error creating default categories:", error);
        return;
      }

      const convertedCategories = data.map(convertFromSupabase);
      setCategories(convertedCategories);
    } catch (error) {
      console.error("Error in createDefaultCategories:", error);
    }
  };

  const addCategory = async (category: Omit<Category, "id">) => {
    if (!userId) return false;

    try {
      const newCategory: CategoryInsert = {
        ...convertToSupabase(category),
        user_id: userId,
      };

      const { data, error } = await supabase
        .from("categories")
        .insert([newCategory])
        .select()
        .single();

      if (error) {
        console.error("Error adding category:", error);
        return false;
      }

      const convertedCategory = convertFromSupabase(data);
      setCategories((prev) => [...prev, convertedCategory]);
      return true;
    } catch (error) {
      console.error("Error in addCategory:", error);
      return false;
    }
  };

  const updateCategory = async (
    categoryId: string,
    updates: Partial<Category>
  ) => {
    if (!userId) return false;

    try {
      const updateData: CategoryUpdate = {
        ...convertToSupabase(updates),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from("categories")
        .update(updateData)
        .eq("id", categoryId)
        .eq("user_id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating category:", error);
        return false;
      }

      const convertedCategory = convertFromSupabase(data);
      setCategories((prev) =>
        prev.map((category) =>
          category.id === categoryId ? convertedCategory : category
        )
      );

      return true;
    } catch (error) {
      console.error("Error in updateCategory:", error);
      return false;
    }
  };

  const deleteCategory = async (categoryId: string) => {
    if (!userId) return false;

    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId)
        .eq("user_id", userId);

      if (error) {
        console.error("Error deleting category:", error);
        return false;
      }

      setCategories((prev) =>
        prev.filter((category) => category.id !== categoryId)
      );
      return true;
    } catch (error) {
      console.error("Error in deleteCategory:", error);
      return false;
    }
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    loadCategories,
  };
}
