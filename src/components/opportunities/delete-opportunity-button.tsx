"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteOpportunityAction } from "@/app/[locale]/(dashboard)/opportunities/actions";
import { useToast } from "@/hooks/use-toast";

export function DeleteOpportunityButton({ oppId }: { oppId: string }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault(); 
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this opportunity? This cannot be undone.")) return;

    setIsDeleting(true);
    const res = await deleteOpportunityAction(oppId);
    if (!res.ok) {
      toast({ variant: "destructive", title: "Error", description: res.message });
      setIsDeleting(false);
    } else {
      toast({ title: "Deleted", description: "Opportunity deleted successfully." });
    }
  }

  return (
    <Button 
      variant="ghost" 
      size="icon" 
      className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-9 w-9" 
      onClick={handleDelete} 
      disabled={isDeleting}
      title="Delete Opportunity"
    >
      {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}

