import { prisma } from "@/lib/db";
import { aprobarMovimientoAction, rechazarMovimientoAction } from "@/actions/movements.actions";
import { MOVEMENT_TYPE_LABEL } from "@/lib/movement-labels";
import { RechazarButton } from "./rechazar-button";

export default async function AprobacionesPage() {
  const pendientes = await prisma.movement.findMany({
    where: { status: "PENDIENTE" },
    include: { product: { include: { supplier: true } }, createdBy: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Pendientes de aprobación</h1>

      {pendientes.length === 0 && (
        <p className="rounded-lg border border-neutral-200 bg-white shadow-sm p-6 text-center text-neutral-400">
          No hay movimientos pendientes.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {pendientes.map((m) => (
          <div
            key={m.id}
            className="flex flex-col gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm font-medium text-neutral-900">
                {MOVEMENT_TYPE_LABEL[m.type] ?? m.type} · {m.product.name} {m.product.size}/{m.product.color}
              </p>
              <p className="text-sm text-neutral-600">
                Proveedor: {m.product.supplier.name} · Cantidad: {m.quantity}
                {m.saleAmount ? ` · Venta: $${Number(m.saleAmount).toLocaleString("es-AR")}` : ""}
                {m.type === "DEVOLUCION"
                  ? m.wasSold
                    ? " · Ya vendido (resta deuda al proveedor)"
                    : " · No vendido (solo reingresa stock)"
                  : ""}
              </p>
              {m.notes && <p className="text-xs text-neutral-500">Nota: {m.notes}</p>}
              <p className="text-xs text-neutral-500">
                Cargado por {m.createdBy.name} el {m.createdAt.toLocaleString("es-AR")}
              </p>
            </div>
            <div className="flex gap-2">
              <form
                action={async () => {
                  "use server";
                  await aprobarMovimientoAction(m.id);
                }}
              >
                <button
                  type="submit"
                  className="rounded bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Aprobar
                </button>
              </form>
              <form
                action={async (formData: FormData) => {
                  "use server";
                  const reason = String(formData.get("reason") ?? "").trim();
                  await rechazarMovimientoAction(m.id, reason || undefined);
                }}
              >
                <RechazarButton />
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
