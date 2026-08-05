import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { getDeudaPorVendedor } from "@/lib/services/debt";
import {
  MOVEMENT_TYPE_LABEL,
  MOVEMENT_STATUS_STYLE,
  MOVEMENT_STATUS_LABEL,
  PAYMENT_STATUS_STYLE,
  PAYMENT_STATUS_LABEL,
} from "@/lib/movement-labels";
import { marcarPagoProveedorAction } from "@/actions/movements.actions";

export default async function VendedorDetallePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const vendedor = await prisma.user.findUnique({ where: { id } });
  if (!vendedor || vendedor.role !== "VENDEDOR") {
    notFound();
  }

  const [deuda, movimientos] = await Promise.all([
    getDeudaPorVendedor(id),
    prisma.movement.findMany({
      where: { createdById: id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 200,
    }),
  ]);

  const pendientes = movimientos.filter((m) => m.status === "PENDIENTE");

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Link href="/admin/vendedores" className="text-sm text-neutral-500 hover:text-neutral-900">
          ← Vendedores
        </Link>
        <h1 className="mt-1 text-2xl font-semibold text-neutral-900">{vendedor.name}</h1>
        <p className="text-sm text-neutral-500">{vendedor.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-neutral-500">Te debe (ventas aprobadas)</p>
          <p className="mt-0.5 text-2xl font-semibold tracking-tight text-neutral-900">
            ${deuda.toLocaleString("es-AR")}
          </p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <p className="text-sm text-amber-700">Movimientos pendientes de aprobación</p>
          <p className="mt-0.5 text-2xl font-semibold tracking-tight text-neutral-900">
            {pendientes.length}
          </p>
        </div>
      </div>

      <section>
        <h2 className="mb-3 text-base font-semibold text-neutral-900">Historial de movimientos</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 text-left text-neutral-500">
              <tr>
                <th className="px-4 py-2 font-medium">Fecha</th>
                <th className="px-4 py-2 font-medium">Tipo</th>
                <th className="px-4 py-2 font-medium">Producto</th>
                <th className="px-4 py-2 font-medium text-right">Cantidad</th>
                <th className="px-4 py-2 font-medium text-right">Monto consig.</th>
                <th className="px-4 py-2 font-medium">Estado</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {movimientos.map((m) => (
                <tr key={m.id} className="border-t border-neutral-100">
                  <td className="px-4 py-2 text-neutral-600">
                    {m.createdAt.toLocaleDateString("es-AR")}
                  </td>
                  <td className="px-4 py-2 text-neutral-800">
                    {MOVEMENT_TYPE_LABEL[m.type] ?? m.type}
                  </td>
                  <td className="px-4 py-2 text-neutral-600">
                    {m.product.name}
                    {m.product.size ? ` · ${m.product.size}` : ""}
                    {m.product.color ? ` · ${m.product.color}` : ""}
                  </td>
                  <td className="px-4 py-2 text-right text-neutral-800">{m.quantity}</td>
                  <td className="px-4 py-2 text-right text-neutral-600">
                    {m.consignmentAmount
                      ? `$${Number(m.consignmentAmount).toLocaleString("es-AR")}`
                      : "-"}
                  </td>
                  <td className="px-4 py-2">
                    {m.status === "APROBADO" && m.paymentStatus !== "NO_APLICA" ? (
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${PAYMENT_STATUS_STYLE[m.paymentStatus]}`}
                      >
                        {PAYMENT_STATUS_LABEL[m.paymentStatus]}
                      </span>
                    ) : (
                      <span
                        className={`rounded px-2 py-0.5 text-xs font-medium ${MOVEMENT_STATUS_STYLE[m.status]}`}
                      >
                        {MOVEMENT_STATUS_LABEL[m.status] ?? m.status}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    {m.status === "APROBADO" && m.paymentStatus === "PENDIENTE_PAGO" && (
                      <form
                        action={async () => {
                          "use server";
                          await marcarPagoProveedorAction(m.id);
                        }}
                      >
                        <button
                          type="submit"
                          className="rounded border border-emerald-300 bg-white px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50"
                        >
                          Marcar pagado
                        </button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {movimientos.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-neutral-400">
                    Este vendedor todavía no registró movimientos.
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
