import { Directive, Input, ElementRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { StatusFormatter } from '../utils/status-formatter.util';

@Directive({
  selector: '[appStatusBadge]',
  standalone: true
})
export class StatusBadgeDirective implements OnInit, OnChanges {
  @Input('appStatusBadge') status: string | undefined;
  @Input() showIcon: boolean = true;
  @Input() showText: boolean = true;

  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    this.applyStatusStyling();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['status']) {
      this.applyStatusStyling();
    }
  }

  private applyStatusStyling(): void {
    if (!this.status) return;

    const statusInfo = StatusFormatter.getStatusInfo(this.status);
    const element = this.el.nativeElement;

    // Add badge classes
    element.classList.add('badge');
    element.classList.add(...statusInfo.className.split(' '));

    // Build content
    let content = '';
    if (this.showIcon) {
      content += `<i class="bi bi-${statusInfo.icon} me-1"></i>`;
    }
    if (this.showText) {
      content += statusInfo.displayName;
    }

    element.innerHTML = content;
  }
} 