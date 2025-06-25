export interface StatusInfo {
  displayName: string;
  className: string;
  icon: string;
  color: string;
}

export class StatusFormatter {
  private static readonly STATUS_MAP: Record<string, StatusInfo> = {
    'PROXIMO': {
      displayName: 'Próximo',
      className: 'bg-info',
      icon: 'clock',
      color: '#0dcaf0'
    },
    'EN_VENTA': {
      displayName: 'En Venta',
      className: 'bg-success',
      icon: 'ticket-perforated',
      color: '#198754'
    },
    'AGOTADO': {
      displayName: 'Agotado',
      className: 'bg-warning text-dark',
      icon: 'exclamation-triangle',
      color: '#ffc107'
    },
    'CANCELADO': {
      displayName: 'Cancelado',
      className: 'bg-danger',
      icon: 'x-circle',
      color: '#dc3545'
    },
    'FINALIZADO': {
      displayName: 'Finalizado',
      className: 'bg-secondary',
      icon: 'check-circle',
      color: '#6c757d'
    },
    'VENDIDA': {
      displayName: 'Vendida',
      className: 'bg-success',
      icon: 'check-circle-fill',
      color: '#198754'
    },
    'CANCELADA': {
      displayName: 'Cancelada',
      className: 'bg-danger',
      icon: 'x-circle-fill',
      color: '#dc3545'
    },
    'RESERVADA': {
      displayName: 'Reservada',
      className: 'bg-warning text-dark',
      icon: 'hourglass-split',
      color: '#ffc107'
    },
    'TRANSFERIDA': {
      displayName: 'Transferida',
      className: 'bg-info',
      icon: 'arrow-left-right',
      color: '#0dcaf0'
    },
    'USADA': {
      displayName: 'Usada',
      className: 'bg-secondary',
      icon: 'check-square',
      color: '#6c757d'
    },
    'REFUND': {
      displayName: 'Reembolsada',
      className: 'bg-danger',
      icon: 'arrow-counterclockwise',
      color: '#dc3545'
    }
  };

  /**
   * Formatea un nombre de estado para mostrar de manera amigable
   */
  static formatStatusName(status: string | undefined): string {
    if (!status) return 'Sin estado';
    
    const statusInfo = this.STATUS_MAP[status.toUpperCase()];
    return statusInfo ? statusInfo.displayName : this.capitalizeStatus(status);
  }

  /**
   * Obtiene la clase CSS para el estado
   */
  static getStatusClass(status: string | undefined): string {
    if (!status) return 'bg-secondary';
    
    const statusInfo = this.STATUS_MAP[status.toUpperCase()];
    return statusInfo ? statusInfo.className : 'bg-secondary';
  }

  /**
   * Obtiene el icono Bootstrap para el estado
   */
  static getStatusIcon(status: string | undefined): string {
    if (!status) return 'question-circle';
    
    const statusInfo = this.STATUS_MAP[status.toUpperCase()];
    return statusInfo ? statusInfo.icon : 'question-circle';
  }

  /**
   * Obtiene el color hexadecimal para el estado
   */
  static getStatusColor(status: string | undefined): string {
    if (!status) return '#6c757d';
    
    const statusInfo = this.STATUS_MAP[status.toUpperCase()];
    return statusInfo ? statusInfo.color : '#6c757d';
  }

  /**
   * Obtiene toda la información del estado
   */
  static getStatusInfo(status: string | undefined): StatusInfo {
    if (!status) {
      return {
        displayName: 'Sin estado',
        className: 'bg-secondary',
        icon: 'question-circle',
        color: '#6c757d'
      };
    }
    
    const statusInfo = this.STATUS_MAP[status.toUpperCase()];
    return statusInfo || {
      displayName: this.capitalizeStatus(status),
      className: 'bg-secondary',
      icon: 'question-circle',
      color: '#6c757d'
    };
  }

  /**
   * Capitaliza un estado como fallback
   */
  private static capitalizeStatus(status: string): string {
    return status
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
  }

  /**
   * Obtiene todos los estados disponibles para eventos
   */
  static getEventStatuses(): Array<{ value: string; viewValue: string }> {
    return [
      { value: 'PROXIMO', viewValue: 'Próximo' },
      { value: 'EN_VENTA', viewValue: 'En Venta' },
      { value: 'AGOTADO', viewValue: 'Agotado' },
      { value: 'CANCELADO', viewValue: 'Cancelado' },
      { value: 'FINALIZADO', viewValue: 'Finalizado' }
    ];
  }

  /**
   * Obtiene todos los estados disponibles para tickets
   */
  static getTicketStatuses(): Array<{ value: string; viewValue: string }> {
    return [
      { value: 'VENDIDA', viewValue: 'Vendida' },
      { value: 'CANCELADA', viewValue: 'Cancelada' },
      { value: 'RESERVADA', viewValue: 'Reservada' },
      { value: 'TRANSFERIDA', viewValue: 'Transferida' },
      { value: 'USADA', viewValue: 'Usada' },
      { value: 'REFUND', viewValue: 'Reembolsada' }
    ];
  }
} 