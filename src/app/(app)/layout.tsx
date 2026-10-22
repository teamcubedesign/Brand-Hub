import { Suspense } from "react";
import Link from "next/link";
import { NavLinks } from "@/components/nav-links";
import { ThemeToggle } from "@/components/theme-toggle";
import { ToastProvider, UrlToasts } from "@/components/toast";
import { UserMenu } from "@/components/user-menu";
import { getCurrentUser } from "@/lib/auth";
import { listProfiles } from "@/lib/data";

export default async function AppLayout({ children }: LayoutProps<"/">) {
  const [user, team] = await Promise.all([getCurrentUser(), listProfiles()]);

  return (
    <ToastProvider>
      <Suspense>
        <UrlToasts />
      </Suspense>
      <header className="sticky top-0 z-20 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:gap-5">
          <Link href="/" className="flex items-center gap-2.5 font-semibold tracking-tight">
            <span className="grid size-7 grid-cols-2 gap-px overflow-hidden rounded-md" aria-hidden>
              <span className="bg-[#E8A87C]" />
              <span className="bg-[#5B4BDB]" />
              <span className="bg-[#3A6B4C]" />
              <span className="bg-[#F6C90E]" />
            </span>
            <span className="hidden sm:inline">Brand Hub</span>
          </Link>
          <NavLinks />
          <div className="ml-auto flex items-center gap-1">
            <ThemeToggle />
            <UserMenu user={user} team={team} />
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:py-8">{children}</main>
    </ToastProvider>
  );
}
