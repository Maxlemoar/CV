import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep heavy native/binary packages out of the Next bundle — the PDF
  // export route (/api/cv-pdf) uses these at runtime on the server.
  serverExternalPackages: ["puppeteer-core", "@sparticuz/chromium"],
};

export default nextConfig;
