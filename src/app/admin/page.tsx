import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDeudaTodosLosProveedores, getDeudaTodosLosVendedores } from "@/lib/services/debt";

export default async function AdminDashboard() {
  const [productCount, pendingCount, deudas, deudasVendedores] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.movement.count({ where: { status: "PENDIENTE" } }),
    getDeudaTodosLosProveedores(),
    getDeudaTodosLosVendedores(),
  ]);

  const totalDeuda = deudas.reduce((acc, d) => acc + d.deuda, 0);
  const totalDeudaVendedores = deudasVendedores.reduce((acc, d) => acc + d.deuda, 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-900">
          Panel de administración
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Resumen general de stock y liquidaciones a proveedores.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label="Productos activos"
          value={productCount}
          icon={<BoxIcon />}
        />
        <StatCard
          label="Movimientos pendientes"
          value={pendingCount}
          href="/admin/aprobaciones"
          highlight={pendingCount > 0}
          icon={<ClockIcon />}
        />
        <StatCard
          label="Deuda total estimada"
          value={`$${totalDeuda.toLocaleString("es-AR")}`}
          icon={<WalletIcon />}
        />
      </div>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900">Deuda por proveedor</h2>
          <span className="text-xs text-neutral-400">
            {deudas.length} proveedor{deudas.length === 1 ? "" : "es"}
          </span>
        </div>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/80 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-3 font-medium">Proveedor</th>
                <th className="px-5 py-3 text-right font-medium">Deuda pendiente</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {deudas.map(({ supplier, deuda }) => (
                <tr key={supplier.id} className="transition-colors hover:bg-neutral-50">
                  <td className="px-5 py-3 font-medium text-neutral-800">{supplier.name}</td>
                  <td
                    className={`px-5 py-3 text-right font-semibold tabular-nums ${
                      deuda > 0 ? "text-neutral-900" : "text-neutral-400"
                    }`}
                  >
                    ${deuda.toLocaleString("es-AR")}
                  </td>
                </tr>
              ))}
              {deudas.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-5 py-10 text-center text-neutral-400">
                    No hay proveedores cargados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-neutral-900">Deuda por vendedor</h2>
          <Link
            href="/admin/vendedores"
            className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
          >
            Ver todos →
          </Link>
        </div>
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/80 text-left text-xs uppercase tracking-wide text-neutral-500">
                <th className="px-5 py-3 font-medium">Vendedor</th>
                <th className="px-5 py-3 text-right font-medium">Te debe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {deudasVendedores.map(({ vendedor, deuda }) => (
                <tr key={vendedor.id} className="transition-colors hover:bg-neutral-50">
                  <td className="px-5 py-3 font-medium text-neutral-800">{vendedor.name}</td>
                  <td
                    className={`px-5 py-3 text-right font-semibold tabular-nums ${
                      deuda > 0 ? "text-neutral-900" : "text-neutral-400"
                    }`}
                  >
                    ${deuda.toLocaleString("es-AR")}
                  </td>
                </tr>
              ))}
              {deudasVendedores.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-5 py-10 text-center text-neutral-400">
                    No hay vendedores cargados todavía.
                  </td>
                </tr>
              )}
            </tbody>
            {deudasVendedores.length > 0 && (
              <tfoot>
                <tr className="border-t border-neutral-200 bg-neutral-50/80">
                  <td className="px-5 py-3 font-semibold text-neutral-900">Total</td>
                  <td className="px-5 py-3 text-right font-semibold tabular-nums text-neutral-900">
                    ${totalDeudaVendedores.toLocaleString("es-AR")}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
  highlight,
  icon,
}: {
  label: string;
  value: string | number;
  href?: string;
  highlight?: boolean;
  icon: React.ReactNode;
}) {
  const content = (
    <div
      className={`flex items-start gap-4 rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
        highlight
          ? "border-amber-200 bg-amber-50"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
          highlight ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-600"
        }`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm text-neutral-500">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold tracking-tight text-neutral-900">{value}</p>
      </div>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}

function BoxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m3.3 7 8.7 5 8.7-5M12 22V12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
      <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
