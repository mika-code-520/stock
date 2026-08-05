"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/require-role";

export async function createSupplierAction(formData: FormData) {
  await requireRole(["ADMIN"]);

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("El nombre es requerido.");

  await prisma.supplier.create({
    data: {
      name,
      contactPhone: String(formData.get("contactPhone") ?? "").trim() || null,
      contactEmail: String(formData.get("contactEmail") ?? "").trim() || null,
      isOwnStock: formData.get("isOwnStock") === "on",
    },
  });

  revalidatePath("/admin/proveedores");
}
