import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "PARTSHUB ERP",
  description: "Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* THE GHOST SCRIPT KILLER: Runs before everything to stop app.js from crashing */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                window.onerror = function(msg, url) {
                  if (url && url.includes('app.js')) return true;
                  return false;
                };
                console.warn = (function(oldWarn) {
                  return function(msg) {
                    if (typeof msg === 'string' && msg.includes('app.js')) return;
                    oldWarn.apply(console, arguments);
                  };
                })(console.warn);
              })();
            `,
          }}
        />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: 'system-ui, -apple-system, sans-serif' }}>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}