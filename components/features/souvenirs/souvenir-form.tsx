"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Gift,
  Package,
  Star,
  Heart,
  Crown,
  Sparkles,
  Trophy,
  Medal,
  Gem,
  Hexagon,
  Award,
  CircleDot,
  Boxes,
  Coins,
  Flower2,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Souvenir, CreateSouvenirParams } from "@/lib/types/souvenir";
import { souvenirService } from "@/lib/services/souvenir-service";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  stock: z.coerce.number().min(0, "Stock must be at least 0"),
  icon: z.string().min(1, "Icon is required"),
  color: z.string().min(1, "Color is required"),
  category_restrictions: z.array(z.string()).optional(),
});

const SOUVENIR_ICONS = [
  { name: "Gift", component: Gift },
  { name: "Package", component: Package },
  { name: "Star", component: Star },
  { name: "Heart", component: Heart },
  { name: "Crown", component: Crown },
  { name: "Sparkles", component: Sparkles },
  { name: "Trophy", component: Trophy },
  { name: "Medal", component: Medal },
  { name: "Gem", component: Gem },
  { name: "Hexagon", component: Hexagon },
  { name: "Award", component: Award },
  { name: "CircleDot", component: CircleDot },
  { name: "Boxes", component: Boxes },
  { name: "Coins", component: Coins },
  { name: "Flower2", component: Flower2 },
];

const SOUVENIR_COLORS = [
  {
    name: "Blue",
    value: "bg-blue-100 text-blue-600",
    border: "border-blue-200",
  },
  {
    name: "Green",
    value: "bg-green-100 text-green-600",
    border: "border-green-200",
  },
  {
    name: "Purple",
    value: "bg-purple-100 text-purple-600",
    border: "border-purple-200",
  },
  {
    name: "Amber",
    value: "bg-amber-100 text-amber-600",
    border: "border-amber-200",
  },
  {
    name: "Rose",
    value: "bg-rose-100 text-rose-600",
    border: "border-rose-200",
  },
  {
    name: "Indigo",
    value: "bg-indigo-100 text-indigo-600",
    border: "border-indigo-200",
  },
  {
    name: "Teal",
    value: "bg-teal-100 text-teal-600",
    border: "border-teal-200",
  },
  {
    name: "Slate",
    value: "bg-slate-100 text-slate-600",
    border: "border-slate-200",
  },
  {
    name: "Red",
    value: "bg-red-100 text-red-600",
    border: "border-red-200",
  },
  {
    name: "Orange",
    value: "bg-orange-100 text-orange-600",
    border: "border-orange-200",
  },
];

interface SouvenirFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventId: string;
  souvenirToEdit?: Souvenir;
  onSuccess: () => void;
}

const CATEGORIES = [
  { label: "VIP", value: "vip" },
  { label: "Family", value: "family" },
  { label: "Friend", value: "friend" },
  { label: "Colleague", value: "colleague" },
  { label: "Other", value: "other" },
];

