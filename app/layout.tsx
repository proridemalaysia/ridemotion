import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "PARTSHUB ERP",
  description: "Secure Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* --- THE DOM SHIELD --- */}
        {/* This script mocks the document.getElementById function to prevent app.js from crashing */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const originalGetId = document.getElementById;
                document.getElementById = function(id) {
                  const el = originalGetId.apply(document, arguments);
                  if (!el && (id === 'vercel-toolkit' || id.includes('vercel'))) {
                    // Return a fake element so the script doesn't crash when setting .onclick
                    return { style: {}, setAttribute: () => {}, onclick: null };
                  }
                  return el;
                };
                // Silence the specific app.js error globally
                window.onerror = function(msg, url) {
                  if (url && url.includes('app.js')) return true;
                  return false;
                };
              })();
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif', backgroundColor: '#f8fafc' }}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}