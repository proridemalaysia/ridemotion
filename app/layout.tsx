import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "PARTSHUB | Hybrid ERP & Shop",
  description: "Enterprise Inventory Management & E-Commerce System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* 
          THE GHOST BYPASS & DOM SHIELD 
          1. Intercepts window.onerror to stop app.js from freezing the app.
          2. Mocks getElementById to prevent "null (setting onclick)" errors.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 1. Error Silencer
                window.onerror = function(msg, url) {
                  if (url && url.includes('app.js')) return true;
                  return false;
                };

                // 2. DOM Shield
                const originalGetId = document.getElementById;
                document.getElementById = function(id) {
                  const el = originalGetId.apply(document, arguments);
                  if (!el && (id === 'vercel-toolkit' || id.includes('vercel'))) {
                    return { 
                      style: {}, 
                      setAttribute: () => {}, 
                      onclick: null,
                      classList: { add: () => {}, remove: () => {} } 
                    };
                  }
                  return el;
                };

                // 3. Console Warning Filter
                const originalWarn = console.warn;
                console.warn = function() {
                  if (arguments[0] && typeof arguments[0] === 'string' && arguments[0].includes('app.js')) return;
                  originalWarn.apply(console, arguments);
                };
              })();
            `,
          }}
        />
      </head>
      <body 
        className="antialiased" 
        style={{ 
          margin: 0, 
          padding: 0, 
          WebkitFontSmoothing: 'antialiased', 
          MozOsxFontSmoothing: 'grayscale',
          textRendering: 'optimizeLegibility'
        }}
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}