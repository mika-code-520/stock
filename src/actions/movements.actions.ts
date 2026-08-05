"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/require-role";
import {
  crearMovimientoPendiente,
  aprobarMovimiento,
  rechazarMovimiento,
  marcarPagoProveedor,
  marcarPagoProveedorMasivo,
} from "@/lib/services/movements";

export async function registrarVentaAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "VENDEDOR"]);

  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity"));
  const saleAmountRaw = formData.get("saleAmount");
  const saleAmount = saleAmountRaw ? Number(saleAmountRaw) : undefined;

  if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Datos de venta inválidos.");
  }

  await crearMovimientoPendiente({
    type: "VENTA",
    productId,
    quantity,
    saleAmount,
    createdById: user.id,
  });

  revalidatePath("/vendedor/mis-movimientos");
  revalidatePath("/admin/aprobaciones");
}

export async function registrarDevolucionAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "VENDEDOR"]);

  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity"));
  const wasSold = formData.get("wasSold") === "on";
  const notesRaw = formData.get("notes");
  const notes = notesRaw ? String(notesRaw) : undefined;

  if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Datos de devolución inválidos.");
  }

  await crearMovimientoPendiente({
    type: "DEVOLUCION",
    productId,
    quantity,
    wasSold,
    notes,
    createdById: user.id,
  });

  revalidatePath("/vendedor/mis-movimientos");
  revalidatePath("/admin/aprobaciones");
}

export async function registrarPedidoReposicionAction(formData: FormData) {
  const user = await requireRole(["ADMIN", "VENDEDOR"]);

  const productId = String(formData.get("productId") ?? "");
  const quantity = Number(formData.get("quantity"));

  if (!productId || !Number.isFinite(quantity) || quantity <= 0) {
    throw new Error("Datos de pedido inválidos.");
  }

  await crearMovimientoPendiente({
    type: "PEDIDO_REPOSICION",
    productId,
    quantity,
    createdById: user.id,
  });

  revalidatePath("/vendedor/mis-movimientos");
  revalidatePath("/admin/aprobaciones");
}

export async function aprobarMovimientoAction(movementId: string) {
  const user = await requireRole(["ADMIN"]);
  await aprobarMovimiento(movementId, user.id);
  revalidatePath("/admin/aprobaciones");
  revalidatePath("/admin/productos");
}

export async function rechazarMovimientoAction(movementId: string, reason?: string) {
  const user = await requireRole(["ADMIN"]);
  await rechazarMovimiento(movementId, user.id, reason);
  revalidatePath("/admin/aprobaciones");
}

export async function marcarPagoProveedorAction(movementId: string) {
  await requireRole(["ADMIN"]);
  await marcarPagoProveedor(movementId);
  revalidatePath("/admin/deuda");
  revalidatePath("/admin/vendedores");
  revalidatePath("/vendedor/mis-movimientos");
}

export async function marcarPagoProveedorMasivoAction(supplierId: string) {
  await requireRole(["ADMIN"]);
  await marcarPagoProveedorMasivo(supplierId);
  revalidatePath("/admin/deuda");
  revalidatePath("/admin/vendedores");
  revalidatePath("/vendedor/mis-movimientos");
}
