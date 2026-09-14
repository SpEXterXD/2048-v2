import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2048",
  description:
    "The classic 2048 with four color themes, undo, three board sizes, and synthesized sound. Built with Next.js and Tailwind CSS.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf8ef",
};

// Applies the persisted theme (or the OS preference) before first paint so
// there is no flash of the wrong palette.
const THEME_INIT = `(function(){try{var t=null;try{var raw=localStorage.getItem("g2048:theme");if(raw!==null){var v=JSON.parse(raw);if(v==="classic"||v==="midnight"||v==="pastel"||v==="mono")t=v;}}catch(e){}if(!t){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"midnight":"classic";}document.documentElement.dataset.theme=t;document.documentElement.style.colorScheme=t==="midnight"?"dark":"light";var colors={classic:"#faf8ef",midnight:"#0c0c14",pastel:"#faf8fc",mono:"#ffffff"};var m=document.querySelector('meta[name="theme-color"]');if(m&&colors[t])m.setAttribute("content",colors[t]);}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground antialiased">
        {children}
      </body>
    </html>
  );
}
