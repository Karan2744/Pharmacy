"use client";

import { QRCodeSVG } from "qrcode.react";
import { useRef, useState } from "react";
import { Printer, ArrowLeft, FileText, Receipt, X } from "lucide-react";

const PRIMARY = "#0070B3";
const PRIMARY_DARK = "#005A92";

// ── Shared invoice data builder ──────────────────────────────────────────────
function buildData(order) {
  const subtotal      = order.items.reduce((s, i) => s + i.price * i.quantity, 0);
  const taxableAmount = order.taxableAmount ?? subtotal;
  const cgst          = order.cgst   ?? parseFloat((taxableAmount * 0.06).toFixed(2));
  const sgst          = order.sgst   ?? parseFloat((taxableAmount * 0.06).toFixed(2));
  const gstTotal      = order.gstTotal ?? cgst + sgst;
  const rateLabel     = taxableAmount > 0 ? Math.round((cgst / taxableAmount) * 100) : 6;
  const shippingFee   = order.shippingFee ?? 0;
  const grandTotal    = order.total;
  const orderId       = order._id || order.id || "";
  const shortId       = orderId.slice(-8).toUpperCase();
  const orderDate     = new Date(order.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric",
  });
  const address = order.address
    ? [order.address.line1, order.address.line2, order.address.city,
       order.address.state, order.address.pincode].filter(Boolean).join(", ")
    : "";

  const qrData = JSON.stringify({
    fullId:   orderId, orderId: shortId,
    customer: order.user?.name || "Guest",
    phone:    order.address?.phone || order.user?.phone || "",
    total:    `₹${grandTotal}`,
    cgst:     `₹${cgst.toFixed(2)}`,
    sgst:     `₹${sgst.toFixed(2)}`,
    date:     orderDate, items: order.items.length,
    status:   order.status || "Processing",
  });

  return { subtotal, taxableAmount, cgst, sgst, gstTotal, rateLabel,
           shippingFee, grandTotal, orderId, shortId, orderDate, address, qrData };
}

