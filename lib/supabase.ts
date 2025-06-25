import { createClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

// Configuración de Supabase
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ejemplo.supabase.co";
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "ejemplo-clave";

// Cliente para el navegador
export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente para el browser con SSR
export function createSupabaseBrowserClient() {
  return createBrowserClient(supabaseUrl, supabaseKey);
}

// Tipos para la base de datos
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          nombre: string | null;
          sueldo: number | null;
          tipo_sueldo: "Fijo" | "Variable" | null;
          configurado: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          nombre?: string | null;
          sueldo?: number | null;
          tipo_sueldo?: "Fijo" | "Variable" | null;
          configurado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          nombre?: string | null;
          sueldo?: number | null;
          tipo_sueldo?: "Fijo" | "Variable" | null;
          configurado?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: string;
          user_id: string;
          nombre: string;
          categoria: string;
          importe: number;
          porcentaje_sueldo: number | null;
          tipo_gasto: "Fijo" | "Variable" | "Cuotas" | "Única vez";
          medio_pago: "Tarjeta" | "Cash" | "Transferencia";
          cuotas: number | null;
          month_key: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          nombre: string;
          categoria: string;
          importe: number;
          porcentaje_sueldo?: number | null;
          tipo_gasto: "Fijo" | "Variable" | "Cuotas" | "Única vez";
          medio_pago: "Tarjeta" | "Cash" | "Transferencia";
          cuotas?: number | null;
          month_key: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          nombre?: string;
          categoria?: string;
          importe?: number;
          porcentaje_sueldo?: number | null;
          tipo_gasto?: "Fijo" | "Variable" | "Cuotas" | "Única vez";
          medio_pago?: "Tarjeta" | "Cash" | "Transferencia";
          cuotas?: number | null;
          month_key?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      categories: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          icon: string;
          color: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          icon?: string;
          color?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
