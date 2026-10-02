import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";

export const metadata: Metadata = {
  title: "Kiwi Latino | Working Holiday en Nueva Zelanda",
  description: "La comunidad latina del Working Holiday en Nueva Zelanda: compañeros de viaje, guías y consejos.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
