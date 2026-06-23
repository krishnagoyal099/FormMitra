// src/app/(dashboard)/settings/page.tsx
"use client";
import { useState } from "react";
import { updateProfileAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/page-header";

export default function SettingsPage() {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const formData = new FormData(e.currentTarget);
    
    // Basic client-side construction. In a real app, education would be a dynamic multi-field form.
    // For MVP, we pass an empty array or construct it from hidden inputs if needed.
    const input = {
      fullName: formData.get("fullName") as string,
      dob: formData.get("dob") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      income: Number(formData.get("income")),
      education: [], // Simplified for MVP single-page form
    };

    const res = await updateProfileAction(input);
    if (!res.ok) {
      toast({ title: "Update failed", description: res.message, variant: "destructive" });
    } else {
      toast({ title: "Profile saved", description: "Your data is encrypted and stored securely." });
    }
    setBusy(false);
  }

  return (
    <div className="space-y-8">
      <PageHeader title="Profile & Settings" description="Your data is encrypted at rest with AES-256-GCM." />
      
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-4 w-4" /> Personal Information
            </CardTitle>
            <CardDescription>This information is used for eligibility checks. It is never exposed in plaintext.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" name="fullName" required disabled={busy} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input id="dob" name="dob" type="date" required disabled={busy} />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+1234567890" required disabled={busy} />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" required disabled={busy} />
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" placeholder="123 Main St, City, Country" required disabled={busy} />
              </div>
              <div>
                <Label htmlFor="income">Annual Income (INR)</Label>
                <Input id="income" name="income" type="number" min="0" required disabled={busy} />
              </div>
              <Button type="submit" disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Save encrypted profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
