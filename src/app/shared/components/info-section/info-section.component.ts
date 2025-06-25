import { Component, Input, TemplateRef, ContentChild } from '@angular/core';

@Component({
  selector: 'app-info-section',
  templateUrl: './info-section.component.html',
  styleUrls: ['./info-section.component.scss']
})
export class InfoSectionComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() sectionClass: string = '';
  @Input() titleClass: string = '';
  @Input() contentClass: string = '';
  @Input() showCard: boolean = true;
  @Input() loading: boolean = false;
  @Input() empty: boolean = false;
  @Input() emptyMessage: string = 'No hay información disponible';
  @Input() emptyIcon: string = 'bi-info-circle';

  // Content projection
  @ContentChild('content') content!: TemplateRef<any>;
  @ContentChild('actions') actions!: TemplateRef<any>;

  getSectionClasses(): string {
    const baseClasses = 'info-section';
    const cardClass = this.showCard ? 'card mb-4' : 'mb-4';
    return `${baseClasses} ${cardClass} ${this.sectionClass}`.trim();
  }

  getTitleClasses(): string {
    const baseClasses = this.showCard ? 'card-title section-title' : 'section-title';
    return `${baseClasses} ${this.titleClass}`.trim();
  }

  getContentClasses(): string {
    const baseClasses = this.showCard ? 'card-body section-content' : 'section-content';
    return `${baseClasses} ${this.contentClass}`.trim();
  }
} 