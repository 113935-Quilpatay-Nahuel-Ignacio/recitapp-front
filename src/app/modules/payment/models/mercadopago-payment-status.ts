export interface MercadoPagoPaymentStatus {
  code: string;
  status: string;
  displayName: string;
  userMessage: string;
  shouldDeliverTickets: boolean;
  canRetry: boolean;
}

export type PaymentStatusCode = 
  | 'APRO'   // Pago aprobado
  | 'OTHE'   // Rechazado por error general
  | 'CONT'   // Pendiente de pago
  | 'CALL'   // Rechazado con validación para autorizar
  | 'FUND'   // Rechazado por fondos insuficientes
  | 'SECU'   // Rechazado por código de seguridad inválido
  | 'EXPI'   // Rechazado por fecha de vencimiento inválida
  | 'FORM'   // Rechazado por error en formulario
  | 'COMPLETED' // Pago completado (billetera virtual)
  | 'approved'
  | 'pending'
  | 'rejected'
  | 'cancelled'
  | 'in_process'
  | 'authorized'
  | 'refunded'
  | 'charged_back'
  | 'unknown'
  | 'ERROR';

export interface PaymentResponse {
  preferenceId: string;
  initPoint?: string;
  sandboxInitPoint?: string;
  publicKey: string;
  totalAmount: number;
  status: string;
  transactionId?: number;
  qrCodeData?: string;
  
  // Nuevos campos para manejo detallado de estados
  statusCode: PaymentStatusCode;
  statusDetail?: string;
  displayName: string;
  userMessage: string;
  shouldDeliverTickets: boolean;
  canRetry: boolean;
  paymentId?: string;
  
  // Información del método de pago
  paymentMethodInfo?: {
    paymentMethodId: string;
    paymentTypeId: string;
    paymentMethodName: string;
    issuerName?: string;
  };
  
  // Configuración de la API
  apiConfig?: {
    locale: string;
    theme: string;
    enabledPaymentMethods: {
      creditCard: boolean;
      debitCard: boolean;
      mercadoPagoWallet: boolean;
    };
  };
}

export class MercadoPagoStatusHandler {
  
