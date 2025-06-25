import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild } from '@angular/core';

@Component({
  selector: 'app-form-page-header',
  templateUrl: './form-page-header.component.html',
  styleUrls: ['./form-page-header.component.scss']
})
export class FormPageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() isEditMode: boolean = false;
  @Input() entityType: 'artist' | 'event' | 'venue' = 'artist';
  @Input() headerClass: string = '';
  @Input() showBackButton: boolean = true;
  @Input() backButtonText: string = '';
  
  @Output() cancelClick = new EventEmitter<void>();
  @Output() backClick = new EventEmitter<void>();

  // Content projection
  @ContentChild('actions') actions!: TemplateRef<any>;

  getTitle(): string {
    if (this.title) return this.title;
    
    const entityNames = {
      'artist': 'Artista',
      'event': 'Evento', 
      'venue': 'Recinto'
    };
    
    const action = this.isEditMode ? 'Editar' : 'Registrar';
    return `${action} ${entityNames[this.entityType]}`;
  }

  getSubtitle(): string {
    if (this.subtitle) return this.subtitle;
    
    const actions = {
      'artist': this.isEditMode 
        ? 'Actualiza la información del artista' 
        : 'Agrega un nuevo artista a la plataforma',
      'event': this.isEditMode 
        ? 'Modifica los detalles del evento' 
        : 'Completa la información para crear un nuevo evento',
      'venue': this.isEditMode 
        ? 'Actualiza la información del recinto' 
        : 'Registra un nuevo recinto en la plataforma'
    };
    
    return actions[this.entityType];
  }

  getIcon(): string {
    const icons = {
      'artist': this.isEditMode ? 'bi-pencil-square text-warning' : 'bi-plus-circle text-success',
      'event': this.isEditMode ? 'bi-pencil-square text-warning' : 'bi-calendar-plus text-success',
      'venue': this.isEditMode ? 'bi-pencil-square text-warning' : 'bi-building text-success'
    };
    
    return icons[this.entityType];
  }

  getBackButtonText(): string {
    if (this.backButtonText) return this.backButtonText;
    return this.isEditMode ? 'Volver al detalle' : 'Volver a lista';
  }

  onCancel(): void {
    this.cancelClick.emit();
    this.backClick.emit();
  }
} 