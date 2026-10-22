"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { useToast } from "./toast";

export function CopyButton({
  value,
  label = "Copy",
  toastMessage = "Copied to clipboard",
  className = "icon-btn",
  children,
}: {
  value: string;
  label?: string;
  toastMessage?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast(toastMessage);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast("Couldn't copy. Your browser blocked the clipboard.");
    }
  }

  return (
    <button type="button" onClick={copy} className={className} title={label} aria-label={label}>
      {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      {children}
    </button>
  );
}
