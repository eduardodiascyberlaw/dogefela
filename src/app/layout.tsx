import type { Metadata } from "next";
import { Josefin_Sans } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const josefinSans = Josefin_Sans({
  variable: "--font-josefin",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Dog Fella | Creche Canina — Santo Tirso",
  description:
    "Creche canina em Santo Tirso. Creche, passeios, banho & tosa, hotel canino e adestramento. O melhor cuidado para o seu melhor amigo.",
  keywords: [
    "creche canina",
    "dog daycare",
    "passeios",
    "banho tosa",
    "hotel canino",
    "Santo Tirso",
    "Dog Fella",
  ],
  openGraph: {
    title: "Dog Fella — Creche Canina",
    description: "A Segunda Casa do Seu Melhor Amigo",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className="scroll-smooth">
      <body className={`${josefinSans.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
