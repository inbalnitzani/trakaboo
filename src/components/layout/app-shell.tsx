import { AppHeader } from "./app-header";
import { BottomNav } from "./bottom-nav";

/** Phone-width frame: header on top, scrolling content, floating tab bar at the bottom. */
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto flex min-h-dvh max-w-md flex-col">
      <AppHeader />
      <main className="flex-1 px-5 pb-36">{children}</main>
      <BottomNav />
    </div>
  );
}
