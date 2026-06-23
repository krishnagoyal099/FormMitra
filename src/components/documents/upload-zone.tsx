// src/components/documents/upload-zone.tsx
"use client";
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useUploadThing } from "@/lib/storage/uploadthing";
import { registerDocumentAction } from "@/app/[locale]/(dashboard)/documents/actions";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils/cn";

interface UploadItem {
  id: string;
  fileName: string;
  status: "uploading" | "processing" | "done" | "error";
  error?: string;
}

const ACCEPTED = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
};

export function UploadZone() {
  const { toast } = useToast();
  const [items, setItems] = useState<UploadItem[]>([]);
  const { startUpload, isUploading } = useUploadThing("documentUploader");

  const onDrop = useCallback(async (accepted: File[]) => {
    if (!accepted.length) return;
    for (const file of accepted) {
      const itemId = crypto.randomUUID();
      setItems((s) => [...s, { id: itemId, fileName: file.name, status: "uploading" }]);
      try {
        const uploaded = await startUpload([file]);
        if (!uploaded?.[0]) throw new Error("Upload failed");
        const u = uploaded[0];
        setItems((s) => s.map((it) => it.id === itemId ? { ...it, status: "processing" } : it));
        const res = await registerDocumentAction({
          uploadThingKey: u.key,
          fileName: file.name,
          fileSize: file.size,
          mimeType: (u.serverData?.mimeType ?? file.type) as "application/pdf" | "image/png" | "image/jpeg",
        });
        if (!res.ok) throw new Error(res.message);
        setItems((s) => s.map((it) => it.id === itemId ? { ...it, status: "done" } : it));
      } catch (err) {
        setItems((s) => s.map((it) => it.id === itemId ? { ...it, status: "error", error: (err as Error).message } : it));
        toast({ title: "Upload failed", description: (err as Error).message, variant: "destructive" });
      }
    }
  }, [startUpload, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED, maxFiles: 10, maxSize: 10 * 1024 * 1024,
  });

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          "rounded-xl border-2 border-dashed p-10 text-center transition-colors cursor-pointer",
          isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-10 w-10 text-muted-foreground" />
        <p className="mt-3 font-medium">Drop documents here or click to browse</p>
        <p className="mt-1 text-sm text-muted-foreground">PDF, PNG, JPG · up to 10 MB each</p>
      </div>

      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((it) => (
            <div key={it.id} className="flex items-center justify-between rounded-lg border bg-card p-3">
              <div className="flex items-center gap-3">
                <span className="truncate text-sm font-medium">{it.fileName}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                {it.status === "uploading" && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                {it.status === "processing" && <Loader2 className="h-4 w-4 animate-spin text-amber-500" />}
                {it.status === "done" && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                {it.status === "error" && <AlertCircle className="h-4 w-4 text-rose-500" />}
                <span className="text-muted-foreground">
                  {it.status === "uploading" && "Uploading…"}
                  {it.status === "processing" && "AI classifying…"}
                  {it.status === "done" && "Ready"}
                  {it.status === "error" && (it.error ?? "Failed")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
      {isUploading && <p className="text-xs text-muted-foreground">Uploading…</p>}
    </div>
  );
}
