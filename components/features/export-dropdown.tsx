"use client";

import { Download, FileText, FileSpreadsheet, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ExportDropdownProps {
  onExportPdf: () => void;
  onExportExcel: () => void;
  className?: string;
}

export function ExportDropdown({
  onExportPdf,
  onExportExcel,
  className,
}: ExportDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          className={`bg-primary shadow-lg shadow-blue-500/30 hover:bg-blue-600 ${className}`}
        >
          <Download className="w-4 h-4 mr-2" />
          Export Report
          <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-[200px] p-2 rounded-xl border-gray-100 shadow-xl"
      >
        <DropdownMenuItem
          onClick={onExportPdf}
          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-blue-50 hover:text-blue-600 transition-colors"
        >
          <div className="p-2 rounded-md bg-blue-50 text-blue-500">
            <FileText className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Download PDF</span>
            <span className="text-[10px] text-gray-400">Visual Summary</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={onExportExcel}
          className="flex items-center gap-3 p-3 rounded-lg cursor-pointer hover:bg-green-50 hover:text-green-600 transition-colors mt-1"
        >
          <div className="p-2 rounded-md bg-green-50 text-green-500">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-sm">Download Excel</span>
            <span className="text-[10px] text-gray-400">Full Guest List</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
