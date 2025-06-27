import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cifra - Control Financiero Personal",
  description:
    "Tu plata, bajo control. Gestiona tus gastos, ahorra más y toma mejores decisiones financieras.",
  keywords: [
    "finanzas",
    "gastos",
    "ahorro",
    "presupuesto",
    "dinero",
    "control financiero",
  ],
  authors: [{ name: "Cifra" }],
  creator: "Cifra",
  publisher: "Cifra",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
  generator: "v0.dev",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster
            position="top-right"
            expand={false}
            duration={3000}
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  "flex items-center gap-3 p-4 min-w-[300px] rounded-lg bg-[#18181b] text-white shadow-lg",
                title: "text-sm font-medium",
                success: "bg-[#18181b]",
                error: "bg-[#18181b]",
                actionButton: "bg-zinc-400",
                cancelButton: "bg-zinc-400",
                closeButton:
                  "absolute right-2 top-2 opacity-50 hover:opacity-100 transition-opacity",
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
