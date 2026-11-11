import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, Inter, Zilla_Slab } from "next/font/google";
import { Guard } from "@/components/Guard";
import { Providers } from "@/components/Providers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { site } from "@/lib/site";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const zilla = Zilla_Slab({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-zilla", display: "swap" });
const cond = Barlow_Condensed({ subsets: ["latin"], weight: ["600", "700", "800"], variable: "--font-barlow", display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name} — ${site.tagline}`, template: `%s | ${site.name}` },
  description: site.description,
  openGraph: { type: "website", locale: "pt_BR", siteName: site.name },
  manifest: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/manifest.webmanifest`,
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icone-192.png`, apple: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/icone-192.png` },
  appleWebApp: { capable: true, title: site.name, statusBarStyle: "black-translucent" },
};

export const viewport: Viewport = { themeColor: "#1a120c" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${zilla.variable} ${cond.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <Guard>
          <Providers>
            <SiteHeader />
            <main className="flex-1">{children}</main>
            <SiteFooter />
          </Providers>
        </Guard>
      </body>
    </html>
  );
}
