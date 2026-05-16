"use client";

import { useState, useTransition, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { onboardUserAction } from "@/actions/onboarding/onboardUser";
import ApisByGroup from "@/components/dashboard/ApisByGroup";
import { useSession } from "next-auth/react";

export function OnboardingClient() {
  const [orgName, setOrgName] = useState("");
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const { update } = useSession();

  const dummyUptimeBars = useMemo(() => {
    return Array.from({ length: 90 }).map((_, i) => {
      const isUp = Math.random() > 0.05;
      return {
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
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

    startTransition(async () => {
      const res = await onboardUserAction(orgName);
      if (res.success) {
        await update({ onboarded: true, organizationName: orgName });
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
            <p className="text-muted-foreground text-sm">
              Please enter your organization name to get started. Make sure the name is unique.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                id="orgName"
                placeholder="e.g. Acme Corp"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                autoComplete="off"
                disabled={isPending}
                className="h-11"
              />
            </div>
            <Button type="submit" className="w-full h-11" disabled={isPending || !orgName.trim()}>
              {isPending ? "Setting up..." : "Continue to Dashboard"}
            </Button>
          </form>
        </div>
      </div>

      <div className="hidden w-full md:w-2/3 p-8 lg:p-12 bg-muted/20 md:flex flex-col justify-center overflow-hidden">
        <div className="w-full max-w-5xl mx-auto space-y-6 transition-all duration-300">
          <div className="flex items-center justify-between opacity-80">
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight transition-all duration-300">
                {orgName.trim() ? `${orgName.trim()}` : "Your Status Page"}
              </h2>
              <p className="text-sm text-muted-foreground">This is how your dashboard will look.</p>
            </div>
            <div className="flex gap-2">
              <div className="h-9 w-24 bg-muted rounded-md animate-pulse" />
              <div className="h-9 w-32 bg-primary/20 rounded-md animate-pulse" />
            </div>
          </div>

          <div className="space-y-4 opacity-80 pointer-events-none">
            <ApisByGroup groupedApis={mockGroupedApis} />
          </div>
        </div>
      </div>
    </div>
  );
}
