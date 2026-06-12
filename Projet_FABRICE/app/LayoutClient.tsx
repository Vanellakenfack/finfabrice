"use client";

import { usePathname } from "next/navigation";
import Navbar from "./componets/nav/Navbar";
import Footer from "./componets/footer/Footer";

interface LayoutClientProps {
  children: React.ReactNode;
}

export default function LayoutClient({ children }: LayoutClientProps) {
  const pathname = usePathname();
  const noLayoutPages = ['/login', '/register', '/Dashbord', '/fournisseur', '/acheteur', '/verification'];
  const showLayout = !noLayoutPages.some(p => pathname === p || pathname.startsWith(p + '/'));

  return (
    <>
      {showLayout && <Navbar />}
      {children}
      {showLayout && <Footer />}
    </>
  );
}
