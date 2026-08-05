import { z } from "zod";

const optionalText = z
  .string()
  .optional()
  .or(z.literal("").transform(() => undefined));

const checkboxBoolean = z
  .union([z.literal("on"), z.literal(""), z.undefined()])
  .transform((v) => v === "on");

export const createProductSchema = z.object({
  name: z.string().min(1, "Requerido"),
  size: optionalText,
  color: optionalText,
  categoryId: z.string().min(1, "Requerido"),
  supplierId: z.string().min(1, "Requerido"),
  consignmentPrice: z.coerce.number().positive("Debe ser mayor a 0"),
  suggestedSalePrice: z.coerce.number().positive().optional().or(z.literal("").transform(() => undefined)),
  initialStock: z.coerce.number().int().min(0).default(0),
  returnable: checkboxBoolean,
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

export const updateProductSchema = z.object({
  id: z.string().min(1, "Requerido"),
  name: z.string().min(1, "Requerido"),
  size: optionalText,
  color: optionalText,
  categoryId: z.string().min(1, "Requerido"),
  supplierId: z.string().min(1, "Requerido"),
  consignmentPrice: z.coerce.number().positive("Debe ser mayor a 0"),
  suggestedSalePrice: z.coerce.number().positive().optional().or(z.literal("").transform(() => undefined)),
  returnable: checkboxBoolean,
});

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
