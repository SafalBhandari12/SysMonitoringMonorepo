"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AlertCircle, Check, Copy, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type DomainVerificationProps = {
  userId: string;
  domain: {
    domain?: string;
    verificationCode: string;
  };
  redirectTo?: string;
};

export default function DomainVerification({
  domain,
  redirectTo = "/dashboard",
}: DomainVerificationProps) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isDnsTokenCopied, setIsDnsTokenCopied] = useState(false);
  const verificationCode = domain.verificationCode;
  const expectedDnsToken = `sysmonitoring-verification=${verificationCode}`;

  const handleCopyDnsToken = async () => {
    try {
      await navigator.clipboard.writeText(expectedDnsToken);
      setIsDnsTokenCopied(true);
      toast.success("DNS token copied");
      setTimeout(() => {
        setIsDnsTokenCopied(false);
      }, 1500);
    } catch {
      toast.error("Failed to copy DNS token");
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);

    try {
      const response = await fetch("/api/onboarding/domain/verify", {
        method: "POST",
      });

      const payload = (await response.json()) as {
        success?: boolean;
        verified?: boolean;
        error?: string;
      };

      if (response.ok && payload.verified) {
        toast.success("Domain verified", {
          description: "Your dashboard is ready for monitored APIs.",
        });
        router.replace(redirectTo);
        router.refresh();
        return;
      }

      toast.error("Verification failed", {
        description:
          payload.error ??
          "The DNS record or meta tag is not live yet. Try again after propagation.",
      });
    } catch {
      toast.error("Verification failed", {
        description: "Unable to reach the verification endpoint.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-4xl border-border/60 bg-card/95 shadow-[0_24px_80px_-24px_rgba(15,23,42,0.35)] backdrop-blur">
      <CardHeader className="gap-3 border-b border-border/60 pb-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1.5 px-2.5 py-1">
            <ShieldCheck className="size-3.5" />
            Domain ownership
          </Badge>
        </div>
        <CardTitle className="text-2xl tracking-tight">
          Verify your domain
        </CardTitle>
        <CardDescription className="max-w-2xl text-base leading-6">
          Add the verification code
          {domain.domain ? ` for ${domain.domain}` : ""} to your DNS provider
          or meta tag, then run a verification check. For the DNS record, use
          <span className="mx-1 font-semibold text-foreground">@</span> as the
          host/name.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <Tabs defaultValue="dns" className="space-y-5">
          <TabsList>
            <TabsTrigger value="dns">DNS record</TabsTrigger>
            <TabsTrigger value="meta">Meta tag</TabsTrigger>
          </TabsList>

          <TabsContent value="dns" className="space-y-5">
            <Alert>
              <AlertCircle className="size-4" />
              <AlertTitle>Use a TXT record</AlertTitle>
              <AlertDescription>
                Add the code to a TXT record in your DNS provider. Use @ for the
                host or name so the record is created on the root domain.
              </AlertDescription>
            </Alert>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Record type</TableCell>
                  <TableCell>TXT</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Host / Name</TableCell>
                  <TableCell>@</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Value</TableCell>
                  <TableCell className="break-all font-mono text-xs sm:text-sm">
                    <div className="flex items-center gap-2">
                      <span className="break-all">{expectedDnsToken}</span>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={handleCopyDnsToken}
                        aria-label="Copy DNS token"
                        className="shrink-0"
                      >
                        {isDnsTokenCopied ? (
                          <Check className="size-3.5" />
                        ) : (
                          <Copy className="size-3.5" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">TTL</TableCell>
                  <TableCell>300</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>

          <TabsContent value="meta" className="space-y-5">
            <Alert>
              <AlertCircle className="size-4" />
              <AlertTitle>Use the page head</AlertTitle>
              <AlertDescription>
                Paste the meta tag into your site&apos;s head section and
                publish the change.
              </AlertDescription>
            </Alert>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-1/3">Field</TableHead>
                  <TableHead>Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-medium">Meta name</TableCell>
                  <TableCell className="break-all font-mono text-xs sm:text-sm">
                    sysMonitoring-Verification
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Content</TableCell>
                  <TableCell className="break-all font-mono text-xs sm:text-sm">
                    {verificationCode}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Placement</TableCell>
                  <TableCell>Inside the &lt;head&gt; element</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-medium">Snippet</TableCell>
                  <TableCell className="break-all font-mono text-xs sm:text-sm">
                    {`<meta name="sysMonitoring-Verification" content="${verificationCode}" />`}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>

        <Separator />
      </CardContent>

      <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Once the record or tag is live, run the verification check below.
        </p>

        <Button
          className="w-full sm:w-auto"
          onClick={handleVerify}
          disabled={isVerifying}
        >
          {isVerifying ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Verifying...
            </>
          ) : (
            <>
              <ShieldCheck className="size-4" />
              Verify domain
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
