"use client";

import { useState, useTransition } from "react";
import { Share2, CalendarPlus, FileDown, Trash2, Copy, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { deleteTrip, ensureShareToken } from "@/lib/actions";
import { useI18n } from "@/components/i18n-provider";

export default function TripActions({ tripId }: { tripId: string }) {
  const { t } = useI18n();
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [deleting, startDeleting] = useTransition();
  const [loadingShare, startShare] = useTransition();

  const openShare = (open: boolean) => {
    if (open && !shareUrl) {
      startShare(async () => {
        const { token } = await ensureShareToken(tripId);
        setShareUrl(`${window.location.origin}/share/${token}`);
      });
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="no-print flex flex-wrap gap-2">
      <Dialog onOpenChange={openShare}>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm" className="rounded-full">
            <Share2 className="size-4" />
            {t.actions.share}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.actions.shareTitle}</DialogTitle>
            <DialogDescription>{t.actions.shareDesc}</DialogDescription>
          </DialogHeader>
          <div className="flex gap-2">
            <Input readOnly value={loadingShare ? t.actions.creatingLink : shareUrl} className="bg-secondary font-mono text-sm" />
            <Button onClick={copy} disabled={!shareUrl} size="icon" aria-label={t.actions.copyLink}>
              {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <Button variant="secondary" size="sm" className="rounded-full" asChild>
        <a href={`/api/trips/${tripId}/ics`} download>
          <CalendarPlus className="size-4" />
          {t.actions.calendar}
        </a>
      </Button>

      <Button variant="secondary" size="sm" className="rounded-full" asChild>
        <a href={`/api/trips/${tripId}/pdf`} download>
          <FileDown className="size-4" />
          {t.actions.pdf}
        </a>
      </Button>

      <Dialog>
        <DialogTrigger asChild>
          <Button variant="secondary" size="sm" className="rounded-full text-destructive hover:text-destructive">
            <Trash2 className="size-4" />
            {t.actions.delete}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.actions.deleteTitle}</DialogTitle>
            <DialogDescription>{t.actions.deleteDesc}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="destructive"
              disabled={deleting}
              onClick={() =>
                startDeleting(() => deleteTrip(tripId))
              }
              className="rounded-full"
            >
              {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
              {t.actions.deleteBtn}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
