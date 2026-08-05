export const MOVEMENT_TYPE_LABEL: Record<string, string> = {
  INGRESO_INICIAL: "Ingreso inicial",
  REPOSICION: "Reposición",
  PEDIDO_REPOSICION: "Pedido de reposición",
  VENTA: "Venta",
  DEVOLUCION: "Devolución",
  CAMBIO_ENTRADA: "Cambio (entra)",
  CAMBIO_SALIDA: "Cambio (sale)",
  RETIRO: "Retiro",
};

export const MOVEMENT_STATUS_STYLE: Record<string, string> = {
  PENDIENTE: "bg-amber-100 text-amber-800",
  APROBADO: "bg-emerald-100 text-emerald-800",
  RECHAZADO: "bg-red-100 text-red-800",
};

export const MOVEMENT_STATUS_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente",
  APROBADO: "Aprobado",
  RECHAZADO: "Rechazado",
};

export const PAYMENT_STATUS_STYLE: Record<string, string> = {
  PENDIENTE_PAGO: "bg-amber-100 text-amber-800",
  PAGADO: "bg-emerald-100 text-emerald-800",
};

export const PAYMENT_STATUS_LABEL: Record<string, string> = {
  PENDIENTE_PAGO: "Pendiente de pago al proveedor",
  PAGADO: "Pagado al proveedor",
};
