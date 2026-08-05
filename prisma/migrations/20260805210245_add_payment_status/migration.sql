-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('NO_APLICA', 'PENDIENTE_PAGO', 'PAGADO');

-- AlterTable
ALTER TABLE "movements" ADD COLUMN     "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'NO_APLICA';

-- CreateIndex
CREATE INDEX "movements_paymentStatus_idx" ON "movements"("paymentStatus");
