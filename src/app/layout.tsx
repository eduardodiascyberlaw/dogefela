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
  metadataBase: new URL("https://dogfella.pt"),
  title: {
    default: "Dog Fella | Creche Canina em Santo Tirso",
    template: "%s | Dog Fella",
  },
  description:
    "Creche canina em Santo Tirso. Creche diária, passeios, banho & tosa, hotel canino e adestramento. O melhor cuidado para o seu melhor amigo. Ambiente seguro e divertido!",
  keywords: [
    "creche canina",
    "creche canina Santo Tirso",
    "dog daycare",
    "passeios caninos",
    "banho e tosa",
    "hotel canino",
    "hotel para cães",
    "adestramento canino",
    "dog sitting",
    "Santo Tirso",
    "Dog Fella",
    "cuidado canino",
    "daycare para cães",
  ],
  manifest: "/manifest.json",
  alternates: {
    canonical: "https://dogfella.pt",
  },
  openGraph: {
    title: "Dog Fella — Creche Canina em Santo Tirso",
    description:
      "A Segunda Casa do Seu Melhor Amigo. Creche diária, passeios, banho & tosa, hotel canino e adestramento em Santo Tirso.",
    type: "website",
    url: "https://dogfella.pt",
    siteName: "Dog Fella",
    locale: "pt_PT",
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "Dog Fella - Creche Canina em Santo Tirso",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Dog Fella — Creche Canina em Santo Tirso",
    description:
      "A Segunda Casa do Seu Melhor Amigo. Creche, passeios, hotel canino e mais em Santo Tirso.",
    images: ["/opengraph-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  other: {
    "geo.region": "PT-13",
    "geo.placename": "Santo Tirso",
    "geo.position": "41.3431;-8.4775",
    ICBM: "41.3431, -8.4775",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "LocalBusiness",
      "@id": "https://dogfella.pt/#business",
      name: "Dog Fella",
      alternateName: "Dog Fella - Creche Canina",
      description:
        "Creche canina em Santo Tirso. Creche diária, passeios, banho & tosa, hotel canino e adestramento.",
      url: "https://dogfella.pt",
      telephone: "+351910122469",
      email: "dogfella.pt@gmail.com",
      image: "https://dogfella.pt/images/logo.png",
      logo: "https://dogfella.pt/images/logo.png",
      priceRange: "€€",
      currenciesAccepted: "EUR",
      paymentAccepted: "Cash, Credit Card, MBWay",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Rua Varziela, 72",
        addressLocality: "Santo Tirso",
        postalCode: "4780-560",
        addressCountry: "PT",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 41.3431,
        longitude: -8.4775,
      },
      openingHoursSpecification: [
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: [
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
          ],
          opens: "07:30",
          closes: "20:00",
        },
        {
          "@type": "OpeningHoursSpecification",
          dayOfWeek: "Saturday",
          opens: "09:00",
          closes: "13:00",
        },
      ],
      sameAs: ["https://instagram.com/dogfella.pt"],
      areaServed: {
        "@type": "City",
        name: "Santo Tirso",
      },
    },
    {
      "@type": "WebSite",
      "@id": "https://dogfella.pt/#website",
      url: "https://dogfella.pt",
      name: "Dog Fella",
      publisher: { "@id": "https://dogfella.pt/#business" },
      inLanguage: "pt-PT",
    },
    {
      "@type": "Service",
      name: "Creche Canina",
      description:
        "O seu cão passa o dia a brincar, socializar e a ser acompanhado por profissionais dedicados. Ambiente seguro e divertido!",
      provider: { "@id": "https://dogfella.pt/#business" },
      areaServed: "Santo Tirso",
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: "15",
        description: "Dia inteiro de creche canina",
      },
    },
    {
      "@type": "Service",
      name: "Passeios Caninos",
      description:
        "Passeios individuais ou em grupo pela natureza. O seu patudo gasta energia e volta feliz para casa!",
      provider: { "@id": "https://dogfella.pt/#business" },
      areaServed: "Santo Tirso",
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: "6",
        description: "Passeio em grupo",
      },
    },
    {
      "@type": "Service",
      name: "Banho & Tosa",
      description:
        "Serviço de parceiro certificado. O seu cão fica limpinho, cheiroso e com um look impecável!",
      provider: { "@id": "https://dogfella.pt/#business" },
      areaServed: "Santo Tirso",
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: "12",
        description: "Banho canino",
      },
    },
    {
      "@type": "Service",
      name: "Hotel Canino",
      description:
        "Vai de férias? O seu melhor amigo fica connosco! Pernoitas com acompanhamento 24h e muito mimo.",
      provider: { "@id": "https://dogfella.pt/#business" },
      areaServed: "Santo Tirso",
      offers: {
        "@type": "Offer",
        priceCurrency: "EUR",
        price: "20",
        description: "Pernoita com acompanhamento 24h",
      },
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt" className="scroll-smooth">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className={`${josefinSans.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
