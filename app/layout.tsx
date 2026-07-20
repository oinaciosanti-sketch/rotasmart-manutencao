import type { Metadata } from "next";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "./components/AuthProvider";

export const metadata: Metadata = {
  title: "RotaSmart Manutenção",
  description: "Planejamento inteligente de rotas de manutenção"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
