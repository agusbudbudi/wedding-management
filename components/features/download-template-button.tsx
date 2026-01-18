"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
// ExcelJS will be dynamically imported

export function DownloadTemplateButton() {
  const handleDownload = async () => {
    // 1. Create workbook and worksheet
    const ExcelJS = (await import("exceljs")).default;
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Template");

    // 2. Define columns
    worksheet.columns = [
      { header: "Guest Name", key: "name", width: 30 },
      { header: "Category", key: "category", width: 15 },
      { header: "Pax Count", key: "pax", width: 10 },
    ];

    // 3. Add sample row
    worksheet.addRow({ name: "John Doe", category: "friend", pax: 2 });

    // 4. Generate download
    workbook.xlsx.writeBuffer().then((buffer) => {
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "guest_import_template.xlsx";
      anchor.click();
      window.URL.revokeObjectURL(url);
    });
  };

  return (
    <Button variant="outline" onClick={handleDownload} className="gap-2">
      <FileDown className="w-4 h-4" />
      Download Template
    </Button>
  );
}
