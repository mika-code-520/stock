import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminPassword = await bcrypt.hash("admin1234", 10);
  await prisma.user.upsert({
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
  await prisma.user.upsert({
    where: { email: "vendedor@stock.local" },
    update: {},
    create: {
      name: "Vendedor Demo",
      email: "vendedor@stock.local",
      passwordHash: vendedorPassword,
      role: "VENDEDOR",
    },
  });

  const categorias = ["Remeras", "Buzos", "Gorras", "Pantuflas"];
  for (const name of categorias) {
    await prisma.category.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("Seed completo: admin@stock.local / admin1234, vendedor@stock.local / vendedor1234");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
