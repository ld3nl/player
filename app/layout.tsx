import { cn } from "cnfast";
import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./styles/globals.css";

export const metadata: Metadata = {
  title: "Paul Lowe Talks",
  description:
    "Listen to conversations with Paul Lowe on awareness, relationships and everyday life.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

// The skip link brings keyboard listeners directly to the catalog.
const RootLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en" className={cn("h-full")}>
    <body
      className={cn(
        "h-full bg-slate-50 font-sans text-slate-900 antialiased selection:bg-purple-100 selection:text-purple-900",
      )}
    >
      <a
        href="#talks"
        className={cn(
          "sr-only focus:fixed focus:left-6 focus:top-6 focus:z-50 focus:not-sr-only focus:rounded-xl focus:bg-purple-700 focus:px-6 focus:py-3 focus:text-white focus:outline-2 focus:outline-offset-4 focus:outline-purple-600",
        )}
      >
        Skip to talks
      </a>
      {children}
    </body>
  </html>
);
export default RootLayout;
