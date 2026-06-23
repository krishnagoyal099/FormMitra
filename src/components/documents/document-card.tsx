// src/components/documents/document-card.tsx
import Link from "next/link";
import { Document } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { CategoryBadge } from "./category-badge";
import { formatDate } from "@/lib/utils/format";
import { FileText, MoreVertical } from "lucide-react";

export function DocumentCard({ doc }: { doc: Document }) {
  return (
    <Link href={`/documents/${doc.id}`}>
      <Card className="card-hover p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-muted">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium line-clamp-1">{doc.fileName}</p>
              <p className="text-xs text-muted-foreground">{formatDate(doc.uploadedAt)}</p>
            </div>
          </div>
          <MoreVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="mt-4">
          <CategoryBadge category={doc.category} confidence={doc.categoryConfidence} />
        </div>
      </Card>
    </Link>
  );
}

