import { prisma } from "@/lib/db";
import { registrarVentaAction } from "@/actions/movements.actions";

export default async function VentaPage() {
  const products = await prisma.product.findMany({
    where: { active: true, stockCache: { gt: 0 } },
    include: { supplier: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Registrar venta</h1>
      <p className="text-sm text-neutral-500">
        La venta queda pendiente de aprobación del administrador antes de descontar stock.
      </p>

      <form
        action={registrarVentaAction}
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
                {p.name} · {p.size}/{p.color} · {p.supplier.name} · stock {p.stockCache} · sugerido{" "}
                {p.suggestedSalePrice ? `$${Number(p.suggestedSalePrice).toLocaleString("es-AR")}` : "-"}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
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
          <div className="flex flex-col gap-1">
            <label htmlFor="saleAmount" className="text-sm font-medium text-neutral-700">
              Precio real cobrado (total)
            </label>
            <input
              id="saleAmount"
              name="saleAmount"
              type="number"
              step="0.01"
              min={0}
              className="rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Registrar venta
        </button>
      </form>
    </div>
  );
}
