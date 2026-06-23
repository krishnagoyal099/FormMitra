// src/app/(dashboard)/layout.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Topbar } from "@/components/dashboard/topbar";
import { prisma } from "@/lib/db/prisma";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  // Enforce Onboarding
  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    select: { profileComplete: true },
  });

  if (!profile || !profile.profileComplete) {
    redirect("/onboarding");
  }

  return (
    <div className="dark relative flex min-h-screen bg-background text-foreground overflow-x-hidden">
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
        <Sidebar user={session.user} />
        <div className="flex flex-1 flex-col lg:pl-64">
          <Topbar user={session.user} />
          <main className="flex-1 p-4 md:p-8 w-full">{children}</main>
        </div>
      </div>
    </div>
  );
}
