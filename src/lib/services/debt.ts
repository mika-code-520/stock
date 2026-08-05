import { prisma } from "@/lib/db";

const SUMA = ["VENTA", "CAMBIO_SALIDA"] as const;
const RESTA = ["DEVOLUCION", "CAMBIO_ENTRADA"] as const;

export async function getDeudaPorProveedor(supplierId: string) {
  const [suma, resta] = await Promise.all([
    prisma.movement.aggregate({
      where: { supplierId, status: "APROBADO", type: { in: [...SUMA] } },
      _sum: { consignmentAmount: true },
    }),
    prisma.movement.aggregate({
      where: { supplierId, status: "APROBADO", type: { in: [...RESTA] } },
      _sum: { consignmentAmount: true },
    }),
  ]);

  return Number(suma._sum.consignmentAmount ?? 0) - Number(resta._sum.consignmentAmount ?? 0);
}

export async function getDeudaTodosLosProveedores() {
  const suppliers = await prisma.supplier.findMany({ where: { active: true } });
  const deudas = await Promise.all(
    suppliers.map(async (s) => ({
      supplier: s,
      deuda: await getDeudaPorProveedor(s.id),
    }))
  );
  return deudas;
}
