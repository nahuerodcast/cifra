"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis, CartesianGrid } from "recharts"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Wallet,
  Plus,
  CreditCard,
  Banknote,
  ArrowRightLeft,
  Home,
  Car,
  ShoppingCart,
  Utensils,
  Heart,
  Gamepad2,
  GraduationCap,
  Shirt,
  Settings,
  LogOut,
  BarChart3,
  Edit,
  Trash2,
  Search,
  Upload,
  Download,
  Tags,
  Activity,
  Menu,
  X,
  TrendingUp,
  TrendingDown,
  Calendar,
  CalendarPlus,
} from "lucide-react"

interface Expense {
  id: string
  nombre: string
  categoria: string
  importe: number
  porcentajeSueldo?: number
  tipoGasto: "Fijo" | "Variable" | "Cuotas" | "Única vez"
  medioPago: "Tarjeta" | "Cash" | "Transferencia"
  cuotas?: number
  fechaCreacion: string
}

interface User {
  nombre: string
  sueldo: number
  tipoSueldo: "Fijo" | "Variable"
  configurado: boolean
}

interface Category {
  id: string
  name: string
  icon: string
  color: string
}

const DEFAULT_CATEGORIES = [
  { id: "1", name: "Vivienda", icon: "Home", color: "#3b82f6" },
  { id: "2", name: "Transporte", icon: "Car", color: "#64748b" },
  { id: "3", name: "Alimentación", icon: "Utensils", color: "#6b7280" },
  { id: "4", name: "Salud", icon: "Heart", color: "#9ca3af" },
  { id: "5", name: "Entretenimiento", icon: "Gamepad2", color: "#d1d5db" },
  { id: "6", name: "Educación", icon: "GraduationCap", color: "#3b82f6" },
  { id: "7", name: "Ropa", icon: "Shirt", color: "#64748b" },
  { id: "8", name: "Servicios", icon: "ShoppingCart", color: "#6b7280" },
  { id: "9", name: "Otros", icon: "Wallet", color: "#9ca3af" },
]

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
}

const CHART_COLORS = ["#3b82f6", "#64748b", "#6b7280", "#9ca3af", "#d1d5db", "#f3f4f6"]

