import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Plus, Loader2 } from "lucide-react";
import { supabaseTableService } from "@/lib/services/table-service";
import { useRouter } from "next/navigation";
import { Table } from "@/lib/types";
import { Textarea } from "@/components/ui/textarea";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Table name must be at least 2 characters." }),
  capacity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "Capacity must be at least 1",
  }),
  shape: z.enum(["round", "rect"]),
  notes: z.string().optional(),
});

interface AddTableDialogProps {
  eventId: string;
  onSuccess?: () => void;
  table?: Table | null; // For Edit Mode
  open?: boolean; // Controlled state
  onOpenChange?: (open: boolean) => void;
}

export function AddTableDialog({
  eventId,
  onSuccess,
  table,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: AddTableDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const router = useRouter();

  const isControlled = controlledOpen !== undefined;
  const show = isControlled ? controlledOpen : internalOpen;
  const setShow = isControlled ? setControlledOpen! : setInternalOpen;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      capacity: "10",
      shape: "round",
      notes: "",
    },
  });

  // Effect to reset form when table changes (Edit Mode)
  useEffect(() => {
    if (show) {
      if (table) {
        form.reset({
          name: table.name,
          capacity: table.capacity.toString(),
          shape: table.shape as "round" | "rect",
          notes: table.notes || "",
        });
      } else {
        form.reset({
          name: "",
          capacity: "10",
          shape: "round",
          notes: "",
        });
      }
    }
  }, [table, show, form]);

  const { isSubmitting } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      if (table) {
        // Update
        await supabaseTableService.updateTable(table.id, {
          name: values.name,
          capacity: parseInt(values.capacity, 10),
          shape: values.shape,
          notes: values.notes,
        });
      } else {
        // Create
        await supabaseTableService.createTable({
          ...values,
          capacity: parseInt(values.capacity, 10),
          event_id: eventId,
        });
      }

      setShow(false);
      form.reset();
      router.refresh();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Failed to save table", error);
    }
  }

  return (
    <Dialog open={show} onOpenChange={setShow}>
      {!isControlled && (
        <DialogTrigger asChild>
          <Button disabled={!eventId} className="cursor-pointer">
            <Plus className="w-4 h-4 mr-2" />
            Add Table
          </Button>
        </DialogTrigger>
      )}
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{table ? "Edit Table" : "Add New Table"}</DialogTitle>
          <DialogDescription>
            {table
              ? "Make changes to the table details."
              : "Create a new table for seating arrangement."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 py-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Table Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. VIP 1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacity</FormLabel>
                    <FormControl>
                      <Input type="number" min="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="shape"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shape</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="cursor-pointer">
                          <SelectValue placeholder="Select one" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="round" className="cursor-pointer">
                          Round
                        </SelectItem>
                        <SelectItem value="rect" className="cursor-pointer">
                          Rectangular
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="e.g. Near stage, Needs high chair..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full cursor-pointer"
              >
                {isSubmitting && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                {table ? "Save Changes" : "Create Table"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
