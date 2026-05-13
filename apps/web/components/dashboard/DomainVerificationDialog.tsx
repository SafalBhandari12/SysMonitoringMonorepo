"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DomainVerificationDialog({
  shouldShow,
}: {
  shouldShow: boolean;
}) {
  const [open, setOpen] = useState(shouldShow);

  if (!shouldShow) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-1 flex size-10 items-center justify-center rounded-lg bg-muted">
            <ShieldCheck className="size-5" />
          </div>
          <DialogTitle>Verify your domain</DialogTitle>
          <DialogDescription>
            You can explore the dashboard now, but monitored API creation needs
            a verified domain. Add or verify your domain before connecting live
            endpoints.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Dismiss
          </Button>
          <Button asChild>
            <Link href="/dashboard/domain">Go to Domain</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
