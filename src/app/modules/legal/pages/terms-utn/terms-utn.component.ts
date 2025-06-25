import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms-utn',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './terms-utn.component.html',
  styleUrls: ['./terms-utn.component.scss']
})
export class TermsUtnComponent implements OnInit {

  ngOnInit(): void {
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
  }

  goBack(): void {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }

  scrollToSection(sectionId: string): void {
    if (typeof document !== 'undefined') {
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  onLogoError(event: any): void {
    // Fallback to a default icon if logo fails to load
    const target = event.target as HTMLImageElement;
    target.style.display = 'none';
    
    // Create a fallback icon element
    const fallbackIcon = document.createElement('i');
    fallbackIcon.className = 'bi bi-building-fill text-success';
    fallbackIcon.style.fontSize = '60px';
    fallbackIcon.style.marginBottom = '1rem';
    
    // Insert the fallback icon before the h1 element
    const headerContent = target.parentElement;
    if (headerContent) {
      headerContent.insertBefore(fallbackIcon, headerContent.querySelector('h1'));
    }
  }
} 