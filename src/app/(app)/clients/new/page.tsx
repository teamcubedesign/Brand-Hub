import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClientProfile } from "@/app/actions";
import { ClientForm } from "@/components/client-form";
import { canEdit, getCurrentUser } from "@/lib/auth";

export const metadata: Metadata = { title: "New client" };

export default async function NewClientPage() {
  const user = await getCurrentUser();
  if (!canEdit(user)) redirect("/");

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-semibold">New client</h1>
      <ClientForm action={createClientProfile} cancelHref="/" />
    </div>
  );
}
