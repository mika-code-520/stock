import { prisma } from "@/lib/db";
import { requireSession } from "@/lib/require-role";

const TYPE_LABEL: Record<string, string> = {
  VENTA: "Venta",
  DEVOLUCION: "Devolución",
  CAMBIO_ENTRADA: "Cambio (entra)",
  CAMBIO_SALIDA: "Cambio (sale)",
  PEDIDO_REPOSICION: "Pedido de reposición",
  REPOSICION: "Reposición",
};

const STATUS_STYLE: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  APROBADO: "bg-emerald-100 text-emerald-800",
  RECHAZADO: "bg-red-100 text-red-800",
};

export default async function MisMovimientosPage() {
  const user = await requireSession();

  const movimientos = await prisma.movement.findMany({
    where: { createdById: user.id },
    include: { product: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Mis movimientos</h1>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Fecha</th>
              <th className="px-4 py-2 font-medium">Tipo</th>
              <th className="px-4 py-2 font-medium">Producto</th>
              <th className="px-4 py-2 font-medium text-right">Cantidad</th>
              <th className="px-4 py-2 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m) => (
              <tr key={m.id} className="border-t border-neutral-100">
                <td className="px-4 py-2 text-neutral-600">
                  {m.createdAt.toLocaleDateString("es-AR")}
                </td>
                <td className="px-4 py-2 text-neutral-800">{TYPE_LABEL[m.type] ?? m.type}</td>
                <td className="px-4 py-2 text-neutral-600">
                  {m.product.name} {m.product.size}/{m.product.color}
                </td>
                <td className="px-4 py-2 text-right text-neutral-800">{m.quantity}</td>
                <td className="px-4 py-2">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-medium ${STATUS_STYLE[m.status]}`}
                  >
                    {m.status}
                  </span>
                </td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
                  Todavía no registraste movimientos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
