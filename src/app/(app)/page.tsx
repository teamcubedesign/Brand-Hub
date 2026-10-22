import Link from "next/link";
import { Plus } from "lucide-react";
import { canEdit, getCurrentUser } from "@/lib/auth";
import { listClients } from "@/lib/data";
import { ClientGrid } from "./client-grid";

export default async function DashboardPage() {
  const [user, clients] = await Promise.all([getCurrentUser(), listClients()]);
  const firstName = user.full_name?.split(" ")[0];

  return (
    <>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Clients</h1>
          <p className="mt-1 text-sm text-muted">
            {firstName ? `Hi ${firstName}. ` : ""}Everything a designer needs to start on a brand, in one place.
          </p>
        </div>
        {canEdit(user) && (
          <Link href="/clients/new" className="btn-primary">
            <Plus className="size-4" /> New client
          </Link>
        )}
      </div>

      <ClientGrid clients={clients} canEdit={canEdit(user)} />
    </>
  );
}
