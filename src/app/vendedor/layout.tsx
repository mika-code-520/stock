import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { logoutAction } from "@/actions/auth.actions";

export default async function VendedorLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["ADMIN", "VENDEDOR"]);

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-neutral-200 bg-white px-6 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/vendedor" className="font-semibold text-neutral-900">
              Mostrador
            </Link>
            <Link href="/vendedor/venta" className="text-neutral-600 hover:text-neutral-900">
              Vender
            </Link>
            <Link
              href="/vendedor/pedido-reposicion"
              className="text-neutral-600 hover:text-neutral-900"
            >
              Pedir stock
            </Link>
            <Link
              href="/vendedor/mis-movimientos"
              className="text-neutral-600 hover:text-neutral-900"
            >
              Mis movimientos
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
      <main className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">{children}</main>
    </div>
  );
}
