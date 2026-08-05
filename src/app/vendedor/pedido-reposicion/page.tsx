import { prisma } from "@/lib/db";
import { registrarPedidoReposicionAction } from "@/actions/movements.actions";

export default async function PedidoReposicionPage() {
  const products = await prisma.product.findMany({
    where: { active: true },
    include: { supplier: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-semibold text-neutral-900">Pedir reposición de stock</h1>
      <p className="text-sm text-neutral-500">
        El pedido queda pendiente hasta que el administrador lo apruebe y confirme la entrega.
      </p>

      <form
        action={registrarPedidoReposicionAction}
        className="flex flex-col gap-4 rounded-lg border border-neutral-200 bg-white p-4"
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
                {p.name} · {p.size}/{p.color} · {p.supplier.name} · stock actual {p.stockCache}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="quantity" className="text-sm font-medium text-neutral-700">
            Cantidad pedida
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

        <button
          type="submit"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Enviar pedido
        </button>
      </form>
    </div>
  );
}
