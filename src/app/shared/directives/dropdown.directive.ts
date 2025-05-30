import { Directive, ElementRef, HostListener, Renderer2, OnDestroy } from '@angular/core';

@Directive({
  selector: '[appDropdown]',
  standalone: true
})
export class DropdownDirective implements OnDestroy {
  private isOpen = false;
  private clickListener?: () => void;

  constructor(private elementRef: ElementRef, private renderer: Renderer2) {}

  @HostListener('click', ['$event']) onClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.toggle();
  }

  @HostListener('document:click', ['$event']) onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!this.elementRef.nativeElement.contains(target) && 
        !this.getDropdownMenu()?.contains(target)) {
      this.close();
    }
  }

  @HostListener('keydown.escape') onEscape(): void {
    this.close();
  }

  private toggle(): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  private open(): void {
    // Close any other open dropdowns first
    this.closeOtherDropdowns();
    
    const dropdownMenu = this.getDropdownMenu();
    if (dropdownMenu) {
      this.renderer.addClass(dropdownMenu, 'show');
      this.renderer.setAttribute(this.elementRef.nativeElement, 'aria-expanded', 'true');
      this.isOpen = true;
    }
  }

  private close(): void {
    const dropdownMenu = this.getDropdownMenu();
    if (dropdownMenu) {
      this.renderer.removeClass(dropdownMenu, 'show');
      this.renderer.setAttribute(this.elementRef.nativeElement, 'aria-expanded', 'false');
      this.isOpen = false;
    }
  }

  private getDropdownMenu(): HTMLElement | null {
    return this.elementRef.nativeElement.nextElementSibling?.classList.contains('dropdown-menu') 
      ? this.elementRef.nativeElement.nextElementSibling 
      : null;
  }

  private closeOtherDropdowns(): void {
    const allDropdowns = document.querySelectorAll('.dropdown-menu.show');
    allDropdowns.forEach(dropdown => {
      this.renderer.removeClass(dropdown, 'show');
      const button = dropdown.previousElementSibling;
      if (button) {
        this.renderer.setAttribute(button, 'aria-expanded', 'false');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.clickListener) {
      this.clickListener();
    }
  }
} 