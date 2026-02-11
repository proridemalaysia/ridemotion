import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PARTSHUB ERP",
  description: "Bypassing script errors...",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* --- THE GHOST BYPASS SCRIPT --- */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.onerror = function(message, source, lineno, colno, error) {
                if (source && source.includes('app.js')) {
                  console.warn('Blocked crashing external script:', source);
                  return true; // This stops the error from freezing the browser
                }
                return false;
              };
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}