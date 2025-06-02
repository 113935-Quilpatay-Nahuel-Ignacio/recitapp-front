import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[simpleDropdown]',
  standalone: true
})
export class SimpleDropdownDirective {

  constructor(private el: ElementRef) {}

  @HostListener('click', ['$event'])
  onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    
    const element = this.el.nativeElement;
    const dropdownMenu = element.nextElementSibling;
    
    if (dropdownMenu && dropdownMenu.classList.contains('dropdown-menu')) {
      // Cerrar otros dropdowns abiertos
      const allDropdowns = document.querySelectorAll('.dropdown-menu');
      allDropdowns.forEach(menu => {
        if (menu !== dropdownMenu && menu.classList.contains('show')) {
          menu.classList.remove('show');
        }
      });
      
      // Toggle este dropdown
      dropdownMenu.classList.toggle('show');
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    const element = this.el.nativeElement;
    const dropdownMenu = element.nextElementSibling;
    
    if (dropdownMenu && 
        !element.contains(event.target as Node) && 
        !dropdownMenu.contains(event.target as Node)) {
      dropdownMenu.classList.remove('show');
    }
  }
} 