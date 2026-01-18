export default function supabaseImageLoader({
  src,
  width,
  quality,
}: {
  src: string;
  width: number;
  quality?: number;
}) {
  // Jika bukan dari Supabase storage, return original
  if (!src.includes("qtsgglzoyzjcvfuaxxmb.supabase.co")) {
    return src;
  }

  // Jika sudah dari render endpoint, return apa adanya
  if (src.includes("/storage/v1/render/image/")) {
    return src;
  }

  try {
    // Parse URL untuk dapat path
    const url = new URL(src);
    const path = url.pathname.replace("/storage/v1/object/public/", "");

    // Gunakan Supabase render endpoint untuk transformation
    const transformParams = new URLSearchParams({
      width: width.toString(),
      resize: "contain", // atau 'cover', 'fill'
      ...(quality && { quality: quality.toString() }),
    });

    return `https://qtsgglzoyzjcvfuaxxmb.supabase.co/storage/v1/render/image/public/${path}?${transformParams}`;
  } catch (error) {
    // Jika error parsing, return original
    console.error("Error loading image:", error);
    return src;
  }
}
