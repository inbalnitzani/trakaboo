import { use } from "react";

import { AuthPageLayout } from "@/features/auth/auth-page-layout";
import { NewPasswordForm } from "@/features/auth/new-password-form";
import { initLocale } from "@/i18n/server";

/** Reached from the reset-password email (the user is signed in by then; see proxy). */
export default function NewPasswordPage({ params }: PageProps<"/[locale]/new-password">) {
  initLocale(use(params).locale);

  return (
    <AuthPageLayout>
      <NewPasswordForm />
    </AuthPageLayout>
  );
}
