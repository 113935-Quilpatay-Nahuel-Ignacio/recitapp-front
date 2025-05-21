export interface RefundRequestDTO {
  transactionId: number;
  reason?: string;
  fullRefund?: boolean;
  ticketIds?: number[];
} 