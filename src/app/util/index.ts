export function toPersianNumber(n: number | Intl.StringNumericLiteral): string {
  return new Intl.NumberFormat("fa-IR").format(n);
}

export function faNum(arg: number | string): string{
  if (typeof arg === 'number') return arg.toLocaleString('fa-IR',{useGrouping: false})
  if (typeof arg === 'string') return arg.replaceAll(/[0]|([1-9]+)/gm, (m) => faNum(Number(m)));
    else return String(arg)
}