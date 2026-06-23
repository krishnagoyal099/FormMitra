// src/components/documents/document-detail.tsx
"use client";
import type { Prisma } from "@prisma/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryBadge } from "./category-badge";
import { formatDate } from "@/lib/utils/format";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, Clock } from "lucide-react";

interface Props {
  document: Prisma.DocumentGetPayload<Record<string, never>>;
}

export function DocumentDetail({ document }: Props) {
  const extracted = document.extractedJson as { classification?: { documentType?: string; keyFields?: Record<string, string> } } | null;
  
  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Status</CardTitle>
          </CardHeader>
          <CardContent>
            {document.status === "READY" && <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Ready</Badge>}
            {document.status === "PROCESSING" && <Badge variant="warning" className="gap-1"><Clock className="h-3 w-3" /> Processing</Badge>}
            {document.status === "FAILED" && <Badge variant="destructive" className="gap-1"><AlertTriangle className="h-3 w-3" /> Failed</Badge>}
            
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Uploaded</span>
                <span>{formatDate(document.uploadedAt)}</span>
              </div>
              {document.processedAt && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Processed</span>
                  <span>{formatDate(document.processedAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category</span>
                <CategoryBadge category={document.category} confidence={document.categoryConfidence} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-sm">Extracted Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            {extracted?.classification?.documentType ? (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Document Type</p>
                  <p className="font-medium">{extracted.classification.documentType}</p>
                </div>
                {extracted.classification.keyFields && (
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(extracted.classification.keyFields).map(([key, value]) => (
                      <div key={key}>
                        <p className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</p>
                        <p className="font-medium text-sm">{value}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No metadata extracted yet.</p>
            )}
            {document.failedReason && (
              <div className="mt-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {document.failedReason}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

