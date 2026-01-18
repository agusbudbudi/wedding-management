"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabaseGuestService } from "@/lib/services/guest-service";
import { usePermissions } from "@/lib/hooks/use-permissions";

import { AddGuestDialog } from "./add-guest-dialog";

import { Guest, Event as WeddingEvent } from "@/lib/types";
import { WhatsAppShareDialog } from "@/components/features/whatsapp-share/share-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Edit,
  Trash2,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  AlertCircle,
  Loader2,
  Filter,
  ListFilter,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";

interface GuestListProps {
  initialGuests: Guest[];
  activeEvent?: WeddingEvent | null;
  onRefresh?: () => void;
}

export function GuestList({
  initialGuests,
  activeEvent,
  onRefresh,
}: GuestListProps) {
  const router = useRouter();
  const { hasPermission } = usePermissions();
  const searchParams = useSearchParams();
  const [filterStatus, setFilterStatus] = useState<string | null>(
    searchParams.get("status") || null
  );
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const searchQuery = searchParams.get("q")?.toLowerCase() || "";

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Deletion state
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const canViewDetail = hasPermission("guest_list", "view");
  const canEdit = hasPermission("guest_list", "edit");
  const canDelete = hasPermission("guest_list", "delete");
  const canSendInvitation = hasPermission("guest_list", "send_invitation");

  const categories = Array.from(
    new Set(initialGuests.map((g) => g.category).filter(Boolean))
  );

  const filteredGuests = initialGuests.filter((guest) => {
    const statusMatch = !filterStatus || guest.status === filterStatus;
    const categoryMatch = !filterCategory || guest.category === filterCategory;
    const searchMatch =
      !searchQuery ||
      guest.name.toLowerCase().includes(searchQuery) ||
      guest.slug.toLowerCase().includes(searchQuery);

    return statusMatch && categoryMatch && searchMatch;
  });

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus, filterCategory, searchQuery]);

  const totalItems = filteredGuests.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedGuests = filteredGuests.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await supabaseGuestService.deleteGuest(id);
      toast.success("Guest deleted successfully");
      onRefresh?.();
      setDeleteConfirmId(null);
    } catch (error: any) {
      setDeleteError(error.message || "Failed to delete guest");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[1.5rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden border border-gray-100/50">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50/50 border-gray-100 hover:bg-gray-50/50">
              <TableHead className="w-[300px] text-xs font-semibold uppercase tracking-wider text-gray-400 pl-6 py-4">
                Guest Name
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                <div className="flex items-center gap-2">
                  Category
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 relative"
                      >
                        <Filter className="h-3.5 w-3.5" />
                        {filterCategory && (
                          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-white" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[200px] rounded-lg"
                    >
                      <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={filterCategory === null}
                        onCheckedChange={() => setFilterCategory(null)}
                      >
                        All Categories
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      {categories.map((category) => (
                        <DropdownMenuCheckboxItem
                          key={category}
                          checked={filterCategory === category}
                          onCheckedChange={() =>
                            setFilterCategory(
                              filterCategory === category ? null : category
                            )
                          }
                          className="capitalize"
                        >
                          {category}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Invite Pax
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Pax
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                <div className="flex items-center gap-2">
                  Status
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 relative"
                      >
                        <Filter className="h-3.5 w-3.5" />
                        {filterStatus && (
                          <span className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-blue-500 ring-2 ring-white" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="start"
                      className="w-[200px] rounded-lg"
                    >
                      <DropdownMenuLabel>Filter by Status</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuCheckboxItem
                        checked={filterStatus === null}
                        onCheckedChange={() => setFilterStatus(null)}
                      >
                        All Statuses
                      </DropdownMenuCheckboxItem>
                      <DropdownMenuSeparator />
                      {[
                        "draft",
                        "sent",
                        "viewed",
                        "confirmed",
                        "declined",
                        "attended",
                        "souvenir_delivered",
                      ].map((status) => (
                        <DropdownMenuCheckboxItem
                          key={status}
                          checked={filterStatus === status}
                          onCheckedChange={() =>
                            setFilterStatus(
                              filterStatus === status ? null : status
                            )
                          }
                          className="capitalize"
                        >
                          {status === "souvenir_delivered"
                            ? "Souvenir Redeemed"
                            : status.replace("_", " ")}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TableHead>
              <TableHead className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Wishes
              </TableHead>
              <TableHead className="text-right text-xs font-semibold uppercase tracking-wider text-gray-400 pr-6">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedGuests.map((guest) => (
              <TableRow
                key={guest.id}
                className="group border-gray-50 hover:bg-blue-50/30 transition-colors"
              >
                <TableCell className="font-medium pl-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">
                      {guest.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">
                        {guest.name}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        /{guest.slug}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-gray-100 text-gray-600 hover:bg-gray-200 capitalize font-medium px-2.5 py-1 rounded-lg"
                  >
                    {guest.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded-md">
                    {guest.pax_count}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "font-mono text-sm px-2 py-1 rounded-md",
                      guest.attended_pax && guest.attended_pax > 0
                        ? "bg-green-50 text-green-700"
                        : "bg-gray-50 text-gray-600"
                    )}
                  >
                    {guest.attended_pax !== null &&
                    guest.attended_pax !== undefined
                      ? guest.attended_pax
                      : "-"}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <StatusBadge status={guest.status} />
                    {guest.updated_at && (
                      <span className="text-[10px] text-gray-400 font-mono">
                        {format(new Date(guest.updated_at), "dd MMM, HH:mm")}
                        {guest.last_log && (
                          <>
                            {" by "}
                            <span className="text-gray-500 font-semibold">
                              {(() => {
                                // 1. Try profile name
                                if (guest.last_log.profile?.full_name)
                                  return guest.last_log.profile.full_name;
                                if (guest.last_log.profile?.email)
                                  return guest.last_log.profile.email;

                                // 2. Robust Fallback: Extract from description if it's there
                                const desc = guest.last_log.description;
                                if (desc.includes(" by ")) {
                                  const parts = desc.split(" by ");
                                  let name = parts[parts.length - 1];
                                  // Clean up if there is an email in parens
                                  if (name.includes(" (")) {
                                    name = name.split(" (")[0];
                                  }
                                  name = name.trim();

                                  if (
                                    name &&
                                    name !== "[staff]" &&
                                    name !== "[staff name]" &&
                                    name !== "System"
                                  ) {
                                    return name;
                                  }
                                }

                                return "System";
                              })()}
                            </span>
                          </>
                        )}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px]">
                  <p
                    className="text-sm text-gray-600 truncate"
                    title={guest.wishes || ""}
                  >
                    {guest.wishes || "-"}
                  </p>
                </TableCell>
                <TableCell className="text-right pr-6 space-x-1">
                  <div className="flex justify-end gap-1">
                    <Link href={`/invitation/${guest.slug}`} target="_blank">
                      <Button
                        variant="ghost"
                        size="icon"
                        title="View Invite"
                        className="h-8 w-8 text-gray-400 hover:text-primary hover:bg-blue-50"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    </Link>

                    {canSendInvitation && (
                      <WhatsAppShareDialog
                        guest={guest}
                        event={activeEvent || undefined}
                        onSuccess={onRefresh}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            title="Share on WhatsApp"
                            className="h-8 w-8 text-gray-400 hover:text-green-600 hover:bg-green-50"
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="16"
                              height="16"
                              fill="currentColor"
                              className="w-4 h-4"
                            >
                              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                          </Button>
                        }
                      />
                    )}

                    {(canEdit || canViewDetail) && (
                      <AddGuestDialog
                        guest={guest}
                        eventId={guest.event_id || ""}
                        onSuccess={onRefresh}
                        trigger={
                          <Button
                            variant="ghost"
                            size="icon"
                            title={canEdit ? "Edit" : "View details"}
                            className="h-8 w-8 text-gray-400 hover:text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        }
                      />
                    )}

                    {canDelete && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Delete"
                        onClick={() => {
                          setDeleteConfirmId(guest.id);
                        }}
                        className="h-8 w-8 text-gray-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredGuests.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="h-32 text-center text-gray-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                      <Filter className="w-6 h-6 text-gray-300" />
                    </div>
                    <p>
                      {filterStatus || filterCategory || searchQuery
                        ? `No guests found matching the selected filters`
                        : "No guests found. Add some guests to get started."}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-2 py-4">
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {startIndex + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900">
              {Math.min(startIndex + ITEMS_PER_PAGE, totalItems)}
            </span>{" "}
            of <span className="font-semibold text-gray-900">{totalItems}</span>{" "}
            guests
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-9 w-9 p-0 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => {
                  // Showing only a range of pages if totalPages is large
                  if (
                    totalPages > 7 &&
                    page !== 1 &&
                    page !== totalPages &&
                    Math.abs(page - currentPage) > 1
                  ) {
                    if (Math.abs(page - currentPage) === 2) {
                      return (
                        <MoreHorizontal
                          key={page}
                          className="h-4 w-4 text-gray-400 mx-1"
                        />
                      );
                    }
                    return null;
                  }

                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => goToPage(page)}
                      className={cn(
                        "h-9 w-9 p-0 rounded-xl transition-all duration-200",
                        currentPage === page
                          ? "shadow-lg shadow-blue-500/30"
                          : "hover:bg-blue-50 hover:text-blue-600 hover:border-blue-100"
                      )}
                    >
                      {page}
                    </Button>
                  );
                }
              )}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="h-9 w-9 p-0 rounded-xl"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!deleteConfirmId}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirmId(null);
            setDeleteError(null);
          }
        }}
      >
        <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-gray-900">
              Delete Guest?
            </DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <p className="text-gray-500">
              Are you sure you want to delete this guest? This action cannot be
              undone and all associated data (RSVP, etc.) will be permanently
              removed.
            </p>

            {deleteError && (
              <div className="flex gap-2 p-3 rounded-2xl bg-red-50 border border-red-100 text-red-600 animate-in fade-in slide-in-from-top-1 duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <p className="text-xs font-semibold leading-relaxed">
                  {deleteError}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmId(null);
                setDeleteError(null);
              }}
              className="rounded-xl font-bold"
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirmId && handleDelete(deleteConfirmId)}
              className="rounded-xl font-bold shadow-lg shadow-red-100"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Guest"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    draft: "bg-gray-100 text-gray-500 border-gray-200",
    sent: "bg-blue-50 text-blue-600 border-blue-100",
    viewed: "bg-indigo-50 text-indigo-600 border-indigo-100",
    confirmed: "bg-green-50 text-green-600 border-green-100",
    declined: "bg-red-50 text-red-600 border-red-100",
    attended: "bg-purple-50 text-purple-600 border-purple-100",
    souvenir_delivered: "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-semibold capitalize border ${
        styles[status] || styles.draft
      }`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === "confirmed" ||
          status === "attended" ||
          status === "souvenir_delivered"
            ? "bg-green-500"
            : status === "declined"
            ? "bg-red-500"
            : status === "sent"
            ? "bg-blue-500"
            : "bg-gray-400"
        }`}
      />
      {status === "souvenir_delivered"
        ? "Souvenir Redeemed"
        : status.replace("_", " ")}
    </span>
  );
}
