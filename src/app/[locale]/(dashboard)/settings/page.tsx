// src/app/(dashboard)/settings/page.tsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { updateProfileAction } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Loader2, Lock, Puzzle, Plus, Trash2, Copy, Check, RefreshCw,
  ShieldCheck, AlertTriangle, ExternalLink, KeyRound,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { PageHeader } from "@/components/shared/page-header";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────────
interface ExtensionToken {
  id: string;
  label: string;
  lastUsedAt: string | null;
  expiresAt: string;
  createdAt: string;
}

// ── Profile Form Section ───────────────────────────────────────────────────────
function ProfileFormSection() {
  const t = useTranslations("Settings");
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const formData = new FormData(e.currentTarget);
    const input = {
      fullName: formData.get("fullName") as string,
      dob: formData.get("dob") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      income: Number(formData.get("income")),
      education: [],
    };
    const res = await updateProfileAction(input);
    if (!res.ok) {
      toast({ title: t("updateFailed"), description: res.message, variant: "destructive" });
    } else {
      toast({ title: t("profileSaved"), description: t("profileSavedDesc") });
    }
    setBusy(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-4 w-4" /> {t("personalInfo")}
        </CardTitle>
        <CardDescription>{t("personalInfoDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">{t("fullName")}</Label>
            <Input id="fullName" name="fullName" required disabled={busy} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="dob">{t("dob")}</Label>
              <Input id="dob" name="dob" type="date" required disabled={busy} />
            </div>
            <div>
              <Label htmlFor="phone">{t("phone")}</Label>
              <Input id="phone" name="phone" type="tel" placeholder="+1234567890" required disabled={busy} />
            </div>
          </div>
          <div>
            <Label htmlFor="email">{t("email")}</Label>
            <Input id="email" name="email" type="email" required disabled={busy} />
          </div>
          <div>
            <Label htmlFor="address">{t("address")}</Label>
            <Input id="address" name="address" placeholder="123 Main St, City, Country" required disabled={busy} />
          </div>
          <div>
            <Label htmlFor="income">{t("income")}</Label>
            <Input id="income" name="income" type="number" min="0" required disabled={busy} />
          </div>
          <Button type="submit" disabled={busy}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : t("saveProfile")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// ── Extension Section ──────────────────────────────────────────────────────────
function ExtensionSection() {
  const { toast } = useToast();

  // Token list state
  const [tokens, setTokens] = useState<ExtensionToken[]>([]);
  const [loadingTokens, setLoadingTokens] = useState(true);

  // New token generation state
  const [newLabel, setNewLabel] = useState("");
  const [creating, setCreating] = useState(false);
  const [newTokenValue, setNewTokenValue] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Profile sync state
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<{ completionPct: number; confidence: number } | null>(null);

  // ── Fetch active tokens ────────────────────────────────────────────────────
  const loadTokens = useCallback(async () => {
    setLoadingTokens(true);
    try {
      const res = await fetch("/api/extension/token");
      if (res.ok) {
        const data = await res.json();
        setTokens(data.tokens ?? []);
      }
    } catch {
      // silently fail — non-critical UI
    } finally {
      setLoadingTokens(false);
    }
  }, []);

  useEffect(() => { loadTokens(); }, [loadTokens]);

  // ── Generate new token ─────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!newLabel.trim()) {
      toast({ title: "Label required", description: "Enter a label for this token", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/extension/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: newLabel.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Failed to generate token", description: data.error, variant: "destructive" });
        return;
      }
      setNewTokenValue(data.token);
      setNewLabel("");
      loadTokens();
    } catch {
      toast({ title: "Network error", description: "Please try again", variant: "destructive" });
    } finally {
      setCreating(false);
    }
  }

  // ── Copy token to clipboard ────────────────────────────────────────────────
  async function handleCopy() {
    if (!newTokenValue) return;
    await navigator.clipboard.writeText(newTokenValue);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  // ── Revoke token ───────────────────────────────────────────────────────────
  async function handleRevoke(id: string) {
    const res = await fetch("/api/extension/token", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toast({ title: "Token revoked" });
      loadTokens();
    } else {
      toast({ title: "Failed to revoke", variant: "destructive" });
    }
  }

  // ── Sync Universal Profile via AI ──────────────────────────────────────────
  async function handleSync() {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await fetch("/api/ai/extract-universal-profile", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: "Sync failed", description: data.error, variant: "destructive" });
        return;
      }
      setSyncResult({ completionPct: data.completionPct, confidence: Math.round(data.confidence * 100) });
      toast({ title: "Profile synced!", description: `${data.completionPct}% of auto-fill fields populated.` });
    } catch {
      toast({ title: "Network error", description: "Please try again", variant: "destructive" });
    } finally {
      setSyncing(false);
    }
  }

  const isTokenExpired = (expiresAt: string) => new Date(expiresAt) < new Date();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Puzzle className="h-4 w-4" />
          Browser Extension
        </CardTitle>
        <CardDescription>
          Connect the FormMitra Chrome Extension to auto-fill scholarship forms with your profile data.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: Sync Profile */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">1</div>
            <div className="space-y-1 flex-1">
              <p className="font-medium text-sm">Sync your profile</p>
              <p className="text-xs text-muted-foreground">
                FormMitra AI will read your uploaded documents and extract auto-fill data. Run this after uploading new documents.
              </p>
              {syncResult && (
                <div className="mt-2 flex items-center gap-2 text-xs text-emerald-600">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>Profile {syncResult.completionPct}% complete · {syncResult.confidence}% confidence</span>
                </div>
              )}
            </div>
          </div>
          <Button
            id="btn-sync-profile"
            variant="outline"
            size="sm"
            onClick={handleSync}
            disabled={syncing}
            className="ml-10"
          >
            {syncing ? (
              <><Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />Syncing...</>
            ) : (
              <><RefreshCw className="h-3.5 w-3.5 mr-2" />Sync Profile Now</>
            )}
          </Button>
        </div>

        {/* Step 2: Generate Token */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">2</div>
            <div className="space-y-1 flex-1">
              <p className="font-medium text-sm">Generate an API token</p>
              <p className="text-xs text-muted-foreground">
                The extension uses this token to securely access your profile. The token is shown only once — copy it immediately.
              </p>
            </div>
          </div>

          {/* New token revealed */}
          {newTokenValue && (
            <div className="ml-10 p-3 rounded-md bg-amber-50 border border-amber-200 space-y-2">
              <div className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold">
                <AlertTriangle className="h-3.5 w-3.5" />
                Copy this token now — it will not be shown again
              </div>
              <div className="flex items-center gap-2">
                <code
                  id="extension-token-value"
                  className="flex-1 rounded bg-white border px-3 py-2 text-xs font-mono break-all select-all text-amber-900"
                >
                  {newTokenValue}
                </code>
                <Button id="btn-copy-token" size="icon" variant="outline" onClick={handleCopy} className="shrink-0 h-8 w-8">
                  {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button size="sm" variant="ghost" className="text-xs text-amber-700 h-auto p-0 hover:bg-transparent" onClick={() => setNewTokenValue(null)}>
                I&apos;ve copied it, dismiss this
              </Button>
            </div>
          )}

          <div className="ml-10 flex gap-2">
            <Input
              id="extension-token-label"
              placeholder="e.g. My Laptop Chrome"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              className="max-w-xs text-sm"
            />
            <Button id="btn-generate-token" size="sm" onClick={handleGenerate} disabled={creating}>
              {creating ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" /> : <Plus className="h-3.5 w-3.5 mr-2" />}
              Generate
            </Button>
          </div>
        </div>

        {/* Step 3: Install Extension */}
        <div className="rounded-lg border p-4 space-y-3">
          <div className="flex items-start gap-3">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">3</div>
            <div className="space-y-1 flex-1">
              <p className="font-medium text-sm">Install the Chrome Extension</p>
              <p className="text-xs text-muted-foreground">
                Install the extension, paste your token in the extension settings, and you're ready to auto-fill forms.
              </p>
              <Button size="sm" variant="outline" className="mt-2 text-xs" disabled>
                <ExternalLink className="h-3 w-3 mr-1.5" />
                Chrome Web Store — Coming Soon
              </Button>
            </div>
          </div>
        </div>

        {/* Active Tokens List */}
        {!loadingTokens && tokens.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <KeyRound className="h-3 w-3" /> Active Tokens
            </p>
            <div className="space-y-2">
              {tokens.map((token) => (
                <div key={token.id} className="flex items-center justify-between rounded-md border px-3 py-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">{token.label}</p>
                    <p className="text-xs text-muted-foreground">
                      Created {new Date(token.createdAt).toLocaleDateString()}
                      {token.lastUsedAt && ` · Last used ${new Date(token.lastUsedAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isTokenExpired(token.expiresAt) ? (
                      <Badge variant="destructive" className="text-xs">Expired</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Expires {new Date(token.expiresAt).toLocaleDateString()}
                      </Badge>
                    )}
                    <Button
                      id={`btn-revoke-${token.id}`}
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleRevoke(token.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  const t = useTranslations("Settings");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="max-w-2xl space-y-6">
        <ProfileFormSection />
        <ExtensionSection />
      </div>
    </div>
  );
}