export default function CifraApp() {
  const [currentScreen, setCurrentScreen] = useState<"landing" | "setup" | "dashboard">("landing")
  const [currentSection, setCurrentSection] = useState<"overview" | "months" | "categories" | "settings">("overview")
  const [user, setUser] = useState<User | null>(null)
  const [userName, setUserName] = useState("")
  const [setupData, setSetupData] = useState({
    sueldo: "",
    tipoSueldo: "Fijo" as "Fijo" | "Variable",
  })
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATEGORIES)
  const [currentMonth, setCurrentMonth] = useState("")
  const [availableMonths, setAvailableMonths] = useState<string[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newExpense, setNewExpense] = useState({
    nombre: "",
    categoria: "",
    importe: "",
    tipoGasto: "",
    medioPago: "",
    cuotas: "",
  })

  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editExpenseData, setEditExpenseData] = useState({
    nombre: "",
    categoria: "",
    importe: "",
    tipoGasto: "",
    medioPago: "",
    cuotas: "",
  })

  // Estados para CRUD de categorías
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryFormData, setCategoryFormData] = useState({
    name: "",
    icon: "Wallet",
    color: "#64748b",
  })

  // Estados para gestión de meses
  const [isNewMonthModalOpen, setIsNewMonthModalOpen] = useState(false)
  const [newMonthData, setNewMonthData] = useState("")

  // Inicializar datos al cargar
  useEffect(() => {
    const savedUser = localStorage.getItem("cifra-user")
    const savedCategories = localStorage.getItem("cifra-categories")
    const currentMonthKey = new Date().toISOString().slice(0, 7)
    setCurrentMonth(currentMonthKey)
    loadAvailableMonths()

    if (savedCategories) {
      setCategories(JSON.parse(savedCategories))
    }

    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)

      if (!userData.configurado) {
        setCurrentScreen("setup")
      } else {
        setCurrentScreen("dashboard")
        loadExpenses(currentMonthKey)
      }
    }
  }, [])

  const loadAvailableMonths = () => {
    const keys = Object.keys(localStorage)
    const months = keys
      .filter((key) => key.startsWith("cifra-expenses-"))
      .map((key) => key.replace("cifra-expenses-", ""))
      .sort()
      .reverse()

    const currentMonthKey = new Date().toISOString().slice(0, 7)
    if (!months.includes(currentMonthKey)) {
      months.unshift(currentMonthKey)
    }

    setAvailableMonths(months)
  }

  const loadExpenses = (monthKey: string) => {
    const savedExpenses = localStorage.getItem(`cifra-expenses-${monthKey}`)
    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses))
    } else {
      setExpenses([])
    }
  }

  const saveExpenses = (expensesToSave: Expense[], monthKey: string) => {
    localStorage.setItem(`cifra-expenses-${monthKey}`, JSON.stringify(expensesToSave))
    loadAvailableMonths()
  }

  const saveCategories = (categoriesToSave: Category[]) => {
    setCategories(categoriesToSave)
    localStorage.setItem("cifra-categories", JSON.stringify(categoriesToSave))
  }

  const handleStartApp = () => {
    if (userName.trim()) {
      const userData: User = {
        nombre: userName.trim(),
        sueldo: 0,
        tipoSueldo: "Fijo",
        configurado: false,
      }
      setUser(userData)
      localStorage.setItem("cifra-user", JSON.stringify(userData))
      setCurrentScreen("setup")
    }
  }

  const handleCompleteSetup = () => {
    if (user && setupData.sueldo) {
      const updatedUser: User = {
        ...user,
        sueldo: Number.parseFloat(setupData.sueldo),
        tipoSueldo: setupData.tipoSueldo,
        configurado: true,
      }
      setUser(updatedUser)
      localStorage.setItem("cifra-user", JSON.stringify(updatedUser))
      setCurrentScreen("dashboard")
      loadExpenses(currentMonth)
    }
  }

  const handleLogout = () => {
    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith("cifra-")) {
        localStorage.removeItem(key)
      }
    })

    setUser(null)
    setUserName("")
    setExpenses([])
    setCurrentScreen("landing")
  }

  const handleAddExpense = () => {
    if (
      newExpense.nombre &&
      newExpense.categoria &&
      newExpense.importe &&
      newExpense.tipoGasto &&
      newExpense.medioPago
    ) {
      const importe = Number.parseFloat(newExpense.importe)
      const porcentajeSueldo = user?.sueldo ? (importe / user.sueldo) * 100 : undefined

      const expense: Expense = {
        id: Date.now().toString(),
        nombre: newExpense.nombre,
        categoria: newExpense.categoria,
        importe,
        porcentajeSueldo,
        tipoGasto: newExpense.tipoGasto as any,
        medioPago: newExpense.medioPago as any,
        cuotas: newExpense.cuotas ? Number.parseInt(newExpense.cuotas) : undefined,
        fechaCreacion: new Date().toISOString(),
      }

      const updatedExpenses = [...expenses, expense]
      setExpenses(updatedExpenses)
      saveExpenses(updatedExpenses, currentMonth)

      setNewExpense({
        nombre: "",
        categoria: "",
        importe: "",
        tipoGasto: "",
        medioPago: "",
        cuotas: "",
      })
      setIsModalOpen(false)
    }
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setEditExpenseData({
      nombre: expense.nombre,
      categoria: expense.categoria,
      importe: expense.importe.toString(),
      tipoGasto: expense.tipoGasto,
      medioPago: expense.medioPago,
      cuotas: expense.cuotas?.toString() || "",
    })
    setIsEditModalOpen(true)
  }

  const handleUpdateExpense = () => {
    if (
      editingExpense &&
      editExpenseData.nombre &&
      editExpenseData.categoria &&
      editExpenseData.importe &&
      editExpenseData.tipoGasto &&
      editExpenseData.medioPago
    ) {
      const importe = Number.parseFloat(editExpenseData.importe)
      const porcentajeSueldo = user?.sueldo ? (importe / user.sueldo) * 100 : undefined

      const updatedExpense: Expense = {
        ...editingExpense,
        nombre: editExpenseData.nombre,
        categoria: editExpenseData.categoria,
        importe,
        porcentajeSueldo,
        tipoGasto: editExpenseData.tipoGasto as any,
        medioPago: editExpenseData.medioPago as any,
        cuotas: editExpenseData.cuotas ? Number.parseInt(editExpenseData.cuotas) : undefined,
      }

      const updatedExpenses = expenses.map((exp) => (exp.id === editingExpense.id ? updatedExpense : exp))
      setExpenses(updatedExpenses)
      saveExpenses(updatedExpenses, currentMonth)

      setEditingExpense(null)
      setEditExpenseData({
        nombre: "",
        categoria: "",
        importe: "",
        tipoGasto: "",
        medioPago: "",
        cuotas: "",
      })
      setIsEditModalOpen(false)
    }
  }

  const handleDeleteExpense = (expenseId: string) => {
    const updatedExpenses = expenses.filter((exp) => exp.id !== expenseId)
    setExpenses(updatedExpenses)
    saveExpenses(updatedExpenses, currentMonth)
  }

  const handleMonthChange = (monthKey: string) => {
    setCurrentMonth(monthKey)
    loadExpenses(monthKey)
  }

  const handleKeyPress = (e: React.KeyboardEvent, action: () => void) => {
    if (e.key === "Enter") {
      e.preventDefault()
      action()
    }
  }

  // Gestión de meses
  const handleCreateNewMonth = () => {
    if (newMonthData) {
      const monthKey = newMonthData
      if (!availableMonths.includes(monthKey)) {
        localStorage.setItem(`cifra-expenses-${monthKey}`, JSON.stringify([]))
        loadAvailableMonths()
        setCurrentMonth(monthKey)
        loadExpenses(monthKey)
      }
      setNewMonthData("")
      setIsNewMonthModalOpen(false)
    }
  }

  // CRUD Categorías
  const handleAddCategory = () => {
    if (categoryFormData.name) {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: categoryFormData.name,
        icon: categoryFormData.icon,
        color: categoryFormData.color,
      }
      const updatedCategories = [...categories, newCategory]
      saveCategories(updatedCategories)
      setCategoryFormData({ name: "", icon: "Wallet", color: "#64748b" })
      setIsCategoryModalOpen(false)
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setCategoryFormData({
      name: category.name,
      icon: category.icon,
      color: category.color,
    })
    setIsCategoryModalOpen(true)
  }

  const handleUpdateCategory = () => {
    if (editingCategory && categoryFormData.name) {
      const updatedCategory: Category = {
        ...editingCategory,
        name: categoryFormData.name,
        icon: categoryFormData.icon,
        color: categoryFormData.color,
      }
      const updatedCategories = categories.map((cat) => (cat.id === editingCategory.id ? updatedCategory : cat))
      saveCategories(updatedCategories)
      setEditingCategory(null)
      setCategoryFormData({ name: "", icon: "Wallet", color: "#64748b" })
      setIsCategoryModalOpen(false)
    }
  }

  const handleDeleteCategory = (categoryId: string) => {
    const updatedCategories = categories.filter((cat) => cat.id !== categoryId)
    saveCategories(updatedCategories)
  }

  const exportToCSV = () => {
    const allData = {
      user,
      categories,
      expenses: {},
    }

    const keys = Object.keys(localStorage)
    keys.forEach((key) => {
      if (key.startsWith("cifra-expenses-")) {
        const month = key.replace("cifra-expenses-", "")
        const monthExpenses = localStorage.getItem(key)
        if (monthExpenses) {
          allData.expenses[month] = JSON.parse(monthExpenses)
        }
      }
    })

    const dataStr = JSON.stringify(allData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `cifra-backup-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importFromCSV = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)

        if (data.user) {
          setUser(data.user)
          localStorage.setItem("cifra-user", JSON.stringify(data.user))
        }

        if (data.categories) {
          setCategories(data.categories)
          localStorage.setItem("cifra-categories", JSON.stringify(data.categories))
        }

        if (data.expenses) {
          Object.keys(data.expenses).forEach((month) => {
            localStorage.setItem(`cifra-expenses-${month}`, JSON.stringify(data.expenses[month]))
          })
          loadAvailableMonths()
          loadExpenses(currentMonth)
        }

        alert("Datos importados correctamente!")
      } catch (error) {
        alert("Error al importar los datos. Verifica que el archivo sea válido.")
      }
    }
    reader.readAsText(file)
  }

  // Cálculos básicos
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.importe, 0)
  const porcentajeGastado = user?.sueldo ? (totalExpenses / user.sueldo) * 100 : 0
  const ahorroEstimado = user?.sueldo ? user.sueldo - totalExpenses : 0

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.categoria.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Datos para gráficos - ARREGLADOS DEFINITIVAMENTE
  const categoryChartData = categories
    .map((cat) => {
      const total = expenses.filter((e) => e.categoria === cat.name).reduce((sum, e) => sum + e.importe, 0)
      return {
        name: cat.name,
        value: total,
        fill: cat.color,
      }
    })
    .filter((item) => item.value > 0)

  const monthlyChartData = availableMonths
    .slice(0, 6)
    .reverse()
    .map((month) => {
      const monthExpenses = localStorage.getItem(`cifra-expenses-${month}`)
      const monthData = monthExpenses ? JSON.parse(monthExpenses) : []
      const total = monthData.reduce((sum: number, exp: Expense) => sum + exp.importe, 0)
      return {
        month: new Date(month + "-01").toLocaleDateString("es-ES", { month: "short" }),
        gastos: total,
        ingresos: user?.sueldo || 0,
      }
    })

  // PANTALLA LANDING
  if (currentScreen === "landing") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-sm border bg-card">
            <CardHeader className="text-center space-y-4 pb-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
                className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center"
              >
                <BarChart3 className="w-8 h-8 text-primary-foreground" />
              </motion.div>
              <div>
                <CardTitle className="text-3xl font-bold">Cifra</CardTitle>
                <CardDescription className="text-base">Tu plata, bajo control.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="name" className="text-sm font-medium">
                  ¿Cómo te llamas?
                </Label>
                <Input
                  id="name"
                  placeholder="Tu nombre"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="h-12"
                  onKeyPress={(e) => handleKeyPress(e, handleStartApp)}
                />
              </div>

              <Button onClick={handleStartApp} className="w-full h-12 font-medium" disabled={!userName.trim()}>
                Empezar con Cifra
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // PANTALLA SETUP
  if (currentScreen === "setup") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-sm border bg-card">
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Settings className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">¡Hola, {user?.nombre}!</CardTitle>
                <CardDescription>Configuremos tu perfil financiero</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label htmlFor="salary" className="text-sm font-medium">
                  ¿Cuál es tu sueldo mensual?
                </Label>
                <Input
                  id="salary"
                  type="number"
                  placeholder="50000"
                  value={setupData.sueldo}
                  onChange={(e) => setSetupData({ ...setupData, sueldo: e.target.value })}
                  className="h-12"
                  onKeyPress={(e) => handleKeyPress(e, handleCompleteSetup)}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-sm font-medium">Tipo de sueldo</Label>
                <Select
                  value={setupData.tipoSueldo}
                  onValueChange={(value: "Fijo" | "Variable") => setSetupData({ ...setupData, tipoSueldo: value })}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Fijo">Sueldo Fijo</SelectItem>
                    <SelectItem value="Variable">Sueldo Variable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={handleCompleteSetup}
                className="w-full h-12 font-medium"
                disabled={!setupData.sueldo || setupData.sueldo === "" || Number.parseFloat(setupData.sueldo) <= 0}
              >
                Continuar
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // DASHBOARD PRINCIPAL
  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-200 ease-in-out ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">Cifra</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(false)} className="lg:hidden">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <nav className="p-4 space-y-1">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Menu</div>
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
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm">
                {user?.nombre?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nombre}</p>
              <p className="text-xs text-muted-foreground">Sueldo {user?.tipoSueldo}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full text-muted-foreground hover:text-destructive"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      {/* Overlay para móvil */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Contenido principal */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setIsSidebarOpen(true)} className="lg:hidden">
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold">
                  {currentSection === "overview" && "Overview"}
                  {currentSection === "months" && "Meses"}
                  {currentSection === "categories" && "Categorías"}
                  {currentSection === "settings" && "Configuración"}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {new Date().toLocaleDateString("es-ES", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64 h-9"
                />
              </div>

              <input type="file" accept=".json" onChange={importFromCSV} className="hidden" id="import-file" />
              <Button variant="outline" size="sm" onClick={() => document.getElementById("import-file")?.click()}>
                <Upload className="w-4 h-4 mr-2" />
                Import
              </Button>
              <Button variant="outline" size="sm" onClick={exportToCSV}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Contenido de las secciones */}
        <main className="p-6">
          {currentSection === "overview" && (
            <div className="space-y-6">
              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Ahorro Estimado</p>
                      <p className="text-2xl font-bold mt-1">${ahorroEstimado.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {user?.sueldo ? ((ahorroEstimado / user.sueldo) * 100).toFixed(1) : 0}% del sueldo
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Gastos del Mes</p>
                      <Select value={currentMonth} onValueChange={handleMonthChange}>
                        <SelectTrigger className="w-auto h-auto p-1 border-0 bg-transparent text-xs">
                          <SelectValue>
                            {new Date(currentMonth + "-01").toLocaleDateString("es-ES", {
                              month: "short",
                              year: "2-digit",
                            })}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {availableMonths.map((month) => (
                            <SelectItem key={month} value={month}>
                              {new Date(month + "-01").toLocaleDateString("es-ES", { month: "long", year: "numeric" })}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <p className="text-2xl font-bold">${totalExpenses.toLocaleString()}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {porcentajeGastado > 50 ? (
                        <TrendingUp className="w-3 h-3 text-red-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-green-500" />
                      )}
                      <p className="text-xs text-muted-foreground">{porcentajeGastado.toFixed(1)}% del sueldo</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border shadow-sm bg-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-muted-foreground">Ingresos</p>
                    </div>
                    <p className="text-2xl font-bold">${user?.sueldo.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground mt-1">Sueldo {user?.tipoSueldo}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Gráficos - ARREGLADOS DEFINITIVAMENTE */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border shadow-sm bg-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Cashflow</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {monthlyChartData.length > 1 ? (
                      <ChartContainer
                        config={{
                          gastos: {
                            label: "Gastos",
                            color: "hsl(var(--chart-1))",
                          },
                          ingresos: {
                            label: "Ingresos",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={monthlyChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                              type="monotone"
                              dataKey="ingresos"
                              stackId="1"
                              stroke="var(--color-ingresos)"
                              fill="var(--color-ingresos)"
                              fillOpacity={0.3}
                            />
                            <Area
                              type="monotone"
                              dataKey="gastos"
                              stackId="1"
                              stroke="var(--color-gastos)"
                              fill="var(--color-gastos)"
                              fillOpacity={0.3}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Activity className="mx-auto h-12 w-12 opacity-50" />
                          <p className="mt-2">No hay suficientes datos</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="border shadow-sm bg-card">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-lg font-semibold">Gastos por Categoría</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {categoryChartData.length > 0 ? (
                      <ChartContainer
                        config={{
                          value: {
                            label: "Importe",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={categoryChartData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              dataKey="value"
                            >
                              {categoryChartData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <ChartTooltip content={<ChartTooltipContent />} />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    ) : (
                      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <BarChart3 className="mx-auto h-12 w-12 opacity-50" />
                          <p className="mt-2">No hay datos para mostrar</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Botón agregar gasto */}
              <div className="flex justify-end">
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Agregar Gasto
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Agregar Nuevo Gasto</DialogTitle>
                      <DialogDescription>Completa los datos del gasto que quieres registrar</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="expense-name">Nombre</Label>
                        <Input
                          id="expense-name"
                          placeholder="Ej: Supermercado"
                          value={newExpense.nombre}
                          onChange={(e) => setNewExpense({ ...newExpense, nombre: e.target.value })}
                          onKeyPress={(e) => handleKeyPress(e, handleAddExpense)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category">Categoría</Label>
                        <Select
                          value={newExpense.categoria}
                          onValueChange={(value) => setNewExpense({ ...newExpense, categoria: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona una categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((cat) => (
                              <SelectItem key={cat.id} value={cat.name}>
                                {cat.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="amount">Importe</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          value={newExpense.importe}
                          onChange={(e) => setNewExpense({ ...newExpense, importe: e.target.value })}
                          onKeyPress={(e) => handleKeyPress(e, handleAddExpense)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="expense-type">Tipo de Gasto</Label>
                        <Select
                          value={newExpense.tipoGasto}
                          onValueChange={(value) => setNewExpense({ ...newExpense, tipoGasto: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Fijo">Fijo</SelectItem>
                            <SelectItem value="Variable">Variable</SelectItem>
                            <SelectItem value="Cuotas">Cuotas</SelectItem>
                            <SelectItem value="Única vez">Única vez</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {newExpense.tipoGasto === "Cuotas" && (
                        <div>
                          <Label htmlFor="installments">Número de Cuotas</Label>
                          <Input
                            id="installments"
                            type="number"
                            placeholder="12"
                            value={newExpense.cuotas}
                            onChange={(e) => setNewExpense({ ...newExpense, cuotas: e.target.value })}
                            onKeyPress={(e) => handleKeyPress(e, handleAddExpense)}
                          />
                        </div>
                      )}
                      <div>
                        <Label htmlFor="payment-method">Medio de Pago</Label>
                        <Select
                          value={newExpense.medioPago}
                          onValueChange={(value) => setNewExpense({ ...newExpense, medioPago: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el medio" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                            <SelectItem value="Cash">Cash</SelectItem>
                            <SelectItem value="Transferencia">Transferencia</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={handleAddExpense} className="w-full">
                        Agregar Gasto
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* TABLA DE ACTIVIDAD RECIENTE - ESTILO PROFESIONAL */}
              <Card className="border shadow-sm bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Actividad Reciente</CardTitle>
                </CardHeader>
                <CardContent>
                  {filteredExpenses.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Wallet className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">No hay gastos registrados</p>
                      <p className="text-sm">¡Agregá tu primer gasto para comenzar!</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Gasto</TableHead>
                          <TableHead>Categoría</TableHead>
                          <TableHead>Tipo</TableHead>
                          <TableHead>Medio de Pago</TableHead>
                          <TableHead>Fecha</TableHead>
                          <TableHead className="text-right">Importe</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredExpenses.slice(0, 10).map((expense) => {
                          const IconComponent =
                            CATEGORY_ICONS[expense.categoria as keyof typeof CATEGORY_ICONS] || Wallet
                          return (
                            <TableRow key={expense.id}>
                              <TableCell>
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center">
                                    <IconComponent className="w-4 h-4" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{expense.nombre}</p>
                                    {expense.cuotas && (
                                      <p className="text-xs text-muted-foreground">{expense.cuotas} cuotas</p>
                                    )}
                                  </div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="secondary">{expense.categoria}</Badge>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{expense.tipoGasto}</Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  {expense.medioPago === "Tarjeta" && <CreditCard className="w-4 h-4" />}
                                  {expense.medioPago === "Cash" && <Banknote className="w-4 h-4" />}
                                  {expense.medioPago === "Transferencia" && <ArrowRightLeft className="w-4 h-4" />}
                                  <span className="text-sm">{expense.medioPago}</span>
                                </div>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(expense.fechaCreacion).toLocaleDateString("es-ES")}
                              </TableCell>
                              <TableCell className="text-right">
                                <div>
                                  <p className="font-semibold">-${expense.importe.toLocaleString()}</p>
                                  {expense.porcentajeSueldo && (
                                    <p className="text-xs text-muted-foreground">
                                      {expense.porcentajeSueldo.toFixed(1)}% sueldo
                                    </p>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex gap-1 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditExpense(expense)}
                                    className="h-8 w-8 p-0"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteExpense(expense.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          )
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentSection === "months" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Historial por Meses</h2>
                  <p className="text-sm text-muted-foreground">Revisa tus gastos mes a mes</p>
                </div>
                <Dialog open={isNewMonthModalOpen} onOpenChange={setIsNewMonthModalOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <CalendarPlus className="w-4 h-4 mr-2" />
                      Nuevo Mes
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Crear Nuevo Mes</DialogTitle>
                      <DialogDescription>Selecciona el mes que quieres crear para registrar gastos</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-month">Mes</Label>
                        <Input
                          id="new-month"
                          type="month"
                          value={newMonthData}
                          onChange={(e) => setNewMonthData(e.target.value)}
                          onKeyPress={(e) => handleKeyPress(e, handleCreateNewMonth)}
                        />
                      </div>
                      <Button onClick={handleCreateNewMonth} className="w-full">
                        Crear Mes
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableMonths.map((month) => {
                  const monthExpenses = localStorage.getItem(`cifra-expenses-${month}`)
                  const monthData = monthExpenses ? JSON.parse(monthExpenses) : []
                  const total = monthData.reduce((sum: number, exp: Expense) => sum + exp.importe, 0)
                  const count = monthData.length

                  return (
                    <Card
                      key={month}
                      className={`border shadow-sm bg-card hover:shadow-md transition-shadow cursor-pointer ${month === currentMonth ? "ring-2 ring-primary" : ""}`}
                      onClick={() => {
                        setCurrentMonth(month)
                        loadExpenses(month)
                        setCurrentSection("overview")
                      }}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            <h3 className="font-semibold">
                              {new Date(month + "-01").toLocaleDateString("es-ES", {
                                month: "long",
                                year: "numeric",
                              })}
                            </h3>
                          </div>
                          {month === currentMonth && <Badge>Actual</Badge>}
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Total gastado:</span>
                            <span className="font-semibold">${total.toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">Gastos registrados:</span>
                            <span className="text-sm">{count}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-muted-foreground">% del sueldo:</span>
                            <span className="text-sm">
                              {user?.sueldo ? ((total / user.sueldo) * 100).toFixed(1) : 0}%
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {currentSection === "categories" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-semibold">Gestión de Categorías</h2>
                  <p className="text-sm text-muted-foreground">Administra las categorías de gastos disponibles</p>
                </div>
                <Dialog open={isCategoryModalOpen} onOpenChange={setIsCategoryModalOpen}>
                  <DialogTrigger asChild>
                    <Button
                      onClick={() => {
                        setEditingCategory(null)
                        setCategoryFormData({ name: "", icon: "Wallet", color: "#64748b" })
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva Categoría
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>{editingCategory ? "Editar Categoría" : "Nueva Categoría"}</DialogTitle>
                      <DialogDescription>
                        {editingCategory ? "Modifica los datos de la categoría" : "Crea una nueva categoría de gastos"}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="category-name">Nombre</Label>
                        <Input
                          id="category-name"
                          placeholder="Ej: Entretenimiento"
                          value={categoryFormData.name}
                          onChange={(e) => setCategoryFormData({ ...categoryFormData, name: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="category-icon">Icono</Label>
                        <Select
                          value={categoryFormData.icon}
                          onValueChange={(value) => setCategoryFormData({ ...categoryFormData, icon: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(CATEGORY_ICONS).map((iconName) => (
                              <SelectItem key={iconName} value={iconName}>
                                {iconName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={editingCategory ? handleUpdateCategory : handleAddCategory} className="w-full">
                        {editingCategory ? "Actualizar" : "Crear"} Categoría
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {categories.map((category) => {
                  const IconComponent = CATEGORY_ICONS[category.icon as keyof typeof CATEGORY_ICONS] || Wallet
                  const expenseCount = expenses.filter((e) => e.categoria === category.name).length
                  return (
                    <Card key={category.id} className="border shadow-sm bg-card hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-muted rounded-lg flex items-center justify-center">
                              <IconComponent className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-medium">{category.name}</h3>
                              <p className="text-sm text-muted-foreground">{expenseCount} gastos</p>
                            </div>
                          </div>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCategory(category)}
                              className="h-8 w-8 p-0"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCategory(category.id)}
                              className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                              disabled={expenseCount > 0}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {currentSection === "settings" && (
            <div className="space-y-6">
              <Card className="border shadow-sm bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Configuración de Usuario</CardTitle>
                  <CardDescription>Actualiza tu información personal y financiera</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="settings-name">Nombre</Label>
                    <Input
                      id="settings-name"
                      value={user?.nombre || ""}
                      onChange={(e) => {
                        if (user) {
                          const updatedUser = { ...user, nombre: e.target.value }
                          setUser(updatedUser)
                          localStorage.setItem("cifra-user", JSON.stringify(updatedUser))
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label htmlFor="settings-salary">Sueldo mensual</Label>
                    <Input
                      id="settings-salary"
                      type="number"
                      value={user?.sueldo || ""}
                      onChange={(e) => {
                        if (user) {
                          const updatedUser = { ...user, sueldo: Number.parseFloat(e.target.value) || 0 }
                          setUser(updatedUser)
                          localStorage.setItem("cifra-user", JSON.stringify(updatedUser))
                        }
                      }}
                    />
                  </div>
                  <div>
                    <Label>Tipo de sueldo</Label>
                    <Select
                      value={user?.tipoSueldo || "Fijo"}
                      onValueChange={(value: "Fijo" | "Variable") => {
                        if (user) {
                          const updatedUser = { ...user, tipoSueldo: value }
                          setUser(updatedUser)
                          localStorage.setItem("cifra-user", JSON.stringify(updatedUser))
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fijo">Sueldo Fijo</SelectItem>
                        <SelectItem value="Variable">Sueldo Variable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card className="border shadow-sm bg-card">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Datos y Respaldo</CardTitle>
                  <CardDescription>Exporta o importa todos tus datos para mantener un respaldo seguro</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <Button onClick={exportToCSV} className="flex-1" variant="outline">
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Datos
                    </Button>
                    <Button
                      onClick={() => document.getElementById("import-file")?.click()}
                      className="flex-1"
                      variant="outline"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Importar Datos
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    El archivo incluye todos tus gastos, configuraciones y categorías personalizadas.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>

      {/* Modal de Edición */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Gasto</DialogTitle>
            <DialogDescription>Modifica los datos del gasto</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-expense-name">Nombre</Label>
              <Input
                id="edit-expense-name"
                placeholder="Ej: Supermercado"
                value={editExpenseData.nombre}
                onChange={(e) => setEditExpenseData({ ...editExpenseData, nombre: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, handleUpdateExpense)}
              />
            </div>
            <div>
              <Label htmlFor="edit-category">Categoría</Label>
              <Select
                value={editExpenseData.categoria}
                onValueChange={(value) => setEditExpenseData({ ...editExpenseData, categoria: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.name}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="edit-amount">Importe</Label>
              <Input
                id="edit-amount"
                type="number"
                placeholder="0.00"
                value={editExpenseData.importe}
                onChange={(e) => setEditExpenseData({ ...editExpenseData, importe: e.target.value })}
                onKeyPress={(e) => handleKeyPress(e, handleUpdateExpense)}
              />
            </div>
            <div>
              <Label htmlFor="edit-expense-type">Tipo de Gasto</Label>
              <Select
                value={editExpenseData.tipoGasto}
                onValueChange={(value) => setEditExpenseData({ ...editExpenseData, tipoGasto: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Fijo">Fijo</SelectItem>
                  <SelectItem value="Variable">Variable</SelectItem>
                  <SelectItem value="Cuotas">Cuotas</SelectItem>
                  <SelectItem value="Única vez">Única vez</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {editExpenseData.tipoGasto === "Cuotas" && (
              <div>
                <Label htmlFor="edit-installments">Número de Cuotas</Label>
                <Input
                  id="edit-installments"
                  type="number"
                  placeholder="12"
                  value={editExpenseData.cuotas}
                  onChange={(e) => setEditExpenseData({ ...editExpenseData, cuotas: e.target.value })}
                  onKeyPress={(e) => handleKeyPress(e, handleUpdateExpense)}
                />
              </div>
            )}
            <div>
              <Label htmlFor="edit-payment-method">Medio de Pago</Label>
              <Select
                value={editExpenseData.medioPago}
                onValueChange={(value) => setEditExpenseData({ ...editExpenseData, medioPago: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el medio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tarjeta">Tarjeta</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Transferencia">Transferencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={handleUpdateExpense} className="flex-1">
                Guardar Cambios
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
