"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Guest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Download,
  Loader2,
  Search,
  CheckCircle2,
  Trash2,
  MessageSquare,
  Image as ImageIcon,
  Eye,
  XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import Image from "next/image";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function GuestBookClient() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewPages, setPreviewPages] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeEvent, setActiveEvent] = useState<any>(null);

  useEffect(() => {
    fetchGuests();
  }, []);

  useEffect(() => {
    // Structured data cleanup not needed as they are stored in state
  }, [previewPages]);

  const fetchGuests = async () => {
    try {
      setLoading(true);
      const activeEventId = localStorage.getItem("active_event_id");
      if (!activeEventId) return;

      const supabase = createClient();
      const [guestRes, eventRes] = await Promise.all([
        supabase
          .from("guests")
          .select("*")
          .eq("event_id", activeEventId)
          .not("photo_url", "is", null)
          .order("updated_at", { ascending: false }),
        supabase.from("events").select("*").eq("id", activeEventId).single(),
      ]);

      if (guestRes.error) throw guestRes.error;
      setGuests(guestRes.data || []);
      setActiveEvent(eventRes.data);
    } catch (error: any) {
      toast.error("Failed to fetch guest book data");
    } finally {
      setLoading(false);
    }
  };

  const filteredGuests = guests.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    if (
      selectedIds.size === filteredGuests.length &&
      filteredGuests.length > 0
    ) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredGuests.map((g) => g.id)));
    }
  };

  const generatePDF = async () => {
    const selectedGuests = guests.filter((g) => selectedIds.has(g.id));
    if (selectedGuests.length === 0) {
      toast.error("Please select at least one guest");
      return null;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 10; // Narrow margin
    const columnGap = 2;
    const colWidth = (pageWidth - margin * 2 - columnGap) / 2;

    const pagesData: { cards: any[]; header: any }[] = [];
    let currentCards: any[] = [];

    const getHeader = () => ({
      title: activeEvent?.name || "Our Wedding",
      subtitle: "GUEST BOOK PHOTO",
      description:
        "A beautiful collection of memories captured on our special day",
    });

    const headerData = getHeader();

    // PDF Header rendering
    const renderPDFHeader = (d: any) => {
      d.setFontSize(20);
      d.setTextColor(30, 41, 59);
      d.setFont("times", "italic");
      d.text(headerData.title, pageWidth / 2, 12, { align: "center" });

      d.setFontSize(12);
      d.setFont("times", "normal");
      const charSpace = 3;
      const xOffset = (headerData.subtitle.length * charSpace) / 2;
      d.text(headerData.subtitle, pageWidth / 2 - xOffset + charSpace / 2, 18, {
        align: "center",
        charSpace: charSpace,
      });

      d.setFontSize(8);
      d.setTextColor(148, 163, 184);
      d.setFont("helvetica", "normal");
      d.text(headerData.description, pageWidth / 2, 23, { align: "center" });

      d.setDrawColor(241, 245, 249);
      d.line(margin, 28, pageWidth - margin, 28);
    };

    renderPDFHeader(doc);

    let yLeft = 40;
    let yRight = 40;

    for (let i = 0; i < selectedGuests.length; i++) {
      const guest = selectedGuests[i];
      const isLeft = yLeft <= yRight;
      const currentX = isLeft ? margin : margin + colWidth + columnGap;
      let currentY = isLeft ? yLeft : yRight;

      // Render Card to Canvas with precise integer dimensions to avoid stretching
      const pixelRatio = 4;
      const canvasWidth = Math.ceil(colWidth * pixelRatio);

      const cardCanvas = document.createElement("canvas");
      const ctx = cardCanvas.getContext("2d");
      if (!ctx) continue;

      // Preliminary text measurements
      const dummyCanvas = document.createElement("canvas");
      const dummyCtx = dummyCanvas.getContext("2d")!;
      const fontSizeName = 6 * pixelRatio;
      const fontSizeWishes = 5.5 * pixelRatio;

      // Photo loading and ratio
      let img: HTMLImageElement | null = null;
      let imgHeight = 0;
      const photoHPadding = 4 * pixelRatio;
      const photoW = canvasWidth - photoHPadding * 2;

      if (guest.photo_url) {
        try {
          const response = await fetch(guest.photo_url);
          const blob = await response.blob();
          const dataUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          });

          img = new (window as any).Image();
          if (img) {
            img.src = dataUrl;
            await new Promise((resolve, reject) => {
              img!.onload = resolve;
              img!.onerror = reject;
            });

            const ratio = img.height / img.width;
            imgHeight = photoW * ratio;
          }
        } catch (e) {
          console.error("Card Image Error", e);
        }
      }

      // Wrap text
      const wrapText = (text: string, font: string, maxWidth: number) => {
        dummyCtx.font = font;
        const words = text.split(" ");
        const lines = [];
        let currentLine = "";
        for (const word of words) {
          const testLine = currentLine ? currentLine + " " + word : word;
          if (dummyCtx.measureText(testLine).width > maxWidth) {
            lines.push(currentLine);
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        lines.push(currentLine);
        return lines;
      };

      const nameFont = `bold ${fontSizeName}px "Times New Roman", Times, serif`;
      const wishFont = `italic ${fontSizeWishes}px "Times New Roman", Times, serif`;
      const textHPadding = 3 * pixelRatio;
      const textMaxWidth = canvasWidth - textHPadding * 2;

      const nameLines = wrapText(guest.name, nameFont, textMaxWidth);
      const hasWishes = guest.wishes && guest.wishes.trim().length > 0;
      const wishLines = hasWishes
        ? wrapText(guest.wishes!, wishFont, textMaxWidth)
        : [];

      // Calculate card height precisely - Reduced padding
      const contentPadding = 2 * pixelRatio;
      const verticalGap = 2 * pixelRatio;

      let calculatedHeight = contentPadding;
      if (img) calculatedHeight += imgHeight + verticalGap;
      calculatedHeight += nameLines.length * (fontSizeName * 1.15);

      if (hasWishes) {
        calculatedHeight += 2 * pixelRatio; // gap between name and wishes
        calculatedHeight += wishLines.length * (fontSizeWishes * 1.15);
      }

      calculatedHeight += contentPadding;

      cardCanvas.width = canvasWidth;
      cardCanvas.height = Math.ceil(calculatedHeight);

      // Draw Card - Clean & Borderless
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, cardCanvas.width, cardCanvas.height);

      let drawY = contentPadding;

      // Image
      if (img) {
        const drawX = photoHPadding;
        const imgRadius = 3 * pixelRatio;
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(drawX, drawY, photoW, imgHeight, imgRadius);
        ctx.clip();
        ctx.drawImage(img, drawX, drawY, photoW, imgHeight);
        ctx.restore();
        drawY += imgHeight + verticalGap;
      }

      // Name
      ctx.fillStyle = "#1e293b";
      ctx.font = nameFont;
      ctx.textBaseline = "top";
      for (const line of nameLines) {
        ctx.fillText(line, textHPadding, drawY);
        drawY += fontSizeName * 1.15;
      }

      // Wishes (only if provided)
      if (hasWishes) {
        drawY += 2 * pixelRatio;
        ctx.fillStyle = "#64748b";
        ctx.font = wishFont;
        ctx.textBaseline = "top";
        for (const line of wishLines) {
          ctx.fillText(line, textHPadding, drawY);
          drawY += fontSizeWishes * 1.15;
        }
      }

      // Add to PDF with exactly the same aspect ratio as Canvas
      const finalCardWidth = colWidth;
      const finalCardHeight = cardCanvas.height / pixelRatio;

      // Check for page break
      if (currentY + finalCardHeight > pageHeight - margin) {
        pagesData.push({ cards: [...currentCards], header: headerData });
        currentCards = [];
        doc.addPage();
        renderPDFHeader(doc);
        yLeft = 40;
        yRight = 40;
        currentY = 40;
      }

      const cardImg = cardCanvas.toDataURL("image/jpeg", 0.9);
      doc.addImage(
        cardImg,
        "JPEG",
        currentX,
        currentY,
        finalCardWidth,
        finalCardHeight,
        undefined,
        "FAST"
      );

      currentCards.push({
        img: cardImg,
        x: currentX,
        y: currentY,
        w: finalCardWidth,
        h: finalCardHeight,
      });

      // Update column heights
      if (isLeft) {
        yLeft += finalCardHeight + columnGap;
      } else {
        yRight += finalCardHeight + columnGap;
      }
    }

    pagesData.push({
      cards: [...currentCards],
      header: headerData,
    });

    return { doc, pagesData };
  };

  const handlePreview = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePDF();
      if (!result) return;
      // We'll store the pages as structured data and render them in HTML
      setPreviewPages(result.pagesData);
      setIsPreviewOpen(true);
    } catch (error: any) {
      console.error("Preview error:", error);
      toast.error("Failed to generate preview: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadPDF = async () => {
    setIsGenerating(true);
    try {
      const result = await generatePDF();
      if (!result) return;
      result.doc.save(
        `guest-book-${
          activeEvent?.slug || "wedding"
        }-${new Date().getTime()}.pdf`
      );
      toast.success("PDF downloaded successfully");
    } catch (error: any) {
      console.error("PDF Export Error:", error);
      toast.error("Failed to generate PDF: " + error.message);
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Guest Book
          </h1>
          <p className="text-gray-500 mt-1">
            View the list of guests who have uploaded photos and shared their
            wishes.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handlePreview}
            disabled={selectedIds.size === 0 || isGenerating}
            className="rounded-xl border-gray-200 text-gray-600 hover:bg-gray-50 font-bold"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Eye className="w-4 h-4 mr-2" />
            )}
            Preview
          </Button>
          <Button
            variant="default"
            onClick={downloadPDF}
            disabled={selectedIds.size === 0 || isGenerating}
            className="rounded-xl font-bold bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PDF ({selectedIds.size})
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_2px_40px_-12px_rgba(0,0,0,0.08)] overflow-hidden">
        <div className="p-4 border-b border-gray-50 bg-gray-50/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search guest name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-gray-100 focus:bg-white transition-all rounded-xl h-9 text-xs"
            />
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Checkbox
              checked={
                selectedIds.size === filteredGuests.length &&
                filteredGuests.length > 0
              }
              onCheckedChange={toggleSelectAll}
              id="select-all"
            />
            <label
              htmlFor="select-all"
              className="text-[10px] font-bold uppercase tracking-widest text-gray-400 cursor-pointer whitespace-nowrap"
            >
              Select All
            </label>
          </div>
        </div>

        <ScrollArea className="h-[calc(100vh-320px)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
            {filteredGuests.map((guest) => (
              <div
                key={guest.id}
                className={`group relative bg-white rounded-[1.5rem] border transition-all duration-300 ${
                  selectedIds.has(guest.id)
                    ? "border-primary ring-4 ring-blue-50 shadow-lg"
                    : "border-gray-100 hover:border-blue-200 hover:shadow-xl hover:-translate-y-1"
                }`}
              >
                <div className="absolute top-4 left-4 z-10">
                  <Checkbox
                    checked={selectedIds.has(guest.id)}
                    onCheckedChange={() => toggleSelect(guest.id)}
                    className="bg-white/80 backdrop-blur-sm shadow-sm"
                  />
                </div>

                {/* Photo Preview */}
                <div className="aspect-[4/3] w-full relative overflow-hidden rounded-t-[1.4rem]">
                  {guest.photo_url ? (
                    <Image
                      src={guest.photo_url}
                      alt={guest.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300">
                      <ImageIcon className="w-12 h-12 stroke-1" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                    <p className="text-white text-xs font-medium line-clamp-2">
                      {guest.wishes || "No wishes provided"}
                    </p>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900 group-hover:text-primary transition-colors truncate max-w-[120px]">
                        {guest.name}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400">
                          {guest.category || "General"}
                        </span>
                        <span className="w-1 h-1 bg-gray-300 rounded-full" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-purple-600">
                          Attended
                        </span>
                      </div>
                    </div>
                    <div className="bg-blue-50 p-1.5 rounded-lg">
                      <MessageSquare className="w-3.5 h-3.5 text-primary" />
                    </div>
                  </div>

                  {guest.wishes && (
                    <p className="text-[11px] text-gray-500 italic line-clamp-1">
                      "{guest.wishes}"
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredGuests.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="w-20 h-20 bg-blue-50/50 rounded-[2rem] flex items-center justify-center mb-6 text-blue-500">
                <ImageIcon className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Guest Book Empty
              </h3>
              <p className="text-gray-500 max-w-[280px] mx-auto mt-2">
                No guests have uploaded photos or shared their wishes yet.
              </p>
            </div>
          )}
        </ScrollArea>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl gap-0">
          <DialogHeader className="p-6 border-b bg-white shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-xl font-bold text-gray-900">
                Guest Book Photo Preview
              </DialogTitle>
              <div className="flex items-center gap-2 mr-8">
                <Button onClick={downloadPDF} className="rounded-xl font-bold">
                  <Download className="w-4 h-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="flex-1 bg-gray-100/50 relative overflow-hidden">
            <ScrollArea className="h-full w-full">
              <div className="py-4 px-4 flex flex-col items-center gap-12 min-h-full">
                {previewPages &&
                  (previewPages as any).map((page: any, pageIdx: number) => (
                    <div
                      key={pageIdx}
                      className="bg-white shadow-2xl relative flex-shrink-0 w-full max-w-[210mm] aspect-[210/297]"
                    >
                      {/* Simulated Header */}
                      <div className="absolute top-0 left-0 w-full p-[4mm] text-center pointer-events-none flex flex-col items-center">
                        <h1 className="text-[13pt] text-slate-800 italic font-serif leading-none font-bold">
                          {page.header.title}
                        </h1>
                        <h2
                          className="text-[9pt] text-slate-800 font-serif mt-0"
                          style={{ letterSpacing: "4px" }}
                        >
                          {page.header.subtitle}
                        </h2>
                        <p className="text-[6pt] text-slate-400 font-sans mt-0 opacity-80">
                          {page.header.description}
                        </p>
                        <div className="mt-2 border-b border-slate-100 w-[calc(100%-10mm)]" />
                      </div>

                      {/* Cards */}
                      {page.cards.map((card: any, cardIdx: number) => (
                        <div
                          key={cardIdx}
                          className="absolute"
                          style={{
                            left: `${(card.x / 210) * 100}%`,
                            top: `${(card.y / 297) * 100}%`,
                            width: `${(card.w / 210) * 100}%`,
                            height: `${(card.h / 297) * 100}%`,
                          }}
                        >
                          <img
                            src={card.img}
                            className="w-full h-full object-fill"
                            alt={`Guest ${cardIdx}`}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
