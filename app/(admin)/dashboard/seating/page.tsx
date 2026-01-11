"use client";

import { useState, useEffect } from "react";
import { supabaseGuestService } from "@/lib/services/guest-service";
import { supabaseTableService } from "@/lib/services/table-service";
import { SeatingBoard } from "@/components/features/seating/seating-board";
import { usePermissions } from "@/lib/hooks/use-permissions";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

import { AddTableDialog } from "@/components/features/seating/add-table-dialog";

export default function SeatingPage() {
  const [guests, setGuests] = useState<any[]>([]);
  const [tables, setTables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEventId, setActiveEventId] = useState<string | null>(null);
  const { hasPermission } = usePermissions();

  useEffect(() => {
    const stored = localStorage.getItem("active_event_id");
    setActiveEventId(stored);
    loadData(stored || undefined);
  }, []);

  async function loadData(eventId?: string) {
    try {
      const [g, t] = await Promise.all([
        supabaseGuestService.getGuests(eventId),
        supabaseTableService.getTables(eventId),
      ]);
      setGuests(g);
      setTables(t);
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="p-8 text-center text-gray-500">Loading seating...</div>
    );

  const canAddTable = hasPermission("seating", "add_table");

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Seating Management
          </h1>
          <p className="text-gray-500">Arrange tables and guests</p>
        </div>

        {canAddTable && (
          <AddTableDialog
            eventId={activeEventId || ""}
            onSuccess={() => loadData(activeEventId || undefined)}
          />
        )}
      </div>

      <SeatingBoard initialGuests={guests} initialTables={tables} />
    </div>
  );
}
