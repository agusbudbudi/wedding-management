"use client";

import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
import * as XLSX from "xlsx";

export function DownloadTemplateButton() {
  const handleDownload = () => {
    // 1. Define data
    const headers = ["Guest Name", "Category", "Pax Count"];
    const sampleRow = ["John Doe", "friend", 2];

    // 2. Create worksheet
    const wsData = [headers, sampleRow];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    // 3. Create workbook and append sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Template");

    // 4. Generate download
    XLSX.writeFile(wb, "guest_import_template.xlsx");
  };

  return (
    <Button variant="outline" onClick={handleDownload} className="gap-2">
      <FileDown className="w-4 h-4" />
      Download Template
    </Button>
  );
}
