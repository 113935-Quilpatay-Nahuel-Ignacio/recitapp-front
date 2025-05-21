export interface WalletTransactionDTO {
  userId: number;
  operation: 'ADD' | 'SUBTRACT';
  amount: number; // BigDecimal in Java
  currency?: string; // Currency might be implicit or part of user's wallet settings
  description?: string;
} 