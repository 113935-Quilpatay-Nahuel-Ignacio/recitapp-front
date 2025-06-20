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
} 