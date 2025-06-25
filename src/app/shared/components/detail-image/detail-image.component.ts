import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-detail-image',
  templateUrl: './detail-image.component.html',
  styleUrls: ['./detail-image.component.scss']
})
export class DetailImageComponent {
  @Input() src: string | null = null;
  @Input() alt: string = '';
  @Input() title: string = '';
  @Input() placeholderIcon: string = 'bi-image';
  @Input() placeholderText?: string;
  @Input() containerClass: string = '';
  @Input() imageClass: string = '';
  @Input() height: string = '250px';
  @Input() rounded: boolean = true;
  @Input() shadow: boolean = true;

  @Output() imageError = new EventEmitter<Event>();
  @Output() imageLoad = new EventEmitter<Event>();

  imageError$ = false;

  onImageError(event: Event): void {
    this.imageError$ = true;
    this.imageError.emit(event);
  }

  onImageLoad(event: Event): void {
    this.imageError$ = false;
    this.imageLoad.emit(event);
  }

  getContainerClasses(): string {
    const baseClasses = 'detail-image-container';
    const roundedClass = this.rounded ? 'rounded' : '';
    const shadowClass = this.shadow ? 'shadow-sm' : '';
    return `${baseClasses} ${roundedClass} ${shadowClass} ${this.containerClass}`.trim();
  }

  getImageClasses(): string {
    const baseClasses = 'detail-image img-fluid';
    const roundedClass = this.rounded ? 'rounded' : '';
    return `${baseClasses} ${roundedClass} ${this.imageClass}`.trim();
  }

  getPlaceholderClasses(): string {
    const baseClasses = 'detail-image-placeholder d-flex align-items-center justify-content-center';
    const roundedClass = this.rounded ? 'rounded' : '';
    return `${baseClasses} ${roundedClass}`.trim();
  }

  getPlaceholderText(): string {
    if (this.placeholderText) return this.placeholderText;
    return this.title ? this.title.charAt(0).toUpperCase() : '?';
  }
} 