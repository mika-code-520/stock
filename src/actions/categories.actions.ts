"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/require-role";

export async function createCategoryAction(formData: FormData) {
  await requireRole(["ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre es requerido.");

  await prisma.category.create({ data: { name } });

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
}

export async function renameCategoryAction(formData: FormData) {
  await requireRole(["ADMIN"]);

  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!id) throw new Error("Falta la categoría.");
  if (!name) throw new Error("El nombre es requerido.");

  await prisma.category.update({ where: { id }, data: { name } });

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
}

export async function deleteCategoryAction(formData: FormData) {
  await requireRole(["ADMIN"]);

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Falta la categoría.");

  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) {
    throw new Error("No se puede eliminar: hay productos usando esta categoría.");
  }

  await prisma.category.delete({ where: { id } });

  revalidatePath("/admin/categorias");
  revalidatePath("/admin/productos");
}
