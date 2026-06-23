// src/app/(dashboard)/documents/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/config";
import { prisma } from "@/lib/db/prisma";
import { UploadZone } from "@/components/documents/upload-zone";
import { DocumentTable } from "@/components/documents/document-table";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { getTranslations } from "next-intl/server";

export default async function DocumentsPage() {
  const t = await getTranslations("Documents");
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const documents = await prisma.document.findMany({
    where: { userId: session.user.id, deletedAt: null },
    orderBy: { uploadedAt: "desc" },
    select: {
      id: true, fileName: true, category: true, categoryConfidence: true,
      status: true, fileSize: true, fileType: true, uploadedAt: true, processedAt: true,
      issuingAuthority: true, expiryDate: true,
    },
  });

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("subtitle")} />
      <UploadZone />
      {documents.length === 0 ? (
        <EmptyState
          title={t("noDocuments")}
          description={t("noDocumentsDesc")}
        />
      ) : (
        <DocumentTable documents={documents} />
      )}
    </div>
  );
}
