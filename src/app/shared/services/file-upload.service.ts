import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpProgressEvent } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface FileUploadResponse {
  success: boolean;
  fileUrl?: string;
  message: string;
}

export interface FileValidationResponse {
  valid: boolean;
  message: string;
  size?: number;
  type?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = `${environment.apiUrl}/files`;

  constructor(private http: HttpClient) {}

  uploadEventFlyer(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload/event-flyer`, formData);
  }

  uploadEventSections(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload/event-sections`, formData);
  }

  uploadArtistProfile(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload/artist-profile`, formData);
  }

  uploadVenueImage(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload/venue-image`, formData);
  }

  uploadNotificationImage(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload/notification-image`, formData);
  }

  uploadUserProfile(file: File): Observable<FileUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileUploadResponse>(`${this.apiUrl}/upload/user-profile`, formData);
  }

  uploadWithProgress(file: File, category: 'event-flyer' | 'event-sections' | 'artist-profile' | 'venue-image' | 'notification-image' | 'user-profile'): Observable<any> {
    console.log('🌐 [SERVICE DEBUG] uploadWithProgress called');
    console.log('🌐 [SERVICE DEBUG] file:', file.name, 'size:', file.size, 'type:', file.type);
    console.log('🌐 [SERVICE DEBUG] category:', category);
    
    const formData = new FormData();
    formData.append('file', file);
    console.log('🌐 [SERVICE DEBUG] FormData created with file');

    let endpoint: string;
    switch (category) {
      case 'event-flyer':
        endpoint = '/upload/event-flyer';
        break;
      case 'event-sections':
        endpoint = '/upload/event-sections';
        break;
      case 'artist-profile':
        endpoint = '/upload/artist-profile';
        break;
      case 'venue-image':
        endpoint = '/upload/venue-image';
        break;
      case 'notification-image':
        endpoint = '/upload/notification-image';
        break;
      case 'user-profile':
        endpoint = '/upload/user-profile';
        break;
      default:
        endpoint = '/upload/event-flyer';
    }

    const fullUrl = `${this.apiUrl}${endpoint}`;
    console.log('🌐 [SERVICE DEBUG] Full URL:', fullUrl);
    console.log('🌐 [SERVICE DEBUG] Making HTTP POST request...');

    return this.http.post(fullUrl, formData, {
      reportProgress: true,
      observe: 'events'
    }).pipe(
      map(event => {
        console.log('🌐 [SERVICE DEBUG] HTTP event received:', event);
        if (event.type === HttpEventType.UploadProgress) {
          const progress = Math.round(100 * event.loaded / (event.total || 1));
          console.log('🌐 [SERVICE DEBUG] Upload progress:', progress + '%');
          return { type: 'progress', progress };
        } else if (event.type === HttpEventType.Response) {
          console.log('🌐 [SERVICE DEBUG] Upload response received:', event.body);
          return { type: 'complete', response: event.body };
        }
        console.log('🌐 [SERVICE DEBUG] Other event type:', event.type);
        return { type: 'other', event };
      })
    );
  }

  validateImage(file: File): Observable<FileValidationResponse> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<FileValidationResponse>(`${this.apiUrl}/validate-image`, formData);
  }

  deleteFile(fileUrl: string): Observable<{success: boolean, message: string}> {
    return this.http.delete<{success: boolean, message: string}>(`${this.apiUrl}/delete`, {
      params: { fileUrl }
    });
  }

  // Método utilitario para validar archivos del lado cliente
  validateImageFile(file: File): { valid: boolean; message: string } {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!file) {
      return { valid: false, message: 'No se ha seleccionado ningún archivo' };
    }

    if (file.size > maxSize) {
      return { valid: false, message: 'El archivo es demasiado grande. Máximo 10MB.' };
    }

    if (!allowedTypes.includes(file.type)) {
      return { valid: false, message: 'Tipo de archivo no permitido. Solo se permiten: JPG, PNG, WebP, GIF.' };
    }

    return { valid: true, message: 'Archivo válido' };
  }

  // Método para crear una vista previa de imagen
  createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
} 