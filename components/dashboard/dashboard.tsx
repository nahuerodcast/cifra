"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  PieChart,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useExpenses } from "@/hooks/useExpenses";
import { useCategories } from "@/hooks/useCategories";
import { motion } from "framer-motion";
import CountUp from "react-countup";

interface DashboardProps {
  onAddExpense: () => void;
}

export default function Dashboard({ onAddExpense }: DashboardProps) {
  const { user, userProfile, signOut, getAvatarUrl } = useAuth();
  const {
    expenses,
    currentMonth,
    loading: expensesLoading,
  } = useExpenses(user?.id);
  const { categories } = useCategories(user?.id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (monthKey: string) => {
    const date = new Date(monthKey + "-01");
    return date.toLocaleDateString("es-ES", {
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Ajustado al ancho del contenido */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl font-bold">Cifra</h1>
              <p className="text-xs text-muted-foreground">
                {formatDate(currentMonth)}
              </p>
            </div>
          </div>

          {/* Barra de búsqueda */}
          <div className="flex-1 max-w-md mx-4 hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar gastos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-2">
            <Button
              onClick={onAddExpense}
              size="sm"
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">Agregar Gasto</span>
            </Button>

            <ThemeToggle />

            {/* Avatar y menú */}
            <div className="flex items-center space-x-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={getAvatarUrl()} />
                <AvatarFallback>
                  {userProfile.nombre?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{userProfile.nombre}</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut()}
              className="text-muted-foreground hover:text-destructive"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-6">
        {/* Estadísticas principales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6"
        >
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
                  animate={{ width: `${Math.min(porcentajeSueldo, 100)}%` }}
                  transition={{ duration: 2, delay: 0.5 }}
                />
              </div>
            </CardContent>
          </Card>

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

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Categorías
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{categoryData.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {categories.length} disponibles
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Búsqueda móvil */}
        <div className="md:hidden mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Buscar gastos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Lista de gastos */}
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
                <h3 className="text-lg font-medium mb-2">No hay gastos</h3>
                <p className="text-muted-foreground mb-4">
                  {searchTerm
                    ? "No se encontraron gastos con ese término"
                    : "Comienza agregando tu primer gasto"}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={onAddExpense}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar Gasto
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredExpenses.slice(0, 10).map((expense) => (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                        <Wallet className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium">{expense.nombre}</h4>
                        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                          <Badge variant="outline" className="text-xs">
                            {expense.categoria}
                          </Badge>
                          <span>•</span>
                          <span>{expense.tipoGasto}</span>
                          <span>•</span>
                          <span>{expense.medioPago}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        -{formatCurrency(expense.importe)}
                      </p>
                      {expense.porcentajeSueldo && (
                        <p className="text-xs text-muted-foreground">
                          {expense.porcentajeSueldo.toFixed(1)}% del sueldo
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}

                {filteredExpenses.length > 10 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      Mostrando 10 de {filteredExpenses.length} gastos
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
