import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { AlertModalComponent } from '../components/alert-modal/alert-modal.component';
import { ConfirmModalComponent } from '../components/confirm-modal/confirm-modal.component';
import { PromptModalComponent } from '../components/prompt-modal/prompt-modal.component';

export interface AlertData {
  title?: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  buttonText?: string;
}

export interface ConfirmData {
  title?: string;
  message: string;
  type?: 'info' | 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  details?: string[];
}

export interface PromptData {
  title?: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  inputType?: 'text' | 'textarea';
  confirmText?: string;
  cancelText?: string;
  required?: boolean;
}

export interface PromptResult {
  confirmed: boolean;
  value?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ModalService {
  constructor(private dialog: MatDialog) {}

  /**
   * Muestra un modal de alerta (reemplazo de alert())
   */
  showAlert(data: AlertData): Observable<boolean> {
    const dialogRef: MatDialogRef<AlertModalComponent> = this.dialog.open(AlertModalComponent, {
      width: '400px',
      maxWidth: '95vw',
      data: {
        title: data.title || this.getDefaultTitle(data.type || 'info'),
        message: data.message,
        type: data.type || 'info',
        buttonText: data.buttonText || 'Aceptar'
      },
      panelClass: 'recitapp-modal-container',
      disableClose: false
    });

    return dialogRef.afterClosed();
  }

  /**
   * Muestra un modal de confirmación (reemplazo de confirm())
   */
  showConfirm(data: ConfirmData): Observable<boolean> {
    const dialogRef: MatDialogRef<ConfirmModalComponent> = this.dialog.open(ConfirmModalComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: {
        title: data.title || 'Confirmar acción',
        message: data.message,
        type: data.type || 'info',
        confirmText: data.confirmText || 'Confirmar',
        cancelText: data.cancelText || 'Cancelar',
        details: data.details
      },
      panelClass: 'recitapp-modal-container',
      disableClose: false
    });

    return dialogRef.afterClosed();
  }

  /**
   * Muestra un modal de prompt (reemplazo de prompt())
   */
  showPrompt(data: PromptData): Observable<PromptResult> {
    const dialogRef: MatDialogRef<PromptModalComponent> = this.dialog.open(PromptModalComponent, {
      width: '500px',
      maxWidth: '95vw',
      data: {
        title: data.title || 'Ingrese información',
        message: data.message,
        placeholder: data.placeholder || '',
        defaultValue: data.defaultValue || '',
        inputType: data.inputType || 'text',
        confirmText: data.confirmText || 'Aceptar',
        cancelText: data.cancelText || 'Cancelar',
        required: data.required !== false
      },
      panelClass: 'recitapp-modal-container',
      disableClose: false
    });

    return dialogRef.afterClosed();
  }

  /**
   * Métodos de conveniencia para casos comunes
   */
  success(message: string, title?: string): Observable<boolean> {
    return this.showAlert({
      title: title || 'Éxito',
      message,
      type: 'success'
    });
  }

  error(message: string, title?: string): Observable<boolean> {
    return this.showAlert({
      title: title || 'Error',
      message,
      type: 'error'
    });
  }

  warning(message: string, title?: string): Observable<boolean> {
    return this.showAlert({
      title: title || 'Advertencia',
      message,
      type: 'warning'
    });
  }

  info(message: string, title?: string): Observable<boolean> {
    return this.showAlert({
      title: title || 'Información',
      message,
      type: 'info'
    });
  }

  confirmDeletion(itemName: string, details?: string[]): Observable<boolean> {
    return this.showConfirm({
      title: 'Confirmar eliminación',
      message: `¿Estás ABSOLUTAMENTE SEGURO de que deseas ELIMINAR PERMANENTEMENTE "${itemName}"? Esta acción no se puede deshacer.`,
      type: 'danger',
      confirmText: 'Sí, eliminar',
      cancelText: 'Cancelar',
      details
    });
  }

  confirmAction(message: string, title?: string): Observable<boolean> {
    return this.showConfirm({
      title: title || 'Confirmar acción',
      message,
      type: 'warning',
      confirmText: 'Sí, continuar',
      cancelText: 'Cancelar'
    });
  }

  private getDefaultTitle(type: string): string {
    switch (type) {
      case 'success': return 'Éxito';
      case 'error': return 'Error';
      case 'warning': return 'Advertencia';
      case 'info': 
      default: return 'Información';
    }
  }
} 