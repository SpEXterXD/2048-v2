import type { Metadata, Viewport } from "next";
import { Outfit, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "2048 — Premium Edition",
  description:
    "The classic 2048 game reimagined with four curated themes, undo, multiple board sizes, and synthesized Web Audio sound.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f7f5f0",
};

// Applies the persisted theme (or OS preference) before first paint to prevent flashes.
const THEME_INIT = `(function(){try{var t=null;try{var raw=localStorage.getItem("g2048:theme");if(raw!==null){var v=JSON.parse(raw);if(v==="classic"||v==="midnight"||v==="pastel"||v==="mono")t=v;}}catch(e){}if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"midnight":"classic";}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t==="midnight"?"dark":"light";var colors={classic:"#f7f5f0",midnight:"#08080e",pastel:"#f5f3fa",mono:"#ffffff"};var m=document.querySelector('meta[name="theme-color"]');if(m&&colors[t])m.setAttribute("content",colors[t]);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body
        className={`${outfit.variable} ${plusJakartaSans.variable} min-h-dvh bg-background font-sans text-foreground antialiased selection:bg-primary/20`}
      >
        {children}
      </body>
    </html>
  );
}
