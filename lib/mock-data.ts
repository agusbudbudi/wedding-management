import { Guest, GuestCategory, GuestStatus, Table } from "./types";

// Mock Data Store
const tables: Table[] = [
  {
    id: "t1",
    name: "VIP A",
    capacity: 10,
    shape: "round",
    assigned_guest_ids: [],
  },
  {
    id: "t2",
    name: "Family 1",
    capacity: 8,
    shape: "rectangular",
    assigned_guest_ids: [],
  },
];

let guests: Guest[] = [
  {
    id: "1",
    name: "Budi Santoso",
    category: "family",
    slug: "budi-santoso-001",
    pax_count: 2,
    status: "sent",
    created_at: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Siti Aminah",
    category: "vip",
    slug: "siti-aminah-002",
    pax_count: 1,
    status: "viewed",
    created_at: new Date().toISOString(),
  },
  {
    id: "3",
    name: "Andi Pratama",
    category: "friend",
    slug: "andi-pratama-003",
    pax_count: 2,
    status: "draft",
    created_at: new Date().toISOString(),
  },
];

export const mockService = {
  getGuests: async (): Promise<Guest[]> => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    return [...guests];
  },

  getGuestBySlug: async (slug: string): Promise<Guest | undefined> => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return guests.find((g) => g.slug === slug);
  },

  createGuest: async (guest: Omit<Guest, "id" | "created_at" | "status">) => {
    const newGuest: Guest = {
      ...guest,
      id: Math.random().toString(36).substr(2, 9),
      status: "draft",
      created_at: new Date().toISOString(),
    };
    guests.unshift(newGuest);
    return newGuest;
  },

  updateGuestStatus: async (id: string, status: GuestStatus) => {
    const index = guests.findIndex((g) => g.id === id);
    if (index !== -1) {
      guests[index] = { ...guests[index], status };
      return guests[index];
    }
    return null;
  },

  deleteGuest: async (id: string) => {
    guests = guests.filter((g) => g.id !== id);
    return true;
  },

  getStats: async () => {
    const totalGuests = guests.length;
    const totalPax = guests.reduce((acc, curr) => acc + curr.pax_count, 0);
    const confirmed = guests.filter((g) => g.status === "viewed").length; // Mock logic

    return {
      totalGuests,
      totalPax,
      confirmedGuests: confirmed, // This would normally come from RSVP table
      attendanceRate: Math.round((confirmed / totalGuests) * 100) || 0,
    };
  },

  // Table Management
  getTables: async (): Promise<Table[]> => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return [...tables];
  },

  createTable: async (table: Omit<Table, "id" | "assigned_guest_ids">) => {
    const newTable = {
      ...table,
      id: Math.random().toString(36).substr(2, 9),
      assigned_guest_ids: [],
    };
    tables.push(newTable);
    return newTable;
  },

  assignGuestToTable: async (tableId: string, guestId: string) => {
    // Remove guest from other tables first
    tables.forEach((t) => {
      t.assigned_guest_ids = t.assigned_guest_ids.filter(
        (id) => id !== guestId
      );
    });

    const table = tables.find((t) => t.id === tableId);
    if (table) {
      table.assigned_guest_ids.push(guestId);
    }
    return true;
  },
};
