// src/components/opportunities/opportunity-uploader.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDropzone } from "react-dropzone";
import { Loader2, Sparkles, FileText } from "lucide-react";
import { useUploadThing } from "@/lib/storage/uploadthing";
import { createOpportunityAction } from "@/app/[locale]/(dashboard)/opportunities/actions";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue,
} from "@/components/ui/select";

const TYPES = [
  { value: "SCHOLARSHIP", label: "Scholarship" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "ADMISSION", label: "Admission" },
  { value: "GOVERNMENT_SCHEME", label: "Government scheme" },
  { value: "VISA", label: "Visa" },
  { value: "JOB", label: "Job" },
];

export function OpportunityUploader() {
  const router = useRouter();
  const { toast } = useToast();
  const { startUpload } = useUploadThing("opportunityUploader");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>("SCHOLARSHIP");
  const [provider, setProvider] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (f) => setFile(f[0] ?? null),
    accept: { "application/pdf": [".pdf"], "image/png": [".png"], "image/jpeg": [".jpg",".jpeg"] },
    maxFiles: 1, maxSize: 20 * 1024 * 1024,
  });

  async function analyze() {
    if (!title) {
      toast({ title: "Missing title", description: "Add an opportunity title.", variant: "destructive" });
      return;
    }
    if (!file && !sourceUrl) {
      toast({ title: "Missing source", description: "Provide either a Document or a Source URL.", variant: "destructive" });
      return;
    }
    setBusy(true);
    try {
      let uploadKey: string | undefined;
      let mimeType: string | undefined;

      if (file) {
        const uploaded = await startUpload([file], { title, type });
        if (!uploaded?.[0]) throw new Error("Upload failed");
        uploadKey = uploaded[0].key;
        mimeType = uploaded[0].serverData?.mimeType ?? file.type;
      }

      const res = await createOpportunityAction({
        title, type: type as typeof TYPES[number]["value"],
        provider: provider || undefined,
        sourceUrl: sourceUrl || undefined,
        uploadThingKey: uploadKey,
        fileName: file?.name,
        fileSize: file?.size,
        mimeType: mimeType,
      });
      if (!res.ok) throw new Error(res.message);
      toast({ title: "Analysis complete", description: "Opportunity analyzed by ASI:ONE." });
      router.push(`/opportunities/${res.data.opportunityId}`);
    } catch (err) {
      toast({ title: "Analysis failed", description: (err as Error).message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Opportunity title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. National Merit Scholarship 2025" />
        </div>
        <div>
          <Label>Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {TYPES.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="provider">Provider (optional)</Label>
          <Input id="provider" value={provider} onChange={(e) => setProvider(e.target.value)} placeholder="e.g. Ministry of Education" />
        </div>
        <div>
          <Label htmlFor="sourceUrl">Source URL (Alternative if no document)</Label>
          <Input id="sourceUrl" value={sourceUrl} onChange={(e) => setSourceUrl(e.target.value)} placeholder="https://example.com/scholarship" type="url" />
        </div>
        <div className="space-y-2">
          <Label>Upload Document (Preferred)</Label>
          <div {...getRootProps()} className="rounded-xl border-2 border-dashed p-8 text-center cursor-pointer hover:border-primary/50 transition-colors bg-muted/20">
            <input {...getInputProps()} />
            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileText className="h-8 w-8 text-muted-foreground" />
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            ) : (
              <>
                <FileText className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm">{isDragActive ? "Drop here" : "Click or drag to upload PDF/Image"}</p>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          <h3 className="font-medium">What ASI:ONE will do</h3>
        </div>
        <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
          <li>• Extract eligibility criteria from the document</li>
          <li>• Identify all required documents</li>
          <li>• Parse deadlines & application steps</li>
          <li>• Cross-reference your document vault</li>
          <li>• Compute eligibility status with confidence</li>
          <li>• Generate a prioritized action plan with readiness score</li>
        </ul>
        <Button className="mt-6 w-full" disabled={busy} onClick={analyze}>
          {busy ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Analyzing…</> : "Analyze with ASI:ONE"}
        </Button>
        {busy && <p className="mt-2 text-center text-xs text-muted-foreground">Reasoning over requirements… this takes ~10s</p>}
      </div>
    </div>
  );
}
