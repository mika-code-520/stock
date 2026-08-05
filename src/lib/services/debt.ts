import { prisma } from "@/lib/db";

const SUMA = ["VENTA", "CAMBIO_SALIDA"] as const;
const RESTA = ["DEVOLUCION", "CAMBIO_ENTRADA"] as const;

// "Deuda pendiente" = ventas/cambios-salida aprobados y no pagados todavía
// al proveedor, menos TODAS las devoluciones/cambios-entrada aprobados
// (una devolución reduce la deuda incluso si la venta que revierte ya fue
// pagada; en ese caso el proveedor pasa a estar en crédito con el local).
export async function getDeudaPorProveedor(supplierId: string) {
  const [suma, resta] = await Promise.all([
    prisma.movement.aggregate({
      where: {
        supplierId,
        status: "APROBADO",
        paymentStatus: "PENDIENTE_PAGO",
        type: { in: [...SUMA] },
      },
      _sum: { consignmentAmount: true },
    }),
    prisma.movement.aggregate({
      where: {
        supplierId,
        status: "APROBADO",
        type: { in: [...RESTA] },
      },
      _sum: { consignmentAmount: true },
    }),
  ]);

  return Number(suma._sum.consignmentAmount ?? 0) - Number(resta._sum.consignmentAmount ?? 0);
}

export async function getDeudaTodosLosProveedores() {
  const suppliers = await prisma.supplier.findMany({
    where: { active: true, isOwnStock: false },
  });
  const deudas = await Promise.all(
    suppliers.map(async (s) => ({
      supplier: s,
      deuda: await getDeudaPorProveedor(s.id),
    }))
  );
  return deudas;
}

// Lo que generó un vendedor y todavía está pendiente de pago al proveedor:
// mismo cálculo que getDeudaPorProveedor, pero agrupado por quién cargó el
// movimiento en vez de por dueño de la mercadería.
export async function getDeudaPorVendedor(createdById: string) {
  const [suma, resta] = await Promise.all([
    prisma.movement.aggregate({
      where: {
        createdById,
        status: "APROBADO",
        paymentStatus: "PENDIENTE_PAGO",
        type: { in: [...SUMA] },
      },
      _sum: { consignmentAmount: true },
    }),
    prisma.movement.aggregate({
      where: { createdById, status: "APROBADO", type: { in: [...RESTA] } },
      _sum: { consignmentAmount: true },
    }),
  ]);

  return Number(suma._sum.consignmentAmount ?? 0) - Number(resta._sum.consignmentAmount ?? 0);
}

export async function getDeudaTodosLosVendedores() {
  const vendedores = await prisma.user.findMany({
    where: { active: true, role: "VENDEDOR" },
    orderBy: { name: "asc" },
  });
  const deudas = await Promise.all(
    vendedores.map(async (v) => ({
      vendedor: v,
      deuda: await getDeudaPorVendedor(v.id),
    }))
  );
  return deudas;
}