// ── A4 HTML generator ────────────────────────────────────────────────────────
function buildA4Html(order, d, qrSvgString) {
  const rows = order.items.map((item, i) => `
    <tr style="background:${i % 2 === 0 ? "#fff" : "#f9fafb"}">
      <td style="padding:10px 14px;font-size:12px;font-weight:600;color:#111">${item.name}
        ${item.brand ? `<br><span style="font-size:10px;color:#9ca3af">${item.brand}</span>` : ""}
      </td>
      <td style="padding:10px 14px;text-align:center;font-size:12px;color:#4b5563">${item.quantity}</td>
      <td style="padding:10px 14px;text-align:right;font-size:12px;color:#4b5563">₹${item.price.toFixed(2)}</td>
      <td style="padding:10px 14px;text-align:right;font-size:12px;font-weight:700;color:#111">₹${(item.price * item.quantity).toFixed(2)}</td>
    </tr>`).join("");

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Invoice #${d.shortId}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;font-family:Arial,sans-serif}
    body{background:#fff;color:#111;padding:32px;font-size:13px}
    @media print{body{padding:16px}@page{margin:10mm}}
  </style></head><body>
  <!-- Header -->
  <div style="background:linear-gradient(135deg,${PRIMARY},${PRIMARY_DARK});border-radius:12px;padding:24px 28px;margin-bottom:20px;color:#fff;display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <div style="font-size:24px;font-weight:900">PharmaCare</div>
      <div style="font-size:11px;color:#fbcfe8;margin-top:3px">Your Trusted Online Pharmacy</div>
      <div style="margin-top:12px;font-size:11px;color:#fbcfe8">GSTIN: 27AAACP1234P1Z5</div>
      <div style="font-size:11px;color:#fbcfe8">support@pharmacare.in</div>
    </div>
    <div style="text-align:right">
      <div style="font-size:10px;color:#fbcfe8;letter-spacing:1px;text-transform:uppercase">Tax Invoice</div>
      <div style="font-size:20px;font-weight:900;margin-top:4px">#${d.shortId}</div>
      <div style="font-size:11px;color:#fbcfe8;margin-top:4px">${d.orderDate}</div>
    </div>
  </div>

  <!-- Bill To / Ship To -->
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
    <div style="background:#f9fafb;border-radius:10px;padding:16px">
      <div style="font-size:9px;font-weight:900;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">Bill To</div>
      <div style="font-weight:700;font-size:13px">${order.user?.name || "Guest"}</div>
      ${order.user?.phone ? `<div style="font-size:11px;color:#6b7280;margin-top:3px">${order.user.phone}</div>` : ""}
      ${order.user?.email ? `<div style="font-size:11px;color:#6b7280">${order.user.email}</div>` : ""}
    </div>
    <div style="background:#f9fafb;border-radius:10px;padding:16px">
      <div style="font-size:9px;font-weight:900;color:#9ca3af;letter-spacing:1.5px;text-transform:uppercase;margin-bottom:8px">Ship To</div>
      <div style="font-weight:700;font-size:13px">${order.address?.fullName || order.user?.name || ""}</div>
      ${order.address?.phone ? `<div style="font-size:11px;color:#6b7280;margin-top:3px">${order.address.phone}</div>` : ""}
      <div style="font-size:11px;color:#6b7280;margin-top:3px;line-height:1.5">${d.address}</div>
    </div>
  </div>

  <!-- Items Table -->
  <table style="width:100%;border-collapse:collapse;border-radius:10px;overflow:hidden;margin-bottom:20px;border:1px solid #e5e7eb">
    <thead>
      <tr style="background:${PRIMARY}">
        <th style="text-align:left;padding:10px 14px;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:1px">Item</th>
        <th style="text-align:center;padding:10px 14px;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:1px">Qty</th>
        <th style="text-align:right;padding:10px 14px;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:1px">Rate</th>
        <th style="text-align:right;padding:10px 14px;color:#fff;font-size:11px;text-transform:uppercase;letter-spacing:1px">Amount</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <!-- Totals + QR -->
  <div style="display:flex;gap:20px;align-items:flex-start;margin-bottom:20px">
    <div style="flex-shrink:0;text-align:center">
      <div style="border:2px solid #e5e7eb;border-radius:12px;padding:10px;display:inline-block">
        ${qrSvgString}
      </div>
      <div style="font-size:9px;color:#9ca3af;margin-top:6px;font-weight:600">Scan to verify order</div>
    </div>
    <div style="flex:1;background:#f9fafb;border-radius:10px;padding:16px">
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;color:#4b5563"><span>Subtotal</span><span style="font-weight:600">₹${d.subtotal.toFixed(2)}</span></div>
      <div style="display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px;color:#4b5563"><span>Shipping</span><span style="font-weight:600;color:${d.shippingFee === 0 ? "#16a34a" : "#374151"}">${d.shippingFee === 0 ? "FREE" : `₹${d.shippingFee}`}</span></div>
      <div style="border-top:1px dashed #d1d5db;padding-top:8px;margin-top:4px">
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:11px;color:#6b7280"><span>Taxable Amount</span><span>₹${d.taxableAmount.toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:11px;color:#6b7280"><span>CGST (${d.rateLabel}%)</span><span>₹${d.cgst.toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:5px;font-size:11px;color:#6b7280"><span>SGST (${d.rateLabel}%)</span><span>₹${d.sgst.toFixed(2)}</span></div>
        <div style="display:flex;justify-content:space-between;font-size:11px;font-weight:600;color:#374151"><span>Total GST</span><span>₹${d.gstTotal.toFixed(2)}</span></div>
      </div>
      <div style="border-top:2px solid #d1d5db;margin-top:10px;padding-top:10px;display:flex;justify-content:space-between;font-size:16px;font-weight:900;color:#111"><span>Grand Total</span><span>₹${d.grandTotal.toLocaleString("en-IN")}</span></div>
    </div>
  </div>

  <!-- Payment + Footer -->
  <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
    <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:10px 16px">
      <div style="font-size:10px;color:#6b7280">Payment Method</div>
      <div style="font-weight:700;font-size:13px">${order.paymentMethod || "Cash on Delivery"}</div>
    </div>
    <div style="font-size:10px;color:#9ca3af;text-align:right">
      This is a computer-generated invoice.<br>
      Queries: 09240250346 | support@pharmacare.in
    </div>
  </div>
  </body></html>`;
}

// ── Thermal (80mm) HTML generator ────────────────────────────────────────────
function buildThermalHtml(order, d, qrSvgString) {
  const rows = order.items.map((item) => `
    <div style="border-bottom:1px dashed #ccc;padding:6px 0;font-size:11px">
      <div style="font-weight:700">${item.name}</div>
      ${item.brand ? `<div style="color:#666;font-size:10px">${item.brand}</div>` : ""}
      <div style="display:flex;justify-content:space-between;margin-top:3px">
        <span style="color:#555">₹${item.price.toFixed(2)} × ${item.quantity}</span>
        <span style="font-weight:700">₹${(item.price * item.quantity).toFixed(2)}</span>
      </div>
    </div>`).join("");

  const trow = (label, value, bold) =>
    `<div style="display:flex;justify-content:space-between;padding:3px 0;font-size:11px${bold ? ";font-weight:900;font-size:13px;border-top:1px solid #000;margin-top:4px;padding-top:6px" : ""}">
      <span>${label}</span><span>${value}</span></div>`;

  return `<!DOCTYPE html><html><head><meta charset="UTF-8">
  <title>Receipt #${d.shortId}</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0;font-family:'Courier New',monospace}
    body{width:80mm;max-width:80mm;padding:8mm 6mm;font-size:12px;color:#000}
    @media print{body{width:80mm}@page{margin:0;size:80mm auto}}
  </style></head><body>

  <div style="text-align:center;margin-bottom:10px">
    <div style="font-size:18px;font-weight:900;letter-spacing:2px">PHARMACARE</div>
    <div style="font-size:9px;color:#555;margin-top:2px">Your Trusted Online Pharmacy</div>
    <div style="font-size:9px;color:#555">GSTIN: 27AAACP1234P1Z5</div>
    <div style="border-top:2px dashed #000;margin:8px 0"></div>
    <div style="font-size:10px">TAX INVOICE</div>
    <div style="font-size:13px;font-weight:900">#${d.shortId}</div>
    <div style="font-size:10px;color:#555">${d.orderDate}</div>
  </div>

  <div style="border-top:1px dashed #000;border-bottom:1px dashed #000;padding:6px 0;margin-bottom:8px;font-size:11px">
    <div><strong>Customer:</strong> ${order.user?.name || "Guest"}</div>
    ${order.user?.phone ? `<div><strong>Phone:</strong> ${order.user.phone}</div>` : ""}
    ${d.address ? `<div style="margin-top:3px;font-size:10px;color:#444">${d.address}</div>` : ""}
  </div>

  <div style="margin-bottom:8px">${rows}</div>

  <div style="margin-top:6px">
    ${trow("Subtotal", `₹${d.subtotal.toFixed(2)}`)}
    ${trow("Shipping", d.shippingFee === 0 ? "FREE" : `₹${d.shippingFee}`)}
    ${trow(`CGST (${d.rateLabel}%)`, `₹${d.cgst.toFixed(2)}`)}
    ${trow(`SGST (${d.rateLabel}%)`, `₹${d.sgst.toFixed(2)}`)}
    ${trow("Total GST", `₹${d.gstTotal.toFixed(2)}`)}
    ${trow("GRAND TOTAL", `₹${d.grandTotal.toLocaleString("en-IN")}`, true)}
  </div>

  <div style="margin-top:8px;font-size:11px">
    <strong>Payment:</strong> ${order.paymentMethod || "Cash on Delivery"}
  </div>

  <div style="text-align:center;margin-top:12px">
    ${qrSvgString}
    <div style="font-size:9px;color:#666;margin-top:4px">Scan to verify order</div>
  </div>

  <div style="text-align:center;margin-top:10px;border-top:2px dashed #000;padding-top:8px;font-size:9px;color:#555">
    Thank you for shopping with us!<br>
    09240250346 | support@pharmacare.in
  </div>
  </body></html>`;
}

// ── Print Options Modal ───────────────────────────────────────────────────────
function PrintOptionsModal({ onSelect, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-[80] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h3 className="font-black text-gray-900">Select Print Format</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition">
            <X size={16} className="text-gray-500" />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <button
            onClick={() => onSelect("a4")}
            className="w-full flex items-start gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-pink-300 hover:bg-pink-50 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform" style={{ backgroundColor: "#EBF5FF" }}>
              <FileText size={22} style={{ color: PRIMARY }} />
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm">A4 Full Invoice</p>
              <p className="text-xs text-gray-500 mt-0.5">Complete tax invoice with all details, QR code, and GST breakdown. Best for records & email.</p>
            </div>
          </button>

          <button
            onClick={() => onSelect("thermal")}
            className="w-full flex items-start gap-4 p-4 rounded-2xl border-2 border-gray-100 hover:border-pink-300 hover:bg-pink-50 transition-all text-left group"
          >
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform" style={{ backgroundColor: "#EBF5FF" }}>
              <Receipt size={22} style={{ color: PRIMARY }} />
            </div>
            <div>
              <p className="font-black text-gray-900 text-sm">Thermal Receipt (80mm)</p>
              <p className="text-xs text-gray-500 mt-0.5">Compact receipt for thermal / POS printers. Includes QR code for scanner.</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function InvoiceBill({ order, onClose }) {
  const qrRef = useRef(null);
  const [showPrintOptions, setShowPrintOptions] = useState(false);

  if (!order) return null;

  const d = buildData(order);

  const getQrSvgString = () => {
    const el = qrRef.current?.querySelector("svg");
    return el ? el.outerHTML : "";
  };

  const handlePrint = (format) => {
    setShowPrintOptions(false);
    const qrSvgString = getQrSvgString();
    const html = format === "thermal"
      ? buildThermalHtml(order, d, qrSvgString)
      : buildA4Html(order, d, qrSvgString);

    const win = window.open("", "_blank", "width=900,height=700");
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xl relative my-4">

          {/* Action bar */}
          <div className="flex items-center justify-between px-6 pt-5 pb-2">
            <h2 className="font-black text-gray-900 text-lg">Tax Invoice</h2>
            <div className="flex items-center gap-2">
              {onClose && (
                <button
                  onClick={onClose}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 text-sm font-bold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ArrowLeft size={15} /> Back
                </button>
              )}
              <button
                onClick={() => setShowPrintOptions(true)}
                className="flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-xl transition-colors"
                style={{ backgroundColor: PRIMARY }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = PRIMARY_DARK)}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = PRIMARY)}
              >
                <Printer size={15} /> Print Options
              </button>
            </div>
          </div>

          {/* Printable preview */}
          <div className="px-6 pb-6">

            {/* Header */}
            <div className="rounded-2xl px-6 py-5 mb-5 text-white" style={{ background: `linear-gradient(135deg, ${PRIMARY} 0%, ${PRIMARY_DARK} 100%)` }}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-black">PharmaCare</p>
                  <p className="text-pink-200 text-xs mt-0.5">Your Trusted Online Pharmacy</p>
                  <p className="text-pink-200 text-xs mt-3">GSTIN: 27AAACP1234P1Z5</p>
                  <p className="text-pink-200 text-xs">support@pharmacare.in</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-pink-200 uppercase tracking-widest font-semibold">Tax Invoice</p>
                  <p className="font-black text-lg">#{d.shortId}</p>
                  <p className="text-xs text-pink-200 mt-1">{d.orderDate}</p>
                </div>
              </div>
            </div>

            {/* Bill To / Ship To */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Bill To</p>
                <p className="font-bold text-gray-900 text-sm">{order.user?.name || "Guest"}</p>
                {order.user?.phone && <p className="text-xs text-gray-500 mt-0.5">{order.user.phone}</p>}
                {order.user?.email && <p className="text-xs text-gray-500">{order.user.email}</p>}
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Ship To</p>
                {order.address ? (
                  <>
                    <p className="font-bold text-gray-900 text-sm">{order.address.fullName || order.user?.name}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{order.address.phone}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{d.address}</p>
                  </>
                ) : (
                  <p className="text-xs text-gray-400">—</p>
                )}
              </div>
            </div>

            {/* Items table */}
            <div className="rounded-2xl overflow-hidden border border-gray-100 mb-5">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ backgroundColor: PRIMARY }}>
                    <th className="text-left px-4 py-2.5 text-white text-xs font-black uppercase tracking-wider">Item</th>
                    <th className="text-center px-4 py-2.5 text-white text-xs font-black uppercase tracking-wider">Qty</th>
                    <th className="text-right px-4 py-2.5 text-white text-xs font-black uppercase tracking-wider">Rate</th>
                    <th className="text-right px-4 py-2.5 text-white text-xs font-black uppercase tracking-wider">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900 text-xs leading-tight">{item.name}</p>
                        {item.brand && <p className="text-[10px] text-gray-400">{item.brand}</p>}
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-600">{item.quantity}</td>
                      <td className="px-4 py-3 text-right text-xs text-gray-600">₹{item.price.toFixed(2)}</td>
                      <td className="px-4 py-3 text-right text-xs font-bold text-gray-900">₹{(item.price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals + QR */}
            <div className="flex gap-4 items-start">
              <div ref={qrRef} className="flex flex-col items-center gap-2 shrink-0">
                <div className="border-2 border-gray-100 rounded-2xl p-3">
                  <QRCodeSVG value={d.qrData} size={110} level="M" />
                </div>
                <p className="text-[10px] text-gray-400 font-semibold text-center">Scan to verify order</p>
              </div>
              <div className="flex-1 bg-gray-50 rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span className="font-semibold">₹{d.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm text-gray-600"><span>Shipping</span><span className={`font-semibold ${d.shippingFee === 0 ? "text-green-600" : ""}`}>{d.shippingFee === 0 ? "FREE" : `₹${d.shippingFee}`}</span></div>
                <div className="border-t border-dashed border-gray-300 pt-2 space-y-1.5">
                  <div className="flex justify-between text-xs text-gray-500"><span>Taxable Amount</span><span>₹{d.taxableAmount.toFixed(2)}</span></div>
                  <div className="flex justify-between text-xs text-gray-500"><span>CGST ({d.rateLabel}%)</span><span>₹{d.cgst.toFixed(2)}</span></div>
                  <div className="flex justify-between text-xs text-gray-500"><span>SGST ({d.rateLabel}%)</span><span>₹{d.sgst.toFixed(2)}</span></div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700"><span>Total GST</span><span>₹{d.gstTotal.toFixed(2)}</span></div>
                </div>
                <div className="flex justify-between font-black text-gray-900 text-base border-t border-gray-200 pt-2 mt-1"><span>Grand Total</span><span>₹{d.grandTotal.toLocaleString("en-IN")}</span></div>
              </div>
            </div>

            {/* Payment footer */}
            <div className="mt-4">
              <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-2 inline-block">
                <p className="text-xs text-gray-500">Payment Method</p>
                <p className="text-sm font-bold text-gray-800">{order.paymentMethod || "Cash on Delivery"}</p>
              </div>
            </div>

            <p className="text-center text-[10px] text-gray-400 mt-4">
              This is a computer-generated invoice. For queries: 09240250346 | support@pharmacare.in
            </p>
          </div>
        </div>
      </div>

      {/* Print Options Modal */}
      {showPrintOptions && (
        <PrintOptionsModal
          onSelect={handlePrint}
          onClose={() => setShowPrintOptions(false)}
        />
      )}
    </>
  );
}
