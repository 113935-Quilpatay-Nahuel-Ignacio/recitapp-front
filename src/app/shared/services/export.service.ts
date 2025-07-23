import { Injectable } from '@angular/core';

interface ExportColumn {
  header: string;
  key: string;
  width?: number;
  type?: 'text' | 'number' | 'currency' | 'percentage' | 'date';
}

interface ExportData {
  title: string;
  subtitle?: string;
  columns: ExportColumn[];
  data: any[];
  summary?: { [key: string]: any };
  metadata?: { [key: string]: any };
  chartImage?: string | null; // Imagen del gráfico en base64
  chartTitle?: string; // Título del gráfico
}

@Injectable({
  providedIn: 'root'
})
export class ExportService {

  constructor() { }

  /**
   * Exporta datos a PDF usando jsPDF con estética de Recitapp
   */
  async exportToPDF(exportData: ExportData): Promise<void> {
    try {
      // Importar jsPDF y autoTable dinámicamente
      const jsPDFModule = await import('jspdf');
      const autoTableModule = await import('jspdf-autotable');
      
      // Obtener jsPDF del módulo
      const { jsPDF } = jsPDFModule;
      
      // Crear documento en orientación landscape para mejor legibilidad
      const doc = new jsPDF('l', 'mm', 'a4');
      
             // Colores de Recitapp
       const colors = {
         primary: [34, 197, 94] as [number, number, number],      // #22C55E - Verde principal
         darkBg: [26, 26, 26] as [number, number, number],        // #1A1A1A - Fondo oscuro
         darkCard: [45, 45, 45] as [number, number, number],      // #2D2D2D - Tarjetas oscuras
         lightGray: [248, 249, 250] as [number, number, number],  // Gris claro para alternancia
         white: [255, 255, 255] as [number, number, number],      // Blanco
         darkText: [55, 65, 81] as [number, number, number]       // Texto oscuro legible
       };
      
             // === ENCABEZADO PRINCIPAL ===
       this.addPDFHeader(doc, exportData, colors);
       
              let yPosition = 50;
       
       // === INFORMACIÓN METADATA ===
       if (exportData.metadata) {
         yPosition = this.addPDFMetadata(doc, exportData.metadata, yPosition, colors);
         yPosition += 8;
       }
      
      // === TABLA PRINCIPAL ===
      const tableColumns = exportData.columns.map(col => col.header);
      const tableData = exportData.data.map(row => 
        exportData.columns.map(col => this.formatCellValue(row[col.key], col.type))
      );
      
      const autoTable = autoTableModule.default;
      autoTable(doc, {
        head: [tableColumns],
        body: tableData,
        startY: yPosition,
        styles: {
          fontSize: 9,
          cellPadding: { top: 4, right: 6, bottom: 4, left: 6 },
          textColor: colors.darkText,
          lineColor: colors.darkCard,
          lineWidth: 0.5,
          halign: 'left'
        },
        headStyles: {
          fillColor: colors.primary,
          textColor: colors.white,
          fontStyle: 'bold',
          halign: 'center',
          fontSize: 10
        },
        alternateRowStyles: {
          fillColor: colors.lightGray
        },
        margin: { top: yPosition, left: 14, right: 14 },
        theme: 'grid',
        tableLineColor: colors.darkCard,
        tableLineWidth: 0.5
      });
      
      // === SECCIÓN DE RESUMEN ===
      let finalSummaryY = 0;
      if (exportData.summary) {
        const finalY = (doc as any).lastAutoTable?.finalY || yPosition + 100;
        finalSummaryY = this.addPDFSummary(doc, exportData.summary, finalY + 15, colors);
      }

      // === GRÁFICO (SI ESTÁ DISPONIBLE) ===
      let finalChartY = finalSummaryY;
      if (exportData.chartImage && exportData.chartTitle) {
        finalChartY = this.addPDFChart(doc, exportData.chartImage, exportData.chartTitle, finalSummaryY + 20, colors);
      }
      
      // === PIE DE PÁGINA ===
      this.addPDFFooter(doc, colors, finalChartY);
      
      // Descargar archivo
      const fileName = `RecitApp_${this.sanitizeFileName(exportData.title)}_${this.getDateString()}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      throw new Error('Error al generar el archivo PDF');
    }
  }

  /**
   * Añade encabezado estilizado al PDF (solo ASCII para compatibilidad)
   */
  private addPDFHeader(doc: any, exportData: ExportData, colors: any): void {
    // Fondo del encabezado
    doc.setFillColor(...colors.darkBg);
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    
    // Línea decorativa verde superior
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, doc.internal.pageSize.width, 4, 'F');
    
    // Línea decorativa verde inferior
    doc.setFillColor(...colors.primary);
    doc.rect(0, 36, doc.internal.pageSize.width, 4, 'F');
    
    // Logo/Marca RecitApp
    doc.setTextColor(...colors.primary);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('>> RECITAPP <<', 14, 18);
    
    // Título del reporte
    doc.setTextColor(...colors.white);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(exportData.title.toUpperCase(), 14, 30);
    
    // Subtítulo si existe
    if (exportData.subtitle) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(200, 200, 200);
      // Limpiar emojis y caracteres especiales del subtítulo
      const cleanSubtitle = this.cleanTextForPDF(exportData.subtitle);
      doc.text(cleanSubtitle, 14, 35);
    }
    
    // Fecha en la esquina derecha
    doc.setFontSize(10);
    doc.setTextColor(180, 180, 180);
    const currentDate = new Date().toLocaleDateString('es-AR', {
      year: 'numeric',
      month: '2-digit', 
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
    const dateText = `Generado: ${currentDate}`;
    const dateWidth = doc.getTextWidth(dateText);
    doc.text(dateText, doc.internal.pageSize.width - dateWidth - 14, 25);
  }

  /**
   * Limpia texto removiendo emojis y caracteres especiales para PDF
   */
  private cleanTextForPDF(text: string): string {
    return text
      // Remover emojis y símbolos Unicode
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
      // Remover otros caracteres especiales problemáticos
      .replace(/[^\x00-\x7F]/g, '')
      // Limpiar espacios múltiples
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Añade sección de metadata estilizada con alineación natural
   */
  private addPDFMetadata(doc: any, metadata: any, startY: number, colors: any): number {
    let yPosition = startY;
    
    // Título de la sección
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.darkText);
    doc.text('>> INFORMACION DEL REPORTE', 14, yPosition);
    yPosition += 8;
    
    // Fondo sutil para la metadata
    const metadataHeight = Object.keys(metadata).length * 6 + 8;
    doc.setFillColor(250, 250, 250);
    doc.rect(14, yPosition - 2, doc.internal.pageSize.width - 28, metadataHeight, 'F');
    
    // Borde izquierdo verde
    doc.setFillColor(...colors.primary);
    doc.rect(14, yPosition - 2, 3, metadataHeight, 'F');
    
    // Contenido de metadata con alineación natural
    doc.setFontSize(10);
    doc.setTextColor(...colors.darkText);
    
    const entries = Object.entries(metadata);
    const halfLength = Math.ceil(entries.length / 2);
    
    entries.forEach(([key, value], index) => {
      const isLeftColumn = index < halfLength;
      const columnOffset = isLeftColumn ? 0 : (doc.internal.pageSize.width / 2);
      const rowIndex = isLeftColumn ? index : index - halfLength;
      
      const xPos = 20 + columnOffset;
      const yPos = yPosition + (rowIndex * 6);
      
      // Clave en negrita
      doc.setFont('helvetica', 'bold');
      const labelText = `${key}:`;
      doc.text(labelText, xPos, yPos);
      
      // Valor normal - calcular posición usando ancho real de la etiqueta
      doc.setFont('helvetica', 'normal');
      const labelWidth = doc.getTextWidth(labelText);
      doc.text(String(value), xPos + labelWidth + 5, yPos); // +5 para pequeño espacio
    });
    
    return yPosition + metadataHeight + 5;
  }

  /**
   * Añade sección de resumen estilizada
   */
  private addPDFSummary(doc: any, summary: any, startY: number, colors: any): number {
    // Título del resumen
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.primary);
    doc.text('>> RESUMEN EJECUTIVO', 14, startY);
    
    let yPosition = startY + 10;
    
    // Fondo para el resumen con más altura para acomodar el espacio extra
    const summaryHeight = Object.keys(summary).length * 8 + 18; // +6 más de altura
    doc.setFillColor(...colors.darkBg);
    doc.rect(14, yPosition - 5, doc.internal.pageSize.width - 28, summaryHeight, 'F');
    
    // Borde superior verde
    doc.setFillColor(...colors.primary);
    doc.rect(14, yPosition - 5, doc.internal.pageSize.width - 28, 3, 'F');
    
    // Contenido del resumen con más espacio desde el borde superior
    doc.setFontSize(11);
    doc.setTextColor(...colors.white);
    yPosition += 6; // Espacio adicional entre el borde verde y el primer elemento
    
    Object.entries(summary).forEach(([key, value], index) => {
      const yPos = yPosition + (index * 8);
      
      // Bullet point con símbolo ASCII
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...colors.primary);
      doc.text('*', 18, yPos);
      
      // Texto del resumen
      doc.setTextColor(...colors.white);
      doc.setFont('helvetica', 'bold');
      const labelText = `${key}:`;
      doc.text(labelText, 25, yPos);
      
      doc.setFont('helvetica', 'normal');
      const keyWidth = doc.getTextWidth(labelText);
      doc.text(String(value), 25 + keyWidth + 6, yPos); // +6 para mejor espaciado
    });
    
    // Retornar la posición Y final del resumen
    return yPosition + summaryHeight + 15; // +15 para espacio adicional antes del footer
  }

  /**
   * Añade pie de página estilizado
   */
  private addPDFFooter(doc: any, colors: any, summaryEndY?: number): void {
    const pageCount = doc.getNumberOfPages();
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Línea superior del pie de página - ajustar posición si hay contenido de resumen
      let footerY = doc.internal.pageSize.height - 15;
      if (summaryEndY && summaryEndY > 0) {
        // Si tenemos la posición final del resumen, usar esa más un espacio adicional
        const minFooterY = summaryEndY + 25; // 25pt de espacio mínimo después del resumen
        const maxFooterY = doc.internal.pageSize.height - 15; // Posición máxima (fondo de página)
        footerY = Math.min(minFooterY, maxFooterY);
      }
      
      doc.setDrawColor(...colors.primary);
      doc.setLineWidth(1);
      doc.line(14, footerY - 3, doc.internal.pageSize.width - 14, footerY - 3);
      
      // Información del pie de página
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.darkText);
      
      // Lado izquierdo: Marca
      doc.text('RECITAPP - Sistema de Gestion de Eventos', 14, footerY);
      
      // Centro: Fecha
      const centerText = `Generado el ${new Date().toLocaleDateString('es-AR')}`;
      const centerX = (doc.internal.pageSize.width - doc.getTextWidth(centerText)) / 2;
      doc.text(centerText, centerX, footerY);
      
      // Lado derecho: Numeración
      const pageText = `Pagina ${i} de ${pageCount}`;
      const pageTextWidth = doc.getTextWidth(pageText);
      doc.text(pageText, doc.internal.pageSize.width - 14 - pageTextWidth, footerY);
    }
  }

  /**
   * Exporta datos a Excel usando SheetJS con estética profesional Recitapp
   */
  async exportToExcel(exportData: ExportData): Promise<void> {
    try {
      // Importar SheetJS dinámicamente
      const XLSX = await import('xlsx');
      
      // Crear workbook con propiedades personalizadas
      const wb = XLSX.utils.book_new();
      wb.Props = {
        Title: `RecitApp - ${exportData.title}`,
        Subject: exportData.subtitle || 'Reporte de sistema',
        Author: 'RecitApp',
        Company: 'RecitApp - Sistema de Gestión de Eventos',
        CreatedDate: new Date()
      };
      
             // === HOJA PRINCIPAL: DATOS ===
       const mainSheetData = this.createMainExcelSheet(exportData);
       const ws = XLSX.utils.aoa_to_sheet(mainSheetData);
       
       // Configurar anchos de columna optimizados y text wrap
       const colWidths = this.calculateExcelColumnWidths(exportData, mainSheetData);
       ws['!cols'] = colWidths;
       
       // Aplicar estilos profesionales de Recitapp
       this.applyRecitappExcelStyles(ws, mainSheetData, XLSX, 'main');
      
      // Añadir la hoja principal
      XLSX.utils.book_append_sheet(wb, ws, 'Datos Principales');
      
             // === HOJA ADICIONAL: RESUMEN EJECUTIVO ===
       if (exportData.summary) {
         const summarySheetData = this.createSummaryExcelSheet(exportData);
         const wsSummary = XLSX.utils.aoa_to_sheet(summarySheetData);
         wsSummary['!cols'] = [{ wch: 40 }, { wch: 30 }];
         this.applyRecitappExcelStyles(wsSummary, summarySheetData, XLSX, 'summary');
         XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen');
       }
       
       // === HOJA ADICIONAL: INFORMACIÓN TÉCNICA ===
       const infoSheetData = this.createInfoExcelSheet(exportData);
       const wsInfo = XLSX.utils.aoa_to_sheet(infoSheetData);
       wsInfo['!cols'] = [{ wch: 35 }, { wch: 45 }];
       this.applyRecitappExcelStyles(wsInfo, infoSheetData, XLSX, 'info');
       XLSX.utils.book_append_sheet(wb, wsInfo, 'Informacion');
      
      // Descargar archivo con nombre mejorado
      const fileName = `RecitApp_${this.sanitizeFileName(exportData.title)}_${this.getDateString()}.xlsx`;
      XLSX.writeFile(wb, fileName);
      
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      throw new Error('Error al generar el archivo Excel');
    }
  }

  /**
   * Crea la hoja principal de datos para Excel con estética Recitapp
   */
  private createMainExcelSheet(exportData: ExportData): any[][] {
    const worksheetData: any[][] = [];
    
    // === ENCABEZADO PRINCIPAL ESTILIZADO ===
    worksheetData.push(['>> RECITAPP - SISTEMA DE GESTION DE EVENTOS <<']);
    worksheetData.push([exportData.title.toUpperCase()]);
    worksheetData.push(['='.repeat(70)]);
    worksheetData.push([]);
    
    // === INFORMACIÓN BÁSICA CON MEJOR FORMATO ===
    if (exportData.subtitle) {
      const cleanSubtitle = this.cleanTextForPDF(exportData.subtitle);
      worksheetData.push(['DESCRIPCION:', cleanSubtitle]);
      worksheetData.push([]);
    }
    
    worksheetData.push(['FECHA DE GENERACION:', new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })]);
    worksheetData.push(['TOTAL DE REGISTROS:', exportData.data.length]);
    
    // === METADATA ADICIONAL SI EXISTE ===
    if (exportData.metadata) {
      worksheetData.push([]);
      worksheetData.push(['>> INFORMACION DEL REPORTE']);
      worksheetData.push(['-'.repeat(40)]);
      Object.entries(exportData.metadata).forEach(([key, value]) => {
        worksheetData.push([`${key}:`, value]);
      });
    }
    
    worksheetData.push([]);
    worksheetData.push([]);
    
    // === SEPARADOR ESTILIZADO PARA DATOS ===
    worksheetData.push(['='.repeat(70)]);
    worksheetData.push(['>> DATOS DETALLADOS']);
    worksheetData.push(['='.repeat(70)]);
    worksheetData.push([]);
    
    // === ENCABEZADOS DE TABLA ESTILIZADOS ===
    const headers = exportData.columns.map(col => `> ${col.header}`);
    worksheetData.push(headers);
    
    // === LÍNEA SEPARADORA MEJORADA ===
    worksheetData.push(exportData.columns.map(() => '-'.repeat(20)));
    
    // === DATOS PRINCIPALES FORMATEADOS ===
    exportData.data.forEach((row, index) => {
      const rowData = exportData.columns.map(col => {
        const value = row[col.key];
        
        // Formatear según el tipo de columna
        switch (col.type) {
          case 'currency':
            const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
            return numValue; // Excel manejará el formato de moneda
          case 'percentage':
            const pctValue = typeof value === 'number' ? value : parseFloat(value) || 0;
            return pctValue;
          case 'number':
            return typeof value === 'number' ? value : parseFloat(value) || 0;
          case 'date':
            if (value instanceof Date) return value;
            if (typeof value === 'string') {
              const date = new Date(value);
              return isNaN(date.getTime()) ? value : date;
            }
            return value;
          default:
            // Limpiar texto de emojis y caracteres especiales
            return typeof value === 'string' ? this.cleanTextForPDF(value) : (value || '');
        }
      });
      worksheetData.push(rowData);
    });
    
    // === PIE DE DATOS CON INFORMACIÓN ADICIONAL ===
    worksheetData.push([]);
    worksheetData.push(['-'.repeat(70)]);
    worksheetData.push(['GENERADO POR RECITAPP', `Fecha: ${new Date().toLocaleDateString('es-AR')}`]);
    
    return worksheetData;
  }

  /**
   * Crea hoja de resumen ejecutivo para Excel con estética Recitapp
   */
  private createSummaryExcelSheet(exportData: ExportData): any[][] {
    const worksheetData: any[][] = [];
    
    // === ENCABEZADO PRINCIPAL ESTILIZADO ===
    worksheetData.push(['>> RECITAPP - RESUMEN EJECUTIVO <<']);
    worksheetData.push(['='.repeat(60)]);
    worksheetData.push([]);
    
    // === INFORMACIÓN DEL REPORTE ===
    worksheetData.push(['>> INFORMACION DEL REPORTE']);
    worksheetData.push(['-'.repeat(40)]);
    worksheetData.push(['REPORTE:', exportData.title]);
    worksheetData.push(['GENERADO:', new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })]);
    if (exportData.subtitle) {
      worksheetData.push(['DESCRIPCION:', this.cleanTextForPDF(exportData.subtitle)]);
    }
    worksheetData.push([]);
    
    // === MÉTRICAS PRINCIPALES CON MEJOR FORMATO ===
    worksheetData.push(['='.repeat(60)]);
    worksheetData.push(['>> METRICAS PRINCIPALES']);
    worksheetData.push(['='.repeat(60)]);
    worksheetData.push([]);
    
    if (exportData.summary) {
      Object.entries(exportData.summary).forEach(([key, value]) => {
        worksheetData.push([`* ${key}:`, value]);
      });
    }
    
    worksheetData.push([]);
    
    // === ANÁLISIS DE DATOS ===
    worksheetData.push(['='.repeat(60)]);
    worksheetData.push(['>> ANALISIS DE DATOS']);
    worksheetData.push(['='.repeat(60)]);
    worksheetData.push([]);
    
    worksheetData.push(['Total de registros analizados:', exportData.data.length]);
    worksheetData.push(['Columnas de datos:', exportData.columns.length]);
    worksheetData.push(['Hora de procesamiento:', new Date().toLocaleTimeString('es-AR')]);
    
    // === INFORMACIÓN DE COLUMNAS ===
    if (exportData.columns && exportData.columns.length > 0) {
      worksheetData.push([]);
      worksheetData.push(['>> ESTRUCTURA DE DATOS']);
      worksheetData.push(['-'.repeat(40)]);
      exportData.columns.forEach((col, index) => {
        worksheetData.push([`Columna ${index + 1}:`, `${col.header} (${col.type || 'texto'})`]);
      });
    }
    
    // === PIE CON INFORMACIÓN DEL SISTEMA ===
    worksheetData.push([]);
    worksheetData.push(['-'.repeat(60)]);
    worksheetData.push(['GENERADO POR RECITAPP - SISTEMA DE GESTION DE EVENTOS']);
    worksheetData.push([`Procesado el ${new Date().toLocaleDateString('es-AR')} a las ${new Date().toLocaleTimeString('es-AR')}`]);
    
    return worksheetData;
  }

  /**
   * Crea hoja de información técnica para Excel con estética Recitapp
   */
  private createInfoExcelSheet(exportData: ExportData): any[][] {
    const worksheetData: any[][] = [];
    
    // === ENCABEZADO PRINCIPAL ESTILIZADO ===
    worksheetData.push(['>> RECITAPP - INFORMACION TECNICA <<']);
    worksheetData.push(['='.repeat(70)]);
    worksheetData.push([]);
    
    // === INFORMACIÓN DEL SISTEMA CON MEJOR FORMATO ===
    worksheetData.push(['>> INFORMACION DEL SISTEMA']);
    worksheetData.push(['='.repeat(50)]);
    worksheetData.push(['Aplicacion:', 'RecitApp - Sistema de Gestion de Eventos']);
    worksheetData.push(['Version:', '2.1.4 - Edicion Estilizada']);
    worksheetData.push(['Formato de exportacion:', 'Microsoft Excel (.xlsx)']);
    worksheetData.push(['Codificacion:', 'UTF-8']);
    worksheetData.push(['Fecha de generacion:', new Date().toLocaleDateString('es-AR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })]);
    worksheetData.push([]);
    
    // === METADATA DEL REPORTE ESTILIZADA ===
    if (exportData.metadata) {
      worksheetData.push(['>> PARAMETROS DEL REPORTE']);
      worksheetData.push(['='.repeat(50)]);
      Object.entries(exportData.metadata).forEach(([key, value]) => {
        worksheetData.push([`${key}:`, String(value)]);
      });
      worksheetData.push([]);
    }
    
    // === ESTRUCTURA DE DATOS MEJORADA ===
    worksheetData.push(['>> ESTRUCTURA DE DATOS']);
    worksheetData.push(['='.repeat(50)]);
    worksheetData.push(['Total de columnas:', exportData.columns.length]);
    worksheetData.push(['Total de registros:', exportData.data.length]);
    worksheetData.push([]);
    
    worksheetData.push(['>> DETALLE DE COLUMNAS']);
    worksheetData.push(['-'.repeat(40)]);
    exportData.columns.forEach((col, index) => {
      worksheetData.push([
        `Columna ${index + 1}:`,
        `${col.header} (${col.type || 'texto'})`
      ]);
    });
    worksheetData.push([]);
    
    // === CONFIGURACIÓN REGIONAL ===
    worksheetData.push(['>> CONFIGURACION REGIONAL']);
    worksheetData.push(['='.repeat(50)]);
    worksheetData.push(['* Pais:', 'Argentina']);
    worksheetData.push(['* Idioma:', 'Español (Argentina)']);
    worksheetData.push(['* Formato de fechas:', 'DD/MM/AAAA']);
    worksheetData.push(['* Formato de moneda:', 'Peso Argentino (ARS)']);
    worksheetData.push(['* Zona horaria:', 'UTC-3 (Argentina)']);
    worksheetData.push(['* Separador decimal:', 'Coma (,)']);
    worksheetData.push(['* Separador de miles:', 'Punto (.)']);
    worksheetData.push([]);
    
    // === INFORMACIÓN TÉCNICA AVANZADA ===
    worksheetData.push(['>> INFORMACION TECNICA']);
    worksheetData.push(['='.repeat(50)]);
    worksheetData.push(['* Estado de datos:', 'Actualizados en tiempo real']);
    worksheetData.push(['* Método de exportación:', 'SheetJS (xlsx)']);
    worksheetData.push(['* Compatibilidad:', 'Excel 2007+ / LibreOffice / Google Sheets']);
    worksheetData.push(['* Tamaño del archivo:', 'Optimizado automáticamente']);
    worksheetData.push(['* Codificación de caracteres:', 'UTF-8']);
    worksheetData.push([]);
    
    // === PIE CON INFORMACIÓN DE CONTACTO ===
    worksheetData.push(['='.repeat(70)]);
    worksheetData.push(['RECITAPP - SISTEMA PROFESIONAL DE GESTION DE EVENTOS']);
    worksheetData.push(['Reporte generado automáticamente']);
    worksheetData.push([`Procesado: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR')}`]);
    
    return worksheetData;
  }

  /**
   * Calcula anchos óptimos para columnas de Excel con mejor distribución
   */
  private calculateExcelColumnWidths(exportData: ExportData, sheetData: any[][]): any[] {
    // Si no hay columnas de datos, usar anchos por defecto para la hoja informativa
    if (!exportData.columns || exportData.columns.length === 0) {
      return [
        { wch: 35 }, // Primera columna más ancha para etiquetas
        { wch: 45 }  // Segunda columna para valores
      ];
    }

    const maxWidths = exportData.columns.map((col, colIndex) => {
      // Comenzar con el ancho del header (sin prefijo "> ")
      let maxWidth = col.header.length + 2;
      
      // Verificar el ancho de los datos en esta columna
      exportData.data.forEach(row => {
        const value = row[col.key];
        let strValue = String(value || '');
        
        // Formatear valores según tipo para calcular ancho real
        if (col.type === 'currency' && typeof value === 'number') {
          strValue = `$ ${value.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`;
        } else if (col.type === 'percentage' && typeof value === 'number') {
          strValue = `${(value * 100).toFixed(2)}%`;
        } else if (col.type === 'date' && value instanceof Date) {
          strValue = value.toLocaleDateString('es-AR');
        }
        
        maxWidth = Math.max(maxWidth, strValue.length);
      });
      
      // Aplicar límites específicos por tipo de columna
      let minWidth, maxWidthLimit;
      switch (col.type) {
        case 'currency':
          minWidth = 15;
          maxWidthLimit = 20;
          break;
        case 'number':
          minWidth = 10;
          maxWidthLimit = 15;
          break;
        case 'date':
          minWidth = 12;
          maxWidthLimit = 18;
          break;
        default:
          minWidth = 12;
          maxWidthLimit = 40;
      }
      
      return { wch: Math.min(Math.max(maxWidth, minWidth), maxWidthLimit) };
    });
    
    return maxWidths;
  }

  /**
   * Aplica estilos profesionales de Recitapp a las hojas de Excel
   */
  private applyRecitappExcelStyles(ws: any, sheetData: any[][], XLSX: any, sheetType: 'main' | 'summary' | 'info'): void {
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    
    // Colores de Recitapp en formato RGB
    const colors = {
      primary: '22C55E',      // Verde Recitapp
      darkBg: '1A1A1A',       // Gris muy oscuro
      mediumBg: '2D2D2D',     // Gris oscuro
      white: 'FFFFFF',        // Blanco
      lightGray: 'F8F9FA',    // Gris claro
      textDark: '374151'      // Texto oscuro
    };
    
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
        const cell = ws[cellAddress];
        
        if (cell && cell.v) {
          const cellValue = String(cell.v);
          
          if (!cell.s) cell.s = {};
          
          // === ESTILOS PARA TÍTULOS PRINCIPALES (>>) ===
          if (cellValue.startsWith('>> RECITAPP') || cellValue.includes('SISTEMA DE GESTION')) {
            cell.s = {
              font: { bold: true, size: 16, color: { rgb: colors.white } },
              fill: { fgColor: { rgb: colors.primary } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              border: {
                top: { style: 'thick', color: { rgb: colors.darkBg } },
                bottom: { style: 'thick', color: { rgb: colors.darkBg } },
                left: { style: 'thick', color: { rgb: colors.darkBg } },
                right: { style: 'thick', color: { rgb: colors.darkBg } }
              }
            };
          }
          
          // === ESTILOS PARA SUBTÍTULOS (>>) ===
          else if (cellValue.startsWith('>>')) {
            cell.s = {
              font: { bold: true, size: 12, color: { rgb: colors.primary } },
              fill: { fgColor: { rgb: colors.lightGray } },
              alignment: { horizontal: 'left', vertical: 'center', wrapText: true },
              border: {
                bottom: { style: 'medium', color: { rgb: colors.primary } }
              }
            };
          }
          
          // === ESTILOS PARA SEPARADORES (= y -) ===
          else if (cellValue.startsWith('=') || cellValue.startsWith('-')) {
            cell.s = {
              font: { bold: true, color: { rgb: colors.primary } },
              fill: { fgColor: { rgb: colors.mediumBg } },
              alignment: { horizontal: 'center', vertical: 'center' }
            };
          }
          
          // === ESTILOS PARA ENCABEZADOS DE TABLA (>) ===
          else if (cellValue.startsWith('>') && sheetType === 'main') {
            cell.s = {
              font: { bold: true, size: 11, color: { rgb: colors.white } },
              fill: { fgColor: { rgb: colors.darkBg } },
              alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
              border: {
                top: { style: 'medium', color: { rgb: colors.primary } },
                bottom: { style: 'medium', color: { rgb: colors.primary } },
                left: { style: 'thin', color: { rgb: colors.mediumBg } },
                right: { style: 'thin', color: { rgb: colors.mediumBg } }
              }
            };
          }
          
          // === ESTILOS PARA ELEMENTOS CON ASTERISCO (*) ===
          else if (cellValue.startsWith('*')) {
            cell.s = {
              font: { bold: true, color: { rgb: colors.primary } },
              alignment: { horizontal: 'left', vertical: 'center', wrapText: true }
            };
          }
          
          // === ESTILOS PARA ETIQUETAS (terminan en :) ===
          else if (cellValue.endsWith(':') && cellValue.length < 50) {
            cell.s = {
              font: { bold: true, color: { rgb: colors.textDark } },
              alignment: { horizontal: 'left', vertical: 'center', wrapText: true }
            };
          }
          
          // === ESTILOS PARA DATOS NUMÉRICOS Y MONEDA ===
          else if (typeof cell.v === 'number' || cellValue.includes('$') || cellValue.includes('%')) {
            cell.s = {
              font: { color: { rgb: colors.textDark } },
              alignment: { horizontal: 'right', vertical: 'center' },
              fill: { fgColor: { rgb: colors.lightGray } }
            };
          }
          
          // === ESTILOS GENERALES PARA DATOS ===
          else {
            cell.s = {
              font: { color: { rgb: colors.textDark } },
              alignment: { horizontal: 'left', vertical: 'center', wrapText: true }
            };
          }
          
          // Aplicar text wrap automático para textos largos
          if (cellValue.length > 30 || cellValue.includes('\n')) {
            if (!cell.s.alignment) cell.s.alignment = {};
            cell.s.alignment.wrapText = true;
          }
        }
      }
    }
    
    // === CONFIGURAR ALTURAS DE FILA ===
    if (!ws['!rows']) ws['!rows'] = [];
    for (let i = 0; i <= range.e.r; i++) {
      if (!ws['!rows'][i]) ws['!rows'][i] = {};
      
      const rowData = sheetData[i];
      if (rowData && rowData[0]) {
        const firstCellValue = String(rowData[0]);
        
        if (firstCellValue.startsWith('>> RECITAPP') || firstCellValue.includes('SISTEMA DE GESTION')) {
          ws['!rows'][i].hpt = 25; // Extra altura para título principal
        } else if (firstCellValue.startsWith('>>')) {
          ws['!rows'][i].hpt = 20; // Altura mayor para subtítulos
        } else if (firstCellValue.startsWith('=') || firstCellValue.startsWith('-')) {
          ws['!rows'][i].hpt = 16; // Altura media para separadores
        } else if (firstCellValue.startsWith('>')) {
          ws['!rows'][i].hpt = 18; // Altura para encabezados de tabla
        } else {
          ws['!rows'][i].hpt = 15; // Altura normal mejorada
        }
      }
    }
  }

