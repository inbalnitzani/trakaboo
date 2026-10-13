import { revalidatePath } from "next/cache";

import { ingestApplePay } from "@/data/apple-pay-ingest";
import { handleApplePayIngest } from "@/features/apple-pay/handle-ingest";

export async function POST(request: Request) {
  const response = await handleApplePayIngest(request, {
    ingest: ingestApplePay,
    now: () => new Date(),
  });
  if (response.status === 201) revalidatePath("/[locale]", "layout");
  return response;
}
