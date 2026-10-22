import Link from "next/link";

export default function ClientNotFound() {
  return (
    <div className="card mx-auto max-w-md px-6 py-16 text-center">
      <h1 className="text-lg font-semibold">Client not found</h1>
      <p className="mt-1 text-sm text-muted">It may have been deleted, or the link is wrong.</p>
      <Link href="/" className="btn-primary mt-6">
        Back to clients
      </Link>
    </div>
  );
}