  /**
   * Formatea el valor de una celda según su tipo
   */
  private formatCellValue(value: any, type?: string): string {
    if (value === null || value === undefined) {
      return '-';
    }
    
    switch (type) {
      case 'currency':
        const numValue = typeof value === 'number' ? value : parseFloat(value);
        return new Intl.NumberFormat('es-AR', { 
          style: 'currency', 
          currency: 'ARS' 
        }).format(numValue || 0);
      
      case 'percentage':
        const pctValue = typeof value === 'number' ? value : parseFloat(value);
        return new Intl.NumberFormat('es-AR', { 
          style: 'percent', 
          minimumFractionDigits: 1,
          maximumFractionDigits: 2 
        }).format(pctValue || 0);
      
      case 'number':
        const numberValue = typeof value === 'number' ? value : parseFloat(value);
        return new Intl.NumberFormat('es-AR').format(numberValue || 0);
      
      case 'date':
        if (value instanceof Date) {
          return value.toLocaleDateString('es-AR');
        }
        if (typeof value === 'string') {
          const date = new Date(value);
          return isNaN(date.getTime()) ? value : date.toLocaleDateString('es-AR');
        }
        return value.toString();
      
      default:
        return value.toString();
    }
  }

  /**
   * Sanitiza el nombre del archivo
   */
  private sanitizeFileName(fileName: string): string {
    return fileName
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remover acentos
      .replace(/[^a-zA-Z0-9\s-_]/g, '') // Remover caracteres especiales
      .replace(/\s+/g, '_') // Reemplazar espacios con guiones bajos
      .toLowerCase();
  }

