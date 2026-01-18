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

  // Exclude heavy packages from server bundle
  serverExternalPackages: [
    "@supabase/supabase-js",
    "@supabase/ssr",
    "exceljs",
    "jspdf",
    "jspdf-autotable",
    "html-to-image",
  ],

  // Exclude unnecessary files from bundle tracing
  outputFileTracingExcludes: {
    "*": [
      // Build tools (tidak perlu di production)
      "node_modules/@swc/core-linux-x64-gnu",
      "node_modules/@swc/core-linux-x64-musl",
      "node_modules/@swc/core-darwin-x64",
      "node_modules/@swc/core-darwin-arm64",
      "node_modules/@esbuild/**",
      "node_modules/webpack/**",
      "node_modules/rollup/**",
      "node_modules/terser/**",

      // Heavy dependencies yang sudah di-external
      "node_modules/exceljs/**",
      "node_modules/jspdf/**",
      "node_modules/html-to-image/**",

      // Canvas dependencies (biasanya berat dan tidak perlu di edge)
      "node_modules/canvas/**",
      "node_modules/sharp/**",
    ],
  },

  experimental: {
    optimizePackageImports: [
      "lucide-react",
      "recharts",
      "date-fns",
      "@radix-ui/react-icons",
      "@radix-ui/react-alert-dialog",
      "@radix-ui/react-avatar",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-radio-group",
      "@radix-ui/react-scroll-area",
      "@radix-ui/react-select",
      "@radix-ui/react-separator",
      "@radix-ui/react-slot",
      "@radix-ui/react-switch",
      "@radix-ui/react-tabs",
      "@radix-ui/react-tooltip",
    ],
  },
};

export default nextConfig;
