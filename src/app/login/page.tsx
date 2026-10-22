import type { Metadata } from "next";
import { signIn } from "@/app/auth-actions";
import { SubmitButton } from "@/components/submit-button";
import { safeNextPath } from "@/lib/safe-next";

export const metadata: Metadata = { title: "Sign in" };

const ALLOWED_DOMAIN = "cubehq.ai";

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = safeNextPath(typeof params.next === "string" ? params.next : null);

  return (
    <main className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-16">
      <BackgroundSwatches />
      <div className="relative w-full max-w-sm rounded-2xl border border-line bg-surface p-8 shadow-xl shadow-black/5">
        <div className="mb-8 flex items-center gap-2.5">
          <Logo />
          <span className="text-lg font-semibold tracking-tight">Brand Hub</span>
        </div>
        <h1 className="text-xl font-semibold tracking-tight">Sign in to continue</h1>
        <p className="mt-1.5 text-sm text-muted">
          Brand kits, Drive links and client resources for the design team, all in one place.
        </p>

        <form action={signIn} className="mt-7">
          <input type="hidden" name="next" value={next} />
          <SubmitButton
            pendingLabel="Signing in…"
            className="flex w-full items-center justify-center gap-3 rounded-lg border border-line bg-surface px-4 py-2.5 text-sm font-medium transition-colors hover:bg-subtle disabled:opacity-60"
          >
            <GoogleIcon />
            Continue with Google
          </SubmitButton>
        </form>
        <p className="mt-4 text-center text-xs text-muted">Use your @{ALLOWED_DOMAIN} Google account.</p>
      </div>
    </main>
  );
}

function Logo() {
  return (
    <span className="grid size-9 grid-cols-2 gap-0.5 overflow-hidden rounded-lg" aria-hidden>
      <span className="bg-[#E8A87C]" />
      <span className="bg-[#5B4BDB]" />
      <span className="bg-[#3A6B4C]" />
      <span className="bg-[#F6C90E]" />
    </span>
  );
}

function BackgroundSwatches() {
  const colors = ["#E8A87C", "#5B4BDB", "#3A6B4C", "#F6C90E", "#2F4858", "#D96C8A"];
  return (
    <div className="pointer-events-none absolute inset-0 flex items-end justify-center gap-3 opacity-[0.08] blur-2xl" aria-hidden>
      {colors.map((c, i) => (
        <span key={c} className="w-24 rounded-t-full" style={{ background: c, height: `${40 + ((i * 17) % 45)}%` }} />
      ))}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="size-5" aria-hidden>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
