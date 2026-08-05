import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Requerido"),
  size: z.string().min(1, "Requerido"),
  color: z.string().min(1, "Requerido"),
  categoryId: z.string().min(1, "Requerido"),
  supplierId: z.string().min(1, "Requerido"),
  consignmentPrice: z.coerce.number().positive("Debe ser mayor a 0"),
  suggestedSalePrice: z.coerce.number().positive().optional().or(z.literal("").transform(() => undefined)),
  initialStock: z.coerce.number().int().min(0).default(0),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
