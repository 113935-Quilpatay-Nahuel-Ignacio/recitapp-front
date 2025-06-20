import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface FAQItem {
  question: string;
  answer: string;
  isOpen?: boolean;
}

interface FAQSection {
  title: string;
  icon: string;
  items: FAQItem[];
}

@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  
  searchTerm: string = '';
  filteredSections: FAQSection[] = [];
  
  faqSections: FAQSection[] = [
    {
      title: "Información General",
      icon: "bi-info-circle",
      items: [
        {
          question: "¿Qué es RecitApp?",
          answer: "RecitApp es una plataforma digital que conecta a organizadores de eventos, artistas, recintos y compradores para facilitar la venta y compra de entradas para eventos musicales y culturales de manera segura y confiable."
        },
        {
          question: "¿Es seguro comprar en RecitApp?",
          answer: "Sí, RecitApp utiliza sistemas de pago seguros como MercadoPago y cuenta con verificación de eventos, códigos QR únicos para entradas y protección de datos personales."
        }
      ]
    },
    {
      title: "Compra de Entradas",
      icon: "bi-ticket-perforated",
      items: [
        {
          question: "¿Cómo compro entradas?",
          answer: "Busca el evento, selecciona la sección y cantidad de entradas, procede al pago con MercadoPago o billetera virtual, y recibirás las entradas por email con códigos QR únicos."
        },
        {
          question: "¿Las entradas son nominales?",
          answer: "Sí, todas las entradas son nominales e intransferibles. Debes presentar tu documento de identidad junto con la entrada en el evento."
        }
      ]
    },
    {
      title: "Pagos y Billetera Virtual",
      icon: "bi-wallet2",
      items: [
        {
          question: "¿Qué métodos de pago aceptan?",
          answer: "Aceptamos MercadoPago (tarjetas de crédito, débito, etc.) y nuestra billetera virtual RecitApp. También puedes combinar ambos métodos en una compra."
        },
        {
          question: "¿Cómo funciona la billetera virtual?",
          answer: "La billetera virtual almacena créditos en pesos argentinos que se aplican automáticamente como descuento en tus compras. Si el saldo cubre la compra completa, no necesitas pago adicional."
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.filteredSections = [...this.faqSections];
    window.scrollTo(0, 0);
  }

  searchFAQ(event: any): void {
    const term = event.target.value.toLowerCase();
    this.searchTerm = term;

    if (!term.trim()) {
      this.filteredSections = [...this.faqSections];
      return;
    }

    this.filteredSections = this.faqSections.map(section => ({
      ...section,
      items: section.items.filter(item => 
        item.question.toLowerCase().includes(term) ||
        item.answer.toLowerCase().includes(term)
      )
    })).filter(section => section.items.length > 0);
  }

  toggleItem(sectionIndex: number, itemIndex: number): void {
    const section = this.filteredSections[sectionIndex];
    if (section && section.items[itemIndex]) {
      section.items[itemIndex].isOpen = !section.items[itemIndex].isOpen;
    }
  }

  scrollToSection(sectionTitle: string): void {
    const element = document.getElementById(sectionTitle.replace(/\s+/g, '-').toLowerCase());
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  goBack(): void {
    window.history.back();
  }
}
