// src/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await currentUser();
  if (!user?.id) redirect("/login");

  return (
    <div className="relative flex min-h-screen bg-background text-foreground overflow-x-hidden">
      <div className="noise-overlay" />
      <div className="absolute inset-0 z-0 flex pointer-events-none">
        <div className="grid-lines-4 w-full">
          <div className="grid-line" />
          <div className="grid-line" />
          <div className="grid-line" />
          <div className="grid-line" />
        </div>
      </div>
      
      <div className="relative z-10 flex w-full">
        <Sidebar />
        <div className="flex flex-1 flex-col lg:pl-64">
          <Topbar />
          <main className="flex-1 p-4 md:p-8 w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}
