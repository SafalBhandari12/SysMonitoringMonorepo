"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { onboardUserAction } from "@/actions/onboarding/onboardUser";
import ApisByGroup from "@/components/dashboard/ApisByGroup";
import { useSession } from "next-auth/react";

import { onboardingSchema } from "@/lib/validations/onboarding";

export function OnboardingClient() {
  const [orgName, setOrgName] = useState("");
  const [orgUrl, setOrgUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { update } = useSession();

  const slugify = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleNameChange = (val: string) => {
    setOrgName(val);
    setOrgUrl(slugify(val));
    if (error) setError(null);
  };

  const dummyUptimeBars = useMemo(() => {
    // Use a fixed base date and deterministic logic to prevent SSR hydration mismatches
    const baseDate = new Date("2024-01-01T12:00:00Z").getTime();
    return Array.from({ length: 90 }).map((_, i) => {
      const isUp = i % 20 !== 0; // Deterministic: every 20th bar is down
      return {
        date: new Date(baseDate - i * 24 * 60 * 60 * 1000).toISOString(),
        up: isUp,
        upCount: isUp ? 100 : 90,
        totalCount: 100,
        hasData: true,
      };
    }).reverse();
  }, []);

  const mockGroupedApis = useMemo(() => [
    {
      groupName: "Website Core",
      aggregateUptime: 99.98,
      aggregateUptimeBars: dummyUptimeBars,
      apis: [
        {
          id: "api-1",
          name: "Landing Page",
          uptime: dummyUptimeBars,
          currentUptime: 100,
          apiGroup: { name: "Website Core" },
        },
        {
          id: "api-2",
          name: "User Dashboard",
          uptime: dummyUptimeBars,
          currentUptime: 99.95,
          apiGroup: { name: "Website Core" },
        }
      ]
    },
    {
      groupName: "Backend Services",
      aggregateUptime: 98.45,
      aggregateUptimeBars: dummyUptimeBars,
      apis: [
        {
          id: "api-3",
          name: "Authentication API",
          uptime: dummyUptimeBars,
          currentUptime: 99.99,
          apiGroup: { name: "Backend Services" },
        }
      ]
    }
  ], [dummyUptimeBars]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) {
      toast.error("Please enter an organization name.");
      return;
    }

    const validationResult = onboardingSchema.safeParse({ 
      organizationName: orgName,
      organizationUrl: orgUrl
    });

    if (!validationResult.success) {
      setError(validationResult.error.issues[0].message);
      return;
    }

    setError(null);

    startTransition(async () => {
      const res = await onboardUserAction(
        validationResult.data.organizationName,
        validationResult.data.organizationUrl
      );
      if (res.success) {
        await update({ 
          onboarded: true, 
        });
        toast.success("Welcome to the platform!");
        window.location.href = "/dashboard";
      } else {
        toast.error(res.error || "Something went wrong.");
      }
    });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      <div className="w-full md:w-1/3 p-8 lg:p-12 flex flex-col justify-center border-r">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome Onboard</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="orgName" className="text-sm font-medium">Organization Name</label>
                <Input
                  id="orgName"
                  placeholder="e.g. Acme Corp"
                  value={orgName}
                  onChange={(e) => handleNameChange(e.target.value)}
                  autoComplete="off"
                  disabled={isPending}
                  className={`h-11 ${error && error.includes("Name") ? "border-destructive focus-visible:ring-destructive" : ""}`}
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="orgUrl" className="text-sm font-medium">Status Page URL</label>
                <div className="relative">
                  <Input
                    id="orgUrl"
                    placeholder="acme-corp"
                    value={orgUrl}
                    onChange={(e) => {
                      setOrgUrl(e.target.value.toLowerCase().replace(/\s+/g, "-"));
                      if (error) setError(null);
                    }}
                    autoComplete="off"
                    disabled={isPending}
                    className={`h-11 ${error && error.includes("URL") ? "border-destructive focus-visible:ring-destructive" : ""}`}
                  />
                </div>
                {error && <p className="text-xs font-medium text-destructive">{error}</p>}
              </div>

              {/* Real-time Domain Preview */}
              <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/70">Status Page Preview</p>
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="text-sm text-muted-foreground shrink-0">monitoring.com/status/</span>
                  <span className="text-sm font-semibold text-primary truncate">
                    {orgUrl || "your-slug"}
                  </span>
                </div>
              </div>
            </div>

            <Button type="submit" className="w-full h-11" disabled={isPending || !orgName.trim() || !orgUrl.trim()}>
              {isPending ? "Setting up..." : "Continue to Dashboard"}
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden w-full md:w-2/3 p-8 lg:p-12 bg-muted/20 md:flex flex-col justify-center overflow-hidden">
        <div className="w-full max-w-5xl mx-auto space-y-6 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight transition-all duration-300">
                {orgName.trim() ? `${orgName.trim()}` : "Your Status Page"}
              </h2>
              <p className="text-sm text-muted-foreground">This is how your status page will look.</p>
            </div>
          </div>

          <div className="space-y-4">
            <ApisByGroup groupedApis={mockGroupedApis} />
          </div>
        </div>
      </div>
    </div>
  );
}
