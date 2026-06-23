// src/app/(onboarding)/page.tsx
"use client";

import { useActionState } from "@/hooks/use-action-state";
import { saveProfileAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ShieldCheck } from "lucide-react";

export default function OnboardingPage() {
  const { error, execute, busy } = useActionState(saveProfileAction);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    await execute({
      fullName: formData.get("fullName") as string,
      dob: formData.get("dob") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      income: Number(formData.get("income")),
      level: formData.get("level") as "BACHELORS",
      institution: formData.get("institution") as string,
      startYear: Number(formData.get("startYear")),
      graduationYear: Number(formData.get("graduationYear")),
    });
  };

  return (
    <div className="w-full max-w-2xl bg-card rounded-xl border shadow-sm p-6 md:p-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2 text-foreground">Welcome! Let&apos;s set up your profile.</h1>
        <p className="text-muted-foreground mb-4">
          To automatically match you with opportunities, we need a few details.
        </p>
        <div className="inline-flex items-center text-sm font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 mr-2" />
          Your information is AES-256 encrypted and never shared.
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-md bg-destructive/10 text-destructive border border-destructive/20 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" name="fullName" placeholder="John Doe" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dob">Date of Birth</Label>
            <Input id="dob" name="dob" type="date" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input id="phone" name="phone" type="tel" placeholder="+1 (555) 000-0000" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="income">Annual Income (USD)</Label>
            <Input id="income" name="income" type="number" placeholder="50000" min="0" required />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="address">Full Address</Label>
            <Input id="address" name="address" placeholder="123 Main St, City, Country" required />
          </div>
        </div>

        <hr className="my-6 border-muted" />
        <h2 className="text-xl font-semibold mb-4">Education</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="level">Highest Degree Level</Label>
            <select id="level" name="level" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" required>
              <option value="SECONDARY">High School / Secondary</option>
              <option value="HIGHER_SECONDARY">Higher Secondary</option>
              <option value="DIPLOMA">Diploma</option>
              <option value="BACHELORS">Bachelors</option>
              <option value="MASTERS">Masters</option>
              <option value="DOCTORAL">Doctoral</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="institution">Institution Name</Label>
            <Input id="institution" name="institution" placeholder="University of X" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="startYear">Start Year</Label>
            <Input id="startYear" name="startYear" type="number" placeholder="2021" min="1900" max="2100" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="graduationYear">Graduation Year</Label>
            <Input id="graduationYear" name="graduationYear" type="number" placeholder="2025" min="1900" max="2100" required />
          </div>
        </div>

        <Button type="submit" className="w-full mt-8" disabled={busy} size="lg">
          {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
          Save & Continue to Dashboard
        </Button>
      </form>
    </div>
  );
}
