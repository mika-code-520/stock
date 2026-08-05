"use client";

import { useState } from "react";
import { updateProductAction, deactivateProductAction } from "@/actions/products.actions";

type Category = { id: string; name: string };
type Supplier = { id: string; name: string };
type Product = {
  id: string;
  name: string;
  size: string | null;
  color: string | null;
  categoryId: string;
  supplierId: string;
  stockCache: number;
  consignmentPrice: number;
  suggestedSalePrice: number | null;
  supplier: Supplier;
  category: Category;
};

export function ProductRow({
  product,
  categories,
  suppliers,
}: {
  product: Product;
  categories: Category[];
  suppliers: Supplier[];
}) {
  const [editing, setEditing] = useState(false);

  if (!editing) {
    return (
      <tr className="border-t border-neutral-100">
        <td className="px-4 py-2 text-neutral-800">
          {product.name}
          {product.size ? ` · ${product.size}` : ""}
          {product.color ? ` · ${product.color}` : ""}
        </td>
        <td className="px-4 py-2 text-neutral-600">{product.supplier.name}</td>
        <td className="px-4 py-2 text-neutral-600">{product.category.name}</td>
        <td className="px-4 py-2 text-right text-neutral-800">{product.stockCache}</td>
        <td className="px-4 py-2 text-right text-neutral-600">
          ${Number(product.consignmentPrice).toLocaleString("es-AR")}
        </td>
        <td className="px-4 py-2 text-right text-neutral-600">
          {product.suggestedSalePrice
            ? `$${Number(product.suggestedSalePrice).toLocaleString("es-AR")}`
            : "-"}
        </td>
        <td className="px-4 py-2 text-right">
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="text-xs font-medium text-neutral-500 hover:text-neutral-900"
            >
              Editar
            </button>
            <form
              action={deactivateProductAction}
              onSubmit={(e) => {
                if (!confirm(`¿Dar de baja "${product.name}"? Dejará de listarse pero se conserva su historial.`)) {
                  e.preventDefault();
                }
              }}
            >
              <input type="hidden" name="id" value={product.id} />
              <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-700">
                Baja
              </button>
            </form>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-neutral-100 bg-neutral-50">
      <td colSpan={7} className="px-4 py-3">
        <form
          action={async (formData) => {
            await updateProductAction(formData);
            setEditing(false);
          }}
          className="grid grid-cols-1 gap-3 sm:grid-cols-3"
        >
          <input type="hidden" name="id" value={product.id} />
          <EditField label="Nombre" name="name" defaultValue={product.name} required />
          <EditField label="Talle" name="size" defaultValue={product.size ?? ""} />
          <EditField label="Color" name="color" defaultValue={product.color ?? ""} />

          <EditSelect label="Categoría" name="categoryId" defaultValue={product.categoryId}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </EditSelect>

          <EditSelect label="Proveedor" name="supplierId" defaultValue={product.supplierId}>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </EditSelect>

          <EditField
            label="Precio consignación"
            name="consignmentPrice"
            type="number"
            step="0.01"
            defaultValue={String(product.consignmentPrice)}
            required
          />
          <EditField
            label="Precio sugerido de venta"
            name="suggestedSalePrice"
            type="number"
            step="0.01"
            defaultValue={product.suggestedSalePrice ? String(product.suggestedSalePrice) : ""}
          />

          <div className="flex items-end gap-2 sm:col-span-3">
            <button
              type="submit"
              className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Cancelar
            </button>
          </div>
        </form>
      </td>
    </tr>
  );
}

function EditField({
  label,
  name,
  type = "text",
  step,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={`edit-${name}-${defaultValue}`} className="text-sm font-medium text-neutral-700">
        {label}
      </label>
      <input
        id={`edit-${name}-${defaultValue}`}
        name={name}
        type={type}
        step={step}
        required={required}
        defaultValue={defaultValue}
        className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
      />
    </div>
  );
}

function EditSelect({
  label,
  name,
  defaultValue,
  children,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      <select
        name={name}
        defaultValue={defaultValue}
        required
        className="rounded border border-neutral-300 bg-white px-3 py-2 text-sm focus:border-neutral-500 focus:outline-none"
      >
        {children}
      </select>
    </div>
  );
}
