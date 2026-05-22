"use client";

import type { ContentNode } from "@spcx/content";

import { dualText, type DualText } from "../lib/localized";
import { uiString, type UiStringId } from "../lib/uiStrings";
import { useUIStore, type Locale } from "../stores/uiStore";

export const useLocale = (): Locale => useUIStore((state) => state.locale);

export const useDualText = (node: ContentNode): DualText => {
  const locale = useLocale();
  return dualText(node, locale);
};

export const useUiString = (id: UiStringId): string => {
  const locale = useLocale();
  return uiString(id, locale);
};
