import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "MY ERP | Professional Enterprise System",
  description: "High-density hybrid management suite",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* DOM SHIELD: Bypasses external script crashes like app.js */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                window.onerror = function(msg, url) {
                  if (url && url.includes('app.js')) return true;
                  return false;
                };
                const originalGetId = document.getElementById;
                document.getElementById = function(id) {
                  const el = originalGetId.apply(document, arguments);
                  if (!el && (id === 'vercel-toolkit' || id.includes('vercel') || id === 'feedback')) {
                    return { style: {}, setAttribute: () => {}, onclick: null, classList: { add: () => {}, remove: () => {} } };
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