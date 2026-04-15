import { NextRequest, NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteerCore, { type Browser } from "puppeteer-core";

export const runtime = "nodejs";
export const maxDuration = 60;

const isDev = process.env.NODE_ENV === "development";

async function getBrowser(): Promise<Browser> {
  if (isDev) {
    // Local dev: full puppeteer bundles its own Chromium
    const puppeteer = await import("puppeteer");
    return (await puppeteer.default.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    })) as unknown as Browser;
  }

  // Vercel / production: puppeteer-core + @sparticuz/chromium
  return puppeteerCore.launch({
    args: [
      ...chromium.args,
      "--hide-scrollbars",
      "--font-render-hinting=none",
    ],
    defaultViewport: { width: 1200, height: 1600, deviceScaleFactor: 2 },
    executablePath: await chromium.executablePath(),
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

    // Kill any residual animation state so the snapshot is fully visible
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation: none !important;
          transition: none !important;
        }
        .ed-reveal { opacity: 1 !important; transform: none !important; }
      `,
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "12mm", right: "15mm", bottom: "12mm", left: "15mm" },
      displayHeaderFooter: false,
      scale: 1,
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
