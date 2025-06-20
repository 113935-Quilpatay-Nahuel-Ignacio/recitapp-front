import { Component, Input, Output, EventEmitter, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { FileUploadService, FileUploadResponse } from '../../services/file-upload.service';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FileUploadComponent),
      multi: true
    }
  ],
  template: `
    <div class="file-upload-container">
      <div class="upload-area" 
           [class.dragover]="isDragOver"
           [class.has-file]="selectedFile || currentFileUrl"
           (click)="fileInput.click()"
           (dragover)="onDragOver($event)"
           (dragleave)="onDragLeave($event)"
           (drop)="onDrop($event)">
        
        <!-- Input oculto -->
        <input #fileInput
               type="file"
               accept="image/*"
               (change)="onFileSelected($event)"
               style="display: none;">
        
        <!-- Área de arrastrar y soltar -->
        <div *ngIf="!selectedFile && !currentFileUrl" class="upload-placeholder">
          <i class="bi bi-cloud-upload fs-1 text-muted mb-3"></i>
          <p class="mb-2"><strong>{{ placeholder || 'Arrastra una imagen aquí' }}</strong></p>
          <p class="text-muted small">o haz clic para seleccionar</p>
          <p class="text-muted small">La imagen se subirá automáticamente</p>
          <p class="text-muted small">Formatos: JPG, PNG, WebP, GIF (máx. 10MB)</p>
        </div>
        
        <!-- Vista previa de imagen existente -->
        <div *ngIf="currentFileUrl && !selectedFile" class="image-preview-container">
          <img [src]="currentFileUrl" [alt]="label" class="preview-image">
          <div class="image-overlay">
            <button type="button" 
                    class="btn btn-sm btn-danger" 
                    (click)="removeCurrentImage($event)"
                    [disabled]="isUploading">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
        
        <!-- Vista previa de archivo seleccionado -->
        <div *ngIf="selectedFile" class="image-preview-container">
          <img [src]="previewUrl" [alt]="selectedFile.name" class="preview-image">
          <div class="image-overlay">
            <button type="button" 
                    class="btn btn-sm btn-danger" 
                    (click)="removeSelectedFile($event)"
                    [disabled]="isUploading">
              <i class="bi bi-trash"></i>
            </button>
          </div>
          <div class="file-info">
            <small class="text-muted">{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</small>
          </div>
        </div>
        
        <!-- Barra de progreso -->
        <div *ngIf="isUploading" class="upload-progress">
          <div class="progress mb-2">
            <div class="progress-bar" 
                 [style.width.%]="uploadProgress"
                 role="progressbar">
              {{ uploadProgress }}%
            </div>
          </div>
          <small class="text-muted">Subiendo imagen...</small>
        </div>
      </div>
      
      <!-- Auto-upload info -->
      <div *ngIf="isUploading" class="upload-info mt-2">
        <div class="alert alert-info alert-sm">
          <i class="bi bi-cloud-upload me-1"></i>
          Subiendo imagen automáticamente...
        </div>
      </div>
      
      <!-- Mensajes de error -->
      <div *ngIf="errorMessage" class="alert alert-danger alert-sm mt-2">
        <i class="bi bi-exclamation-triangle me-1"></i>
        {{ errorMessage }}
      </div>
      
      <!-- Mensaje de éxito -->
      <div *ngIf="successMessage" class="alert alert-success alert-sm mt-2">
        <i class="bi bi-check-circle me-1"></i>
        {{ successMessage }}
      </div>
    </div>
  `,
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = '';
  @Input() category: 'event-flyer' | 'event-sections' | 'artist-profile' | 'venue-image' | 'notification-image' | 'user-profile' = 'event-flyer';
  @Input() currentFileUrl: string | null = null;
  
  @Output() fileUploaded = new EventEmitter<string>();
  @Output() fileRemoved = new EventEmitter<void>();

  selectedFile: File | null = null;
  previewUrl: string = '';
  isDragOver: boolean = false;
  isUploading: boolean = false;
  uploadProgress: number = 0;
  errorMessage: string = '';
  successMessage: string = '';

  private onChange = (value: string | null) => {};
  private onTouched = () => {};

  constructor(private fileUploadService: FileUploadService) {}

  // ControlValueAccessor implementation
  writeValue(value: string | null): void {
    this.currentFileUrl = value;
  }

  registerOnChange(fn: (value: string | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragOver = false;
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.processFile(files[0]);
    }
  }

  private processFile(file: File): void {
    console.log('📁 [FRONTEND DEBUG] processFile() called with file:', file.name);
    this.clearMessages();
    
    // Validar archivo
    console.log('📁 [FRONTEND DEBUG] Validating file...');
    const validation = this.fileUploadService.validateImageFile(file);
    console.log('📁 [FRONTEND DEBUG] Validation result:', validation);
    if (!validation.valid) {
      console.log('❌ [FRONTEND DEBUG] File validation failed:', validation.message);
      this.errorMessage = validation.message;
      return;
    }

    console.log('✅ [FRONTEND DEBUG] File validation passed, setting selectedFile');
    this.selectedFile = file;
    console.log('📁 [FRONTEND DEBUG] selectedFile assigned:', this.selectedFile);
    console.log('📁 [FRONTEND DEBUG] selectedFile name:', this.selectedFile?.name);
    
    // Crear vista previa
    console.log('📁 [FRONTEND DEBUG] Creating image preview...');
    this.fileUploadService.createImagePreview(file)
      .then(preview => {
        console.log('✅ [FRONTEND DEBUG] Preview created successfully');
        this.previewUrl = preview;
        console.log('📁 [FRONTEND DEBUG] After preview - selectedFile still exists?:', !!this.selectedFile);
        console.log('📁 [FRONTEND DEBUG] After preview - selectedFile name:', this.selectedFile?.name);
        
        // AUTO-UPLOAD: Subir automáticamente después de crear la vista previa
        console.log('🚀 [AUTO-UPLOAD] Starting automatic upload...');
        this.uploadFile();
      })
      .catch(error => {
        console.error('❌ [FRONTEND DEBUG] Error creating preview:', error);
        this.errorMessage = 'Error al crear vista previa de la imagen';
        this.selectedFile = null; // Reset on error
      });
  }



  uploadFile(): void {
    console.log('📤 [FRONTEND DEBUG] uploadFile() called');
    console.log('📤 [FRONTEND DEBUG] selectedFile:', this.selectedFile);
    console.log('📤 [FRONTEND DEBUG] category:', this.category);
    
    if (!this.selectedFile) {
      console.log('❌ [FRONTEND DEBUG] No selected file, returning');
      return;
    }

    console.log('📤 [FRONTEND DEBUG] Starting upload process...');
    this.isUploading = true;
    this.uploadProgress = 0;
    this.clearMessages();

    console.log('📤 [FRONTEND DEBUG] Calling fileUploadService.uploadWithProgress...');
    this.fileUploadService.uploadWithProgress(this.selectedFile, this.category)
      .subscribe({
        next: (event) => {
          console.log('📤 [FRONTEND DEBUG] Upload event received:', event);
          if (event.type === 'progress') {
            this.uploadProgress = event.progress;
            console.log('📤 [FRONTEND DEBUG] Upload progress:', event.progress + '%');
          } else if (event.type === 'complete') {
            console.log('📤 [FRONTEND DEBUG] Upload completed, response:', event.response);
            const response = event.response as FileUploadResponse;
            if (response.success && response.fileUrl) {
              console.log('✅ [FRONTEND DEBUG] Upload successful, fileUrl:', response.fileUrl);
              this.onUploadSuccess(response.fileUrl);
            } else {
              console.log('❌ [FRONTEND DEBUG] Upload failed, message:', response.message);
              this.errorMessage = response.message || 'Error al subir la imagen';
              this.isUploading = false;
            }
          }
        },
        error: (error) => {
          console.error('❌ [FRONTEND DEBUG] Upload error:', error);
          this.errorMessage = 'Error al subir la imagen';
          this.isUploading = false;
          this.uploadProgress = 0;
        }
      });
  }

  private onUploadSuccess(fileUrl: string): void {
    this.currentFileUrl = fileUrl;
    this.selectedFile = null;
    this.previewUrl = '';
    this.isUploading = false;
    this.uploadProgress = 0;
    this.successMessage = 'Imagen subida correctamente';
    
    // Notificar cambios
    this.onChange(fileUrl);
    this.fileUploaded.emit(fileUrl);
    
    // Limpiar mensaje de éxito después de 3 segundos
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  removeCurrentImage(event: Event): void {
    event.stopPropagation();
    
    if (this.currentFileUrl) {
      this.fileUploadService.deleteFile(this.currentFileUrl).subscribe({
        next: (response) => {
          if (response.success) {
            this.currentFileUrl = null;
            this.onChange(null);
            this.fileRemoved.emit();
            this.successMessage = 'Imagen eliminada correctamente';
            setTimeout(() => this.successMessage = '', 3000);
          } else {
            this.errorMessage = response.message;
          }
        },
        error: () => {
          this.errorMessage = 'Error al eliminar la imagen';
        }
      });
    }
  }

  removeSelectedFile(event: Event): void {
    event.stopPropagation();
    this.selectedFile = null;
    this.previewUrl = '';
    this.clearMessages();
  }

  cancel(): void {
    console.log('🚫 [FRONTEND DEBUG] cancel() called');
    this.selectedFile = null;
    this.previewUrl = '';
    this.clearMessages();
  }

  private clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
} 