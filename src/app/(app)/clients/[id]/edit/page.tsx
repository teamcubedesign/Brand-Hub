import type { Metadata } from "next";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { updateClientProfile } from "@/app/actions";
import { ClientForm } from "@/components/client-form";
import { canEdit, getCurrentUser } from "@/lib/auth";
import { getClient } from "@/lib/data";
import { DangerZone } from "./danger-zone";

const getClientOr404 = cache(async (id: string) => {
  const client = await getClient(id);
  if (!client) notFound();
  return client;
});

export async function generateMetadata({ params }: PageProps<"/clients/[id]/edit">): Promise<Metadata> {
  const client = await getClientOr404((await params).id);
  return { title: `Edit ${client.name}` };
}

export default async function EditClientPage({ params }: PageProps<"/clients/[id]/edit">) {
  const { id } = await params;
  const user = await getCurrentUser();
  if (!canEdit(user)) redirect(`/clients/${id}`);
  const client = await getClientOr404(id);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold tracking-tight">Edit {client.name}</h1>
      <ClientForm
        action={updateClientProfile.bind(null, client.id)}
        client={client}
        cancelHref={`/clients/${client.id}`}
      />
      {user.role === "admin" && <DangerZone clientId={client.id} clientName={client.name} />}
    </div>
  );
}
