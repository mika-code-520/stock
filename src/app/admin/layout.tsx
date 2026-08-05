import Link from "next/link";
import { requireRole } from "@/lib/require-role";
import { logoutAction } from "@/actions/auth.actions";

const NAV = [
  { href: "/admin", label: "Panel" },
  { href: "/admin/proveedores", label: "Proveedores" },
  { href: "/admin/productos", label: "Productos" },
  { href: "/admin/categorias", label: "Categorías" },
  { href: "/admin/deuda", label: "Deuda" },
  { href: "/admin/vendedores", label: "Vendedores" },
  { href: "/admin/aprobaciones", label: "Aprobaciones" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole(["ADMIN"]);

  return (
    <div className="flex min-h-screen flex-col bg-neutral-50">
      <header className="sticky top-0 z-10 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-md bg-neutral-900 text-xs font-bold text-white">
                S
              </span>
              <span className="text-sm font-semibold tracking-tight text-neutral-900">
                Stock
              </span>
            </Link>
            <nav className="flex items-center gap-1 text-sm">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-3 py-1.5 text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-600">
              {user.name}
            </span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-neutral-400 transition-colors hover:text-neutral-900"
              >
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
