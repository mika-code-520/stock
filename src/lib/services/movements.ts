import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

type Tx = Prisma.TransactionClient;

export async function registrarIngresoInicial(params: {
  productId: string;
  quantity: number;
  createdById: string;
}) {
  return prisma.$transaction(async (tx) => {
    const product = await tx.product.findUniqueOrThrow({
      where: { id: params.productId },
    });

    await tx.product.update({
      where: { id: product.id },
      data: { stockCache: { increment: params.quantity } },
    });

    return tx.movement.create({
      data: {
        type: "INGRESO_INICIAL",
        status: "APROBADO",
        productId: product.id,
        supplierId: product.supplierId,
        quantity: params.quantity,
        createdById: params.createdById,
        reviewedById: params.createdById,
        reviewedAt: new Date(),
      },
    });
  });
}

export async function crearMovimientoPendiente(params: {
  type: "VENTA" | "DEVOLUCION" | "PEDIDO_REPOSICION";
  productId: string;
  quantity: number;
  saleAmount?: number;
  wasSold?: boolean;
  notes?: string;
  createdById: string;
}) {
  const product = await prisma.product.findUniqueOrThrow({
    where: { id: params.productId },
  });

  const consignmentAmount =
    params.type === "VENTA" || (params.type === "DEVOLUCION" && params.wasSold)
      ? Number(product.consignmentPrice) * params.quantity
      : undefined;

  return prisma.movement.create({
    data: {
      type: params.type,
      status: "PENDIENTE",
      productId: product.id,
      supplierId: product.supplierId,
      quantity: params.quantity,
      saleAmount: params.saleAmount,
      consignmentAmount,
      wasSold: params.type === "DEVOLUCION" ? params.wasSold ?? false : undefined,
      notes: params.notes,
      createdById: params.createdById,
    },
  });
}

async function aplicarEfectoStock(tx: Tx, movement: {
  id: string;
  type: string;
  productId: string;
  quantity: number;
}) {
  const suma = new Set(["INGRESO_INICIAL", "REPOSICION", "DEVOLUCION", "CAMBIO_ENTRADA"]);
  const resta = new Set(["VENTA", "CAMBIO_SALIDA", "RETIRO"]);

  if (suma.has(movement.type)) {
    await tx.product.update({
      where: { id: movement.productId },
      data: { stockCache: { increment: movement.quantity } },
    });
    return;
  }

  if (resta.has(movement.type)) {
    const result = await tx.product.updateMany({
      where: { id: movement.productId, stockCache: { gte: movement.quantity } },
      data: { stockCache: { decrement: movement.quantity } },
    });
    if (result.count === 0) {
      throw new Error("Stock insuficiente para aprobar este movimiento.");
    }
  }
}

export async function aprobarMovimiento(movementId: string, adminId: string) {
  return prisma.$transaction(async (tx) => {
    const movement = await tx.movement.findUniqueOrThrow({ where: { id: movementId } });

    if (movement.status !== "PENDIENTE") {
      throw new Error("Este movimiento ya fue revisado.");
    }

    if (movement.type === "PEDIDO_REPOSICION") {
      await tx.movement.update({
        where: { id: movement.id },
        data: { status: "APROBADO", reviewedById: adminId, reviewedAt: new Date() },
      });

      const product = await tx.product.findUniqueOrThrow({ where: { id: movement.productId } });
      await tx.product.update({
        where: { id: product.id },
        data: { stockCache: { increment: movement.quantity } },
      });

      return tx.movement.create({
        data: {
          type: "REPOSICION",
          status: "APROBADO",
          productId: product.id,
          supplierId: product.supplierId,
          quantity: movement.quantity,
          notes: `Generado por aprobación de pedido ${movement.id}`,
          createdById: movement.createdById,
          reviewedById: adminId,
          reviewedAt: new Date(),
        },
      });
    }

    await aplicarEfectoStock(tx, movement);

    return tx.movement.update({
      where: { id: movement.id },
      data: { status: "APROBADO", reviewedById: adminId, reviewedAt: new Date() },
    });
  });
}

export async function rechazarMovimiento(movementId: string, adminId: string, reason?: string) {
  return prisma.$transaction(async (tx) => {
    const movement = await tx.movement.findUniqueOrThrow({ where: { id: movementId } });
    if (movement.status !== "PENDIENTE") {
      throw new Error("Este movimiento ya fue revisado.");
    }
    return tx.movement.update({
      where: { id: movement.id },
      data: {
        status: "RECHAZADO",
        reviewedById: adminId,
        reviewedAt: new Date(),
        rejectionReason: reason,
      },
    });
  });
}
