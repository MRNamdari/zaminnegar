import type { NamingStrategy } from "../core/config";
import type { AreaFeature, Level } from "../core/schemas";

const faNumber = (value: number) => value.toLocaleString("fa-IR");

export const defaultNaming: NamingStrategy = ({ label, index }) => `${label} ${faNumber(index)}`;

/** Names are derived from the canonical collection, not from a mutable counter, so they stay stable across reloads. */
export function suggestName(
  level: Level,
  label: string,
  features: readonly AreaFeature[],
  strategy: NamingStrategy = defaultNaming,
): string {
  const index = features.filter((f) => f.properties.level === level).length + 1;
  return strategy({ level, label, index });
}
