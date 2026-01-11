"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface PhotoUploadProps {
  guestId: string;
  initialPhotoUrl?: string;
  onUploadSuccess: (url: string) => void;
}

export function PhotoUpload({
  guestId,
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
    <div className="space-y-4">
      <div className="relative group">
        {photoUrl ? (
          <div className="relative aspect-square w-full max-w-[200px] mx-auto overflow-hidden rounded-2xl border-4 border-white shadow-xl">
            <Image
              src={photoUrl}
              alt="Guest photo"
              fill
              className="object-cover"
            />
            <button
              onClick={removePhoto}
              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 text-white rounded-full backdrop-blur-sm transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="aspect-square w-full max-w-[200px] mx-auto rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gray-100 hover:border-gray-300 transition-all duration-300"
          >
            <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-gray-400">
              <Camera className="w-6 h-6" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-gray-900">Upload Foto</p>
              <p className="text-[10px] text-gray-400">Ambil momen bahagiamu</p>
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
            className="text-primary font-bold hover:bg-primary/5"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengunggah...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Pilih File
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
