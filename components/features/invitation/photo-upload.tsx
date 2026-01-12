"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface PhotoUploadProps {
  guestId: string;
  guestName: string;
  initialPhotoUrl?: string;
  onUploadSuccess: (url: string) => void;
}

export function PhotoUpload({
  guestId,
  guestName,
  initialPhotoUrl,
  onUploadSuccess,
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | undefined>(initialPhotoUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    try {
      setIsUploading(true);
      const supabase = createClient() as any;

      // 1. Upload to Supabase Storage
      const fileExt = file.name.split(".").pop();
      const fileName = `${guestId}-${Math.random()}.${fileExt}`;
      const filePath = `guest-book/${fileName}`;

      const { data, error: uploadError } = await supabase.storage
        .from("guest-books")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: urlData } = supabase.storage
        .from("guest-books")
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // 3. Update Guest Record
      const { error: updateError } = await supabase
        .from("guests")
        .update({ photo_url: publicUrl })
        .eq("id", guestId);

      if (updateError) throw updateError;

      setPhotoUrl(publicUrl);
      onUploadSuccess(publicUrl);
      toast.success("Foto berhasil diunggah!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Gagal mengunggah foto: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = async () => {
    try {
      const supabase = createClient() as any;
      const { error } = await supabase
        .from("guests")
        .update({ photo_url: null })
        .eq("id", guestId);

      if (error) throw error;

      setPhotoUrl(undefined);
      onUploadSuccess("");
      toast.success("Foto dihapus");
    } catch (error: any) {
      toast.error("Gagal menghapus foto");
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative group w-full">
        {photoUrl ? (
          <div className="space-y-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[2.5rem] border-8 border-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-gray-100 group-hover:scale-[1.01] transition-all duration-500">
              <Image
                src={photoUrl}
                alt="Guest photo"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <button
                onClick={removePhoto}
                className="absolute top-4 right-4 p-2.5 bg-white/90 hover:bg-white text-red-500 rounded-2xl shadow-xl backdrop-blur-md transition-all z-20"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-center space-y-2 animate-in fade-in slide-in-from-top-2 duration-700 delay-300">
              <p className="text-sm font-medium text-gray-900">
                Terima kasih,{" "}
                <span className="font-bold text-blue-600">{guestName}</span>!
              </p>
              <p className="text-[11px] text-gray-500 leading-relaxed max-w-[240px] mx-auto font-medium">
                Foto ini akan dimasukkan ke dalam{" "}
                <span className="italic font-serif">Guest Book Photo</span>{" "}
                spesial untuk kedua mempelai.
              </p>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-[4/3] w-full rounded-[2.5rem] border-2 border-dashed border-gray-100 bg-gray-50/50 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-blue-50/30 hover:border-blue-200 transition-all duration-500 group relative overflow-hidden"
          >
            {/* Background decorative elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100/30 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-200/40 transition-colors" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-cyan-100/30 rounded-full blur-3xl -ml-16 -mb-16 group-hover:bg-cyan-200/40 transition-colors" />

            <div className="w-16 h-16 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-400 group-hover:text-blue-500 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 relative z-10">
              <Camera className="w-8 h-8" />
            </div>
            <div className="text-center relative z-10">
              <p className="text-base font-bold text-gray-900">
                Ketuk untuk Foto
              </p>
              <p className="text-[11px] text-gray-400 font-medium">
                Bagi kebahagiaanmu di sini
              </p>
            </div>
          </div>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      <div className="text-center">
        {!photoUrl && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-primary font-bold hover:bg-primary/5 rounded-full px-6 py-5 transition-all active:scale-95"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengunggah...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Pilih Dari Galeri
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
