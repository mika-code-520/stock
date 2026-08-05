import { getDeudaTodosLosProveedores } from "@/lib/services/debt";

export default async function DeudaPage() {
  const deudas = await getDeudaTodosLosProveedores();
  const totalDeuda = deudas.reduce((acc, d) => acc + d.deuda, 0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-900">Deuda por proveedor</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Lo que el local debe a cada proveedor por mercadería en consignación ya vendida
          (movimientos aprobados). Los proveedores marcados como stock propio no generan deuda.
        </p>
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
                  No hay proveedores en consignación cargados todavía.
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
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
