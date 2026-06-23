// src/app/(marketing)/layout.tsx
export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="dark relative flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      <div className="noise-overlay" />
      <div className="absolute inset-0 z-0 flex pointer-events-none">
        <div className="grid-lines-4 w-full">
          <div className="grid-line" />
          <div className="grid-line" />
          <div className="grid-line" />
          <div className="grid-line" />
        </div>
      </div>
      <div className="relative z-10 w-full flex min-h-screen flex-col">
        {children}
      </div>
    </div>
  );
}