export function SouvenirForm({
  open,
  onOpenChange,
  eventId,
  souvenirToEdit,
  onSuccess,
}: SouvenirFormProps) {
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema) as any,
    defaultValues: {
      name: souvenirToEdit?.name || "",
      description: souvenirToEdit?.description || "",
      stock: souvenirToEdit?.stock || 0,
      icon: souvenirToEdit?.icon || "Gift",
      color: souvenirToEdit?.color || "bg-blue-100 text-blue-600",
      category_restrictions: souvenirToEdit?.category_restrictions || [],
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: souvenirToEdit?.name || "",
        description: souvenirToEdit?.description || "",
        stock: souvenirToEdit?.stock || 0,
        icon: souvenirToEdit?.icon || "Gift",
        color: souvenirToEdit?.color || "bg-blue-100 text-blue-600",
        category_restrictions: souvenirToEdit?.category_restrictions || [],
      });
    }
  }, [souvenirToEdit, open, form]);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      if (souvenirToEdit) {
        await souvenirService.updateSouvenir(souvenirToEdit.id, values);
        toast.success("Souvenir updated successfully");
      } else {
        await souvenirService.createSouvenir({
          ...values,
          event_id: eventId,
        });
        toast.success("Souvenir created successfully");
      }
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error(error);
      toast.error("Failed to save souvenir");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {souvenirToEdit ? "Edit Souvenir" : "Add New Souvenir"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-4">
              <Label>Appearance</Label>
              <FormDescription>
                Customize the icon and color theme for this souvenir.
              </FormDescription>
              <div className="flex justify-start">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div
                      className={`
                        w-14 h-14 rounded-2xl cursor-pointer transition-all hover:scale-105 active:scale-95 flex items-center justify-center relative shadow-sm hover:shadow-md
                        ${form.watch("color")}
                      `}
                    >
                      {(() => {
                        const currentIcon = form.watch("icon");
                        const iconObj =
                          SOUVENIR_ICONS.find((i) => i.name === currentIcon) ||
                          SOUVENIR_ICONS[0];
                        const IconComp = iconObj.component;
                        return <IconComp className="w-7 h-7 opacity-80" />;
                      })()}

                      {/* Pencil Edit Indicator */}
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center text-gray-500 group-hover:text-primary transition-colors">
                        <Pencil className="w-2.5 h-2.5" />
                      </div>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 p-3" align="start">
                    <div className="space-y-3">
                      <div>
                        <DropdownMenuLabel className="px-0 mb-1.5 text-xs">
                          Select Icon
                        </DropdownMenuLabel>
                        <div className="grid grid-cols-5 gap-1.5">
                          {SOUVENIR_ICONS.map((icon) => {
                            const IconComp = icon.component;
                            const isSelected = form.watch("icon") === icon.name;
                            return (
                              <div
                                key={icon.name}
                                onClick={() =>
                                  form.setValue("icon", icon.name, {
                                    shouldValidate: true,
                                  })
                                }
                                className={`
                                  cursor-pointer flex items-center justify-center p-1 rounded-xl border transition-all aspect-square
                                  ${
                                    isSelected
                                      ? "bg-primary/10 border-primary text-primary"
                                      : "bg-white border-gray-100 hover:bg-gray-50 hover:border-gray-200"
                                  }
                                `}
                                title={icon.name}
                              >
                                <IconComp className="w-4 h-4" />
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <DropdownMenuSeparator />

                      <div>
                        <DropdownMenuLabel className="px-0 mb-1.5 text-xs">
                          Select Color
                        </DropdownMenuLabel>
                        <div className="grid grid-cols-5 gap-1.5">
                          {SOUVENIR_COLORS.map((color) => {
                            const isSelected =
                              form.watch("color") === color.value;
                            return (
                              <div
                                key={color.name}
                                onClick={() =>
                                  form.setValue("color", color.value, {
                                    shouldValidate: true,
                                  })
                                }
                                className={`
                                  cursor-pointer w-full aspect-square rounded-xl border-0 flex items-center justify-center transition-all
                                  ${color.value.split(" ")[0]} 
                                  ${
                                    isSelected
                                      ? "ring-1 ring-blue-500 ring-offset-0"
                                      : "border-transparent hover:scale-110"
                                  }
                                `}
                                title={color.name}
                              >
                                {isSelected && null}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <input type="hidden" {...form.register("icon")} />
              <input type="hidden" {...form.register("color")} />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Gold Gift Box" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Quantity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Details about this souvenir..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category_restrictions"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Allowed Categories
                    </FormLabel>
                    <FormDescription>
                      Select which guest categories can receive this souvenir.
                      Leave empty for all.
                    </FormDescription>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORIES.map((item) => (
                      <FormField
                        key={item.value}
                        control={form.control}
                        name="category_restrictions"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.value}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.value)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...(field.value || []),
                                          item.value,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.value
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
