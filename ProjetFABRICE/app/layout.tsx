// app/layout.tsx
"use client"; // ← ajoute ceci tout en haut

import type { Metadata } from "next";
import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "./componets/nav/Navbar";
import Footer from "./componets/footer/Footer";
import { ReduxProvider } from "@/providers/ReduxProviders";
import { CartProvider } from "./Context/CartContext";
import { usePathname } from "next/navigation";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "600"],
});

import { AuthProvider } from "@/providers/AuthProvider";

// ...

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname(); // récupère le chemin actuel
  const isHomePage = pathname === "/"; // true seulement sur la page d’accueil

  return (
    <html lang="fr">
      <body className={`${inter.variable} ${poppins.variable} antialiased`}>
        <CartProvider>
          <ReduxProvider>
            <AuthProvider>
              {isHomePage && <Navbar />} {/* Navbar uniquement sur Home */}
              {children}
              {/**isHomePage && <Footer /> */} {/* Footer uniquement sur Home */}
            </AuthProvider>
          </ReduxProvider>
          <Footer/>
        </CartProvider>
      </body>
    </html>
  );
}
