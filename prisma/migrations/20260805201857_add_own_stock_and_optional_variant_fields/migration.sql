-- AlterTable
ALTER TABLE "products" ALTER COLUMN "size" DROP NOT NULL,
ALTER COLUMN "color" DROP NOT NULL;

-- AlterTable
ALTER TABLE "suppliers" ADD COLUMN     "isOwnStock" BOOLEAN NOT NULL DEFAULT false;
