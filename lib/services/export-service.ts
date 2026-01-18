import { Guest, Event } from "../types";
import { RedeemedGuest } from "../types/souvenir";
import { format } from "date-fns";

export const exportService = {
  async exportGuestsToExcel(guests: Guest[], eventName: string) {
    const ExcelJS = (await import("exceljs")).default;
    const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Guests");

    // Define columns
    worksheet.columns = [
      { header: "Guest Name", key: "name", width: 30 },
      { header: "Category", key: "category", width: 15 },
      { header: "Pax", key: "pax", width: 8 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Status", key: "status", width: 15 },
      { header: "Wishes", key: "wishes", width: 40 },
      { header: "Last Action By", key: "lastActionBy", width: 30 },
      { header: "Last Action At", key: "lastActionAt", width: 20 },
      { header: "Invitation Link", key: "link", width: 50 },
    ];

    // Add data
    guests.forEach((guest) => {
      // Extract performer name
      const lastActionBy = (() => {
        if (!guest.last_log) return "-";
        if (guest.last_log.profile?.full_name)
          return guest.last_log.profile.full_name;
        if (guest.last_log.profile?.email) return guest.last_log.profile.email;

        const desc = guest.last_log.description;
        if (desc.includes(" by ")) {
          const parts = desc.split(" by ");
          let name = parts[parts.length - 1];
          if (name.includes(" (")) {
            name = name.split(" (")[0];
          }
          return name;
        }
        return "System";
      })();

      worksheet.addRow({
        name: guest.name,
        category: guest.category,
        pax: guest.pax_count,
        phone: guest.phone_number || "-",
        status: guest.status.replace("_", " ").toUpperCase(),
        wishes: guest.wishes || "-",
        lastActionBy: lastActionBy,
        lastActionAt: guest.updated_at
          ? format(new Date(guest.updated_at), "dd MMM yyyy, HH:mm")
          : "-",
        link: `${baseUrl}/invitation/${guest.slug}`,
      });
    });

    // Generate filename
    const dateStr = format(new Date(), "yyyyMMdd_HHmm");
    const filename = `GuestList_${eventName.replace(
      /\s+/g,
      "_",
    )}_${dateStr}.xlsx`;

    // Write and download
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  },

  async exportSummaryToPDF(guests: Guest[], event: Event | null) {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const eventName = event?.name || "Wedding Event";
    const dateStr = format(new Date(), "dd MMMM yyyy");
    const timeStr = format(new Date(), "HH:mm");

    // Helper for drawing cards
    const drawCard = (
      x: number,
      y: number,
      w: number,
      h: number,
      title: string,
      value: string,
      color: [number, number, number],
      percentage?: number,
    ) => {
      // Card Shadow/Border
      doc.setDrawColor(240, 240, 240);
      doc.setFillColor(255, 255, 255);
      doc.roundedRect(x, y, w, h, 3, 3, "FD");

      // Left Accent Bar
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(x, y + 5, 2, h - 10, "F");

      // Title
      doc.setFontSize(9);
      doc.setTextColor(120, 120, 120);
      doc.setFont("helvetica", "bold");
      doc.text(title.toUpperCase(), x + 8, y + 10);

      // Value
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text(value, x + 8, y + 22);

      // Progress Bar
      if (percentage !== undefined) {
        const barW = w - 16;
        const barH = 2;
        const barX = x + 8;
        const barY = y + 28;

        // Bg
        doc.setFillColor(245, 245, 245);
        doc.roundedRect(barX, barY, barW, barH, 1, 1, "F");

        // Fill
        doc.setFillColor(color[0], color[1], color[2]);
        const fillW = (barW * Math.min(percentage, 100)) / 100;
        if (fillW > 0) {
          doc.roundedRect(barX, barY, fillW, barH, 1, 1, "F");
        }

        // Percentage Text
        doc.setFontSize(8);
        doc.setTextColor(color[0], color[1], color[2]);
        doc.text(`${Math.round(percentage)}%`, x + w - 15, y + 22, {
          align: "right",
        });
      }
    };

    // Header Background
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, 210, 40, "F");

    // Header Content
    doc.setFontSize(24);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text("Event Summary", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text(`${eventName} • ${dateStr} at ${timeStr}`, 14, 28);

    // Divider
    doc.setDrawColor(229, 231, 235);
    doc.line(14, 35, 196, 35);

    // Event Info Section
    const startYInfo = 45;
    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81);
    doc.setFont("helvetica", "bold");
    doc.text("Event Details", 14, startYInfo);

    doc.setFontSize(10);
    doc.setTextColor(75, 85, 99);
    doc.setFont("helvetica", "normal");
    doc.text(`Location: ${event?.location || "Not set"}`, 14, startYInfo + 7);
    doc.text(
      `Date: ${
        event?.date
          ? format(new Date(event.date), "EEEE, dd MMMM yyyy")
          : "Not set"
      }`,
      100,
      startYInfo + 7,
    );

    // Statistics Grid
    const confirmed = guests.filter((g) =>
      ["confirmed", "attended", "souvenir_delivered"].includes(g.status),
    ).length;
    const attended = guests.filter((g) =>
      ["attended", "souvenir_delivered"].includes(g.status),
    ).length;
    const souvenirs = guests.filter(
      (g) => g.status === "souvenir_delivered",
    ).length;
    const totalPax = guests.reduce((sum, g) => sum + (g.pax_count || 0), 0);

    const cardY = 65;
    const cardW = 44;
    const cardH = 35;
    const gap = 6;

    drawCard(
      14,
      cardY,
      cardW,
      cardH,
      "Total Pax",
      totalPax.toString(),
      [79, 70, 229],
    ); // Indigo
    drawCard(
      14 + cardW + gap,
      cardY,
      cardW,
      cardH,
      "RSVP Yes",
      confirmed.toString(),
      [16, 185, 129], // Emerald
      guests.length > 0 ? (confirmed / guests.length) * 100 : 0,
    );
    drawCard(
      14 + (cardW + gap) * 2,
      cardY,
      cardW,
      cardH,
      "Attended",
      attended.toString(),
      [59, 130, 246], // Blue
      confirmed > 0 ? (attended / confirmed) * 100 : 0,
    );
    drawCard(
      14 + (cardW + gap) * 3,
      cardY,
      cardW,
      cardH,
      "Souvenirs",
      souvenirs.toString(),
      [139, 92, 246], // Purple
      attended > 0 ? (souvenirs / attended) * 100 : 0,
    );

    // Recent Activity Table
    const recentGuests = [...guests]
      .sort(
        (a, b) =>
          new Date(b.updated_at || 0).getTime() -
          new Date(a.updated_at || 0).getTime(),
      )
      .slice(0, 15);

    doc.setFontSize(14);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text("Latest Guest Activity", 14, cardY + cardH + 15);

    autoTable(doc, {
      startY: cardY + cardH + 20,
      head: [["Guest Name", "Category", "Pax", "Status", "Last Update"]],
      body: recentGuests.map((g) => [
        g.name,
        g.category,
        g.pax_count.toString(),
        g.status.replace("_", " ").toUpperCase(),
        g.updated_at ? format(new Date(g.updated_at), "dd MMM, HH:mm") : "-",
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [31, 41, 55],
        fontSize: 10,
        fontStyle: "bold",
        halign: "left",
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
      alternateRowStyles: {
        fillColor: [249, 250, 251],
      },
    });

    // Footer with Page Number
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Generated by Wedding Management System • Page ${i} of ${pageCount}`,
        105,
        285,
        { align: "center" },
      );
    }

    const filename = `Summary_${eventName.replace(/\s+/g, "_")}_${format(
      new Date(),
      "yyyyMMdd",
    )}.pdf`;
    doc.save(filename);
  },

  async exportRedeemedGuestsToExcel(
    redemptions: RedeemedGuest[],
    eventName: string,
  ) {
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Redemptions");

    worksheet.columns = [
      { header: "Guest Name", key: "name", width: 30 },
      { header: "Category", key: "category", width: 15 },
      { header: "Souvenir", key: "souvenir", width: 25 },
      { header: "Quantity", key: "quantity", width: 10 },
      { header: "Redeemed At", key: "redeemedAt", width: 20 },
      { header: "Redeemed By", key: "redeemedBy", width: 25 },
    ];

    redemptions.forEach((r) => {
      worksheet.addRow({
        name: r.name,
        category: r.category,
        souvenir: r.souvenir_name,
        quantity: r.souvenir_redeemed_quantity,
        redeemedAt: format(
          new Date(r.souvenir_redeemed_at),
          "dd MMM yyyy, HH:mm",
        ),
        redeemedBy: r.redeemed_by_name,
      });
    });

    const dateStr = format(new Date(), "yyyyMMdd_HHmm");
    const filename = `SouvenirRedemptions_${eventName.replace(
      /\s+/g,
      "_",
    )}_${dateStr}.xlsx`;

    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  },

  async exportRedeemedGuestsToPDF(
    redemptions: RedeemedGuest[],
    event: Event | null,
  ) {
    const jsPDF = (await import("jspdf")).default;
    const autoTable = (await import("jspdf-autotable")).default;

    const doc = new jsPDF();
    const eventName = event?.name || "Wedding Event";
    const dateStr = format(new Date(), "dd MMMM yyyy");
    const timeStr = format(new Date(), "HH:mm");

    // Header Background
    doc.setFillColor(249, 250, 251);
    doc.rect(0, 0, 210, 40, "F");

    // Header Content
    doc.setFontSize(22);
    doc.setTextColor(31, 41, 55);
    doc.setFont("helvetica", "bold");
    doc.text("Souvenir Redemption Report", 14, 20);

    doc.setFontSize(10);
    doc.setTextColor(107, 114, 128);
    doc.setFont("helvetica", "normal");
    doc.text(`${eventName} • Generated on ${dateStr} at ${timeStr}`, 14, 28);

    // Summary Section
    const totalRedeemed = redemptions.reduce(
      (sum, r) => sum + r.souvenir_redeemed_quantity,
      0,
    );
    const uniqueGuests = new Set(redemptions.map((r) => r.id)).size;

    doc.setFontSize(12);
    doc.setTextColor(55, 65, 81);
    doc.setFont("helvetica", "bold");
    doc.text("Redemption Overview", 14, 50);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Total Items Redeemed: ${totalRedeemed} units`, 14, 58);
    doc.text(`Total Guests Served: ${uniqueGuests} guests`, 130, 58);

    // Table
    autoTable(doc, {
      startY: 65,
      head: [
        [
          "Guest Name",
          "Category",
          "Souvenir Name",
          "Qty",
          "Redeemed At",
          "Redeemed By",
        ],
      ],
      body: redemptions.map((r) => [
        r.name,
        r.category,
        r.souvenir_name,
        r.souvenir_redeemed_quantity.toString(),
        format(new Date(r.souvenir_redeemed_at), "dd MMM, HH:mm"),
        r.redeemed_by_name,
      ]),
      theme: "striped",
      headStyles: {
        fillColor: [79, 70, 229],
        fontSize: 10,
        fontStyle: "bold",
      },
      styles: {
        fontSize: 9,
        cellPadding: 4,
      },
    });

    // Footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(156, 163, 175);
      doc.text(
        `Wedding Management System • Page ${i} of ${pageCount}`,
        105,
        285,
        { align: "center" },
      );
    }

    const filename = `Redemptions_${eventName.replace(/\s+/g, "_")}_${format(
      new Date(),
      "yyyyMMdd",
    )}.pdf`;
    doc.save(filename);
  },
};
