import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-legal-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './legal-home.component.html',
  styleUrls: ['./legal-home.component.scss']
})
export class LegalHomeComponent implements OnInit {
  
  currentDate: string = new Date().toLocaleDateString('es-AR');
  
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
} 