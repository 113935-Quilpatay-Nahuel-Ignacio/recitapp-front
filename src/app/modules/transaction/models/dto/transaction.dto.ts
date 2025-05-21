import { TransactionDetailDTO } from './transaction-detail.dto';

export interface TransactionDTO {
  id: number;
  userId: number;
  userName?: string; // Added by backend mapper
  paymentMethodId: number;
  paymentMethodName?: string; // Added by backend mapper
  totalAmount: number; // BigDecimal in Java
  statusName: string;
  externalReference?: string;
  transactionDate: string; // LocalDateTime in Java, will be ISO string
  details?: TransactionDetailDTO[];
  description?: string;
  isRefund: boolean;
  originalTransactionId?: number;
  // walletBalance is not part of TransactionDTO directly, but of WalletTransactionDTO and User entity
} 