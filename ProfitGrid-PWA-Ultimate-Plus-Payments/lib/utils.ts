import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function ymd(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export function fmtMoney(n: number, currency = "USD") {
  const sign = n > 0 ? "+" : n < 0 ? "-" : "";
  const abs = Math.abs(n);
  return `${sign}${new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2
  }).format(abs)}`;
}

export function monthLabel(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1).toLocaleString(undefined, {
    month: "long",
    year: "numeric"
  });
}

export function buildMonthGrid(year: number, monthIndex: number) {
  // Monday-first grid
  const first = new Date(year, monthIndex, 1);
  const last = new Date(year, monthIndex + 1, 0);
  const firstDow = (first.getDay() + 6) % 7; // Monday=0
  const daysInMonth = last.getDate();

  const cells: { date: Date; inMonth: boolean }[] = [];

  for (let i = 0; i < firstDow; i++) {
    const d = new Date(year, monthIndex, 1 - (firstDow - i));
    cells.push({ date: d, inMonth: false });
  }
  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ date: new Date(year, monthIndex, day), inMonth: true });
  }
  while (cells.length % 7 !== 0) {
    const d = new Date(year, monthIndex, daysInMonth + (cells.length % 7) + 1);
    cells.push({ date: d, inMonth: false });
  }
  if (cells.length < 35) {
    while (cells.length < 35) {
      const d = new Date(year, monthIndex, daysInMonth + (cells.length % 7) + 1);
      cells.push({ date: d, inMonth: false });
    }
  }
  return cells;
}
