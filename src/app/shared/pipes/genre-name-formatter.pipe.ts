import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'genreNameFormatter',
  standalone: true
})
export class GenreNameFormatterPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return value;
    
    // Convert snake_case to Title Case
    return value
      .toLowerCase()
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());
  }
} 