// src/components/documents/document-table.tsx
import Link from "next/link";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDate, formatBytes } from "@/lib/utils/format";

interface DocumentRow {
  id: string;
  fileName: string;
  category: string;
  status: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
  processedAt: Date | null;
  issuingAuthority: string | null;
  expiryDate: Date | null;
}

export function DocumentTable({ documents }: { documents: DocumentRow[] }) {
  return (
    <div className="rounded-xl border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Document</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Uploaded</TableHead>
            <TableHead className="text-right">Size</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">
                <Link href={`/documents/${doc.id}`} className="hover:underline">
                  {doc.fileName}
                </Link>
              </TableCell>
              <TableCell>
                <Badge variant="outline">
                  {doc.category.replace("_", " ").toLowerCase()}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    doc.status === "READY" ? "success" :
                    doc.status === "FAILED" ? "destructive" : "warning"
                  }
                >
                  {doc.status}
                </Badge>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(doc.uploadedAt)}
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {formatBytes(doc.fileSize)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

