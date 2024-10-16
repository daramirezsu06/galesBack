export enum OrderStatus {
  BLOCKED = 'blocked',
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  DELIVERED = 'delivered',
}

export enum PaymentStatus {
  PENDING = 'pending', // Pago aún no completado.
  PAID = 'paid', // Pago completado y confirmado.
  CANCELLED = 'cancelled', // El pago fue cancelado.
}

export enum PaymentTerms {
  CASH = 'cash', // Pago al contado
  CREDIT = 'credit', // Pago a crédito
  INSTALLMENTS = 'installments', // Pago en cuotas
  ADVANCE = 'advance', // Pago por adelantado
  DEFERRED = 'deferred', // Pago diferido (pagar más tarde)
}
