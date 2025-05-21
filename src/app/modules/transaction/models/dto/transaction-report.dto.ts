export interface TransactionReportDTO {
  reportType: 'USER' | 'PAYMENT_METHOD' | 'STATUS' | 'ALL';
  startDate: string; // LocalDateTime in Java
  endDate: string; // LocalDateTime in Java
  userId?: number;
  paymentMethodId?: number;
  statusName?: string;
}

export interface TimeSegmentStatisticsDTO {
  segmentStart: string; // LocalDateTime
  segmentEnd: string; // LocalDateTime
  transactionCount: number;
  totalAmount: number; // BigDecimal
}

export interface TransactionStatisticsDTO {
  reportType: string;
  startDate: string; // LocalDateTime
  endDate: string; // LocalDateTime
  generatedDate: string; // LocalDateTime
  userId?: number;
  userName?: string;
  paymentMethodId?: number;
  paymentMethodName?: string;
  statusName?: string;
  totalTransactions: number;
  totalAmount: number; // BigDecimal
  averageAmount: number; // BigDecimal
  maxAmount: number; // BigDecimal
  minAmount: number; // BigDecimal
  transactionsByStatus: { [key: string]: number };
  amountByStatus: { [key: string]: number }; // BigDecimal values
  transactionsByPaymentMethod: { [key: string]: number };
  amountByPaymentMethod: { [key: string]: number }; // BigDecimal values
  timeSegmentStatistics?: TimeSegmentStatisticsDTO[];
} 