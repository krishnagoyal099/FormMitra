"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { analyzeOpportunityAction } from "@/app/[locale]/(dashboard)/opportunities/actions";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function OpportunityAnalyzer({ oppId }: { oppId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  useEffect(() => {
    let ignore = false;

    async function runAnalysis() {
      try {
        const res = await analyzeOpportunityAction(oppId);
        if (ignore) return;
        
        if (!res.ok) {
          toast({
            title: "Analysis Failed",
            description: res.message || "Something went wrong during analysis.",
            variant: "destructive",
          });
        }
      } catch {
        if (ignore) return;
        toast({
          title: "System Error",
          description: "The analysis pipeline crashed.",
          variant: "destructive",
        });
      } finally {
        if (!ignore) router.refresh();
      }
    }

    runAnalysis();

    return () => {
      ignore = true;
    };
  }, [oppId, router, toast]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <h2 className="text-2xl font-semibold">Analyzing Opportunity...</h2>
      <p className="text-muted-foreground max-w-md mx-auto">
        Our AI is reading the document, checking your eligibility, mapping required documents, and building a custom action plan. 
        This usually takes 15-20 seconds. Please wait...
      </p>
    </div>
  );
}

