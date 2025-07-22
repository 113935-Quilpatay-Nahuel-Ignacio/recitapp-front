/**
 * Utilidades para el manejo consistente de fechas en Argentina (GMT-3)
 * Todas las fechas deben usar estas utilidades para garantizar consistencia
 */

export class DateUtil {
  
  /**
   * Timezone de Argentina
   */
  private static readonly ARGENTINA_TIMEZONE = 'America/Argentina/Buenos_Aires';
  private static readonly ARGENTINA_LOCALE = 'es-AR';

  /**
   * Formatea una fecha para mostrar en Argentina (dd/MM/yyyy)
   */
  static formatDateShort(date: string | Date | undefined): string {
    if (!date) return 'No disponible';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Fecha inválida';
      
      return dateObj.toLocaleDateString(this.ARGENTINA_LOCALE, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        timeZone: this.ARGENTINA_TIMEZONE
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  }

  /**
   * Formatea una fecha completa para mostrar en Argentina (ej: lunes, 15 de enero de 2025)
   */
  static formatDateLong(date: string | Date | undefined): string {
    if (!date) return 'No disponible';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Fecha inválida';
      
      return dateObj.toLocaleDateString(this.ARGENTINA_LOCALE, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: this.ARGENTINA_TIMEZONE
      });
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Fecha inválida';
    }
  }

  /**
   * Formatea una hora para mostrar en Argentina (HH:mm)
   */
  static formatTime(date: string | Date | undefined): string {
    if (!date) return 'No disponible';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Hora inválida';
      
      return dateObj.toLocaleTimeString(this.ARGENTINA_LOCALE, {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: this.ARGENTINA_TIMEZONE
      });
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Hora inválida';
    }
  }

  /**
   * Formatea fecha y hora completa para Argentina
   */
  static formatDateTime(date: string | Date | undefined): string {
    if (!date) return 'No disponible';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Fecha y hora inválida';
      
      const datePart = this.formatDateLong(dateObj);
      const timePart = this.formatTime(dateObj);
      
      return `${datePart} a las ${timePart} hs.`;
    } catch (error) {
      console.error('Error formatting datetime:', error);
      return 'Fecha y hora inválida';
    }
  }

  /**
   * Formatea fecha y hora corta para Argentina (dd/MM/yyyy HH:mm)
   */
  static formatDateTimeShort(date: string | Date | undefined): string {
    if (!date) return 'No disponible';
    
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      if (isNaN(dateObj.getTime())) return 'Fecha inválida';
      
      return dateObj.toLocaleString(this.ARGENTINA_LOCALE, {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        timeZone: this.ARGENTINA_TIMEZONE
      });
    } catch (error) {
      console.error('Error formatting datetime short:', error);
      return 'Fecha inválida';
    }
  }

  /**
   * Convierte una fecha a timezone de Argentina
   */
  static toArgentinaDate(date: string | Date): Date {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Crear fecha con timezone específico de Argentina
    const argentineTime = new Intl.DateTimeFormat('en-CA', {
      timeZone: this.ARGENTINA_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(dateObj);

    const year = parseInt(argentineTime.find(part => part.type === 'year')?.value || '0');
    const month = parseInt(argentineTime.find(part => part.type === 'month')?.value || '0') - 1;
    const day = parseInt(argentineTime.find(part => part.type === 'day')?.value || '0');
    const hour = parseInt(argentineTime.find(part => part.type === 'hour')?.value || '0');
    const minute = parseInt(argentineTime.find(part => part.type === 'minute')?.value || '0');
    const second = parseInt(argentineTime.find(part => part.type === 'second')?.value || '0');

    return new Date(year, month, day, hour, minute, second);
  }

  /**
   * Obtiene la fecha actual en timezone de Argentina
   */
  static nowInArgentina(): Date {
    return this.toArgentinaDate(new Date());
  }

  /**
   * Formatea un número con separadores de miles argentinos
   */
  static formatNumber(num: number): string {
    return num.toLocaleString(this.ARGENTINA_LOCALE);
  }

  /**
   * Formatea un precio en pesos argentinos
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat(this.ARGENTINA_LOCALE, {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  }
} 