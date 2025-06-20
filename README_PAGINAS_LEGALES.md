# 📄 Páginas Legales - RecitApp Frontend

## 📋 Descripción General

Se han creado páginas frontend profesionales para mostrar el contenido legal de RecitApp (Términos y Condiciones + FAQ) de manera integrada en la aplicación Angular.

## 🗂️ Estructura de Archivos Creados

```
recitapp-front/src/app/modules/legal/
├── legal.module.ts                         # Módulo principal
├── legal-routing.module.ts                 # Configuración de rutas
└── pages/
    ├── legal-home/                         # Página principal del centro legal
    │   ├── legal-home.component.ts
    │   ├── legal-home.component.html
    │   └── legal-home.component.scss
    ├── terms-and-conditions/               # Términos y Condiciones
    │   ├── terms-and-conditions.component.ts
    │   ├── terms-and-conditions.component.html
    │   └── terms-and-conditions.component.scss
    └── faq/                                # Preguntas Frecuentes
        ├── faq.component.ts
        ├── faq.component.html
        └── faq.component.scss
```

## 🌐 Rutas Disponibles

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/legal` | LegalHomeComponent | Página principal con enlaces a T&C y FAQ |
| `/legal/terms` | TermsAndConditionsComponent | Términos y Condiciones completos |
| `/legal/faq` | FaqComponent | Preguntas Frecuentes interactivas |

## ✨ Características Implementadas

### 🏠 Página Principal Legal (`/legal`)
- **Tarjetas principales** para acceder a T&C y FAQ
- **Accesos rápidos** a secciones populares
- **Información de contacto** y soporte
- **Diseño responsive** y moderno

### 📝 Términos y Condiciones (`/legal/terms`)
- **Índice navegable** con scroll suave
- **12 secciones principales** cubriendo:
  - Información general y aceptación
  - Registro y tipos de cuenta
  - Servicios (pagos, billetera virtual, notificaciones)
  - Compra de entradas y verificación
  - Cancelaciones y reembolsos
  - Responsabilidades y limitaciones
  - Propiedad intelectual
  - Privacidad y notificaciones
  - Conducta del usuario
  - Aspectos legales
  - Contacto y soporte
- **Contenido específico** para RecitApp (billetera virtual, roles de usuario, etc.)

### ❓ FAQ Interactivas (`/legal/faq`)
- **Búsqueda inteligente** en tiempo real
- **Acordeón expandible** por pregunta
- **12 categorías organizadas**:
  - Información General
  - Registro y Cuentas
  - Compra de Entradas
  - Pagos y Billetera Virtual
  - Cancelaciones y Reembolsos
  - Entradas Digitales
  - Verificación en Eventos
  - Notificaciones
  - Gestión de Eventos (Organizadores)
  - Seguridad y Privacidad
  - Problemas Técnicos
  - Soporte y Contacto
- **Accesos rápidos** a categorías populares
- **Información de contacto** integrada

## 🧭 Navegación Integrada

### Navbar
Se agregó un dropdown **"Ayuda"** en la navbar principal con:
- Preguntas Frecuentes
- Términos y Condiciones  
- Centro Legal
- Contactar Soporte (email directo)

### Enlaces Cruzados
- Desde T&C se puede ir a FAQ
- Desde FAQ se puede ir a T&C
- Botones "Volver" en todas las páginas
- Navegación breadcrumb implícita

## 🎨 Características de Diseño

### Responsive Design
- **Mobile-first** approach
- Adaptación automática a diferentes tamaños de pantalla
- Navegación optimizada para dispositivos móviles

### Accesibilidad
- Iconos descriptivos para cada sección
- Colores contrastantes para buena legibilidad
- Navegación por teclado habilitada
- Estructura semántica HTML5

### UX/UI Moderna
- **Animaciones suaves** para acordeones y hover effects
- **Códigos de colores** consistentes con RecitApp
- **Typography** jerárquica clara
- **Cards y badges** informativos

## 🔧 Configuración Técnica

### Dependencias
- **CommonModule** - Funcionalidad básica de Angular
- **RouterModule** - Navegación entre páginas  
- **Bootstrap Icons** - Iconografía consistente

### Lazy Loading
El módulo legal se carga de forma lazy para optimizar el rendimiento:

```typescript
{
  path: 'legal',
  loadChildren: () => import('./modules/legal/legal.module').then(m => m.LegalModule)
}
```

### Standalone Components
Todos los componentes son standalone para facilitar el mantenimiento y testing.

## 📱 Funcionalidades Destacadas

### Búsqueda FAQ
```typescript
searchFAQ(event: any): void {
  const term = event.target.value.toLowerCase();
  // Filtrado en tiempo real por pregunta y respuesta
}
```

### Navegación Suave
```typescript
scrollToSection(sectionId: string): void {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
```

### Acordeón Interactivo
```typescript
toggleItem(sectionIndex: number, itemIndex: number): void {
  section.items[itemIndex].isOpen = !section.items[itemIndex].isOpen;
}
```

## 🚀 Cómo Usar

### Para Desarrolladores
1. Las páginas están completamente integradas en el routing
2. No requiere configuración adicional
3. Usar las rutas `/legal/*` para navegación programática

### Para Usuarios
1. Acceder desde el dropdown **"Ayuda"** en la navbar
2. Usar la búsqueda en FAQ para encontrar respuestas específicas
3. Navegar por el índice en Términos y Condiciones
4. Contactar soporte desde cualquier página legal

## 📞 Información de Contacto Integrada

- **Email:** soporte@recitapp.com
- **Teléfono:** +54 11 1234-5678  
- **Horarios:** Lunes a Viernes de 9:00 a 18:00 hs
- **Tiempo de respuesta:**
  - Consultas generales: 48 horas
  - Problemas de pago: 24 horas
  - Emergencias: Inmediato

## 🎯 Beneficios de la Implementación

### Para RecitApp
- ✅ **Cumplimiento legal** completo
- ✅ **Experiencia de usuario** profesional
- ✅ **Soporte integrado** reduce consultas repetitivas
- ✅ **SEO optimizado** con contenido estructurado

### Para Usuarios
- ✅ **Acceso fácil** a información legal
- ✅ **Búsqueda rápida** de respuestas
- ✅ **Interfaz intuitiva** y moderna
- ✅ **Contacto directo** con soporte

## 🔄 Mantenimiento

### Actualizaciones de Contenido
- Modificar arrays de FAQ en `faq.component.ts`
- Actualizar secciones HTML en `terms-and-conditions.component.html`
- Cambiar información de contacto en variables del componente

### Estilos y Diseño
- Personalizar colores en archivos `.scss`
- Ajustar responsive breakpoints según necesidades
- Modificar animaciones y transiciones

---

**Estado:** ✅ Implementado y listo para producción
**Última actualización:** Junio 2025
**Mantenido por:** Equipo RecitApp 