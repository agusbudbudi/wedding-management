"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Calendar,
  MapPin,
  Heart,
  Building2,
  Users,
  GraduationCap,
  Sparkles,
  Gift,
} from "lucide-react";
import { InvitationTemplateType, InvitationMetadata } from "@/lib/types";

import { InvitationDisplay } from "./invitation-display";

interface InvitationPreviewDialogProps {
  title: string;
  content: string;
  templateType: InvitationTemplateType;
  metadata: InvitationMetadata;
}

export function InvitationPreviewDialog({
  title,
  content,
  templateType,
  metadata,
}: InvitationPreviewDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="gap-2 border-primary text-primary hover:bg-blue-50"
        >
          <Eye className="w-4 h-4" />
          Preview
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden rounded-[2.5rem] border-0 shadow-2xl">
        <DialogHeader className="hidden">
          <DialogTitle>Invitation Preview</DialogTitle>
        </DialogHeader>

        <div className="h-[750px] overflow-y-auto no-scrollbar bg-white">
          <InvitationDisplay
            title={title}
            content={content}
            templateType={templateType}
            metadata={metadata}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
