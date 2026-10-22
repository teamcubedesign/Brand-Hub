import type { ClientStatus } from "@/lib/types";

const STYLES: Record<ClientStatus, string> = {
  active: "bg-success/12 text-success",
  paused: "bg-warn/12 text-warn",
  archived: "bg-subtle text-muted",
};

export function StatusBadge({ status }: { status: ClientStatus }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STYLES[status]}`}>
      {status}
    </span>
  );
}
