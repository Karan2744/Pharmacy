// ── CSV helpers shared across admin pages ──────────────────────────────────
export const CSV_COLS = ["name","brand","category","subCategory","price","mrp","adminGstPercent","adminCgstPercent","stock","image"];

function esc(v) {
  const s = String(v ?? "");
  return s.includes(",") || s.includes('"') || s.includes("\n")
    ? `"${s.replace(/"/g, '""')}"` : s;
}

export function toCSV(rows) {
  return [CSV_COLS.join(","), ...rows.map((r) => CSV_COLS.map((c) => esc(r[c])).join(","))].join("\n");
}

function parseCSVLine(line) {
  const out = []; let cur = ""; let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQ && line[i+1] === '"') { cur += '"'; i++; } else inQ = !inQ;
    } else if (ch === ',' && !inQ) { out.push(cur); cur = ""; }
    else cur += ch;
  }
  out.push(cur);
  return out;
}

export function parseCSV(text) {
  const lines = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim().split("\n");
  if (lines.length < 2) return [];
  const hdrs = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase());
  return lines
    .slice(1)
    .map((line) => {
      const v = parseCSVLine(line);
      const o = {};
      hdrs.forEach((h, i) => { o[h] = v[i]?.trim() ?? ""; });
      return o;
    })
    .filter((r) => Object.values(r).some((value) => String(value).trim().length > 0));
}
