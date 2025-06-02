import { Pipe, PipeTransform } from '@angular/core';
import { StatusFormatter } from '../utils/status-formatter.util';

@Pipe({
  name: 'statusFormat',
  standalone: true
})
export class StatusFormatPipe implements PipeTransform {
  transform(value: string | undefined, type: 'name' | 'class' | 'icon' | 'color' = 'name'): string {
    if (!value) return '';
    
    switch (type) {
      case 'name':
        return StatusFormatter.formatStatusName(value);
      case 'class':
        return StatusFormatter.getStatusClass(value);
      case 'icon':
        return StatusFormatter.getStatusIcon(value);
      case 'color':
        return StatusFormatter.getStatusColor(value);
      default:
        return StatusFormatter.formatStatusName(value);
    }
  }
} 