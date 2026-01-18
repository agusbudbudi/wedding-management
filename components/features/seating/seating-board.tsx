"use client";

import { useState, useEffect } from "react";
import { Guest, Table } from "@/lib/types";
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  useDraggable,
  useDroppable,
} from "@dnd-kit/core";
import { supabaseTableService } from "@/lib/services/table-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  User,
  Users,
  GripVertical,
  Trash2,
  Hash,
  AlertCircle,
  Loader2,
  Filter,
  ChevronDown,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Search,
  ListFilter,
  XCircle,
  X,
  Pencil,
  StickyNote,
} from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/lib/hooks/use-permissions";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { AddTableDialog } from "./add-table-dialog";

interface SeatingBoardProps {
  initialGuests: Guest[];
  initialTables: Table[];
  onRefresh?: () => void;
}

// Droppable wrapper for guest list area
function DroppableGuestList({ children }: { children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({
    id: "unassigned",
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-200 ${
        isOver ? "bg-green-50/50" : ""
      }`}
    >
      {children}
    </div>
  );
}

// Droppable wrapper for table cards
function DroppableTableCard({
  tableId,
  children,
}: {
  tableId: string;
  children: (isOver: boolean) => React.ReactNode;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: tableId,
  });

  return (
    <div ref={setNodeRef} className="h-full">
      {children(isOver)}
    </div>
  );
}

// Draggable guest item inside table cards
function DraggableTableGuest({
  guest,
  tableId,
  canEdit,
  onAssign,
}: {
  guest: Guest;
  tableId: string;
  canEdit: boolean;
  onAssign: (guestId: string, tableId: string) => void;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `table::${tableId}::${guest.id}`,
    disabled: !canEdit,
  });

  const isCheckedIn =
    guest.status === "attended" || guest.status === "souvenir_delivered";

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`group text-sm flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-transparent hover:border-gray-200 transition-colors select-none ${
        isDragging ? "opacity-50" : ""
      } ${canEdit ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full flex-shrink-0" />
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-gray-700" title={guest.name}>
              {guest.name}
            </span>
            {isCheckedIn && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 fill-green-50/50 cursor-default" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px]">
                  {guest.status === "souvenir_delivered"
                    ? "Souvenir Redeemed"
                    : "Attended"}
                </TooltipContent>
              </Tooltip>
            )}
            {guest.status === "declined" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <XCircle className="w-3.5 h-3.5 text-red-500 fill-red-50/50 cursor-default" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px]">
                  Declined
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <span className="text-[10px] text-gray-400">
            Invite: {guest.pax_count} pax
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span
          className={`text-xs font-mono px-1.5 py-0.5 rounded border transition-colors ${
            isCheckedIn
              ? "bg-green-50 text-green-600 border-green-100 font-bold"
              : "bg-white text-gray-500 border-gray-100"
          }`}
          title={isCheckedIn ? "Attended Pax" : "Invitation Pax"}
        >
          {isCheckedIn
            ? guest.attended_pax || guest.pax_count
            : guest.pax_count}
        </span>
        {canEdit && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAssign(guest.id, "unassigned");
            }}
            className="p-1 rounded-full text-gray-300 hover:bg-red-50 hover:text-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-red-100 cursor-pointer"
            title="Unassign"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

// Draggable guest item
function DraggableGuestItem({
  guest,
  isAssigned,
  assignedTableId,
  canEdit,
  onAssign,
  tables,
  truncateName,
}: {
  guest: Guest;
  isAssigned: boolean;
  assignedTableId: string;
  canEdit: boolean;
  onAssign: (guestId: string, tableId: string) => void;
  tables: Table[];
  truncateName: (name: string, maxLen?: number) => string;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: isAssigned
      ? `guest-list-assigned-${guest.id}`
      : `guest-list-${guest.id}`,
    disabled: !canEdit || isAssigned,
  });

  return (
    <div
      ref={setNodeRef}
      {...(canEdit && !isAssigned ? listeners : {})}
      {...(canEdit && !isAssigned ? attributes : {})}
      className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between group select-none ${
        isDragging
          ? "opacity-50 cursor-grabbing"
          : isAssigned
          ? "bg-gray-50/50 border-transparent opacity-60 hover:opacity-100"
          : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transform hover:-translate-y-0.5"
      } ${canEdit && !isAssigned ? "cursor-grab" : "cursor-default"}`}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={`p-2 rounded-full flex-shrink-0 ${
            isAssigned ? "bg-gray-100" : "bg-blue-50"
          }`}
        >
          <User
            className={`w-4 h-4 ${
              isAssigned ? "text-gray-400" : "text-blue-500"
            }`}
          />
        </div>
        <div className="flex flex-col min-w-0">
          <div className="flex items-center gap-1 min-w-0">
            <p
              className={`font-semibold text-sm truncate ${
                isAssigned ? "text-gray-500" : "text-gray-900"
              }`}
              title={guest.name}
            >
              {truncateName(guest.name)}
            </p>
            {(guest.status === "attended" ||
              guest.status === "souvenir_delivered") && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500 fill-green-50/50 flex-shrink-0 cursor-default" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px]">
                  {guest.status === "souvenir_delivered"
                    ? "Souvenir Redeemed"
                    : "Attended"}
                </TooltipContent>
              </Tooltip>
            )}
            {guest.status === "declined" && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <XCircle className="w-3.5 h-3.5 text-red-500 fill-red-50/50 flex-shrink-0 cursor-default" />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top" className="text-[10px]">
                  Declined
                </TooltipContent>
              </Tooltip>
            )}
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-[10px] text-gray-400 capitalize tracking-tighter truncate max-w-[60px]">
              {guest.category}
            </span>
            <span className="w-1 h-1 bg-gray-200 rounded-full flex-shrink-0" />
            <span className="text-[10px] text-blue-500">
              {guest.pax_count} Pax
            </span>
          </div>
        </div>
      </div>

      <Select
        value={assignedTableId}
        disabled={!canEdit}
        onValueChange={(val) => onAssign(guest.id, val)}
      >
        <SelectTrigger
          className={`w-[110px] h-8 text-xs border-0 cursor-pointer ${
            isAssigned ? "bg-white shadow-sm" : "bg-gray-50"
          }`}
        >
          <SelectValue placeholder="Assign" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="unassigned">No Seat</SelectItem>
          {tables.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export function SeatingBoard({
  initialGuests,
  initialTables,
  onRefresh,
}: SeatingBoardProps) {
  const [tables, setTables] = useState(initialTables);
  const [editingTable, setEditingTable] = useState<Table | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [filterTableId, setFilterTableId] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;
  const [activeId, setActiveId] = useState<string | null>(null);

  const { hasPermission } = usePermissions();

  const canEdit = hasPermission("seating", "edit");
  const canDeleteTable = hasPermission("seating", "delete_table");
  const canEditTable = hasPermission("seating", "edit_table");

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    })
  );

  // Sync state when props change (e.g. after adding a new table)
  useEffect(() => {
    // We rely on the parent to pass sorted tables.
    setTables(initialTables);
  }, [initialTables]);

  // Reset pagination when filter or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterTableId, searchQuery]);

  // Derive assigned guests mapping

  const getAssignedTableId = (guestId: string) => {
    const table = tables.find((t) => t.assigned_guest_ids.includes(guestId));
    return table ? table.id : "unassigned";
  };

  const truncateName = (name: string, maxLen: number = 12) => {
    if (name.length <= maxLen) return name;
    return name.slice(0, maxLen).trim() + "...";
  };

  const filteredGuests = initialGuests.filter((guest) => {
    const tableMatch = (() => {
      if (filterTableId === "all") return true;
      const assignedTableId = getAssignedTableId(guest.id);
      return assignedTableId === filterTableId;
    })();

    const searchMatch =
      !searchQuery ||
      guest.name.toLowerCase().includes(searchQuery.toLowerCase());

    return tableMatch && searchMatch;
  });

  const sortedGuests = [...filteredGuests].sort((a, b) => {
    const tableAId = getAssignedTableId(a.id);
    const tableBId = getAssignedTableId(b.id);

    // 1st Priority: Unassigned at the top
    if (tableAId === "unassigned" && tableBId !== "unassigned") return -1;
    if (tableAId !== "unassigned" && tableBId === "unassigned") return 1;

    // 2nd Priority: Table Name A-Z (for both assigned)
    if (tableAId !== "unassigned" && tableBId !== "unassigned") {
      const tableA = tables.find((t) => t.id === tableAId);
      const tableB = tables.find((t) => t.id === tableBId);
      const tableAName = tableA?.name || "";
      const tableBName = tableB?.name || "";

      const tableComp = tableAName.localeCompare(tableBName);
      if (tableComp !== 0) return tableComp;
    }

    // 3rd Priority: Guest Name A-Z
    return a.name.localeCompare(b.name);
  });

  const totalPages = Math.ceil(sortedGuests.length / ITEMS_PER_PAGE);
  const paginatedGuests = sortedGuests.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleAssign = (guestId: string, tableId: string) => {
    // Optimistic update
    const newTables = tables.map((t) => ({
      ...t,
      assigned_guest_ids: t.assigned_guest_ids.filter((id) => id !== guestId),
    }));

    if (tableId !== "unassigned") {
      const targetTable = newTables.find((t) => t.id === tableId);
      if (targetTable) {
        targetTable.assigned_guest_ids.push(guestId);
      }
    }
    setTables(newTables);

    // API Call for persistence
    supabaseTableService.assignGuestToTable(tableId, guestId);
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!canEdit) return;
    const dragId = event.active.id as string;
    // Extract actual guest ID from prefixed ID
    const guestId = dragId.startsWith("table::")
      ? dragId.split("::")[2]
      : dragId.replace("guest-list-", "");
    setActiveId(guestId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !canEdit) return;

    const dragId = active.id as string;
    // Extract actual guest ID from prefixed ID
    const guestId = dragId.startsWith("table::")
      ? dragId.split("::")[2]
      : dragId.replace("guest-list-", "");
    const targetId = over.id as string;

    // Handle assignment
    handleAssign(guestId, targetId);
  };

  const activeGuest = activeId
    ? initialGuests.find((g) => g.id === activeId)
    : null;

  const handleDeleteTable = async (id: string, name: string) => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await supabaseTableService.deleteTable(id);
      setTables(tables.filter((t) => t.id !== id));
      toast.success(`Table "${name}" deleted successfully`);
      setDeleteConfirmId(null);
    } catch (error: any) {
      setDeleteError(error.message || "Failed to delete table");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <TooltipProvider delayDuration={0}>
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden h-[calc(100vh-140px)]">
          {/* Unassigned Guests List */}
          <Card className="col-span-1 flex flex-col h-full rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] border-gray-100/50">
            <CardHeader className="pb-4 border-b border-dashed border-gray-100 bg-white/50 backdrop-blur-md sticky top-0 z-20">
              <CardTitle className="text-xl font-bold text-gray-900 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    Guest List
                  </span>
                  <Badge
                    variant="secondary"
                    className="bg-blue-50 text-blue-600 border-blue-100 rounded-lg px-2 text-[10px]"
                  >
                    {filteredGuests.length} Guests
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                    <Input
                      placeholder="Search guests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-gray-50/50 border-gray-100 focus:bg-white transition-all rounded-xl text-sm font-medium"
                    />
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className={`h-10 w-10 p-0 rounded-xl relative transition-all duration-300 cursor-pointer ${
                          filterTableId !== "all"
                            ? "border-blue-200 bg-blue-50 text-blue-600 shadow-sm shadow-blue-500/10"
                            : "border-gray-100 bg-gray-50/50 text-gray-500 hover:bg-gray-100"
                        }`}
                      >
                        <Filter className="w-4 h-4" />
                        {filterTableId !== "all" && (
                          <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-blue-600 text-[8px] font-bold text-white ring-2 ring-white">
                            1
                          </span>
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="w-56 rounded-lg p-2 shadow-2xl border-gray-100 animate-in fade-in zoom-in-95 duration-200"
                    >
                      <div className="px-3 py-2">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                          Filter by Table
                        </p>
                      </div>
                      <DropdownMenuItem
                        className={`rounded-xl px-3 py-2 text-sm font-medium focus:bg-blue-50 focus:text-blue-600 cursor-pointer ${
                          filterTableId === "all"
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600"
                        }`}
                        onClick={() => setFilterTableId("all")}
                      >
                        All Tables
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className={`rounded-xl px-3 py-2 text-sm font-medium focus:bg-blue-50 focus:text-blue-600 cursor-pointer ${
                          filterTableId === "unassigned"
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600"
                        }`}
                        onClick={() => setFilterTableId("unassigned")}
                      >
                        No Seat
                      </DropdownMenuItem>
                      {tables.length > 0 && (
                        <DropdownMenuSeparator className="bg-gray-50" />
                      )}
                      <div className="max-h-[200px] overflow-auto scrollbar-hide py-1">
                        {tables.map((table) => (
                          <DropdownMenuItem
                            key={table.id}
                            className={`rounded-xl px-3 py-2 text-sm font-medium focus:bg-blue-50 focus:text-blue-600 cursor-pointer ${
                              filterTableId === table.id
                                ? "bg-blue-50 text-blue-600"
                                : "text-gray-600"
                            }`}
                            onClick={() => setFilterTableId(table.id)}
                          >
                            {table.name}
                          </DropdownMenuItem>
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardTitle>
            </CardHeader>
            <DroppableGuestList>
              <CardContent className="flex-1 overflow-auto p-0 scrollbar-thin scrollbar-thumb-gray-100 flex flex-col">
                <div className="p-4 space-y-3 flex-1">
                  {paginatedGuests.length === 0 ? (
                    <div className="py-12 flex flex-col items-center justify-center gap-2 text-gray-400">
                      <div className="w-10 h-10 bg-gray-50 rounded-full flex items-center justify-center">
                        <Filter className="w-5 h-5 opacity-20" />
                      </div>
                      <p className="text-xs font-medium uppercase tracking-wider">
                        No guests found
                      </p>
                    </div>
                  ) : (
                    paginatedGuests.map((guest) => {
                      const assignedTableId = getAssignedTableId(guest.id);
                      const isAssigned = assignedTableId !== "unassigned";

                      return (
                        <DraggableGuestItem
                          key={guest.id}
                          guest={guest}
                          isAssigned={isAssigned}
                          assignedTableId={assignedTableId}
                          canEdit={canEdit}
                          onAssign={handleAssign}
                          tables={tables}
                          truncateName={truncateName}
                        />
                      );
                    })
                  )}
                </div>

                {totalPages > 1 && (
                  <div className="p-4 border-t border-gray-50 flex items-center justify-between bg-gray-50/30">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg border-gray-100 cursor-pointer"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                      Page {currentPage} of {totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 rounded-lg border-gray-100 cursor-pointer"
                      onClick={() =>
                        setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                      }
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </DroppableGuestList>
          </Card>

          {/* Tables Board */}
          <div className="col-span-1 lg:col-span-2 overflow-auto grid gap-6 grid-cols-1 md:grid-cols-2 auto-rows-fr content-start pb-20 scrollbar-hide">
            {tables.length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 bg-white/50 backdrop-blur-sm rounded-[2rem] border-2 border-dashed border-gray-200 animate-in fade-in zoom-in duration-700">
                <div className="bg-blue-50 p-6 rounded-full mb-6 ring-8 ring-blue-50/50">
                  <Users className="w-12 h-12 text-blue-500" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  No Tables Created Yet
                </h2>
                <p className="text-gray-500 mb-2 text-center max-w-xs px-6">
                  Start by adding tables to arrange your guests.
                </p>
                <p className="text-xs text-blue-500 font-medium animate-pulse">
                  Click the "Add Table" button above to begin
                </p>
              </div>
            ) : (
              tables.map((table) => {
                const assignedGuests = initialGuests.filter((g) =>
                  table.assigned_guest_ids.includes(g.id)
                );
                const currentPax = assignedGuests
                  .filter((g) => g.status !== "declined")
                  .reduce((acc, g) => {
                    const isCheckedIn =
                      g.status === "attended" ||
                      g.status === "souvenir_delivered";
                    // If checked in, count actual attended pax (fallback to pax_count if missing)
                    // If NOT checked in, count invitation pax
                    const paxToCount = isCheckedIn
                      ? g.attended_pax || g.pax_count
                      : g.pax_count;
                    return acc + paxToCount;
                  }, 0);

                const attendedPax = assignedGuests
                  .filter(
                    (g) =>
                      g.status === "attended" ||
                      g.status === "souvenir_delivered"
                  )
                  .reduce((acc, g) => acc + (g.attended_pax || g.pax_count), 0);
                const isOverCapacity = currentPax > table.capacity;
                const isFull = currentPax === table.capacity;

                return (
                  <DroppableTableCard key={table.id} tableId={table.id}>
                    {(isOver) => (
                      <Card
                        className={`relative overflow-hidden rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] border-gray-100/50 hover:shadow-lg transition-all duration-300 h-full flex flex-col ${
                          isOver ? "bg-green-50" : "bg-white"
                        }`}
                      >
                        <div
                          className={`absolute top-0 left-0 w-1.5 h-full transition-colors duration-300 z-10 ${
                            isOverCapacity
                              ? "bg-red-500"
                              : isFull
                              ? "bg-amber-500"
                              : "bg-green-500"
                          }`}
                        />
                        <CardHeader className="pb-4 border-b border-dashed border-gray-100 relative">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <div>
                                <h3 className="font-bold text-gray-900 text-lg">
                                  {table.name}
                                </h3>
                                <Badge
                                  variant="secondary"
                                  className="mt-1 text-[10px] uppercase tracking-wider font-bold text-gray-400 bg-white/80 backdrop-blur-sm border-gray-200/50"
                                >
                                  {table.shape === "rect"
                                    ? "Rectangular"
                                    : "Round"}
                                </Badge>
                              </div>
                              <p className="text-[10px] font-mono text-gray-400 flex items-center gap-1 uppercase tracking-tight">
                                <Hash className="w-3 h-3" />
                                ID:{" "}
                                {table.id.split("-")[1] || table.id.slice(0, 8)}
                              </p>
                              <p className="text-[10px] font-medium text-green-600 flex items-center gap-1.5 pt-1">
                                <CheckCircle2 className="w-3 h-3 text-green-500 fill-green-50/50" />
                                {attendedPax} Pax Present
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={
                                  isOverCapacity ? "destructive" : "secondary"
                                }
                                className={`rounded-full px-3 transition-colors duration-300 ${
                                  isOverCapacity
                                    ? "bg-red-500 text-white"
                                    : isFull
                                    ? "bg-amber-50 text-amber-700 border-amber-200"
                                    : "bg-green-50 text-green-700 hover:bg-green-100"
                                }`}
                              >
                                {currentPax} / {table.capacity}
                              </Badge>
                              {(canEditTable || canDeleteTable) && (
                                <div className="flex items-center gap-1">
                                  {canEditTable && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                                      onClick={() => setEditingTable(table)}
                                      title="Edit Table"
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  )}
                                  {canDeleteTable && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                                      onClick={() => {
                                        setDeleteConfirmId(table.id);
                                      }}
                                      title="Delete Table"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          {isOverCapacity && (
                            <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                              <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                              <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                                Over capacity by {currentPax - table.capacity}{" "}
                                pax
                              </p>
                            </div>
                          )}
                          {table.notes && (
                            <div className="mt-3 flex items-start gap-2 bg-gray-50/50 p-2 rounded-lg border border-gray-100">
                              <StickyNote className="w-3.5 h-3.5 text-gray-400 mt-0.5 flex-shrink-0" />
                              <p className="text-[10px] text-gray-500 leading-relaxed font-medium">
                                {table.notes}
                              </p>
                            </div>
                          )}
                        </CardHeader>
                        <CardContent className="p-4 flex-1">
                          <div className="space-y-2 min-h-[120px]">
                            {assignedGuests.length > 0 ? (
                              assignedGuests.map((g) => (
                                <DraggableTableGuest
                                  key={g.id}
                                  guest={g}
                                  tableId={table.id}
                                  canEdit={canEdit}
                                  onAssign={handleAssign}
                                />
                              ))
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center text-gray-300 text-sm gap-2 py-8 border-2 border-dashed border-gray-100 rounded-xl">
                                <Users className="w-6 h-6 opacity-20" />
                                <span>Empty Table</span>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </DroppableTableCard>
                );
              })
            )}
          </div>

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
            <DialogContent className="max-w-md rounded-[2rem] border-none shadow-2xl p-6 text-left">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Delete Table?
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <p className="text-gray-500">
                  Are you sure you want to delete this table? This action cannot
                  be undone.
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
                  className="rounded-xl font-bold cursor-pointer"
                  disabled={isDeleting}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    const table = tables.find((t) => t.id === deleteConfirmId);
                    if (table) handleDeleteTable(table.id, table.name);
                  }}
                  className="rounded-xl font-bold shadow-lg shadow-red-100 cursor-pointer"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    "Delete Table"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <AddTableDialog
          eventId="" // Not needed for update, but required by prop types. Maybe fix prop types or pass dummy.
          // Actually, updateTable uses ID from table object, createTable uses eventId.
          // Let's pass the eventId from the first table if available or empty string.
          // Ideally we should pass eventId as prop to SeatingBoard.
          open={!!editingTable}
          onOpenChange={(open) => !open && setEditingTable(null)}
          table={editingTable}
          onSuccess={() => {
            setEditingTable(null);
            if (onRefresh) onRefresh();
          }}
        />

        <DragOverlay>
          {activeGuest
            ? (() => {
                const isAssignedGuest = tables.some((t) =>
                  t.assigned_guest_ids.includes(activeGuest.id)
                );
                const isCheckedIn =
                  activeGuest.status === "attended" ||
                  activeGuest.status === "souvenir_delivered";

                // Show table-style card when dragging from a table
                if (isAssignedGuest) {
                  return (
                    <div className="group text-sm flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-blue-300 shadow-2xl opacity-90 cursor-grabbing min-w-[250px]">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 bg-gray-300 rounded-full flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-medium text-gray-700"
                              title={activeGuest.name}
                            >
                              {activeGuest.name}
                            </span>
                            {isCheckedIn && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-green-500 fill-green-50/50" />
                            )}
                          </div>
                          <span className="text-[10px] text-gray-400">
                            Invite: {activeGuest.pax_count} pax
                          </span>
                        </div>
                      </div>
                      <span
                        className={`text-xs font-mono px-1.5 py-0.5 rounded border ${
                          isCheckedIn
                            ? "bg-green-50 text-green-600 border-green-100 font-bold"
                            : "bg-white text-gray-500 border-gray-100"
                        }`}
                      >
                        {isCheckedIn
                          ? activeGuest.attended_pax || activeGuest.pax_count
                          : activeGuest.pax_count}
                      </span>
                    </div>
                  );
                }

                // Show guest list-style card when dragging from guest list
                return (
                  <div className="p-3 rounded-xl border bg-white border-blue-300 shadow-2xl flex items-center gap-3 opacity-90 cursor-grabbing">
                    <div className="p-2 rounded-full bg-blue-50 flex-shrink-0">
                      <User className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">
                        {activeGuest.name}
                      </p>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-gray-400 capitalize">
                          {activeGuest.category}
                        </span>
                        <span className="w-1 h-1 bg-gray-200 rounded-full" />
                        <span className="text-[10px] text-blue-500">
                          {activeGuest.pax_count} Pax
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })()
            : null}
        </DragOverlay>
      </TooltipProvider>
    </DndContext>
  );
}
