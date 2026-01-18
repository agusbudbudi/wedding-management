import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./lib/supabase-image-loader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qtsgglzoyzjcvfuaxxmb.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "qtsgglzoyzjcvfuaxxmb.supabase.co",
        port: "",
        pathname: "/storage/v1/render/image/public/**",
      },
    ],
  },
};

export default nextConfig;
