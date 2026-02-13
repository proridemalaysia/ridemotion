import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "MY ERP | Enterprise Management System",
  description: "High-density hybrid inventory and e-commerce platform",
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
          THE DOM SHIELD 
          Prevents external ghost scripts (like app.js) from crashing your React buttons.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // 1. Silences external errors from app.js
                window.onerror = function(msg, url) {
                  if (url && url.includes('app.js')) return true;
                  return false;
                };

                // 2. Mocks missing elements to prevent .onclick crashes
                const originalGetId = document.getElementById;
                document.getElementById = function(id) {
                  const el = originalGetId.apply(document, arguments);
                  if (!el && (id === 'vercel-toolkit' || id.includes('vercel') || id === 'feedback')) {
                    return { 
                      style: {}, 
                      setAttribute: () => {}, 
                      onclick: null,
                      classList: { add: () => {}, remove: () => {} } 
                    };
                  }
                  return el;
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
          backgroundColor: '#F8FAFC',
          WebkitFontSmoothing: 'antialiased',
          MozOsxFontSmoothing: 'grayscale'
        }}
      >
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}