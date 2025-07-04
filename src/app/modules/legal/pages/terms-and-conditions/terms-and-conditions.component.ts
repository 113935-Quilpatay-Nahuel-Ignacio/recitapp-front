import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-terms-and-conditions',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './terms-and-conditions.component.html',
  styleUrls: ['./terms-and-conditions.component.scss']
})
export class TermsAndConditionsComponent implements OnInit {
  
  lastUpdated: string = new Date().toLocaleDateString('es-AR');
  
  ngOnInit(): void {
    // Scroll to top when component loads
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
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

  goBack(): void {
    if (typeof window !== 'undefined') {
      window.history.back();
    }
  }
} 