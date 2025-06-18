export interface EnhancedRefundResponseDTO {
  // Basic refund information
  refundTransactionId?: number;
  originalTransactionId: number;
  refundAmount: number;
  status: string;
  processedAt: string;
  
  // MercadoPago refund information
  mercadoPagoRefundAttempted: boolean;
  mercadoPagoRefundSuccessful: boolean;
  mercadoPagoRefundId?: string;
  mercadoPagoErrorMessage?: string;
  
  // Wallet fallback information
  walletFallbackUsed: boolean;
  walletCreditAmount?: number;
  newWalletBalance?: number;
  
  // Processing details
  processingMethod: string; // "MERCADOPAGO", "WALLET", "MIXED", "NONE"
  message: string;
} 