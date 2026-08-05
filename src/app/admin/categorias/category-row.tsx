"use client";

import { useState } from "react";
import { renameCategoryAction, deleteCategoryAction } from "@/actions/categories.actions";

export function CategoryRow({
  category,
  productCount,
}: {
  category: { id: string; name: string };
  productCount: number;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <tr className="border-t border-neutral-100 bg-neutral-50">
        <td className="px-4 py-2" colSpan={3}>
          <form
            action={async (formData) => {
              await renameCategoryAction(formData);
              setEditing(false);
            }}
            className="flex items-center gap-2"
          >
            <input type="hidden" name="id" value={category.id} />
            <input
              name="name"
              defaultValue={category.name}
              required
              className="rounded border border-neutral-300 px-3 py-1.5 text-sm focus:border-neutral-500 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-neutral-800"
            >
              Guardar
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="rounded border border-neutral-300 px-3 py-1.5 text-xs font-medium text-neutral-600 hover:bg-neutral-100"
            >
              Cancelar
            </button>
          </form>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-t border-neutral-100">
      <td className="px-4 py-2 text-neutral-800">{category.name}</td>
      <td className="px-4 py-2 text-right text-neutral-500">{productCount}</td>
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
            action={deleteCategoryAction}
            onSubmit={(e) => {
              if (productCount > 0) {
                e.preventDefault();
                alert("No se puede eliminar: hay productos usando esta categoría.");
                return;
              }
              if (!confirm(`¿Eliminar la categoría "${category.name}"?`)) {
                e.preventDefault();
              }
            }}
          >
            <input type="hidden" name="id" value={category.id} />
            <button type="submit" className="text-xs font-medium text-red-500 hover:text-red-700">
              Eliminar
            </button>
          </form>
        </div>
      </td>
    </tr>
  );
}
