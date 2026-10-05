import { use } from "react";

import { AuthPageLayout } from "@/features/auth/auth-page-layout";
import { type LinkStatus, LoginForm } from "@/features/auth/login-form";
import { initLocale } from "@/i18n/server";

const LINK_STATUSES: readonly LinkStatus[] = ["confirmed", "linkExpired"];

export default function LoginPage({ params, searchParams }: PageProps<"/[locale]/login">) {
  initLocale(use(params).locale);
  const status = use(searchParams).status;
  const linkStatus = LINK_STATUSES.find((s) => s === status);

  return (
    <AuthPageLayout>
      <LoginForm linkStatus={linkStatus} />
    </AuthPageLayout>
  );
}
