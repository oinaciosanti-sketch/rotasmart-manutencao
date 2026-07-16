import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RotaSmart Manutenção",
  description: "Planejamento inteligente de rotas de manutenção"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
