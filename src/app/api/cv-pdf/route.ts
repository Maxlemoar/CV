import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium-min";
import puppeteerCore, { type Browser } from "puppeteer-core";

export const runtime = "nodejs";
export const maxDuration = 60;

const isDev = process.env.NODE_ENV === "development";

// chromium-min downloads the full browser (binary + all shared libraries,
// including libnss3) into /tmp at cold start. The bundled variant kept
// failing on Vercel because its library files were pruned from the
// function bundle ("libnss3.so: cannot open shared object file").
// Keep this version in sync with puppeteer-core (23.x ↔ chromium 131).
const CHROMIUM_PACK_URL =
  process.env.CHROMIUM_PACK_URL ??
  "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar";

async function getBrowser(): Promise<Browser> {
  if (isDev) {
    // Local dev: full puppeteer bundles its own Chromium
    const puppeteer = await import("puppeteer");
    return (await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })) as unknown as Browser;
  }

  // Vercel / production: puppeteer-core + @sparticuz/chromium-min
  return puppeteerCore.launch({
    args: [
      ...chromium.args,
      "--hide-scrollbars",
      "--font-render-hinting=none",
    ],
    defaultViewport: { width: 1200, height: 1600, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(CHROMIUM_PACK_URL),
    headless: true,
  });
}

export async function GET(req: NextRequest) {
  let browser: Browser | null = null;
  try {
    browser = await getBrowser();
    const page = await browser.newPage();

    // Build absolute URL to /cv on the current deployment
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const host = req.headers.get("host");
    const url = `${proto}://${host}/cv?print=1`;

    await page.goto(url, { waitUntil: "networkidle0", timeout: 45000 });

    // Critical: wait for Fraunces + Inter to finish loading before capture
    await page.evaluateHandle("document.fonts.ready");

    // Kill animations and neutralize ALL print-specific overrides so the
    // PDF renders identically to the web version.
    await page.addStyleTag({
      content: `
        /* ── Reset animations ── */
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
        }

        @media print {
          /* ── Neutralize globals.css print block 1 (body overrides) ── */
          html, body {
            font-size: 16px !important;
          }

          /* ── Neutralize globals.css print block 2 (ed-cv overrides) ── */
          .ed-cv {
            max-width: 900px !important;
            padding: 24px !important;
            padding-top: 48px !important;
            padding-bottom: 48px !important;
            margin: 0 auto !important;
            font-size: inherit !important;
          }

          /* Web spacing slightly condensed so the CV fits two A4 pages */
          .ed-reveal {
            opacity: 1 !important;
            transform: none !important;
            transition: none !important;
            margin-bottom: 38px !important;
          }

          /* Restore web grid dimensions */
          .ed-grid-row {
            grid-template-columns: 130px 1fr !important;
            gap: 0 24px !important;
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Header margin slightly condensed (web: 64px) */
          article.ed-cv > header {
            margin-bottom: 44px !important;
          }

          /* Heading size as on the web, margin slightly condensed */
          article.ed-cv h2.ed-serif {
            font-size: 28px !important;
            margin-bottom: 14px !important;
          }

          /* Restore h1 size */
          article.ed-cv h1.ed-serif {
            font-size: 48px !important;
          }

          /* ── Clean page breaks ── */
          article.ed-cv > section > h2 {
            break-after: avoid;
            page-break-after: avoid;
          }

          /* Two-page layout: page 1 = Summary + Experience, page 2 =
             Education + Research + Side Projects + Skills (sections:
             1 Summary, 2 Experience, 3 Education, 4 Research,
             5 Side Projects, 6 Skills) */
          article.ed-cv > section:nth-of-type(3) {
            break-before: page;
            page-break-before: always;
          }

          article.ed-cv .space-y-10 > div {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          /* Preserve color rendering */
          *, *::before, *::after {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: false,
      margin: { top: "12mm", right: "15mm", bottom: "12mm", left: "15mm" },
      displayHeaderFooter: false,
      scale: 0.7,
    });

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          'attachment; filename="Maximilian-Marowsky-CV.pdf"',
        "Cache-Control": "public, max-age=0, must-revalidate",
      },
    });
  } catch (err) {
    console.error("PDF generation failed:", err);
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 },
    );
  } finally {
    if (browser) {
      try {
        await browser.close();
      } catch {
        // ignore
      }
    }
  }
}
