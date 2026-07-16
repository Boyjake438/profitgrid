import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createServerSupabase } from "@/lib/supabase/server";

function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

function fmt(n: number) {
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  return `${sign}$${Math.abs(n).toFixed(2)}`;
}

export async function GET(req: Request) {
  const supabase = createServerSupabase();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(req.url);
  const year = Number(url.searchParams.get("year"));
  const month = Number(url.searchParams.get("month")); // 1-12
  const accountId = url.searchParams.get("accountId");

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    return NextResponse.json({ error: "Missing or invalid year/month" }, { status: 400 });
  }

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  let q = supabase
    .from("daily_pnl")
    .select("day,total_pnl")
    .eq("user_id", auth.user.id)
    .gte("day", start.toISOString().slice(0, 10))
    .lt("day", end.toISOString().slice(0, 10))
    .order("day", { ascending: true });

  if (accountId) {
    // @ts-ignore
    q = q.eq("account_id", Number(accountId));
  }

  const { data, error } = await q;
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = (data as any[]) ?? [];
  const values = rows.map((r) => Number(r.total_pnl) || 0);
  const total = values.reduce((a, b) => a + b, 0);
  const best = values.length ? Math.max(...values) : 0;
  const worst = values.length ? Math.min(...values) : 0;
  const avg = values.length ? total / values.length : 0;

  // simple equity + drawdown for a mini chart
  let eq = 0;
  let peak = 0;
  let maxDD = 0;
  const equitySeries = values.map((v) => {
    eq += v;
    peak = Math.max(peak, eq);
    const dd = eq - peak;
    maxDD = Math.min(maxDD, dd);
    return { eq, dd };
  });

  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  // Header
  page.drawText("ProfitGrid", {
    x: 48,
    y: height - 70,
    size: 28,
    font: bold,
    color: rgb(0.12, 0.82, 0.62),
  });

  const label = new Date(year, month - 1, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric",
  });
  page.drawText(`Investor-Grade Performance Report · ${label}`, {
    x: 48,
    y: height - 98,
    size: 12,
    font,
    color: rgb(0.35, 0.38, 0.45),
  });

  // Summary cards
  const cardY = height - 160;
  const cardW = (width - 48 * 2 - 16 * 3) / 4;
  const cardH = 62;
  const cards = [
    { t: "Total", v: fmt(total) },
    { t: "Avg / day", v: fmt(avg) },
    { t: "Best day", v: fmt(best) },
    { t: "Worst day", v: fmt(worst) },
  ];
  cards.forEach((c, i) => {
    const x = 48 + i * (cardW + 16);
    page.drawRectangle({ x, y: cardY, width: cardW, height: cardH, borderColor: rgb(0.9, 0.9, 0.92), borderWidth: 1 });
    page.drawText(c.t, { x: x + 12, y: cardY + 40, size: 10, font, color: rgb(0.45, 0.48, 0.55) });
    page.drawText(c.v, { x: x + 12, y: cardY + 16, size: 14, font: bold, color: rgb(0.1, 0.1, 0.12) });
  });

  // Mini equity/drawdown chart
  const chartX = 48;
  const chartY = cardY - 210;
  const chartW = width - 96;
  const chartH = 160;
  page.drawText("Equity curve & drawdown (from daily totals)", {
    x: chartX,
    y: chartY + chartH + 14,
    size: 12,
    font: bold,
    color: rgb(0.1, 0.1, 0.12),
  });
  page.drawRectangle({ x: chartX, y: chartY, width: chartW, height: chartH, borderColor: rgb(0.9, 0.9, 0.92), borderWidth: 1 });

  if (equitySeries.length >= 2) {
    const eqVals = equitySeries.map((p) => p.eq);
    const ddVals = equitySeries.map((p) => p.dd);
    const minEq = Math.min(...eqVals);
    const maxEq = Math.max(...eqVals);
    const minDD = Math.min(...ddVals);
    const maxDD = Math.max(...ddVals);
    const n = equitySeries.length;
    const step = chartW / (n - 1);

    const mapY = (v: number, vmin: number, vmax: number) => {
      const t = vmax === vmin ? 0.5 : (v - vmin) / (vmax - vmin);
      return chartY + 14 + (chartH - 28) * (1 - clamp(t, 0, 1));
    };

    // equity polyline
    for (let i = 1; i < n; i++) {
      const x1 = chartX + (i - 1) * step;
      const y1 = mapY(eqVals[i - 1], minEq, maxEq);
      const x2 = chartX + i * step;
      const y2 = mapY(eqVals[i], minEq, maxEq);
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 2, color: rgb(0.12, 0.82, 0.62) });
    }

    // drawdown polyline
    for (let i = 1; i < n; i++) {
      const x1 = chartX + (i - 1) * step;
      const y1 = mapY(ddVals[i - 1], minDD, maxDD);
      const x2 = chartX + i * step;
      const y2 = mapY(ddVals[i], minDD, maxDD);
      page.drawLine({ start: { x: x1, y: y1 }, end: { x: x2, y: y2 }, thickness: 2, color: rgb(0.93, 0.32, 0.33) });
    }
  } else {
    page.drawText("Not enough data to plot.", { x: chartX + 12, y: chartY + 70, size: 11, font, color: rgb(0.45, 0.48, 0.55) });
  }

  // Table of days
  const tableY = chartY - 310;
  page.drawText("Daily results", {
    x: 48,
    y: tableY + 280,
    size: 12,
    font: bold,
    color: rgb(0.1, 0.1, 0.12),
  });
  const maxRows = 18;
  const show = rows.slice(0, maxRows);
  const tx = 48;
  const col1 = 140;
  const col2 = 140;
  const rowH = 14;

  page.drawText("Date", { x: tx, y: tableY + 260, size: 10, font: bold, color: rgb(0.35, 0.38, 0.45) });
  page.drawText("P&L", { x: tx + col1, y: tableY + 260, size: 10, font: bold, color: rgb(0.35, 0.38, 0.45) });
  page.drawText("Notes", { x: tx + col1 + col2, y: tableY + 260, size: 10, font: bold, color: rgb(0.35, 0.38, 0.45) });

  show.forEach((r, i) => {
    const y = tableY + 242 - i * rowH;
    page.drawText(String(r.day), { x: tx, y, size: 10, font, color: rgb(0.1, 0.1, 0.12) });
    page.drawText(fmt(Number(r.total_pnl) || 0), { x: tx + col1, y, size: 10, font, color: rgb(0.1, 0.1, 0.12) });
  });
  if (rows.length > maxRows) {
    page.drawText(`…and ${rows.length - maxRows} more days`, { x: tx, y: tableY + 242 - maxRows * rowH, size: 10, font, color: rgb(0.45, 0.48, 0.55) });
  }

  page.drawText("Generated by ProfitGrid", {
    x: 48,
    y: 28,
    size: 9,
    font,
    color: rgb(0.45, 0.48, 0.55),
  });

  const bytes = await pdf.save();
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename=ProfitGrid-${year}-${String(month).padStart(2, "0")}.pdf`,
    },
  });
}
