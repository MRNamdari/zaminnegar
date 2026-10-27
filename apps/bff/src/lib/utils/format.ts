const persianNumber = new Intl.NumberFormat('fa-IR', { maximumFractionDigits: 2 });

/** Formats a number with Persian digits and separators, e.g. `۱٬۰۴۳٫۲۷`. */
export function formatNumber(value: number): string {
  return persianNumber.format(value);
}
