import { type CategoryId, FALLBACK_CATEGORY_ID } from "@/config/categories";
import { MERCHANT_RULES } from "@/config/merchant-rules";

/** Category for an imported merchant name, from `MERCHANT_RULES`; "other" if none match. */
export function categorizeMerchant(merchant: string): CategoryId {
  return (
    MERCHANT_RULES.find((rule) => rule.pattern.test(merchant))?.categoryId ?? FALLBACK_CATEGORY_ID
  );
}
