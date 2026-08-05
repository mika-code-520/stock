import { prisma } from "@/lib/db";
import { registrarDevolucionAction } from "@/actions/movements.actions";

export default async function DevolucionPage() {
  const products = await prisma.product.findMany({
    where: { active: true, returnable: true },
    include: { supplier: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Registrar devolución</h1>
      <p className="text-sm text-neutral-500">
        La devolución queda pendiente de aprobación del administrador. Solo se listan productos
        que el proveedor marcó como devolvibles.
      </p>

      <form
        action={registrarDevolucionAction}
        className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white shadow-sm p-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="productId" className="text-sm font-medium text-neutral-700">
            Producto
          </label>
          <select
            id="productId"
            name="productId"
            required
            className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          >
            <option value="">Seleccionar...</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.size}/{p.color} · {p.supplier.name} · precio consig.{" "}
                ${Number(p.consignmentPrice).toLocaleString("es-AR")}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="quantity" className="text-sm font-medium text-neutral-700">
            Cantidad
          </label>
          <input
            id="quantity"
            name="quantity"
            type="number"
            min={1}
            defaultValue={1}
            required
            className="rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>

        <div className="flex items-start gap-2 rounded border border-neutral-200 bg-neutral-50 p-3">
          <input
            id="wasSold"
            name="wasSold"
            type="checkbox"
            className="mt-0.5 h-4 w-4 rounded border-neutral-300"
          />
          <label htmlFor="wasSold" className="text-sm text-neutral-700">
            Ya estaba vendido (el cliente lo devolvió). Esto reduce la deuda con el proveedor y
            genera crédito de stock invertido. Si no estaba vendido, dejá esto sin marcar — solo
            vuelve a sumar stock, sin efecto en la deuda.
          </label>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="notes" className="text-sm font-medium text-neutral-700">
            Notas (opcional)
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            className="rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
          />
        </div>

        <button
          type="submit"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Registrar devolución
        </button>
      </form>
    </div>
  );
}
