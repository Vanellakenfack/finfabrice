"use client";

import { usePathname } from "next/navigation";
import Navbar from "./componets/nav/Navbar";
import Footer from "./componets/footer/Footer";

interface LayoutClientProps {
  children: React.ReactNode;
}

export default function LayoutClient({ children }: LayoutClientProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  return (
    <>
      {isHomePage && <Navbar />}
      {children}
      {isHomePage && <Footer />}
    </>
  );
}
