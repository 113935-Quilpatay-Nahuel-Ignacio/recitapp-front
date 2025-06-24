import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-list-filters',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './list-filters.component.html',
  styleUrls: ['./list-filters.component.scss']
})
export class ListFiltersComponent {
  @Input() title: string = 'Filtros';
  @Input() icon: string = 'bi-funnel-fill';
  @Input() showClearButton: boolean = false;
  @Output() clearFilters = new EventEmitter<void>();

  onClearFilters(): void {
    this.clearFilters.emit();
  }
} 