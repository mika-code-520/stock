import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

// Días hacia atrás desde hoy, para que createdAt de los movimientos se vea escalonado.
function haceDias(dias: number) {
  const d = new Date();
  d.setDate(d.getDate() - dias);
  return d;
}

async function main() {
  const adminPassword = await bcrypt.hash("admin1234", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@stock.local" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@stock.local",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });

  const vendedorPassword = await bcrypt.hash("vendedor1234", 10);
  const vendedor = await prisma.user.upsert({
    where: { email: "vendedor@stock.local" },
    update: {},
    create: {
      name: "Vendedor Demo",
      email: "vendedor@stock.local",
      passwordHash: vendedorPassword,
      role: "VENDEDOR",
    },
  });

  const categorias = ["Remeras", "Buzos", "Gorras", "Pantuflas", "Pantalones"];
  const categoryByName: Record<string, { id: string }> = {};
  for (const name of categorias) {
    categoryByName[name] = await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Dani es la administradora del local y dueña de esta mercadería (no la
  // recibe en consignación de un tercero), por eso se marca isOwnStock: sus
  // movimientos nunca generan deuda.
  const dani = await prisma.supplier.upsert({
    where: { id: "seed-supplier-dani" },
    update: { isOwnStock: true },
    create: {
      id: "seed-supplier-dani",
      name: "Dani",
      contactPhone: "11-4444-5555",
      contactEmail: "admin@stock.local",
      notes: "Administradora del local. Mercadería propia, no en consignación.",
      isOwnStock: true,
    },
  });

  type ProductoSeed = {
    name: string;
    size: string;
    color: string;
    categoryId: string;
    consignmentPrice: number;
    suggestedSalePrice: number;
    ingresoInicial: number;
  };

  const productos: ProductoSeed[] = [
    // Remeras negras por talle
    { name: "Remera", size: "XS", color: "Negro", categoryId: categoryByName["Remeras"].id, consignmentPrice: 8000, suggestedSalePrice: 15000, ingresoInicial: 15 },
    { name: "Remera", size: "S", color: "Negro", categoryId: categoryByName["Remeras"].id, consignmentPrice: 8000, suggestedSalePrice: 15000, ingresoInicial: 20 },
    { name: "Remera", size: "L", color: "Negro", categoryId: categoryByName["Remeras"].id, consignmentPrice: 8000, suggestedSalePrice: 15000, ingresoInicial: 18 },

    // Pantuflas por talle
    { name: "Pantuflas", size: "38", color: "Gris", categoryId: categoryByName["Pantuflas"].id, consignmentPrice: 5000, suggestedSalePrice: 9500, ingresoInicial: 12 },
    { name: "Pantuflas", size: "39", color: "Gris", categoryId: categoryByName["Pantuflas"].id, consignmentPrice: 5000, suggestedSalePrice: 9500, ingresoInicial: 14 },
    { name: "Pantuflas", size: "40", color: "Gris", categoryId: categoryByName["Pantuflas"].id, consignmentPrice: 5000, suggestedSalePrice: 9500, ingresoInicial: 10 },

    // Pantalones de jean por talle
    { name: "Pantalón de jean", size: "38", color: "Azul", categoryId: categoryByName["Pantalones"].id, consignmentPrice: 12000, suggestedSalePrice: 22000, ingresoInicial: 10 },
    { name: "Pantalón de jean", size: "40", color: "Azul", categoryId: categoryByName["Pantalones"].id, consignmentPrice: 12000, suggestedSalePrice: 22000, ingresoInicial: 12 },
    { name: "Pantalón de jean", size: "42", color: "Azul", categoryId: categoryByName["Pantalones"].id, consignmentPrice: 12000, suggestedSalePrice: 22000, ingresoInicial: 8 },
    { name: "Pantalón de jean", size: "44", color: "Azul", categoryId: categoryByName["Pantalones"].id, consignmentPrice: 12000, suggestedSalePrice: 22000, ingresoInicial: 6 },
  ];

  const productByKey: Record<string, Awaited<ReturnType<typeof prisma.product.upsert>>> = {};

  for (const p of productos) {
    const key = `${p.name}-${p.size}-${p.color}`;
    const product = await prisma.product.upsert({
      where: {
        uniq_variant_per_supplier: {
          name: p.name,
          size: p.size,
          color: p.color,
          supplierId: dani.id,
        },
      },
      update: {
        consignmentPrice: p.consignmentPrice,
        suggestedSalePrice: p.suggestedSalePrice,
      },
      create: {
        name: p.name,
        size: p.size,
        color: p.color,
        categoryId: p.categoryId,
        supplierId: dani.id,
        consignmentPrice: p.consignmentPrice,
        suggestedSalePrice: p.suggestedSalePrice,
        stockCache: 0,
      },
    });
    productByKey[key] = product;

    // Solo genera el ingreso inicial si el producto todavía no tiene stock
    // (evita duplicar movimientos si el seed se corre más de una vez).
    if (product.stockCache === 0) {
      await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: product.id },
          data: { stockCache: { increment: p.ingresoInicial } },
        });
        await tx.movement.create({
          data: {
            type: "INGRESO_INICIAL",
            status: "APROBADO",
            productId: product.id,
            supplierId: product.supplierId,
            quantity: p.ingresoInicial,
            notes: "Carga inicial de stock en consignación",
            createdById: admin.id,
            reviewedById: admin.id,
            reviewedAt: haceDias(20),
            createdAt: haceDias(20),
          },
        });
      });
      productByKey[key] = await prisma.product.findUniqueOrThrow({ where: { id: product.id } });
    }
  }

  // Ventas aprobadas: consumen stock ya ingresado y generan deuda real del
  // vendedor hacia el proveedor (cantidad * consignmentPrice).
  type VentaSeed = {
    key: string;
    quantity: number;
    saleUnitPrice: number;
    diasAtras: number;
  };

  const ventasAprobadas: VentaSeed[] = [
    { key: "Remera-XS-Negro", quantity: 3, saleUnitPrice: 15000, diasAtras: 15 },
    { key: "Remera-S-Negro", quantity: 10, saleUnitPrice: 15000, diasAtras: 12 },
    { key: "Remera-L-Negro", quantity: 5, saleUnitPrice: 15000, diasAtras: 9 },
    { key: "Pantuflas-38-Gris", quantity: 4, saleUnitPrice: 9500, diasAtras: 10 },
    { key: "Pantuflas-39-Gris", quantity: 6, saleUnitPrice: 9500, diasAtras: 7 },
    { key: "Pantalón de jean-38-Azul", quantity: 2, saleUnitPrice: 22000, diasAtras: 6 },
    { key: "Pantalón de jean-40-Azul", quantity: 3, saleUnitPrice: 23000, diasAtras: 4 },
  ];

  for (const v of ventasAprobadas) {
    const product = productByKey[v.key];
    const createdAt = haceDias(v.diasAtras);
    await prisma.$transaction(async (tx) => {
      const result = await tx.product.updateMany({
        where: { id: product.id, stockCache: { gte: v.quantity } },
        data: { stockCache: { decrement: v.quantity } },
      });
      if (result.count === 0) return;

      await tx.movement.create({
        data: {
          type: "VENTA",
          status: "APROBADO",
          productId: product.id,
          supplierId: product.supplierId,
          quantity: v.quantity,
          consignmentAmount: Number(product.consignmentPrice) * v.quantity,
          saleAmount: v.saleUnitPrice * v.quantity,
          notes: "Venta al público",
          createdById: vendedor.id,
          createdAt,
          reviewedById: admin.id,
          reviewedAt: haceDias(Math.max(v.diasAtras - 1, 0)),
        },
      });
    });
  }

  // Una devolución aprobada (unidad vendida que vuelve): resta deuda.
  const remeraS = productByKey["Remera-S-Negro"];
  await prisma.$transaction(async (tx) => {
    await tx.product.update({
      where: { id: remeraS.id },
      data: { stockCache: { increment: 1 } },
    });
    await tx.movement.create({
      data: {
        type: "DEVOLUCION",
        status: "APROBADO",
        productId: remeraS.id,
        supplierId: remeraS.supplierId,
        quantity: 1,
        wasSold: true,
        consignmentAmount: Number(remeraS.consignmentPrice) * 1,
        notes: "Cliente devolvió la prenda, talle incorrecto",
        createdById: vendedor.id,
        createdAt: haceDias(5),
        reviewedById: admin.id,
        reviewedAt: haceDias(4),
      },
    });
  });

  // Movimientos pendientes de aprobación, para ver el panel de aprobaciones
  // con datos: dos ventas nuevas y un pedido de reposición.
  const pantuflas40 = productByKey["Pantuflas-40-Gris"];
  const jean42 = productByKey["Pantalón de jean-42-Azul"];
  const jean44 = productByKey["Pantalón de jean-44-Azul"];

  await prisma.movement.create({
    data: {
      type: "VENTA",
      status: "PENDIENTE",
      productId: pantuflas40.id,
      supplierId: pantuflas40.supplierId,
      quantity: 2,
      consignmentAmount: Number(pantuflas40.consignmentPrice) * 2,
      saleAmount: 9500 * 2,
      notes: "Venta al público",
      createdById: vendedor.id,
      createdAt: haceDias(1),
    },
  });

  await prisma.movement.create({
    data: {
      type: "VENTA",
      status: "PENDIENTE",
      productId: jean42.id,
      supplierId: jean42.supplierId,
      quantity: 1,
      consignmentAmount: Number(jean42.consignmentPrice) * 1,
      saleAmount: 22000,
      notes: "Venta al público",
      createdById: vendedor.id,
      createdAt: haceDias(0),
    },
  });

  await prisma.movement.create({
    data: {
      type: "PEDIDO_REPOSICION",
      status: "PENDIENTE",
      productId: jean44.id,
      supplierId: jean44.supplierId,
      quantity: 6,
      notes: "Se está agotando el talle 44, pido reposición",
      createdById: vendedor.id,
      createdAt: haceDias(0),
    },
  });

  console.log("Seed completo:");
  console.log("  admin@stock.local / admin1234");
  console.log("  vendedor@stock.local / vendedor1234");
  console.log("  Proveedor/dueño: Dani — productos con stock, ventas aprobadas (deuda real) y movimientos pendientes de aprobación.");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
