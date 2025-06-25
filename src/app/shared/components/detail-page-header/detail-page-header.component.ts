import { Component, Input, Output, EventEmitter, TemplateRef, ContentChild } from '@angular/core';

@Component({
  selector: 'app-detail-page-header',
  templateUrl: './detail-page-header.component.html',
  styleUrls: ['./detail-page-header.component.scss']
})
export class DetailPageHeaderComponent {
  @Input() title: string = '';
  @Input() subtitle?: string;
  @Input() verified?: boolean | null;
  @Input() status?: string;
  @Input() statusIcon?: string;
  @Input() statusClass?: string;
  @Input() loading: boolean = false;
  @Input() isAdmin: boolean = false;
  @Input() showFollowButton: boolean = false;
  @Input() headerClass: string = '';
  @Input() gradientType: 'artist' | 'venue' | 'event' = 'artist';

  @Output() adminActionClick = new EventEmitter<string>();
  
  // Content projection for custom actions
  @ContentChild('customActions') customActions!: TemplateRef<any>;
  @ContentChild('followButton') followButton!: TemplateRef<any>;
  @ContentChild('adminDropdown') adminDropdown!: TemplateRef<any>;

  getHeaderClasses(): string {
    const baseClasses = 'detail-header py-3 d-flex justify-content-between align-items-center';
    const gradientClass = this.getGradientClass();
    return `${baseClasses} ${gradientClass} ${this.headerClass}`;
  }

  private getGradientClass(): string {
    switch (this.gradientType) {
      case 'artist':
        return 'bg-gradient-artist';
      case 'venue':
        return 'bg-light';
      case 'event':
        return 'bg-gradient-event';
      default:
        return 'bg-gradient-artist';
    }
  }

  getStatusBadgeClass(): string {
    if (this.statusClass) return this.statusClass;
    
    // Default status classes
    const statusMap: {[key: string]: string} = {
      'ACTIVO': 'bg-success',
      'INACTIVO': 'bg-danger',
      'PAUSADO': 'bg-warning text-dark',
      'CANCELADO': 'bg-danger',
      'FINALIZADO': 'bg-secondary',
      'EN_PROCESO': 'bg-primary',
      'VENDIDO': 'bg-info'
    };
    
    return statusMap[this.status?.toUpperCase() || ''] || 'bg-secondary';
  }

  onAdminAction(action: string): void {
    this.adminActionClick.emit(action);
  }
} 