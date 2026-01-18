"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
// ExcelJS will be dynamically imported
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabaseGuestService } from "@/lib/services/guest-service";
import { supabaseEventService } from "@/lib/services/event-service";
import { supabaseNotificationService } from "@/lib/services/notification-service";
import { GuestCategory } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";
import {
  subscriptionService,
  UserSubscription,
} from "@/lib/services/subscription-service";
import {
  Upload,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DownloadTemplateButton } from "./download-template-button";

interface ImportedRow {
  rowNum: number;
  name: string;
  category: string;
  pax_count: string | number;
  status: "pending" | "success" | "error";
  error?: string;
}

interface ValidationError {
  limit: number;
  existing: number;
  attempting: number;
  remaining: number;
}

const VALID_CATEGORIES: GuestCategory[] = [
  "vip",
  "family",
  "colleague",
  "friend",
  "other",
];

export function ImportGuestDialog({
  eventId,
  onSuccess,
  disabled,
}: {
  eventId: string;
  onSuccess?: () => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [results, setResults] = useState<ImportedRow[] | null>(null);
  const [subscription, setSubscription] = useState<UserSubscription | null>(
    null,
  );
  const [existingGuestCount, setExistingGuestCount] = useState(0);
  const [validationError, setValidationError] =
    useState<ValidationError | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const reset = () => {
    setFile(null);
    setResults(null);
    setIsProcessing(false);
    setValidationError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResults(null);
      setValidationError(null);
    }
  };

  // Load subscription and existing guest count when dialog opens
  useEffect(() => {
    if (open && eventId) {
      const loadData = async () => {
        const supabase = createClient();
        const [sub, guests] = await Promise.all([
          subscriptionService.getSubscription(supabase),
          supabaseGuestService.getGuests(eventId),
        ]);
        setSubscription(sub);
        setExistingGuestCount(guests.length);
      };
      loadData();
    }
  }, [open, eventId]);

  const processImport = async () => {
    if (!file) return;
    setIsProcessing(true);
    setValidationError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const event = await supabaseEventService.getEventById(eventId);
        const eventSlug = event?.slug || "event";

        const data = e.target?.result as ArrayBuffer;
        const ExcelJS = (await import("exceljs")).default;
        const workbook = new ExcelJS.Workbook();
        await workbook.xlsx.load(data);
        const worksheet = workbook.worksheets[0];

        const rows: any[] = [];
        worksheet.eachRow((row, rowNumber) => {
          if (rowNumber === 1) return; // Skip header
          // Extract values (ExcelJS is 1-indexed)
          // row.values is [ <empty>, col1, col2, ... ]
          const rowValues = (row.values as any[]).slice(1);
          // Alternatively navigate directly:
          const name = row.getCell(1).text; // Use text to safely get string
          const category = row.getCell(2).text;
          const pax = row.getCell(3).value;

          rows.push([name, category, pax]);
        });

        // VALIDATION: Check if import would exceed subscription limit
        const guestLimit = subscription
          ? subscriptionService.getPlanLimits(subscription.plan_type).guests
          : 100;
        const remainingSlots = guestLimit - existingGuestCount;
        const rowsToImport = rows.filter((row) => {
          // Count only valid rows (rows with at least a name)
          const name = row[0]?.toString().trim();
          return name && name.length > 0;
        }).length;

        if (rowsToImport > remainingSlots) {
          setValidationError({
            limit: guestLimit,
            existing: existingGuestCount,
            attempting: rowsToImport,
            remaining: Math.max(0, remainingSlots),
          });
          setIsProcessing(false);
          return;
        }

        const processedRows: ImportedRow[] = [];

        // 1. Validation Phase
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          // Expecting: Name, Category, Pax Count in first 3 columns
          // Adjust based on your template needs, assuming standard columns [Name, Category, Pax]
          const name = row[0]?.toString().trim();
          const categoryRaw = row[1]?.toString().trim().toLowerCase();
          const paxRaw = row[2];

          const rowNum = i + 2; // Excel row number (1-based header + 1-based index)

          let error = "";

          if (!name) error = "Missing Guest Name";
          else if (!categoryRaw) error = "Missing Category";
          else if (!VALID_CATEGORIES.includes(categoryRaw as GuestCategory)) {
            error = `Invalid Category (Must be: ${VALID_CATEGORIES.join(
              ", ",
            )})`;
          } else if (!paxRaw || isNaN(parseInt(paxRaw)))
            error = "Invalid Pax Count";

          if (error) {
            processedRows.push({
              rowNum,
              name: name || "Unknown",
              category: categoryRaw || "-",
              pax_count: paxRaw || "-",
              status: "error",
              error,
            });
            continue;
          }

          // 2. Creation Phase
          try {
            // Deterministic Slug Generation
            let nameSlug = name
              .toLowerCase()
              .replace(/[^a-z0-9]+/g, "-")
              .replace(/(^-|-$)/g, "");

            if (!nameSlug) nameSlug = "guest"; // Fallback

            let candidateSlug = `${eventSlug}/${nameSlug}`;
            let counter = 1;
            let isUnique = false;

            // Simple uniqueness check loop
            // NOTE: For bulk imports, pre-fetching all slugs would be more efficient,
            // but for simplicity and safety against race conditions, we check per row.
            // A local cache 'usedSlugs' could optimize this loop for the current batch.
            while (!isUnique) {
              const existing =
                await supabaseGuestService.getGuestBySlug(candidateSlug);
              if (!existing) {
                isUnique = true;
              } else {
                candidateSlug = `${eventSlug}/${nameSlug}-${counter}`;
                counter++;
              }
            }

            await supabaseGuestService.createGuest(
              {
                name,
                category: categoryRaw as GuestCategory,
                pax_count: parseInt(paxRaw),
                phone_number: "", // Optional
                slug: candidateSlug,
                event_id: eventId,
              },
              { action: "import" },
            );

            processedRows.push({
              rowNum,
              name,
              category: categoryRaw,
              pax_count: paxRaw,
              status: "success",
            });
          } catch (err: any) {
            processedRows.push({
              rowNum,
              name,
              category: categoryRaw,
              pax_count: paxRaw,
              status: "error",
              error: "Failed to create: " + (err.message || "Unknown error"),
            });
          }
        }

        setResults(processedRows);

        const localSuccessCount = processedRows.filter(
          (r) => r.status === "success",
        ).length;
        const localErrorCount = processedRows.filter(
          (r) => r.status === "error",
        ).length;

        // Trigger system notification
        if (localSuccessCount > 0) {
          await supabaseNotificationService.createNotification({
            title: "✅ Guest Import Successful",
            message: `Successfully imported ${localSuccessCount} guests to ${
              event?.name || "your event"
            }.`,
            type: "info",
            metadata: {
              eventId,
              successCount: localSuccessCount,
              errorCount: localErrorCount,
            },
            link: `/dashboard/guests?status=draft`,
          });
        } else if (localErrorCount > 0) {
          await supabaseNotificationService.createNotification({
            title: "❌ Guest Import Failed",
            message: `Attempted to import guests to ${
              event?.name || "your event"
            } but all rows failed.`,
            type: "info",
            metadata: { eventId, errorCount: localErrorCount },
          });
        }

        router.refresh();
        onSuccess?.();
      } catch (error) {
        console.error("Import failed:", error);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const successCount =
    results?.filter((r) => r.status === "success").length || 0;
  const errorCount = results?.filter((r) => r.status === "error").length || 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2" disabled={disabled}>
          <FileSpreadsheet className="w-4 h-4" />
          Import Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[900px] max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Import Guests from Excel</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-2 text-muted-foreground text-sm">
              <span>
                Upload an .xlsx file with columns: <strong>Guest Name</strong>,{" "}
                <strong>Category</strong>, <strong>Pax Count</strong>.
              </span>
              <div className="pt-1">
                <DownloadTemplateButton />
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>

        {/* Validation Error Display */}
        {validationError && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-600 rounded-lg">
                <AlertCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-red-900 text-lg">
                  Cannot Import - Guest Limit Exceeded
                </h3>
                <p className="text-red-700 text-sm mt-1">
                  The Excel file contains more guests than your current plan
                  allows.
                </p>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Your Plan Limit
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {validationError.limit}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Existing Guests
                  </p>
                  <p className="text-2xl font-bold text-gray-900">
                    {validationError.existing}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Guests in Excel
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {validationError.attempting}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Can Import
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {validationError.remaining}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                <strong>What you can do:</strong>
              </p>
              <ul className="text-sm text-blue-800 mt-2 space-y-1 list-disc list-inside">
                <li>
                  Remove{" "}
                  <strong>
                    {validationError.attempting - validationError.remaining}
                  </strong>{" "}
                  guests from your Excel file and try again
                </li>
                <li>
                  You can only import{" "}
                  <strong>{validationError.remaining} more guest(s)</strong>{" "}
                  with your current plan
                </li>
                <li>Upgrade your plan to import more guests</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setValidationError(null);
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="flex-1"
              >
                Choose Different File
              </Button>
              <Button
                onClick={() => router.push("/dashboard/subscription")}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Upgrade Plan
              </Button>
            </div>
          </div>
        )}

        {!results && !validationError ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50/50">
            <input
              type="file"
              accept=".xlsx, .xls"
              className="hidden"
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {file ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet className="w-12 h-12 text-green-600" />
                <p className="font-medium text-gray-900">{file.name}</p>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 mt-2"
                >
                  Remove
                </Button>
              </div>
            ) : (
              <div
                className="flex flex-col items-center gap-2 cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-2">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="font-medium text-gray-900">
                  Click to upload file
                </p>
                <p className="text-sm text-gray-400">
                  Supported formats: .xlsx, .xls
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex flex-col gap-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="font-medium text-gray-900">
                  {successCount} Success
                </span>
              </div>
              <div className="h-4 w-[1px] bg-gray-300" />
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-600" />
                <span className="font-medium text-gray-900">
                  {errorCount} Failed
                </span>
              </div>
            </div>

            {errorCount > 0 && (
              <ScrollArea className="h-[300px] rounded-xl border border-gray-200">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-50 sticky top-0">
                      <TableHead className="w-[80px]">Row</TableHead>
                      <TableHead>Guest Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="w-[100px]">Pax</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results
                      ?.filter((r) => r.status === "error")
                      .map((row, i) => (
                        <TableRow key={i}>
                          <TableCell className="font-mono text-gray-500 w-[60px] align-top">
                            {row.rowNum}
                          </TableCell>
                          <TableCell className="font-medium whitespace-normal break-words max-w-[150px]">
                            {row.name}
                          </TableCell>
                          <TableCell className="capitalize whitespace-nowrap">
                            <span
                              className={cn(
                                "text-sm",
                                row.error?.includes("Category")
                                  ? "text-red-600 font-bold"
                                  : "text-gray-600",
                              )}
                            >
                              {row.category}
                            </span>
                          </TableCell>
                          <TableCell className="font-mono">
                            <span
                              className={cn(
                                "text-sm",
                                row.error?.includes("Pax")
                                  ? "text-red-600 font-bold"
                                  : "text-gray-600",
                              )}
                            >
                              {row.pax_count}
                            </span>
                          </TableCell>
                          <TableCell className="text-red-600 text-sm whitespace-normal break-words">
                            {row.error}
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}

            {errorCount === 0 && (
              <div className="flex flex-col items-center justify-center text-center py-12 space-y-2">
                <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-gray-900">
                  All guests imported successfully!
                </h3>
                <p className="text-gray-500 text-sm">
                  You can close this window now.
                </p>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="mt-4">
          {!results ? (
            <>
              {validationError ? (
                <Button
                  onClick={() => {
                    setOpen(false);
                    reset();
                  }}
                  className="w-full sm:w-auto"
                >
                  Close
                </Button>
              ) : (
                <Button
                  onClick={processImport}
                  disabled={!file || isProcessing}
                  className="w-full sm:w-auto"
                >
                  {isProcessing && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  {isProcessing ? "Processing..." : "Start Import"}
                </Button>
              )}
            </>
          ) : (
            <Button
              onClick={() => {
                setOpen(false);
                reset();
              }}
              className="w-full sm:w-auto"
            >
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
