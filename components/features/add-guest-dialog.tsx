"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { logService } from "@/lib/services/log-service";
import { Guest, GuestLog } from "@/lib/types";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { supabaseGuestService } from "@/lib/services/guest-service";
import { supabaseEventService } from "@/lib/services/event-service";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { usePermissions } from "@/lib/hooks/use-permissions";

// Use string for pax_count in schema to match HTML input value, then parse later.
// This avoids type conflicts between "number" in schema and "string" from DOM input.
const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  slug: z
    .string()
    .min(3, { message: "Slug must be unique and at least 3 chars." })
    .regex(/^[a-z0-9-\/]+$/, {
      message: "Slug must be lowercase alphanumeric with dashes and slashes.",
    }),
  category: z.enum(["vip", "family", "colleague", "friend", "other"]),
  pax_count: z
    .string()
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
      message: "Pax must be at least 1",
    }),
  phone_number: z.string().optional(),
});

interface AddGuestDialogProps {
  guest?: Guest;
  trigger?: React.ReactNode;
  eventId: string;
  onSuccess?: () => void;
  disabled?: boolean;
}

export function AddGuestDialog({
  guest,
  trigger,
  eventId,
  onSuccess,
  disabled,
}: AddGuestDialogProps) {
  // State for event slug
  const [eventSlug, setEventSlug] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState<GuestLog[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const router = useRouter();
  const { hasPermission } = usePermissions();

  const isEditMode = !!guest;
  const canEdit = hasPermission("guest_list", "edit");
  const canAdd = hasPermission("guest_list", "add");
  const canWrite = isEditMode ? canEdit : canAdd;

  useEffect(() => {
    if (open && isEditMode && guest) {
      loadLogs();
    }
  }, [open, isEditMode, guest]);

  const loadLogs = async () => {
    if (!guest) return;
    setIsLoadingLogs(true);
    try {
      const data = await logService.getLogsByGuestId(guest.id);
      setLogs(data);
    } catch (error) {
      console.error("Failed to load logs", error);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  useEffect(() => {
    supabaseEventService.getEventById(eventId).then((event) => {
      if (event?.slug) setEventSlug(event.slug);
    });
  }, [eventId]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: guest?.name || "",
      slug: guest?.slug || "",
      category: guest?.category || "friend",
      pax_count: guest ? String(guest.pax_count) : "1",
      phone_number: guest?.phone_number || "",
    },
  });

  const { isSubmitting } = form.formState;

  // Auto-generate slug from name
  const onNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    if (!form.formState.dirtyFields.slug && eventSlug) {
      const guestSlug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      const fullSlug = `${eventSlug}/${guestSlug}`;
      form.setValue("slug", fullSlug);
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (isEditMode && guest) {
        await supabaseGuestService.updateGuest(guest.id, {
          ...values,
          pax_count: parseInt(values.pax_count, 10),
        } as any);
      } else {
        await supabaseGuestService.createGuest({
          ...values,
          pax_count: parseInt(values.pax_count, 10),
          event_id: eventId,
        });
      }
      setOpen(false);
      form.reset();
      router.refresh();
      toast.success(isEditMode ? "Guest updated" : "Guest added");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to save guest", error);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button disabled={disabled}>
            <Plus className="w-4 h-4 mr-2" />
            Add Guest
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Edit Guest" : "Add New Guest"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? canEdit
                ? "Update guest details."
                : "View guest details and history."
              : "Create an invitation for a new guest. They will be added to the guest list."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-white border border-gray-100 p-1.5 rounded-xl h-auto">
            <TabsTrigger
              value="details"
              className="rounded-lg py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all duration-300 text-gray-500 font-medium"
            >
              Details
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-lg py-1.5 data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg data-[state=active]:shadow-blue-500/30 transition-all duration-300 text-gray-500 font-medium"
              disabled={!isEditMode}
            >
              History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="details">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4 mt-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Guest Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Budi Santoso"
                          {...field}
                          disabled={!canWrite}
                          onChange={(e) => {
                            field.onChange(e);
                            onNameChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invitation Slug (URL)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. budi-santoso"
                          {...field}
                          disabled={!canWrite}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                          disabled={!canWrite}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select one" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="vip">VIP</SelectItem>
                            <SelectItem value="family">Family</SelectItem>
                            <SelectItem value="friend">Friend</SelectItem>
                            <SelectItem value="colleague">Colleague</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="pax_count"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pax Count</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min="1"
                            {...field}
                            disabled={!canWrite}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {isEditMode && guest?.wishes && (
                  <div className="space-y-2 p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
                    <div className="flex items-center gap-2 text-blue-600">
                      <MessageSquare className="w-4 h-4" />
                      <span className="text-sm font-semibold">
                        Guest Wishes
                      </span>
                    </div>
                    <Textarea
                      value={guest.wishes}
                      readOnly
                      className="border-0 focus-visible:ring-blue-200 resize-none text-gray-700 min-h-[40px] shadow-none"
                    />
                  </div>
                )}

                {canWrite && (
                  <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {isEditMode ? "Update Guest" : "Save Guest"}
                    </Button>
                  </DialogFooter>
                )}
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="history">
            <ScrollArea className="h-[450px] pr-4">
              <div className="relative pl-6 border-l-2 border-blue-100 ml-3 mt-4 space-y-6">
                {logs.length === 0 && !isLoadingLogs && (
                  <div className="text-center py-8 text-gray-500">
                    No history recorded yet.
                  </div>
                )}
                {isLoadingLogs && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
                  </div>
                )}
                {logs.map((log) => (
                  <div key={log.id} className="relative">
                    {/* Dot */}
                    <div className="absolute -left-[33px] w-4 h-4 rounded-full bg-white border-4 border-blue-500 shadow-sm" />

                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-gray-900">
                          {log.title}
                        </h4>
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-50 px-2 py-0.5 rounded-full">
                          {format(
                            new Date(log.created_at),
                            "dd MMM yyyy, HH:mm"
                          )}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500">{log.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
