import type { CategoryId } from "./categories";

/**
 * Merchant-name rules applied to imported transactions, first match wins.
 * Bit / PayBox are person-to-person transfers, counted as spending (see DESIGN.md → Rules).
 */
export const MERCHANT_RULES: readonly { pattern: RegExp; categoryId: CategoryId }[] = [
  { pattern: /\b(bit|paybox|pay box)\b|ביט|פייבוקס|פיי בוקס/i, categoryId: "transfers" },
];
