"use client";

import { useState } from "react";
import { Guest } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import QRCode from "react-qr-code";
import { supabaseGuestService } from "@/lib/services/guest-service";
import { CheckCircle2, Download, X } from "lucide-react";

interface RSVPFormProps {
  guest: Guest;
  isQRActive?: boolean;
  yesOptionLabel?: string;
  yesResponseMessage?: string;
  noOptionLabel?: string;
  noResponseMessage?: string;
  showWishesInput?: boolean;
  wishesInputTitle?: string;
}

export function RSVPForm({
  guest,
  isQRActive = true,
  yesOptionLabel = "Ya, saya akan hadir",
  yesResponseMessage = "Sudah tidak sabar!",
  noOptionLabel = "Maaf, saya tidak bisa hadir",
  noResponseMessage = "Doa terbaik untuk mempelai",
  showWishesInput = true,
  wishesInputTitle = "Ucapan untuk mempelai",
}: RSVPFormProps) {
  const [attending, setAttending] = useState<"yes" | "no" | null>(null);
  const [wishes, setWishes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleDownload = () => {
    const svg = document.getElementById("guest-qr-code");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      if (ctx) {
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        const pngFile = canvas.toDataURL("image/png");

        const downloadLink = document.createElement("a");
        downloadLink.download = `invitation-qr-${guest.slug}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      }
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const showConfirmed =
    (submitted && attending === "yes") || guest.status === "confirmed";
  const showDeclined =
    (submitted && attending === "no") || guest.status === "declined";
  const showAttended = guest.status === "attended";

  if (showAttended) {
    return (
      <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-700">
        <div className="bg-purple-50 text-purple-700 px-6 py-4 rounded-2xl flex items-center gap-3 w-full justify-center border border-purple-100">
          <div className="bg-purple-100 p-1 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="font-semibold text-sm">
            Selamat datang! Anda telah melakukan check-in.
          </span>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col items-center space-y-4 w-full text-center">
          <h3 className="font-bold text-xl text-gray-900">
            Selamat Menikmati Acara!
          </h3>
          <p className="text-gray-500 text-sm leading-relaxed">
            Terima kasih telah bergabung dengan kami, {guest.name}. Kami harap
            Anda menikmati acaranya!
          </p>
        </div>
      </div>
    );
  }

  if (showConfirmed) {
    return (
      <div className="flex flex-col items-center space-y-6 animate-in fade-in duration-700">
        <div className="bg-green-50 text-green-700 px-6 py-4 rounded-2xl flex items-center gap-3 w-full justify-center border border-green-100">
          <div className="bg-green-100 p-1 rounded-full">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <span className="font-semibold text-sm">
            Terkonfirmasi! Sampai jumpa di sana.
          </span>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 flex flex-col items-center space-y-6 w-full">
          <div className="text-center space-y-1">
            <p className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold">
              Tiket Masuk
            </p>
            <h3 className="font-bold text-xl text-gray-900">{guest.name}</h3>
            <div className="inline-block bg-gray-100 px-3 py-1 rounded-full text-xs font-medium text-gray-600">
              {guest.pax_count} Orang
            </div>
          </div>

          {isQRActive && (
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
              <QRCode
                id="guest-qr-code"
                value={JSON.stringify({ id: guest.id, slug: guest.slug })}
                size={180}
              />
            </div>
          )}

          <div className="w-full space-y-3">
            {isQRActive && (
              <Button
                className="w-full h-12 rounded-xl bg-[#3EA0FE] hover:bg-blue-600 shadow-lg shadow-blue-500/20 text-white font-medium"
                onClick={handleDownload}
              >
                <Download className="w-4 h-4 mr-2" />
                Unduh Tiket
              </Button>
            )}
            <p className="text-[10px] text-center text-gray-400 max-w-[200px] mx-auto leading-relaxed">
              {isQRActive
                ? "Silakan tunjukkan kode QR ini di meja penerima tamu untuk check-in."
                : "Terima kasih atas konfirmasinya. Sampai jumpa di hari H!"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (showDeclined) {
    return (
      <div className="bg-gray-50 text-gray-500 px-6 py-12 rounded-[2rem] text-center space-y-4 border border-gray-100">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
          <X className="w-8 h-8 text-gray-400" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-gray-900">
            Terima kasih telah memberikan kabar
          </p>
          <p className="text-sm">
            Kami sangat menyayangkan Anda tidak bisa hadir, namun kami
            menghargai ucapan Anda.
          </p>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (attending === "yes") {
        await supabaseGuestService.updateGuestStatus(
          guest.id,
          "confirmed",
          wishes
        );
      } else if (attending === "no") {
        await supabaseGuestService.updateGuestStatus(
          guest.id,
          "declined",
          wishes
        );
      }
      setSubmitted(true);
    } catch (error) {
      console.error("Failed to update status", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-3">
        <label className={`cursor-pointer group block`}>
          <input
            type="radio"
            name="attendance"
            value="yes"
            className="peer hidden"
            onChange={() => setAttending("yes")}
            checked={attending === "yes"}
          />
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:shadow-inner transition-all duration-200 hover:border-blue-200 bg-white">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                attending === "yes"
                  ? "border-blue-500 bg-blue-500"
                  : "border-gray-200 group-hover:border-blue-300"
              }`}
            >
              {attending === "yes" && (
                <CheckCircle2 className="w-4 h-4 text-white" />
              )}
            </div>
            <div className="flex-1">
              <span
                className={`font-semibold block ${
                  attending === "yes" ? "text-blue-700" : "text-gray-700"
                }`}
              >
                {yesOptionLabel}
              </span>
              <span className="text-xs text-gray-400">
                {yesResponseMessage}
              </span>
            </div>
          </div>
        </label>

        <label className={`cursor-pointer group block`}>
          <input
            type="radio"
            name="attendance"
            value="no"
            className="peer hidden"
            onChange={() => setAttending("no")}
            checked={attending === "no"}
          />
          <div className="flex items-center gap-4 p-4 rounded-2xl border border-gray-200 peer-checked:border-gray-400 peer-checked:bg-gray-50 peer-checked:shadow-inner transition-all duration-200 hover:border-gray-300 bg-white">
            <div
              className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${
                attending === "no"
                  ? "border-gray-500 bg-gray-500"
                  : "border-gray-200 group-hover:border-gray-300"
              }`}
            >
              {attending === "no" && <X className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1">
              <span
                className={`font-semibold block ${
                  attending === "no" ? "text-gray-900" : "text-gray-700"
                }`}
              >
                {noOptionLabel}
              </span>
              <span className="text-xs text-gray-400">{noResponseMessage}</span>
            </div>
          </div>
        </label>
      </div>

      {attending === "yes" && (
        <div className="space-y-4 animate-in slide-in-from-top-2 fade-in">
          <div className="space-y-2">
            <Label className="text-xs uppercase tracking-wide text-gray-500 font-bold ml-1">
              Jumlah Tamu
            </Label>
            <div className="relative">
              <Input
                type="number"
                min="1"
                max={guest.pax_count}
                defaultValue={guest.pax_count}
                disabled
                className="h-12 rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 text-lg font-medium text-center opacity-60 cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-center text-gray-400">
              Maksimal: {guest.pax_count} orang
            </p>
          </div>
        </div>
      )}

      {attending && showWishesInput && (
        <div className="space-y-2 animate-in slide-in-from-top-2 fade-in">
          <Label className="text-xs uppercase tracking-wide text-gray-500 font-bold ml-1">
            {wishesInputTitle}
          </Label>
          <Textarea
            placeholder="Tulis pesan..."
            value={wishes}
            onChange={(e) => setWishes(e.target.value)}
            className="min-h-[100px] rounded-2xl bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 resize-none p-4"
          />
        </div>
      )}

      {attending && (
        <Button
          type="submit"
          className="w-full h-12 rounded-xl bg-[#3EA0FE] hover:bg-blue-600 text-white font-bold text-lg shadow-lg shadow-blue-500/20 mt-4 transition-transform active:scale-[0.98]"
        >
          Konfirmasi RSVP
        </Button>
      )}
    </form>
  );
}
