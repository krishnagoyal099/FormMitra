// src/app/(dashboard)/opportunities/new/page.tsx
import { OpportunityUploader } from "@/components/opportunities/opportunity-uploader";
import { PageHeader } from "@/components/shared/page-header";

export default function NewOpportunityPage() {
  return (
    <div className="space-y-8">
      <PageHeader title="Analyze an opportunity" description="Upload a scholarship, internship, or scheme PDF. ASI:ONE will extract every requirement." />
      <OpportunityUploader />
    </div>
  );
}
