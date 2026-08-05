import { prisma } from "@/lib/db";
import { createSupplierAction } from "@/actions/suppliers.actions";

export default async function ProveedoresPage() {
  const suppliers = await prisma.supplier.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Proveedores</h1>

      <form
        action={createSupplierAction}
        className="flex flex-col gap-3 rounded-lg border border-neutral-200 bg-white shadow-sm p-4 sm:flex-row sm:items-end"
      >
        <Field label="Nombre" name="name" required />
        <Field label="Teléfono" name="contactPhone" />
        <Field label="Email" name="contactEmail" type="email" />
        <button
          type="submit"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Agregar
        </button>
      </form>

      <div className="overflow-hidden rounded-lg border border-neutral-200">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Nombre</th>
              <th className="px-4 py-2 font-medium">Teléfono</th>
              <th className="px-4 py-2 font-medium">Email</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="border-t border-neutral-100">
                <td className="px-4 py-2 text-neutral-800">{s.name}</td>
                <td className="px-4 py-2 text-neutral-600">{s.contactPhone ?? "-"}</td>
                <td className="px-4 py-2 text-neutral-600">{s.contactEmail ?? "-"}</td>
              </tr>
            ))}
            {suppliers.length === 0 && (
              <tr>
                <td colSpan={3} className="px-4 py-6 text-center text-neutral-400">
                  Todavía no hay proveedores.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-1 flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
      />
    </div>
  );
}
