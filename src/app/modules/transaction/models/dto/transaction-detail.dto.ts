export interface TransactionDetailDTO {
  ticketId: number;
  ticketCode?: string; // Assuming this might be added by backend mapper
  eventName?: string;  // Assuming this might be added by backend mapper
  unitPrice: number; // In Java this is BigDecimal, will be number in TS
  ticketStatus?: string; // Status of the ticket (VENDIDA, CANCELADA, etc.)
  isRefunded?: boolean; // Whether this ticket has been refunded
} 