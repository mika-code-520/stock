import Link from "next/link";
import { getDeudaTodosLosVendedores } from "@/lib/services/debt";

export default async function VendedoresPage() {
  const deudas = await getDeudaTodosLosVendedores();
  const totalDeuda = deudas.reduce((acc, d) => acc + d.deuda, 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Vendedores</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Lo que cada vendedor te debe por lo vendido (movimientos aprobados, al precio de
          consignación). El vendedor se queda con la diferencia hasta el precio de venta real.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80 text-left text-xs uppercase tracking-wide text-neutral-500">
              <th className="px-5 py-3 font-medium">Vendedor</th>
              <th className="px-5 py-3 text-right font-medium">Te debe</th>
              <th className="px-5 py-3 text-right font-medium">Historial</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {deudas.map(({ vendedor, deuda }) => (
              <tr key={vendedor.id} className="transition-colors hover:bg-neutral-50">
                <td className="px-5 py-3 font-medium text-neutral-800">{vendedor.name}</td>
                <td
                  className={`px-5 py-3 text-right font-semibold tabular-nums ${
                    deuda > 0 ? "text-neutral-900" : "text-neutral-400"
                  }`}
                >
                  ${deuda.toLocaleString("es-AR")}
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={`/admin/vendedores/${vendedor.id}`}
                    className="text-sm font-medium text-neutral-500 hover:text-neutral-900"
                  >
                    Ver detalle
                  </Link>
                </td>
              </tr>
            ))}
            {deudas.length === 0 && (
              <tr>
                <td colSpan={3} className="px-5 py-10 text-center text-neutral-400">
                  No hay vendedores cargados todavía.
                </td>
              </tr>
            )}
          </tbody>
          {deudas.length > 0 && (
            <tfoot>
              <tr className="border-t border-neutral-200 bg-neutral-50/80">
                <td className="px-5 py-3 font-semibold text-neutral-900">Total</td>
                <td className="px-5 py-3 text-right font-semibold tabular-nums text-neutral-900">
                  ${totalDeuda.toLocaleString("es-AR")}
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
