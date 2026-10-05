import { AppShell } from "@/components/layout/app-shell";

/** Signed-in app screens: header + bottom tab bar. */
export default function AppLayout({ children }: LayoutProps<"/[locale]">) {
  return <AppShell>{children}</AppShell>;
}
