// app/layout.tsx
import "./styles/globals.css"; // Make sure to use the correct relative path for your global styles.
import { ReactNode } from "react";

export const metadata = {
  title: "My App",
  description: "Welcome to my app",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: "yes",
  minimalUi: true,
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full">{children}</body>
    </html>
  );
}
