import type { HexColor } from "terra-draw";

/** Resolves `var(--token)` against the document, otherwise returns the value. TerraDraw needs hex colours. */
export function resolveColor(value: string, readVar: (name: string) => string = readCssVar): HexColor {
  const match = /^var\((--[\w-]+)\)$/.exec(value.trim());
  const resolved = match?.[1] ? readVar(match[1]).trim() : value;
  return resolved as HexColor;
}

function readCssVar(name: string): string {
  if (typeof document === "undefined") return "";
  return getComputedStyle(document.documentElement).getPropertyValue(name);
}
