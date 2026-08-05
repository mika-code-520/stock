"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/require-role";
import { registrarIngresoInicial } from "@/lib/services/movements";
import { createProductSchema, updateProductSchema } from "@/lib/validations/product.schema";

export async function createProductAction(formData: FormData) {
  const user = await requireRole(["ADMIN"]);

  const parsed = createProductSchema.safeParse({
    name: formData.get("name"),
    size: formData.get("size"),
    color: formData.get("color"),
    categoryId: formData.get("categoryId"),
    supplierId: formData.get("supplierId"),
    consignmentPrice: formData.get("consignmentPrice"),
    suggestedSalePrice: formData.get("suggestedSalePrice"),
    initialStock: formData.get("initialStock"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const data = parsed.data;

  const product = await prisma.product.create({
    data: {
      name: data.name,
      size: data.size,
      color: data.color,
      categoryId: data.categoryId,
      supplierId: data.supplierId,
      consignmentPrice: data.consignmentPrice,
      suggestedSalePrice: data.suggestedSalePrice,
    },
  });

  if (data.initialStock > 0) {
    await registrarIngresoInicial({
      productId: product.id,
      quantity: data.initialStock,
      createdById: user.id,
    });
  }

  revalidatePath("/admin/productos");
}

export async function updateProductAction(formData: FormData) {
  await requireRole(["ADMIN"]);

  const parsed = updateProductSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name"),
    size: formData.get("size"),
    color: formData.get("color"),
    categoryId: formData.get("categoryId"),
    supplierId: formData.get("supplierId"),
    consignmentPrice: formData.get("consignmentPrice"),
    suggestedSalePrice: formData.get("suggestedSalePrice"),
  });

  if (!parsed.success) {
    throw new Error(parsed.error.issues.map((i) => i.message).join(", "));
  }

  const data = parsed.data;

  await prisma.product.update({
    where: { id: data.id },
    data: {
      name: data.name,
      size: data.size,
      color: data.color,
      categoryId: data.categoryId,
      supplierId: data.supplierId,
      consignmentPrice: data.consignmentPrice,
      suggestedSalePrice: data.suggestedSalePrice,
    },
  });

  revalidatePath("/admin/productos");
}

export async function deactivateProductAction(formData: FormData) {
  await requireRole(["ADMIN"]);

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Falta el producto.");

  await prisma.product.update({
    where: { id },
    data: { active: false },
  });

  revalidatePath("/admin/productos");
}
