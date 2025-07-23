import { Component, OnInit, inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { Chart, registerables } from 'chart.js';
import { TransactionService } from '../../services/transaction.service';
import {
  TransactionReportDTO,
  TransactionStatisticsDTO,
} from '../../models/dto';
import { ExportService } from '../../../../shared/services/export.service';

@Component({
  selector: 'app-transaction-report',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './transaction-report.component.html',
  styleUrl: './transaction-report.component.scss',
})
export class TransactionReportComponent implements OnInit, AfterViewInit {
  @ViewChild('timeSegmentChart', { static: false }) timeSegmentChart?: ElementRef<HTMLCanvasElement>;
  
  reportForm!: FormGroup;
  reportData$!: Observable<TransactionStatisticsDTO | null>;
  errorMessage: string | null = null;
  isLoading = false;
  currentReportData: TransactionStatisticsDTO | null = null;
  private chart?: any; // Cambiado temporalmente

  // Method to use Object.keys in the template
  objectKeys = Object.keys;

  reportTypes: { value: TransactionReportDTO['reportType']; label: string }[] = [
    { value: 'ALL', label: 'Todos los Reportes' },
    { value: 'USER', label: 'Por Usuario' },
    { value: 'PAYMENT_METHOD', label: 'Por Método de Pago' },
    { value: 'STATUS', label: 'Por Estado' },
  ];

  transactionStatuses: string[] = [
    'INICIADA',
    'COMPLETADA',
    'FALLIDA',
    'REEMBOLSADA',
    'CANCELADA',
    'PENDIENTE',
  ];

  paymentMethods: { id: number; name: string }[] = [
    { id: 1, name: 'Tarjeta de Crédito' },
    { id: 2, name: 'PayPal' },
    { id: 3, name: 'Transferencia Bancaria' },
  ];

  private fb = inject(FormBuilder);
  private transactionService = inject(TransactionService);
  private exportService = inject(ExportService);

  ngOnInit(): void {
    // Registrar componentes de Chart.js
    Chart.register(...registerables);
    console.log('✅ Chart.js registrado exitosamente');
    
    this.reportForm = this.fb.group({
      reportType: ['ALL' as TransactionReportDTO['reportType'], Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      userId: [null as number | null],
      paymentMethodId: [null as number | null],
      statusName: ['' as string | null],
    });

    this.reportForm.get('reportType')?.valueChanges.subscribe((type) => {
      const userIdControl = this.reportForm.get('userId');
      const paymentMethodIdControl = this.reportForm.get('paymentMethodId');
      const statusNameControl = this.reportForm.get('statusName');

      userIdControl?.clearValidators();
      paymentMethodIdControl?.clearValidators();
      statusNameControl?.clearValidators();

      if (type === 'USER') {
        userIdControl?.setValidators(Validators.required);
      } else if (type === 'PAYMENT_METHOD') {
        paymentMethodIdControl?.setValidators(Validators.required);
      } else if (type === 'STATUS') {
        statusNameControl?.setValidators(Validators.required);
      }

      userIdControl?.updateValueAndValidity();
      paymentMethodIdControl?.updateValueAndValidity();
      statusNameControl?.updateValueAndValidity();
    });
  }

  ngAfterViewInit(): void {
    // Chart will be created when data is available
  }



  getReportTypeLabel(reportType: string): string {
    const type = this.reportTypes.find(t => t.value === reportType);
    return type ? type.label : reportType;
  }

  generateReport(): void {
    if (this.reportForm.invalid) {
      this.errorMessage = 'Por favor completa todos los campos requeridos para el tipo de reporte seleccionado.';
      this.reportForm.markAllAsTouched();
      Object.keys(this.reportForm.controls).forEach(key => {
        const controlErrors = this.reportForm.get(key)?.errors;
        if (controlErrors != null) {
          console.error('Key: ' + key + ', Error: ', controlErrors);
        }
      });
      return;
    }
    this.errorMessage = null;
    this.isLoading = true;
    this.reportData$ = of(null);

    const formValue = this.reportForm.value;

    if (formValue.startDate && formValue.endDate && formValue.endDate < formValue.startDate) {
      this.errorMessage = 'La fecha de fin no puede ser anterior a la fecha de inicio.';
      this.isLoading = false;
      return;
    }

    // Agregar tiempo a las fechas para coincidir con el formato LocalDateTime esperado por el backend
    const startDateWithTime = formValue.startDate ? `${formValue.startDate}T00:00:00` : '';
    const endDateWithTime = formValue.endDate ? `${formValue.endDate}T23:59:59` : '';

    const reportDTO: TransactionReportDTO = {
      reportType: formValue.reportType,
      startDate: startDateWithTime,
      endDate: endDateWithTime,
      userId: formValue.reportType === 'USER' && formValue.userId ? Number(formValue.userId) : undefined,
      paymentMethodId: formValue.reportType === 'PAYMENT_METHOD' && formValue.paymentMethodId ? Number(formValue.paymentMethodId) : undefined,
      statusName: formValue.reportType === 'STATUS' && formValue.statusName ? formValue.statusName : undefined,
    };

    this.reportData$ = this.transactionService
      .generateTransactionReport(reportDTO)
      .pipe(
        tap((data) => {
          this.isLoading = false;
          this.currentReportData = data;
          if (data) {
            this.updateChart(data);
          }
        }),
        catchError((err) => {
          console.error('Error generating transaction report:', err);
          this.errorMessage =
            err.error?.message || err.message || 'Error al generar el reporte de transacciones. Por favor intenta de nuevo.';
          this.isLoading = false;
          this.currentReportData = null;
          return of(null);
        })
      );
  }

  async exportToPDF(): Promise<void> {
    if (!this.currentReportData) {
      console.warn('No hay reporte disponible para exportar');
      return;
    }

    try {
      const stats = this.currentReportData;
      
      // Preparar datos principales
      const mainData = [
        { label: 'Total de Transacciones', value: stats.totalTransactions },
        { label: 'Monto Total', value: stats.totalAmount },
        { label: 'Monto Promedio', value: stats.averageAmount },
        { label: 'Monto Máximo', value: stats.maxAmount },
        { label: 'Monto Mínimo', value: stats.minAmount }
      ];

      // Combinar todos los datos disponibles
      let allData = [...mainData];
      
      // Agregar separador y datos por estado si existen
      if (stats.transactionsByStatus && this.objectKeys(stats.transactionsByStatus).length > 0) {
        allData.push({ label: '=== DISTRIBUCIÓN POR ESTADO ===', value: 0 });
        this.objectKeys(stats.transactionsByStatus).forEach(status => {
          allData.push({ label: `${status} - Cantidad`, value: stats.transactionsByStatus[status] });
          allData.push({ label: `${status} - Monto`, value: stats.amountByStatus[status] });
        });
      }
      
      // Agregar separador y datos por método de pago si existen
      if (stats.transactionsByPaymentMethod && this.objectKeys(stats.transactionsByPaymentMethod).length > 0) {
        allData.push({ label: '=== DISTRIBUCIÓN POR MÉTODO DE PAGO ===', value: 0 });
        this.objectKeys(stats.transactionsByPaymentMethod).forEach(method => {
          allData.push({ label: `${method} - Cantidad`, value: stats.transactionsByPaymentMethod[method] });
          allData.push({ label: `${method} - Monto`, value: stats.amountByPaymentMethod[method] });
        });
      }
      
      // Agregar datos de segmentos de tiempo si existen
      if (stats.timeSegmentStatistics && stats.timeSegmentStatistics.length > 0) {
        allData.push({ label: '=== ANÁLISIS TEMPORAL ===', value: 0 });
        stats.timeSegmentStatistics.forEach((segment, index) => {
          const segmentLabel = `Período ${index + 1}`;
          allData.push({ label: `${segmentLabel} - Transacciones`, value: segment.transactionCount });
          allData.push({ label: `${segmentLabel} - Monto Total`, value: segment.totalAmount });
        });
      }

      // Capturar imagen del gráfico si está disponible
      const chartImage = this.getChartImage();

      const exportData = {
        title: 'Reporte de Transacciones',
        subtitle: `Tipo: ${this.getReportTypeLabel(stats.reportType)} | Período: ${new Date(stats.startDate).toLocaleDateString('es-AR')} - ${new Date(stats.endDate).toLocaleDateString('es-AR')}`,
        metadata: {
          'Fecha de Generación': new Date(stats.generatedDate).toLocaleDateString('es-AR'),
          'Tipo de Reporte': this.getReportTypeLabel(stats.reportType),
          'Usuario': stats.userName || 'N/A',
          'Método de Pago': stats.paymentMethodName || 'MERCADOPAGO',
          'Estado': stats.statusName || 'N/A'
        },
        columns: [
          { header: 'Métrica', key: 'label', width: 30 },
          { header: 'Valor', key: 'value', width: 20, type: 'currency' as const }
        ],
        data: allData,
        chartImage: chartImage, // Incluir imagen del gráfico
        chartTitle: 'Gráfico de Transacciones por Día',
        summary: {
          'Total Transacciones': stats.totalTransactions,
          'Monto Total': new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(stats.totalAmount),
          'Promedio por Transacción': new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(stats.averageAmount)
        }
      };

      await this.exportService.exportToPDF(exportData);
    } catch (error) {
      console.error('Error al exportar PDF:', error);
      alert('Error al generar el archivo PDF. Por favor, inténtelo de nuevo.');
    }
  }

  async exportToExcel(): Promise<void> {
    if (!this.currentReportData) {
      console.warn('No hay reporte disponible para exportar');
      return;
    }

    try {
      const stats = this.currentReportData;
      
      // Datos del resumen
      const summaryData = [
        { metrica: 'Total de Transacciones', valor: stats.totalTransactions, tipo: 'Resumen' },
        { metrica: 'Monto Total', valor: stats.totalAmount, tipo: 'Resumen' },
        { metrica: 'Monto Promedio', valor: stats.averageAmount, tipo: 'Resumen' },
        { metrica: 'Monto Máximo', valor: stats.maxAmount, tipo: 'Resumen' },
        { metrica: 'Monto Mínimo', valor: stats.minAmount, tipo: 'Resumen' }
      ];

      // Agregar datos por estado si existen
      if (stats.transactionsByStatus && this.objectKeys(stats.transactionsByStatus).length > 0) {
        this.objectKeys(stats.transactionsByStatus).forEach(status => {
          summaryData.push({
            metrica: `Transacciones por Estado - ${status}`,
            valor: stats.transactionsByStatus[status],
            tipo: 'Por Estado'
          });
        });
      }

      // Agregar datos por método de pago si existen
      if (stats.transactionsByPaymentMethod && this.objectKeys(stats.transactionsByPaymentMethod).length > 0) {
        this.objectKeys(stats.transactionsByPaymentMethod).forEach(method => {
          summaryData.push({
            metrica: `Transacciones por Método - ${method}`,
            valor: stats.transactionsByPaymentMethod[method],
            tipo: 'Por Método de Pago'
          });
        });
      }

      // Agregar segmentos de tiempo si existen
      if (stats.timeSegmentStatistics && stats.timeSegmentStatistics.length > 0) {
        stats.timeSegmentStatistics.forEach((segment, index) => {
          summaryData.push({
            metrica: `Segmento ${index + 1} - Cantidad`,
            valor: segment.transactionCount,
            tipo: 'Segmento de Tiempo'
          });
          summaryData.push({
            metrica: `Segmento ${index + 1} - Monto`,
            valor: segment.totalAmount,
            tipo: 'Segmento de Tiempo'
          });
        });
      }

      const exportData = {
        title: 'Reporte de Transacciones',
        subtitle: `Tipo: ${this.getReportTypeLabel(stats.reportType)}`,
        metadata: {
          'Fecha de Generación': new Date(stats.generatedDate).toLocaleDateString('es-AR'),
          'Período Inicio': new Date(stats.startDate).toLocaleDateString('es-AR'),
          'Período Fin': new Date(stats.endDate).toLocaleDateString('es-AR'),
          'Tipo de Reporte': this.getReportTypeLabel(stats.reportType),
          'Usuario': stats.userName || 'N/A',
          'ID Usuario': stats.userId || 'N/A',
          'Método de Pago': stats.paymentMethodName || 'N/A',
          'Estado': stats.statusName || 'N/A'
        },
        columns: [
          { header: 'Métrica', key: 'metrica', width: 40 },
          { header: 'Valor', key: 'valor', width: 20, type: 'number' as const },
          { header: 'Categoría', key: 'tipo', width: 25 }
        ],
        data: summaryData
      };

      await this.exportService.exportToExcel(exportData);
    } catch (error) {
      console.error('Error al exportar Excel:', error);
      alert('Error al generar el archivo Excel. Por favor, inténtelo de nuevo.');
    }
  }

  /**
   * Crea el gráfico de barras para segmentos de tiempo
   */
  private createTimeSegmentChart(timeSegments: any[]): void {
    if (!this.timeSegmentChart || !timeSegments || timeSegments.length === 0) {
      return;
    }

    // Chart.js está importado estáticamente, siempre disponible
    console.log('📊 Creando gráfico de barras con Chart.js');

    // Destruir gráfico anterior si existe
    if (this.chart) {
      this.chart.destroy();
    }

    const ctx = this.timeSegmentChart.nativeElement.getContext('2d');
    if (!ctx) return;

    // Preparar datos para el gráfico
    const labels = timeSegments.map(segment => {
      const date = new Date(segment.segmentStart);
      return date.toLocaleDateString('es-AR', { 
        month: 'short', 
        day: 'numeric' 
      });
    });

    const transactionData = timeSegments.map(segment => segment.transactionCount);
    const amountData = timeSegments.map(segment => segment.totalAmount);

    // Configuración del gráfico (tipado como any para evitar problemas de tipos complejos)
    const chartData: any = {
      labels: labels,
      datasets: [
        {
          label: 'Cantidad de Transacciones',
          data: transactionData,
          backgroundColor: '#22C55E',
          borderColor: '#16A34A',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Monto Total (ARS)',
          data: amountData,
          backgroundColor: '#3B82F6',
          borderColor: '#2563EB',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    };

    const chartOptions: any = {
      responsive: true,
      plugins: {
        title: {
          display: true,
          text: 'Transacciones por Día',
          font: {
            size: 16,
            weight: 'bold'
          }
        },
        legend: {
          display: true,
          position: 'top'
        }
      },
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          display: true,
          title: {
            display: true,
            text: 'Día'
          }
        },
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Cantidad de Transacciones'
          },
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Monto Total (ARS)'
          },
          grid: {
            drawOnChartArea: false,
          },
        }
      }
    };

    // Crear el gráfico
    this.chart = new Chart(ctx, {
      type: 'bar',
      data: chartData,
      options: chartOptions
    });

    console.log('📊 Gráfico de barras creado exitosamente');
  }

  /**
   * Actualiza el gráfico cuando cambian los datos
   */
  updateChart(stats: TransactionStatisticsDTO): void {
    if (stats.timeSegmentStatistics && stats.timeSegmentStatistics.length > 0) {
      setTimeout(() => {
        this.createTimeSegmentChart(stats.timeSegmentStatistics!);
      }, 100);
    }
  }

  /**
   * Obtiene el máximo número de transacciones para la visualización temporal
   */
  getMaxTransactions(segments: any[]): number {
    if (!segments || segments.length === 0) return 1;
    return Math.max(...segments.map(s => s.transactionCount));
  }

  /**
   * Obtiene el máximo monto para la visualización temporal
   */
  getMaxAmount(segments: any[]): number {
    if (!segments || segments.length === 0) return 1;
    return Math.max(...segments.map(s => s.totalAmount));
  }

  /**
   * Captura el gráfico como imagen base64 para incluir en PDF
   */
  private getChartImage(): string | null {
    if (!this.chart || !this.timeSegmentChart) {
      return null;
    }
    
    try {
      // Capturar el canvas como imagen base64
      return this.timeSegmentChart.nativeElement.toDataURL('image/png', 1.0);
    } catch (error) {
      console.warn('Error al capturar gráfico:', error);
      return null;
    }
  }
} 