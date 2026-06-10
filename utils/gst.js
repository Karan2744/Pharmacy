/**
 * GST rules:
 *   1 unique product  → 12% total (6% CGST + 6% SGST)
 *   2+ unique products → 18% total (9% CGST + 9% SGST)
 */
export function calcGst(subtotal, uniqueProductCount) {
  const halfRate = uniqueProductCount > 1 ? 0.09 : 0.06;
  const cgst     = parseFloat((subtotal * halfRate).toFixed(2));
  const sgst     = parseFloat((subtotal * halfRate).toFixed(2));
  const gstTotal = parseFloat((cgst + sgst).toFixed(2));
  const rateLabel = halfRate * 100; // 6 or 9
  return { cgst, sgst, gstTotal, rateLabel };
}