  private static readonly statusMap: Record<PaymentStatusCode, MercadoPagoPaymentStatus> = {
    // Estados de aprobación
    'APRO': {
      code: 'APRO',
      status: 'approved',
      displayName: 'Pago aprobado',
      userMessage: 'Tu pago ha sido aprobado exitosamente',
      shouldDeliverTickets: true,
      canRetry: false
    },
    'approved': {
      code: 'approved',
      status: 'approved',
      displayName: 'Pago aprobado',
      userMessage: 'Tu pago ha sido aprobado exitosamente',
      shouldDeliverTickets: true,
      canRetry: false
    },
    'COMPLETED': {
      code: 'COMPLETED',
      status: 'approved',
      displayName: 'Pago completado',
      userMessage: 'Tu pago con billetera virtual ha sido completado exitosamente. Recibirás tus entradas por email.',
      shouldDeliverTickets: true,
      canRetry: false
    },
    
    // Estados pendientes
    'CONT': {
      code: 'CONT',
      status: 'pending',
      displayName: 'Pendiente de pago',
      userMessage: 'Tu pago está siendo procesado. Te daremos tus entradas cuando se complete el proceso.',
      shouldDeliverTickets: false,
      canRetry: false
    },
    'pending': {
      code: 'pending',
      status: 'pending',
      displayName: 'Pendiente de pago',
      userMessage: 'Tu pago está siendo procesado. Te daremos tus entradas cuando se complete el proceso.',
      shouldDeliverTickets: false,
      canRetry: false
    },
    'in_process': {
      code: 'in_process',
      status: 'in_process',
      displayName: 'En proceso',
      userMessage: 'Tu pago está siendo procesado. Te daremos tus entradas cuando se complete el proceso.',
      shouldDeliverTickets: false,
      canRetry: false
    },
    
    // Estados de rechazo - Errores específicos de tarjeta
    'CALL': {
      code: 'CALL',
      status: 'rejected',
      displayName: 'Rechazado - Validación requerida',
      userMessage: 'Tu pago fue rechazado. Debes contactar a tu banco para autorizar el pago. Puedes intentar con otra tarjeta.',
      shouldDeliverTickets: false,
      canRetry: true
    },
    'FUND': {
      code: 'FUND',
      status: 'rejected',
      displayName: 'Rechazado - Fondos insuficientes',
      userMessage: 'Tu pago fue rechazado por fondos insuficientes. Verifica tu saldo o intenta con otra tarjeta.',
      shouldDeliverTickets: false,
      canRetry: true
    },
    'SECU': {
      code: 'SECU',
      status: 'rejected',
      displayName: 'Rechazado - Código de seguridad inválido',
      userMessage: 'Tu pago fue rechazado por código de seguridad inválido. Verifica el CVV de tu tarjeta e intenta nuevamente.',
      shouldDeliverTickets: false,
      canRetry: true
    },
    'EXPI': {
      code: 'EXPI',
      status: 'rejected',
      displayName: 'Rechazado - Fecha de vencimiento inválida',
      userMessage: 'Tu pago fue rechazado por fecha de vencimiento inválida. Verifica la fecha de tu tarjeta e intenta nuevamente.',
      shouldDeliverTickets: false,
      canRetry: true
    },
    'FORM': {
      code: 'FORM',
      status: 'rejected',
      displayName: 'Rechazado - Error en formulario',
      userMessage: 'Tu pago fue rechazado por datos incorrectos. Verifica todos los campos del formulario e intenta nuevamente.',
      shouldDeliverTickets: false,
      canRetry: true
    },
    'OTHE': {
      code: 'OTHE',
      status: 'rejected',
      displayName: 'Rechazado - Error general',
      userMessage: 'Tu pago fue rechazado. Verifica los datos de tu tarjeta o intenta con otra tarjeta.',
      shouldDeliverTickets: false,
      canRetry: true
    },
    'rejected': {
      code: 'rejected',
      status: 'rejected',
      displayName: 'Pago rechazado',
      userMessage: 'Tu pago fue rechazado. Verifica los datos de tu tarjeta o intenta con otra tarjeta.',
      shouldDeliverTickets: false,
      canRetry: true
    },
    
    // Estados de cancelación
    'cancelled': {
      code: 'cancelled',
      status: 'cancelled',
      displayName: 'Pago cancelado',
      userMessage: 'El pago ha sido cancelado.',
      shouldDeliverTickets: false,
      canRetry: true
    },
    
    // Estados de autorización
    'authorized': {
      code: 'authorized',
      status: 'authorized',
      displayName: 'Pago autorizado',
      userMessage: 'El pago ha sido autorizado pero aún no capturado.',
      shouldDeliverTickets: false,
      canRetry: false
    },
    
    // Estados de reembolso
    'refunded': {
      code: 'refunded',
      status: 'refunded',
      displayName: 'Pago reembolsado',
      userMessage: 'El pago ha sido reembolsado.',
      shouldDeliverTickets: false,
      canRetry: false
    },
    'charged_back': {
      code: 'charged_back',
      status: 'charged_back',
      displayName: 'Contracargo',
      userMessage: 'Se ha realizado un contracargo.',
      shouldDeliverTickets: false,
      canRetry: false
    },
    
    // Estados desconocidos o de error
    'unknown': {
      code: 'unknown',
      status: 'unknown',
      displayName: 'Estado desconocido',
      userMessage: 'No se pudo determinar el estado del pago.',
      shouldDeliverTickets: false,
      canRetry: true
    },
    'ERROR': {
      code: 'ERROR',
      status: 'ERROR',
      displayName: 'Error de procesamiento',
      userMessage: 'Ocurrió un error al procesar el pago.',
      shouldDeliverTickets: false,
      canRetry: true
    }
  };

  /**
   * Obtiene la información detallada del estado de pago
   */
  static getStatusInfo(statusCode: PaymentStatusCode): MercadoPagoPaymentStatus {
    return this.statusMap[statusCode] || this.statusMap['unknown'];
  }

  /**
   * Determina si el estado permite entregar entradas
   */
  static shouldDeliverTickets(statusCode: PaymentStatusCode): boolean {
    return this.getStatusInfo(statusCode).shouldDeliverTickets;
  }

  /**
   * Determina si el usuario puede reintentar el pago
   */
  static canRetryPayment(statusCode: PaymentStatusCode): boolean {
    return this.getStatusInfo(statusCode).canRetry;
  }

  /**
   * Obtiene el mensaje apropiado para mostrar al usuario
   */
  static getUserMessage(statusCode: PaymentStatusCode): string {
    return this.getStatusInfo(statusCode).userMessage;
  }

  /**
   * Obtiene la clase CSS apropiada para el estado
   */
  static getStatusCssClass(statusCode: PaymentStatusCode): string {
    const status = this.getStatusInfo(statusCode);
    
    if (status.shouldDeliverTickets) {
      return 'status-success';
    } else if (status.canRetry) {
      return 'status-error';
    } else if (status.status === 'pending' || status.status === 'in_process') {
      return 'status-pending';
    } else {
      return 'status-neutral';
    }
  }

  /**
   * Obtiene el ícono apropiado para el estado
   */
  static getStatusIcon(statusCode: PaymentStatusCode): string {
    const status = this.getStatusInfo(statusCode);
    
    if (status.shouldDeliverTickets) {
      return 'bi-check-circle-fill';
    } else if (status.canRetry) {
      return 'bi-x-circle-fill';
    } else if (status.status === 'pending' || status.status === 'in_process') {
      return 'bi-clock-fill';
    } else {
      return 'bi-info-circle-fill';
    }
  }
} 