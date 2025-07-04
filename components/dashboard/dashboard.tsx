"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  BarChart3,
  Plus,
  Search,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Wallet,
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar,
  Tags,
  CalendarPlus,
  Download,
  Upload,
  Trash2,
  Edit3,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Home,
  Car,
  Utensils,
  Heart,
  Gamepad2,
  GraduationCap,
  Shirt,
  ShoppingCart,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { formatMonthKey, formatMonthKeyShort } from "@/lib/date-utils";
import { motion, AnimatePresence } from "framer-motion";
import CountUp from "react-countup";
import AddExpenseModal from "./add-expense-modal";
import ConfirmationModal from "@/components/ui/confirmation-modal";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import type { Expense } from "@/hooks/useExpenses";
// Charts are now implemented with CSS progress bars

const CATEGORY_ICONS = {
  Home,
  Car,
  Utensils,
  Heart,
  Gamepad2,
  GraduationCap,
  Shirt,
  ShoppingCart,
  Wallet,
};

interface DashboardProps {
  // Dashboard now handles the add expense modal internally
}

export default function Dashboard({}: DashboardProps) {
  const { user, userProfile, signOut, getAvatarUrl } = useAuth();
  const [supabase] = useState(() => createSupabaseBrowserClient());
  const {
    expenses,
    currentMonth,
    availableMonths,
    loading: expensesLoading,
    changeMonth,
    createNewMonth,
    deleteMonth,
    getMonthStats,
    addExpense,
    updateExpense,
    deleteExpense,
  } = useExpenses(user?.id);
  const { categories, addCategory, updateCategory, deleteCategory } =
    useCategories(user?.id);

  // Estados UI
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentSection, setCurrentSection] = useState<
    "overview" | "months" | "categories" | "settings"
  >("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [deletingExpense, setDeletingExpense] = useState(false);

  // Estados para gestión de categorías
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    icon: "Wallet",
    color: "#64748b",
  });
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [deletingCategory, setDeletingCategory] = useState(false);

  // Estados para gestión de meses
  const [isNewMonthModalOpen, setIsNewMonthModalOpen] = useState(false);
  const [newMonthData, setNewMonthData] = useState("");
  const [monthStats, setMonthStats] = useState<
    Record<string, { total: number; count: number }>
  >({});
  const [monthToDelete, setMonthToDelete] = useState<string | null>(null);
  const [isEditMonthModalOpen, setIsEditMonthModalOpen] = useState(false);
  const [editingMonth, setEditingMonth] = useState<string>("");
  const [editMonthData, setEditMonthData] = useState("");
  const [deletingMonth, setDeletingMonth] = useState(false);

  if (!userProfile) return null;

  // Cálculos
  const totalGastos = expenses.reduce(
    (sum, expense) => sum + expense.importe,
    0
  );
  const porcentajeSueldo = userProfile.sueldo
    ? (totalGastos / userProfile.sueldo) * 100
    : 0;
  const ahorro = userProfile.sueldo ? userProfile.sueldo - totalGastos : 0;

  // Filtrar gastos por búsqueda
  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Datos para gráficos
  const categoryData = categories
    .map((cat) => ({
      name: cat.name,
      value: expenses
        .filter((e) => e.categoria === cat.name)
        .reduce((sum, e) => sum + e.importe, 0),
      color: cat.color,
    }))
    .filter((item) => item.value > 0);

  const expenseTypeData = [
    {
      name: "Fijo",
      value: expenses
        .filter((e) => e.tipoGasto === "Fijo")
        .reduce((sum, e) => sum + e.importe, 0),
      color: "#3b82f6",
    },
    {
      name: "Variable",
      value: expenses
        .filter((e) => e.tipoGasto === "Variable")
        .reduce((sum, e) => sum + e.importe, 0),
      color: "#64748b",
    },
    {
      name: "Cuotas",
      value: expenses
        .filter((e) => e.tipoGasto === "Cuotas")
        .reduce((sum, e) => sum + e.importe, 0),
      color: "#6b7280",
    },
    {
      name: "Única vez",
      value: expenses
        .filter((e) => e.tipoGasto === "Única vez")
        .reduce((sum, e) => sum + e.importe, 0),
      color: "#9ca3af",
    },
  ].filter((item) => item.value > 0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Use the new date utilities that handle timezone issues properly
  const formatDate = (monthKey: string) => {
    return formatMonthKey(monthKey);
  };

  const formatDateShort = (monthKey: string) => {
    return formatMonthKeyShort(monthKey);
  };

  // Funciones para categorías
  const handleAddCategory = async () => {
    if (categoryFormData.name) {
      const success = await addCategory({
        name: categoryFormData.name,
        icon: categoryFormData.icon,
        color: categoryFormData.color,
      });
      if (success) {
        setCategoryFormData({ name: "", icon: "Wallet", color: "#64748b" });
        setIsCategoryModalOpen(false);
      }
    }
  };

  const handleEditCategory = (category: any) => {
    setEditingCategory(category);
    setCategoryFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
    });
    setIsCategoryModalOpen(true);
  };

  const handleUpdateCategory = async () => {
    if (editingCategory && categoryFormData.name) {
      const success = await updateCategory(editingCategory.id, {
        name: categoryFormData.name,
        icon: categoryFormData.icon,
        color: categoryFormData.color,
      });
      if (success) {
        setEditingCategory(null);
        setCategoryFormData({ name: "", icon: "Wallet", color: "#64748b" });
        setIsCategoryModalOpen(false);
      }
    }
  };

  const handleDeleteCategory = (categoryId: string) => {
    setCategoryToDelete(categoryId);
  };

  const confirmDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setDeletingCategory(true);
    try {
      await deleteCategory(categoryToDelete);
      setCategoryToDelete(null);
    } finally {
      setDeletingCategory(false);
    }
  };

  // Funciones para gestión de meses
  const handleCreateNewMonth = async () => {
    if (newMonthData) {
      await createNewMonth(newMonthData);
      setNewMonthData("");
      setIsNewMonthModalOpen(false);
      loadMonthStats();
    }
  };

  const confirmDeleteMonth = async () => {
    if (!monthToDelete) return;

    setDeletingMonth(true);
    try {
      const success = await deleteMonth(monthToDelete);
      if (success) {
        setMonthToDelete(null);
        loadMonthStats();
      }
    } finally {
      setDeletingMonth(false);
    }
  };

  const handleEditMonth = (monthKey: string) => {
    setEditingMonth(monthKey);
    setEditMonthData(monthKey);
    setIsEditMonthModalOpen(true);
  };

  const handleUpdateMonth = async () => {
    if (editingMonth && editMonthData && editingMonth !== editMonthData) {
      // Simular edición moviendo gastos al nuevo mes
      // Primero cargar gastos del mes original
      const { data } = await supabase
        .from("expenses")
        .select("*")
        .eq("user_id", user?.id)
        .eq("month_key", editingMonth);

      if (data && data.length > 0) {
        // Actualizar todos los gastos al nuevo mes
        await supabase
          .from("expenses")
          .update({ month_key: editMonthData })
          .eq("user_id", user?.id)
          .eq("month_key", editingMonth);

        // Nota: Los meses se recargarán automáticamente cuando cambien los datos
        if (editingMonth === currentMonth) {
          changeMonth(editMonthData);
        }
      }
    }
    setEditingMonth("");
    setEditMonthData("");
    setIsEditMonthModalOpen(false);
    loadMonthStats();
  };

  // Función simple para cargar estadísticas - se llama manualmente cuando es necesario
  const loadMonthStats = async () => {
    const stats: Record<string, { total: number; count: number }> = {};
    for (const month of availableMonths) {
      const monthStat = await getMonthStats(month);
      if (monthStat) {
        stats[month] = monthStat;
      }
    }
    setMonthStats(stats);
  };

  // Funciones para exportar/importar
  const exportData = () => {
    const data = {
      user: userProfile,
      categories: categories,
      expenses: { [currentMonth]: expenses },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cifra-backup-${currentMonth}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Animaciones
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.3,
      },
    },
  };

  const sidebarVariants = {
    open: {
      x: 0,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
    closed: {
      x: "-100%",
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 30,
      },
    },
    desktop: {
      x: 0,
    },
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenseToDelete(expenseId);
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;

    setDeletingExpense(true);
    try {
      await deleteExpense(expenseToDelete);
      setExpenseToDelete(null);
    } finally {
      setDeletingExpense(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Desktop */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:border-r lg:bg-background lg:z-50">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Cifra</span>
            </div>
          </div>

          <nav className="p-4 space-y-1 flex-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Menu
            </div>
            <div className="space-y-1">
              <Button
                variant={currentSection === "overview" ? "default" : "ghost"}
                className="w-full justify-start h-10"
                onClick={() => setCurrentSection("overview")}
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Overview
              </Button>

              <Button
                variant={currentSection === "months" ? "default" : "ghost"}
                className="w-full justify-start h-10"
                onClick={() => setCurrentSection("months")}
              >
                <Calendar className="w-4 h-4 mr-3" />
                Meses
              </Button>

              <Button
                variant={currentSection === "categories" ? "default" : "ghost"}
                className="w-full justify-start h-10"
                onClick={() => setCurrentSection("categories")}
              >
                <Tags className="w-4 h-4 mr-3" />
                Categorías
              </Button>

              <Button
                variant={currentSection === "settings" ? "default" : "ghost"}
                className="w-full justify-start h-10"
                onClick={() => setCurrentSection("settings")}
              >
                <Settings className="w-4 h-4 mr-3" />
                Configuración
              </Button>
            </div>
          </nav>

          {/* Usuario info */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={getAvatarUrl()} />
                <AvatarFallback>
                  {userProfile.nombre?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {userProfile.nombre}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Sidebar Móvil */}
      <motion.aside
        variants={sidebarVariants}
        initial="closed"
        animate={isSidebarOpen ? "open" : "closed"}
        className="lg:hidden fixed left-0 top-0 z-50 h-full w-64 bg-background border-r"
      >
        <div className="flex flex-col h-full">
          {/* Logo y cerrar */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Cifra</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsSidebarOpen(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <nav className="p-4 space-y-1 flex-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
              Menu
            </div>
            <div className="space-y-1">
              <Button
                variant={currentSection === "overview" ? "default" : "ghost"}
                className="w-full justify-start h-10"
                onClick={() => {
                  setCurrentSection("overview");
                  setIsSidebarOpen(false);
                }}
              >
                <BarChart3 className="w-4 h-4 mr-3" />
                Overview
              </Button>

              <Button
                variant={currentSection === "months" ? "default" : "ghost"}
                className="w-full justify-start h-10"
                onClick={() => {
                  setCurrentSection("months");
                  setIsSidebarOpen(false);
                }}
              >
                <Calendar className="w-4 h-4 mr-3" />
                Meses
              </Button>

              <Button
                variant={currentSection === "categories" ? "default" : "ghost"}
                className="w-full justify-start h-10"
                onClick={() => {
                  setCurrentSection("categories");
                  setIsSidebarOpen(false);
                }}
              >
                <Tags className="w-4 h-4 mr-3" />
                Categorías
              </Button>

              <Button
                variant={currentSection === "settings" ? "default" : "ghost"}
                className="w-full justify-start h-10"
                onClick={() => {
                  setCurrentSection("settings");
                  setIsSidebarOpen(false);
                }}
              >
                <Settings className="w-4 h-4 mr-3" />
                Configuración
              </Button>
            </div>
          </nav>

          {/* Usuario info */}
          <div className="p-4 border-t">
            <div className="flex items-center space-x-3 mb-3">
              <Avatar className="w-10 h-10">
                <AvatarImage src={getAvatarUrl()} />
                <AvatarFallback>
                  {userProfile.nombre?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">
                  {userProfile.nombre}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signOut()}
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </motion.aside>

      {/* Contenido principal */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">
                  {currentSection === "overview" && "Overview"}
                  {currentSection === "months" && "Meses"}
                  {currentSection === "categories" && "Categorías"}
                  {currentSection === "settings" && "Configuración"}
                </h1>
                {currentSection === "overview" && (
                  <div className="flex items-center gap-2">
                    <Select value={currentMonth} onValueChange={changeMonth}>
                      <SelectTrigger className="w-[180px]">
                        <SelectValue>{formatDate(currentMonth)}</SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        {availableMonths.map((month) => (
                          <SelectItem key={month} value={month}>
                            {formatDate(month)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                {currentSection !== "overview" && (
                  <p className="text-sm text-muted-foreground">
                    {formatDate(currentMonth)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {currentSection === "overview" && (
                <Button
                  onClick={() => setShowAddExpenseModal(true)}
                  size="sm"
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Agregar Gasto</span>
                </Button>
              )}
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Contenido */}
        <main className="p-4 lg:p-6">
          <AnimatePresence mode="wait">
            {currentSection === "overview" && (
              <motion.div
                key="overview"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                {/* Estadísticas principales */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Total Gastado
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          <CountUp
                            end={totalGastos}
                            duration={2}
                            formattingFn={(value) => formatCurrency(value)}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {expenses.length} gastos este mes
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          % del Sueldo
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          <CountUp
                            end={porcentajeSueldo}
                            duration={2}
                            decimals={1}
                            suffix="%"
                          />
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 mt-2">
                          <motion.div
                            className={`h-2 rounded-full ${
                              porcentajeSueldo > 80
                                ? "bg-red-500"
                                : porcentajeSueldo > 60
                                ? "bg-yellow-500"
                                : "bg-green-500"
                            }`}
                            initial={{ width: 0 }}
                            animate={{
                              width: `${Math.min(porcentajeSueldo, 100)}%`,
                            }}
                            transition={{ duration: 2, delay: 0.5 }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Disponible
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          <CountUp
                            end={ahorro}
                            duration={2}
                            formattingFn={(value) => formatCurrency(value)}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Sueldo: {formatCurrency(userProfile.sueldo || 0)}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                          Categorías
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-2xl font-bold">
                          {categoryData.length}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {categories.length} disponibles
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Búsqueda */}
                <motion.div variants={itemVariants}>
                  <div className="relative max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Buscar gastos..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </motion.div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Gastos por Categoría</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {categoryData.length > 0 ? (
                          <div className="space-y-3">
                            {categoryData.map((item, index) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">
                                    {item.name}
                                  </span>
                                  <span>{formatCurrency(item.value)}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full transition-all duration-1000"
                                    style={{
                                      backgroundColor: item.color,
                                      width: `${
                                        (item.value / totalGastos) * 100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-64 flex items-center justify-center text-muted-foreground">
                            No hay datos para mostrar
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Gastos por Tipo</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {expenseTypeData.length > 0 ? (
                          <div className="space-y-3">
                            {expenseTypeData.map((item, index) => (
                              <div key={index} className="space-y-1">
                                <div className="flex justify-between text-sm">
                                  <span className="font-medium">
                                    {item.name}
                                  </span>
                                  <span>{formatCurrency(item.value)}</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <div
                                    className="h-2 rounded-full transition-all duration-1000"
                                    style={{
                                      backgroundColor: item.color,
                                      width: `${
                                        (item.value / totalGastos) * 100
                                      }%`,
                                    }}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="h-64 flex items-center justify-center text-muted-foreground">
                            No hay datos para mostrar
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>

                {/* Lista de gastos */}
                <motion.div variants={cardVariants}>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Gastos de {formatDate(currentMonth)}</span>
                        <Badge variant="secondary">
                          {filteredExpenses.length} gastos
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {expensesLoading ? (
                        <div className="flex items-center justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                        </div>
                      ) : filteredExpenses.length === 0 ? (
                        <div className="text-center py-8">
                          <Wallet className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                          <h3 className="text-lg font-medium mb-2">
                            No hay gastos
                          </h3>
                          <p className="text-muted-foreground mb-4">
                            {searchTerm
                              ? "No se encontraron gastos con ese término"
                              : "Comienza agregando tu primer gasto"}
                          </p>
                          {!searchTerm && (
                            <Button
                              onClick={() => setShowAddExpenseModal(true)}
                              className="bg-orange-500 hover:bg-orange-600"
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              Agregar Gasto
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="relative overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead className="w-[300px]">
                                  Transacción
                                </TableHead>
                                <TableHead>Importe</TableHead>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Medio de Pago</TableHead>
                                <TableHead>Total</TableHead>
                                <TableHead>Estado</TableHead>
                                <TableHead className="text-right">
                                  Acción
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {filteredExpenses
                                .slice(0, 10)
                                .map((expense, index) => {
                                  const category = categories.find(
                                    (cat) => cat.name === expense.categoria
                                  );
                                  const IconComponent = category
                                    ? CATEGORY_ICONS[
                                        category.icon as keyof typeof CATEGORY_ICONS
                                      ] || Wallet
                                    : Wallet;
                                  return (
                                    <TableRow key={expense.id}>
                                      <TableCell>
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                            <IconComponent className="w-4 h-4" />
                                          </div>
                                          <div>
                                            <p className="font-medium">
                                              {expense.nombre}
                                            </p>
                                            {expense.cuotas && (
                                              <p className="text-xs text-muted-foreground">
                                                {expense.cuotas} cuotas
                                              </p>
                                            )}
                                            <div className="md:hidden flex gap-1 mt-1">
                                              <Badge
                                                variant="secondary"
                                                className="text-xs"
                                              >
                                                {expense.categoria}
                                              </Badge>
                                            </div>
                                          </div>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        <span
                                          className={
                                            expense.importe > 0
                                              ? "text-green-600"
                                              : ""
                                          }
                                        >
                                          {expense.importe > 0 ? "+" : "-"}
                                          {formatCurrency(
                                            Math.abs(expense.importe)
                                          )}
                                        </span>
                                      </TableCell>
                                      <TableCell>
                                        {new Date(
                                          expense.fechaCreacion
                                        ).toLocaleTimeString("es-AR", {
                                          hour: "numeric",
                                          minute: "numeric",
                                        })}
                                      </TableCell>
                                      <TableCell>
                                        <div className="flex items-center gap-2">
                                          {expense.medioPago === "Tarjeta" && (
                                            <CreditCard className="w-4 h-4" />
                                          )}
                                          {expense.medioPago === "Cash" && (
                                            <Banknote className="w-4 h-4" />
                                          )}
                                          {expense.medioPago ===
                                            "Transferencia" && (
                                            <ArrowRightLeft className="w-4 h-4" />
                                          )}
                                          <span>{expense.medioPago}</span>
                                        </div>
                                      </TableCell>
                                      <TableCell>
                                        {formatCurrency(expense.importe)}
                                      </TableCell>
                                      <TableCell>
                                        <Badge
                                          variant="default"
                                          className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                        >
                                          Success
                                        </Badge>
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <div className="flex items-center justify-end gap-2">
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                              setEditingExpense(expense);
                                              setShowAddExpenseModal(true);
                                            }}
                                            className="h-8 w-8 p-0"
                                          >
                                            <Edit3 className="h-4 w-4" />
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() =>
                                              handleDeleteExpense(expense.id)
                                            }
                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                          >
                                            <Trash2 className="h-4 w-4" />
                                          </Button>
                                        </div>
                                      </TableCell>
                                    </TableRow>
                                  );
                                })}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>
            )}

            {currentSection === "months" && (
              <motion.div
                key="months"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
                onAnimationComplete={() => {
                  // Cargar estadísticas cuando se muestre la sección
                  if (availableMonths.length > 0) {
                    loadMonthStats();
                  }
                }}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Historial por Meses
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Revisa tus gastos mes a mes
                    </p>
                  </div>
                  <Dialog
                    open={isNewMonthModalOpen}
                    onOpenChange={setIsNewMonthModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <CalendarPlus className="w-4 h-4 mr-2" />
                        Nuevo Mes
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Crear Nuevo Mes</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          type="month"
                          value={newMonthData}
                          onChange={(e) => setNewMonthData(e.target.value)}
                          placeholder="2024-01"
                        />
                        <Button
                          onClick={handleCreateNewMonth}
                          className="w-full"
                        >
                          Crear Mes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableMonths.map((month) => {
                    const stats = monthStats[month];
                    return (
                      <motion.div
                        key={month}
                        variants={cardVariants}
                        className="relative"
                      >
                        <Card
                          className={`transition-colors ${
                            month === currentMonth
                              ? "border-orange-500 bg-orange-50 dark:bg-orange-950"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                              <span
                                className="text-base cursor-pointer hover:text-orange-500"
                                onClick={() => {
                                  changeMonth(month);
                                  setCurrentSection("overview");
                                }}
                              >
                                {formatDate(month)}
                              </span>
                              <div className="flex space-x-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditMonth(month);
                                  }}
                                  title="Editar mes"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setMonthToDelete(month);
                                  }}
                                  title="Eliminar mes"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Gastos:</span>
                                <span className="font-medium">
                                  {stats?.count || 0}
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span>Total:</span>
                                <span className="font-medium">
                                  {formatCurrency(stats?.total || 0)}
                                </span>
                              </div>
                              {month === currentMonth && (
                                <div className="text-xs text-orange-600 font-medium">
                                  Mes actual
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {currentSection === "categories" && (
              <motion.div
                key="categories"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-lg font-semibold">
                      Gestión de Categorías
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      Administra las categorías de gastos
                    </p>
                  </div>
                  <Dialog
                    open={isCategoryModalOpen}
                    onOpenChange={setIsCategoryModalOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Nueva Categoría
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingCategory ? "Editar" : "Nueva"} Categoría
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Nombre</label>
                          <Input
                            value={categoryFormData.name}
                            onChange={(e) =>
                              setCategoryFormData({
                                ...categoryFormData,
                                name: e.target.value,
                              })
                            }
                            placeholder="Nombre de la categoría"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Color</label>
                          <Input
                            type="color"
                            value={categoryFormData.color}
                            onChange={(e) =>
                              setCategoryFormData({
                                ...categoryFormData,
                                color: e.target.value,
                              })
                            }
                          />
                        </div>
                        <Button
                          onClick={
                            editingCategory
                              ? handleUpdateCategory
                              : handleAddCategory
                          }
                          className="w-full"
                        >
                          {editingCategory ? "Actualizar" : "Crear"} Categoría
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <motion.div key={category.id} variants={cardVariants}>
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: category.color }}
                              />
                              <span>{category.name}</span>
                            </div>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditCategory(category)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">
                            {
                              expenses.filter(
                                (e) => e.categoria === category.name
                              ).length
                            }{" "}
                            gastos
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {currentSection === "settings" && (
              <motion.div
                key="settings"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="space-y-6"
              >
                <div>
                  <h2 className="text-lg font-semibold">Configuración</h2>
                  <p className="text-sm text-muted-foreground">
                    Gestiona tu perfil y datos
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <label className="text-sm font-medium">Nombre</label>
                          <p className="text-lg">{userProfile.nombre}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <p className="text-lg">{user?.email}</p>
                        </div>
                        <div>
                          <label className="text-sm font-medium">Sueldo</label>
                          <p className="text-lg">
                            {formatCurrency(userProfile.sueldo || 0)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  <motion.div variants={cardVariants}>
                    <Card>
                      <CardHeader>
                        <CardTitle>Datos y Backup</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <Button
                          onClick={exportData}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Exportar Datos
                        </Button>
                        <div>
                          <label className="text-sm font-medium block mb-2">
                            Importar Datos
                          </label>
                          <Input
                            type="file"
                            accept=".json"
                            onChange={(e) => {
                              // Manejar importación aquí
                            }}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modal de confirmación para eliminar mes */}
      <ConfirmationModal
        open={!!monthToDelete}
        onOpenChange={() => setMonthToDelete(null)}
        title="Eliminar Mes"
        description={`¿Estás seguro de que quieres eliminar el mes ${
          monthToDelete ? formatDate(monthToDelete) : ""
        }? Esta acción eliminará todos los gastos de este mes y no se puede deshacer.`}
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteMonth}
        loading={deletingMonth}
      />

      {/* Modal para editar mes */}
      <Dialog
        open={isEditMonthModalOpen}
        onOpenChange={setIsEditMonthModalOpen}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Mes</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nuevo periodo</label>
              <Input
                type="month"
                value={editMonthData}
                onChange={(e) => setEditMonthData(e.target.value)}
                placeholder="2024-01"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Cambiar el periodo moverá todos los gastos de{" "}
              <strong>{editingMonth && formatDate(editingMonth)}</strong> a{" "}
              <strong>{editMonthData && formatDate(editMonthData)}</strong>
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditMonthModalOpen(false);
                  setEditingMonth("");
                  setEditMonthData("");
                }}
              >
                Cancelar
              </Button>
              <Button onClick={handleUpdateMonth}>Actualizar</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal para agregar/editar gastos */}
      <AddExpenseModal
        open={showAddExpenseModal}
        onOpenChange={(open) => {
          setShowAddExpenseModal(open);
          if (!open) {
            setEditingExpense(null);
          }
        }}
        onAddExpense={addExpense}
        onUpdateExpense={updateExpense}
        categories={categories}
        editingExpense={editingExpense}
      />

      {/* Modal de confirmación para eliminar categoría */}
      <ConfirmationModal
        open={!!categoryToDelete}
        onOpenChange={() => setCategoryToDelete(null)}
        title="Eliminar Categoría"
        description="¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteCategory}
        loading={deletingCategory}
      />

      {/* Modal de confirmación para eliminar gasto */}
      <ConfirmationModal
        open={!!expenseToDelete}
        onOpenChange={() => setExpenseToDelete(null)}
        title="Eliminar Gasto"
        description="¿Estás seguro de que quieres eliminar este gasto? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
        variant="destructive"
        onConfirm={confirmDeleteExpense}
        loading={deletingExpense}
      />
    </div>
  );
}
