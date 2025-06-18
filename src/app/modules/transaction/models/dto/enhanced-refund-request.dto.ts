export interface EnhancedRefundRequestDTO {
  transactionId: number;
  reason?: string;
  fullRefund?: boolean;
  ticketIds?: number[];
  
  // Enhanced refund options
  forceMercadoPagoRefund?: boolean; // Force attempt MercadoPago refund even if risky
  allowWalletFallback?: boolean; // Allow fallback to wallet if MercadoPago fails
  mercadoPagoPaymentId?: string; // Optional: specific MercadoPago payment ID
} 