import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDeudaTodosLosProveedores } from "@/lib/services/debt";

export default async function AdminDashboard() {
  const [productCount, pendingCount, deudas] = await Promise.all([
    prisma.product.count({ where: { active: true } }),
    prisma.movement.count({ where: { status: "PENDIENTE" } }),
    getDeudaTodosLosProveedores(),
  ]);

  const totalDeuda = deudas.reduce((acc, d) => acc + d.deuda, 0);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Panel de administración</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Productos activos" value={productCount} />
        <StatCard
          label="Movimientos pendientes"
          value={pendingCount}
          href="/admin/aprobaciones"
          highlight={pendingCount > 0}
        />
        <StatCard label="Deuda total estimada" value={`$${totalDeuda.toLocaleString("es-AR")}`} />
      </div>

      <section>
        <h2 className="mb-3 text-lg font-medium text-neutral-900">Deuda por proveedor</h2>
        <div className="overflow-hidden rounded-lg border border-neutral-200">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Proveedor</th>
                <th className="px-4 py-2 font-medium text-right">Deuda pendiente</th>
              </tr>
            </thead>
            <tbody>
              {deudas.map(({ supplier, deuda }) => (
                <tr key={supplier.id} className="border-t border-neutral-100">
                  <td className="px-4 py-2 text-neutral-800">{supplier.name}</td>
                  <td className="px-4 py-2 text-right text-neutral-800">
                    ${deuda.toLocaleString("es-AR")}
                  </td>
                </tr>
              ))}
              {deudas.length === 0 && (
                <tr>
                  <td colSpan={2} className="px-4 py-6 text-center text-neutral-400">
                    No hay proveedores cargados todavía.
                  </td>
                </tr>
              )}
            </tbody>
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
}: {
  label: string;
  value: string | number;
  href?: string;
  highlight?: boolean;
}) {
  const content = (
    <div
      className={`rounded-lg border p-4 ${
        highlight ? "border-amber-300 bg-amber-50" : "border-neutral-200 bg-white"
      }`}
    >
      <p className="text-sm text-neutral-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-neutral-900">{value}</p>
    </div>
  );
  return href ? <Link href={href}>{content}</Link> : content;
}
