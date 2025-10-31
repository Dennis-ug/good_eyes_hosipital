import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ClientThemeProvider } from "@/components/client-theme-provider";

export const metadata: Metadata = {
  title: "Eyesante - Hospital Management System",
  description: "Super Admin Dashboard for Eyesante Hospital Management System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme') || 'system';
                  var resolvedTheme;
                  
                  if (theme === 'system') {
                    resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  } else {
                    resolvedTheme = theme;
                  }
                  
                  // Apply theme immediately to prevent hydration mismatch
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add(resolvedTheme);
                  
                  // Store the resolved theme in a data attribute for React to read
                  document.documentElement.setAttribute('data-theme', resolvedTheme);
                  
                  // Mark that theme has been applied
                  window.__THEME_APPLIED__ = true;
                } catch (e) {
                  // Fallback to light theme
                  document.documentElement.classList.remove('light', 'dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                  window.__THEME_APPLIED__ = true;
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className="antialiased"
        suppressHydrationWarning={true}
      >
      <div suppressHydrationWarning={true}>
        <ClientThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ClientThemeProvider>
      </div>
    </body>
    </html>
  );
}
