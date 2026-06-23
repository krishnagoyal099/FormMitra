// src/app/layout.tsx
// Minimal root layout — just sets the document shell.
// Locale-specific providers and <html lang> are handled in [locale]/layout.tsx.
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
