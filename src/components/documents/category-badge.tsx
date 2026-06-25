// src/components/documents/category-badge.tsx
import { Badge } from "@/components/ui/badge";
import { LucideIcon, IdCard, Home, Wallet, GraduationCap, FileText, Image as ImageIcon, HeartPulse, Landmark, File } from "lucide-react";

const CATEGORY_CONFIG: Record<string, { icon: LucideIcon; label: string; variant: "default" | "secondary" | "outline" }> = {
  ID_PROOF: { icon: IdCard, label: "ID Proof", variant: "default" },
  ADDRESS_PROOF: { icon: Home, label: "Address", variant: "secondary" },
  INCOME_PROOF: { icon: Wallet, label: "Income", variant: "secondary" },
  EDUCATION: { icon: GraduationCap, label: "Education", variant: "default" },
  RESUME: { icon: FileText, label: "Resume", variant: "outline" },
  PHOTO: { icon: ImageIcon, label: "Photo", variant: "outline" },
  MEDICAL: { icon: HeartPulse, label: "Medical", variant: "secondary" },
  FINANCIAL: { icon: Landmark, label: "Financial", variant: "default" },
  OTHER: { icon: File, label: "Other", variant: "outline" },
};

export function CategoryBadge({ category, confidence }: { category: string; confidence?: number }) {
  const config = CATEGORY_CONFIG[category] ?? CATEGORY_CONFIG.OTHER;
  const Icon = config.icon;
  
  return (
    <Badge variant={config.variant} className="gap-1.5">
      <Icon className="h-3 w-3" />
      {config.label}
      {confidence !== undefined && confidence < 0.8 && (
        <span className="ml-1 text-amber-500" title="Low confidence">⚠</span>
      )}
    </Badge>
  );
}

