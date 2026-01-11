"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Guest } from "@/lib/types";
import { supabaseGuestService } from "@/lib/services/guest-service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Copy, Send, MessageCircle } from "lucide-react";

interface WhatsAppShareDialogProps {
  guest: Guest;
  trigger?: React.ReactNode;
  onSuccess?: () => void;
}

export function WhatsAppShareDialog({
  guest,
  trigger,
  onSuccess,
}: WhatsAppShareDialogProps) {
  const [open, setOpen] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const inviteLink = `${baseUrl}/invitation/${guest.slug}`;

  const defaultTemplate = `Hi ${guest.name},

You are invited to the wedding of Budi & Siti!
Save the date: Sunday, 20 October 2025.

Please confirm your attendance here:
${inviteLink}

We look forward to celebrating with you!`;

  const [message, setMessage] = useState(defaultTemplate);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    // Could add toast here
  };

  const handleSend = async () => {
    try {
      // Update status to sent and update time log
      await supabaseGuestService.updateGuest(guest.id, {
        status: "sent",
        updated_at: new Date().toISOString(),
      });

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/?text=${encodedMessage}`;
      window.open(waUrl, "_blank");

      // Success feedback
      toast.success("Invitation shared to WhatsApp!");
      setOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Error updating guest status:", error);
      toast.error("Failed to update status, but opening WhatsApp...");

      const encodedMessage = encodeURIComponent(message);
      const waUrl = `https://wa.me/?text=${encodedMessage}`;
      window.open(waUrl, "_blank");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="icon" title="Share via WhatsApp">
            <MessageCircle className="w-4 h-4 text-green-600" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Invitation</DialogTitle>
          <DialogDescription>
            Send this personalized message to {guest.name} via WhatsApp.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Message Preview</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="h-[200px] font-mono text-sm"
            />
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between gap-2">
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            <Copy className="w-4 h-4" />
            Copy Text
          </Button>
          <Button
            onClick={handleSend}
            className="bg-green-600 hover:bg-green-700 gap-2"
          >
            <Send className="w-4 h-4" />
            Open WhatsApp
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
