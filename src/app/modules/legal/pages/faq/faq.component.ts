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
          answer: "Sí, todas las entradas son nominales pero SÍ se pueden transferir a otros usuarios registrados en RecitApp. También se puede reasignar el asistente (cambiar el nombre de quien aparece en la entrada). Debes presentar tu documento de identidad junto con la entrada en el evento."
        },
        {
          question: "¿Puedo transferir mis entradas a otra persona?",
          answer: "Sí, las entradas se pueden transferir a otros usuarios registrados en RecitApp. Solo necesitas los datos del destinatario (nombre, apellido y DNI) y el sistema buscará automáticamente al usuario para realizar la transferencia."
        },
        {
          question: "¿Puedo cambiar el nombre del asistente en mi entrada?",
          answer: "Sí, puedes reasignar el asistente cuyo nombre aparece en la entrada. Esta función es útil cuando compras entradas para terceros y necesitas cambiar los datos del asistente sin transferir la propiedad de la entrada."
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
        },
        {
          question: "¿Cómo cargo saldo a mi billetera virtual?",
          answer: "Actualmente puedes cargar saldo mediante reembolsos automáticos de entradas canceladas. Próximamente se habilitarán más métodos de carga."
        },
        {
          question: "¿El saldo de la billetera virtual se combina con MercadoPago?",
          answer: "Sí, si tu saldo de billetera virtual no cubre el total de la compra, se descuenta automáticamente lo disponible y el resto se paga con MercadoPago. Es completamente automático."
        },
        {
          question: "¿Puedo convertir el saldo de la billetera virtual a dinero real?",
          answer: "No, el saldo de la billetera virtual no se puede convertir de vuelta a dinero real ni transferir a otros usuarios. Solo se puede usar para compras en RecitApp."
        }
      ]
    },
    {
      title: "Cancelaciones y Reembolsos",
      icon: "bi-arrow-repeat",
      items: [
        {
          question: "¿Qué pasa si se cancela un evento?",
          answer: "Cuando un evento es cancelado por el organizador, recibes un reembolso automático como crédito en tu billetera virtual RecitApp. El proceso es instantáneo y recibes notificación por email."
        },
        {
          question: "¿Puedo cancelar mi entrada y pedir reembolso?",
          answer: "Sí, puedes solicitar reembolso con al menos 48 horas de anticipación al evento. Se cobra una comisión administrativa del 10% y el reembolso se procesa como crédito en tu billetera virtual."
        },
        {
          question: "¿Cuánto tarda un reembolso?",
          answer: "Los reembolsos a billetera virtual son instantáneos. Para reembolsos a MercadoPago, el proceso tarda entre 7-14 días hábiles y se procesa directamente al método de pago original."
        }
      ]
    },
    {
      title: "Notificaciones",
      icon: "bi-bell",
      items: [
        {
          question: "¿Qué tipos de notificaciones recibo?",
          answer: "Recibes notificaciones sobre nuevos eventos de artistas que sigues, baja disponibilidad de entradas, confirmaciones de compra, recordatorios de eventos próximos y ofertas promocionales."
        },
        {
          question: "¿Puedo personalizar mis notificaciones?",
          answer: "Sí, puedes activar/desactivar cada tipo de notificación, elegir canales preferidos (email, push, SMS), configurar horarios y hacer opt-out de comunicaciones promocionales."
        },
        {
          question: "¿Cómo activo las notificaciones push?",
          answer: "Ve a tu configuración de notificaciones y solicita permisos para notificaciones push. Una vez activadas, recibirás alertas instantáneas en tu navegador sobre eventos y actualizaciones importantes."
        }
      ]
    },
    {
      title: "Cuenta y Acceso",
      icon: "bi-person-circle",
      items: [
        {
          question: "¿Cómo creo una clave segura para mi cuenta?",
          answer: "Tu clave debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y símbolos. Evita usar información personal como fechas de nacimiento o nombres. RecitApp te sugerirá crear una clave fuerte durante el registro."
        },
        {
          question: "¿Qué hago si olvido mi clave de acceso?",
          answer: "Usa la opción '¿Olvidaste tu contraseña?' en la página de login. Ingresa tu email y recibirás un link para crear una nueva clave. El link expira en 24 horas por seguridad."
        },
        {
          question: "¿Cómo desbloqueo mi cuenta si está suspendida?",
          answer: "Si tu cuenta está bloqueada por múltiples intentos de login fallidos, espera 15 minutos y vuelve a intentar. Para bloqueos por seguridad, contacta a soporte en soporte@recitapp.com con tu email registrado."
        },
        {
          question: "¿Puedo cambiar mi email de registro?",
          answer: "Sí, puedes cambiar tu email desde 'Mi Perfil'. Deberás verificar el nuevo email antes de que se active. El email anterior se mantiene válido hasta completar la verificación."
        },
        {
          question: "¿Cómo actualizo mi información de perfil?",
          answer: "Accede a 'Mi Perfil' desde tu cuenta, edita los datos necesarios (nombre, apellido, teléfono, fecha de nacimiento) y guarda los cambios. Algunos datos como el DNI no se pueden modificar por seguridad."
        },
        {
          question: "¿Puedo eliminar mi cuenta de RecitApp?",
          answer: "Sí, puedes solicitar la eliminación de tu cuenta contactando a soporte. Ten en cuenta que se mantendrán los datos necesarios para cumplir obligaciones legales y entradas ya compradas seguirán siendo válidas."
        }
      ]
    },
    {
      title: "Soporte y Contacto",
      icon: "bi-headset",
      items: [
        {
          question: "¿Cómo contacto al soporte de RecitApp?",
          answer: "Puedes contactarnos por email a soporte@recitapp.com, por teléfono al +54 351 123-4567, o a través de los botones de 'Contactar Soporte' en la plataforma. Horario: Lunes a Viernes de 9:00 a 18:00 hs."
        },
        {
          question: "¿Cuáles son los horarios de atención?",
          answer: "Nuestro equipo de soporte está disponible de Lunes a Viernes de 9:00 a 18:00 hs (hora argentina). Fuera de estos horarios, puedes enviar tu consulta por email y te responderemos lo antes posible."
        }
      ]
    }
  ];

  ngOnInit(): void {
    this.filteredSections = [...this.faqSections];
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
    }
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
    if (typeof document !== 'undefined') {
      const element = document.getElementById(sectionTitle.replace(/\s+/g, '-').toLowerCase());
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