  /**
   * Agrega gráfico al PDF
   */
  private addPDFChart(doc: any, chartImage: string, chartTitle: string, startY: number, colors: any): number {
    let yPosition = startY;

    // Verificar si necesitamos una nueva página
    if (yPosition > 180) {
      doc.addPage();
      yPosition = 50;
    }

    // Título del gráfico
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...colors.primary);
    doc.text(chartTitle, 20, yPosition);
    yPosition += 15;

    try {
      // Dimensiones del gráfico (mantener proporción 2:1)
      const chartWidth = 240; // Ancho máximo para landscape
      const chartHeight = 120; // Alto proporcional

      // Centrar el gráfico horizontalmente
      const xPosition = (297 - chartWidth) / 2; // 297 es el ancho de A4 landscape

      // Verificar si el gráfico cabe en la página actual
      if (yPosition + chartHeight > 200) {
        doc.addPage();
        yPosition = 50;
        
        // Repetir título en nueva página
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...colors.primary);
        doc.text(chartTitle, 20, yPosition);
        yPosition += 15;
      }

      // Agregar la imagen del gráfico
      doc.addImage(chartImage, 'PNG', xPosition, yPosition, chartWidth, chartHeight);
      yPosition += chartHeight + 15;

      // Agregar nota explicativa
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...colors.darkText);
      const noteText = 'Gráfico generado automáticamente a partir de los datos del reporte';
      const noteWidth = doc.getTextWidth(noteText);
      const noteX = (297 - noteWidth) / 2;
      doc.text(noteText, noteX, yPosition);
      yPosition += 10;

    } catch (error) {
      console.warn('Error al agregar gráfico al PDF:', error);
      
      // Fallback: mostrar mensaje explicativo
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      doc.setTextColor(100, 100, 100);
      doc.text('Gráfico no disponible en esta versión del reporte', 20, yPosition);
      yPosition += 15;
    }

    return yPosition + 10; // Espacio adicional después del gráfico
  }

  /**
   * Obtiene string de fecha para nombres de archivo
   */
  private getDateString(): string {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
  }

  /**
   * Instala las dependencias necesarias si no están presentes
   */
  async installDependencies(): Promise<void> {
    try {
      await import('jspdf');
      await import('jspdf-autotable');
      await import('xlsx');
    } catch (error) {
      console.warn('Algunas dependencias de exportación no están disponibles:', error);
      throw new Error('Dependencias de exportación no disponibles. Contacte al administrador.');
    }
  }
} 