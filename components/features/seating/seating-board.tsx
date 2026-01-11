"use client";

import { useState, useEffect } from "react";
import { Guest, Table } from "@/lib/types";
import { supabaseTableService } from "@/lib/services/table-service";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { User, Users, GripVertical, Trash2, Hash } from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/lib/hooks/use-permissions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SeatingBoardProps {
  initialGuests: Guest[];
  initialTables: Table[];
}

export function SeatingBoard({
  initialGuests,
  initialTables,
}: SeatingBoardProps) {
  const [tables, setTables] = useState(initialTables);
  const { hasPermission } = usePermissions();

  const canEdit = hasPermission("seating", "edit");
  const canDeleteTable = hasPermission("seating", "delete_table");

  // Sync state when props change (e.g. after adding a new table)
  useEffect(() => {
    setTables(initialTables);
  }, [initialTables]);

  // Derive assigned guests mapping

  const getAssignedTableId = (guestId: string) => {
    const table = tables.find((t) => t.assigned_guest_ids.includes(guestId));
    return table ? table.id : "unassigned";
  };

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

  const handleDeleteTable = async (id: string, name: string) => {
    try {
      await supabaseTableService.deleteTable(id);
      setTables(tables.filter((t) => t.id !== id));
      toast.success(`Table "${name}" deleted successfully`);
    } catch (error: any) {
      toast.error(error.message || "Failed to delete table");
    }
  };

  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-hidden h-[calc(100vh-140px)]">
      {/* Unassigned Guests List */}
      <Card className="col-span-1 flex flex-col h-full rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] border-gray-100/50">
        <CardHeader className="pb-4 border-b border-gray-50">
          <CardTitle className="flex items-center justify-between">
            <span className="text-lg font-bold text-gray-900">Guest List</span>
            <Badge
              variant="secondary"
              className="bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full px-3"
            >
              {initialGuests.length} Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto p-0 scrollbar-thin scrollbar-thumb-gray-100">
          <div className="p-4 space-y-3">
            {initialGuests.map((guest) => {
              const assignedTableId = getAssignedTableId(guest.id);
              const isAssigned = assignedTableId !== "unassigned";

              return (
                <div
                  key={guest.id}
                  className={`p-3 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                    isAssigned
                      ? "bg-gray-50/50 border-transparent opacity-60 hover:opacity-100"
                      : "bg-white border-gray-100 hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transform hover:-translate-y-0.5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        isAssigned ? "bg-gray-100" : "bg-blue-50"
                      }`}
                    >
                      <User
                        className={`w-4 h-4 ${
                          isAssigned ? "text-gray-400" : "text-blue-500"
                        }`}
                      />
                    </div>
                    <div>
                      <p
                        className={`font-semibold text-sm ${
                          isAssigned ? "text-gray-500" : "text-gray-900"
                        }`}
                      >
                        {guest.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {guest.pax_count} pax • {guest.category}
                      </p>
                    </div>
                  </div>

                  <Select
                    value={assignedTableId}
                    disabled={!canEdit}
                    onValueChange={(val) => handleAssign(guest.id, val)}
                  >
                    <SelectTrigger
                      className={`w-[110px] h-8 text-xs border-0 ${
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
            })}
          </div>
        </CardContent>
      </Card>

      {/* Tables Board */}
      <div className="col-span-1 lg:col-span-2 overflow-auto grid gap-6 grid-cols-1 md:grid-cols-2 content-start pb-20 scrollbar-hide">
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
            const currentPax = assignedGuests.reduce(
              (acc, g) => acc + g.pax_count,
              0
            );
            const isOverCapacity = currentPax > table.capacity;
            const isFull = currentPax === table.capacity;

            return (
              <Card
                key={table.id}
                className="relative overflow-hidden rounded-[2rem] shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] border-gray-100/50 hover:shadow-lg transition-all duration-300 bg-white"
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
                      <div className="flex items-center gap-3">
                        <CardTitle className="text-lg font-bold text-gray-900 line-clamp-1">
                          {table.name}
                        </CardTitle>
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase tracking-wider font-bold text-gray-400 border-gray-200 px-2 h-5"
                        >
                          {table.shape}
                        </Badge>
                      </div>
                      <p className="text-[10px] font-mono text-gray-400 flex items-center gap-1 uppercase tracking-tight">
                        <Hash className="w-3 h-3" />
                        ID: {table.id.split("-")[1] || table.id.slice(0, 8)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={isOverCapacity ? "destructive" : "secondary"}
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
                      {canDeleteTable && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          onClick={() =>
                            handleDeleteTable(table.id, table.name)
                          }
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  {isOverCapacity && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-wider">
                        Over capacity by {currentPax - table.capacity} pax
                      </p>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <div className="space-y-2 min-h-[120px]">
                    {assignedGuests.length > 0 ? (
                      assignedGuests.map((g) => (
                        <div
                          key={g.id}
                          className="text-sm flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-transparent hover:border-gray-200 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-gray-300 rounded-full" />
                            <span className="font-medium text-gray-700">
                              {g.name}
                            </span>
                          </div>
                          <span className="text-xs font-mono text-gray-500 bg-white px-1.5 py-0.5 rounded border border-gray-100">
                            {g.pax_count}
                          </span>
                        </div>
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
            );
          })
        )}
      </div>
    </div>
  );
}
