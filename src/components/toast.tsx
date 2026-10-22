"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

type Toast = { id: number; message: string };

const ToastContext = createContext<(message: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(0);

  const show = useCallback((message: string) => {
    const id = ++nextId.current;
    // Keep at most three on screen; a burst of copies shouldn't stack up.
    setToasts((t) => [...t.slice(-2), { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2200);
  }, []);

  return (
    <ToastContext value={show}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex animate-[toast-in_160ms_ease-out] items-center gap-2 rounded-full bg-fg px-4 py-2 text-sm font-medium text-bg shadow-lg"
          >
            <CheckCircle2 className="size-4 text-success" />
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext>
  );
}

const PARAM_MESSAGES: Record<string, string> = {
  created: "Client created",
  saved: "Changes saved",
  deleted: "Client deleted",
};

/** Shows a toast for ?created=1 style flags left by a redirect, then removes the flag. */
export function UrlToasts() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  useEffect(() => {
    const key = Object.keys(PARAM_MESSAGES).find((k) => params.has(k));
    if (!key) return;
    toast(PARAM_MESSAGES[key]);
    const rest = new URLSearchParams(params);
    rest.delete(key);
    router.replace(rest.size ? `${pathname}?${rest}` : pathname, { scroll: false });
  }, [params, pathname, router, toast]);

  return null;
}
