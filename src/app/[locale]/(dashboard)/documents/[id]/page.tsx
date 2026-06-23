// src/app/(dashboard)/documents/[id]/page.tsx
import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { PageHeader } from "@/components/shared/page-header";
import { DocumentDetail } from "@/components/documents/document-detail";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function DocumentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const document = await prisma.document.findFirst({
    where: { id, userId: session.user.id, deletedAt: null },
  });

  if (!document) notFound();

  return (
    <div className="space-y-8">
      <PageHeader
        title={document.fileName}
        description={`Uploaded on ${document.uploadedAt.toLocaleDateString()}`}
        action={
          <Button variant="ghost" asChild>
            <Link href="/documents"><ChevronLeft className="h-4 w-4 mr-2" /> Back to Vault</Link>
          </Button>
        }
      />
      <DocumentDetail document={document} />
    </div>
  );
}
