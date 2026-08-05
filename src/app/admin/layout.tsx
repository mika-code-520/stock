import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { logoutAction } from "@/actions/auth.actions";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["ADMIN"]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/admin" className="font-semibold text-neutral-900">
              Admin
            </Link>
            <Link href="/admin/proveedores" className="text-neutral-600 hover:text-neutral-900">
              Proveedores
            </Link>
            <Link href="/admin/productos" className="text-neutral-600 hover:text-neutral-900">
              Productos
            </Link>
            <Link href="/admin/aprobaciones" className="text-neutral-600 hover:text-neutral-900">
              Aprobaciones
            </Link>
          </nav>
          <div className="flex items-center gap-3 text-sm text-neutral-500">
            <span>{user.name}</span>
            <form action={logoutAction}>
              <button type="submit" className="text-neutral-500 underline hover:text-neutral-800">
                Salir
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
