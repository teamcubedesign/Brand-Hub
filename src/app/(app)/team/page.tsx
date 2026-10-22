import type { Metadata } from "next";
import { Avatar } from "@/components/avatar";
import { getCurrentUser } from "@/lib/auth";
import { listProfiles } from "@/lib/data";
import { RoleSelect } from "./role-select";

export const metadata: Metadata = { title: "Team" };

const ROLE_HELP = [
  ["Admin", "Everything, plus managing roles and deleting clients."],
  ["Editor", "Add and edit clients, links, colours, fonts and notes."],
  ["Viewer", "Read-only access to every client."],
];

export default async function TeamPage() {
  const [user, members] = await Promise.all([getCurrentUser(), listProfiles()]);
  const isAdmin = user.role === "admin";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="mt-1 text-sm text-muted">
          People join as viewers the first time they sign in with a company Google account.
          {isAdmin ? " Make designers editors here so they can add links." : " Ask an admin to change roles."}
        </p>
      </div>

      <ul className="card divide-y divide-line overflow-hidden">
        {members.map((m) => (
          <li key={m.id} className="flex items-center gap-3 px-4 py-3">
            <Avatar profile={m} className="size-9 text-sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {m.full_name ?? m.email}
                {m.id === user.id && <span className="font-normal text-muted"> (you)</span>}
              </p>
              <p className="truncate text-xs text-muted">{m.email}</p>
            </div>
            {isAdmin && m.id !== user.id ? (
              <RoleSelect userId={m.id} role={m.role} name={m.full_name ?? m.email} />
            ) : (
              <span className="rounded-full bg-subtle px-2.5 py-1 text-xs text-muted capitalize">{m.role}</span>
            )}
          </li>
        ))}
      </ul>

      <dl className="grid gap-3 text-sm sm:grid-cols-3">
        {ROLE_HELP.map(([role, help]) => (
          <div key={role} className="rounded-xl border border-line p-4">
            <dt className="font-medium">{role}</dt>
            <dd className="mt-1 text-muted">{help}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
