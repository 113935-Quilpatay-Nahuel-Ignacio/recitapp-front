export interface ReceiptItemDTO {
  itemDescription: string;
  unitPrice: number; // BigDecimal in Java
  quantity: number;
  subtotal: number; // BigDecimal in Java
}

export interface TransactionReceiptDTO {
  transactionId: number;
  receiptNumber: string;
  issueDate: string; // LocalDateTime in Java
  userFullName: string;
  userDni?: string;
  totalAmount: number; // BigDecimal in Java
  paymentMethod: string;
  items: ReceiptItemDTO[];
  isRefund: boolean;
} 