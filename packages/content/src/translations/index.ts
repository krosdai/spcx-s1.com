import { zhTranslations } from "./zh";

export { zhTranslations };

// Returns the Chinese translation for a node id, or undefined when the
// registry has no entry. Empty strings count as "no translation" so a
// blank entry behaves the same as an omitted key — this keeps the
// rule 12 error surface consistent.
export const getZh = (id: string): string | undefined => {
  const value = zhTranslations[id];
  if (typeof value !== "string") return undefined;
  return value.trim().length > 0 ? value : undefined;
};

export const missingZhIds = (ids: readonly string[]): string[] =>
  ids.filter((id) => getZh(id) === undefined);
