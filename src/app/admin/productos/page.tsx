import { prisma } from "@/lib/db";
import { createProductAction } from "@/actions/products.actions";
import { ProductRow } from "./product-row";

export default async function ProductosPage() {
  const [products, suppliers, categories] = await Promise.all([
    prisma.product.findMany({
      where: { active: true },
      include: { supplier: true, category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.supplier.findMany({ where: { active: true }, orderBy: { name: "asc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="text-2xl font-semibold text-neutral-900">Productos</h1>

      <form
        action={createProductAction}
        className="grid grid-cols-1 gap-3 rounded-lg border border-neutral-200 bg-white shadow-sm p-4 sm:grid-cols-3"
      >
        <Field label="Nombre" name="name" required />
        <Field label="Talle" name="size" />
        <Field label="Color" name="color" />

        <SelectField label="Categoría" name="categoryId" required>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </SelectField>

        <SelectField label="Proveedor" name="supplierId" required>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </SelectField>

        <Field label="Precio consignación" name="consignmentPrice" type="number" step="0.01" required />
        <Field label="Precio sugerido de venta" name="suggestedSalePrice" type="number" step="0.01" />
        <Field label="Stock inicial" name="initialStock" type="number" defaultValue="0" />

        <div className="flex items-center gap-2 sm:col-span-3">
          <input
            id="returnable"
            name="returnable"
            type="checkbox"
            defaultChecked
            className="h-4 w-4 rounded border-neutral-300"
          />
          <label htmlFor="returnable" className="text-sm font-medium text-neutral-700">
            El vendedor puede devolver este producto
          </label>
        </div>

        <div className="sm:col-span-3">
          <button
            type="submit"
            className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
          >
            Crear producto
          </button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-left text-neutral-500">
            <tr>
              <th className="px-4 py-2 font-medium">Producto</th>
              <th className="px-4 py-2 font-medium">Proveedor</th>
              <th className="px-4 py-2 font-medium">Categoría</th>
              <th className="px-4 py-2 font-medium text-right">Stock</th>
              <th className="px-4 py-2 font-medium text-right">Precio consig.</th>
              <th className="px-4 py-2 font-medium text-right">Precio sugerido</th>
              <th className="px-4 py-2 font-medium text-center">Devolvible</th>
              <th className="px-4 py-2 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <ProductRow
                key={p.id}
                product={{
                  ...p,
                  consignmentPrice: Number(p.consignmentPrice),
                  suggestedSalePrice: p.suggestedSalePrice ? Number(p.suggestedSalePrice) : null,
                }}
                categories={categories}
                suppliers={suppliers}
              />
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-neutral-400">
                  Todavía no hay productos.
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
  step,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  step?: string;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        className="rounded border border-neutral-300 px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
      />
    </div>
  );
}

function SelectField({
  label,
  name,
  required,
  children,
}: {
  label: string;
  name: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      <select
        id={name}
        name={name}
        required={required}
        className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
      >
        <option value="">Seleccionar...</option>
        {children}
      </select>
    </div>
  );
}
