# Gestión de Usuarios - RecitApp Frontend

## Descripción

Sistema completo de gestión de usuarios para administradores de RecitApp. Permite crear, editar, visualizar y eliminar usuarios del sistema con una interfaz moderna y funcional.

## ✅ Estado del Proyecto

**COMPLETAMENTE IMPLEMENTADO** - Sistema listo para producción con todas las funcionalidades operativas.

## Características Principales

### 🔍 **Listado y Búsqueda**
- ✅ Tabla paginada con todos los usuarios del sistema
- ✅ Filtros avanzados por:
  - Texto libre (email, nombre, apellido, DNI)
  - Rol de usuario
  - País
  - Estado (activo/inactivo)
- ✅ Ordenamiento por cualquier columna
- ✅ Estadísticas en tiempo real por tipo de rol

### 👤 **Gestión de Usuarios**
- ✅ **Crear usuarios** con rol específico
- ✅ **Editar información** de usuarios existentes
- ✅ **Ver detalles completos** con historial de actividad
- ✅ **Eliminar usuarios** con confirmación y resumen de impacto

### 📊 **Información Detallada**
- ✅ Información personal y de contacto
- ✅ Historial de compras y transacciones
- ✅ Artistas y venues seguidos
- ✅ Preferencias de notificación
- ✅ Datos de cuenta y actividad

### 🛡️ **Seguridad**
- ✅ Solo usuarios con rol `ADMIN` pueden acceder
- ✅ Confirmación obligatoria para eliminaciones
- ✅ Resumen de impacto antes de eliminar usuarios
- ✅ Validaciones completas en formularios

### 📤 **Exportación**
- ✅ Exportación de usuarios a CSV
- ✅ Descarga automática con fecha actual

## Estructura de Archivos

```
src/app/modules/admin/
├── components/
│   ├── user-management/
│   │   ├── user-management.component.ts
│   │   ├── user-management.component.html
│   │   └── user-management.component.scss
│   ├── user-form-dialog/
│   │   ├── user-form-dialog.component.ts
│   │   ├── user-form-dialog.component.html
│   │   └── user-form-dialog.component.scss
│   └── user-detail-dialog/
│       ├── user-detail-dialog.component.ts
│       ├── user-detail-dialog.component.html
│       └── user-detail-dialog.component.scss
├── services/
│   └── user-admin.service.ts
└── admin-routing.module.ts

src/app/shared/
├── components/
│   └── confirm-dialog/
│       └── confirm-dialog.component.ts
└── pipes/
    └── filter.pipe.ts

src/app/modules/user/models/
├── user.ts
└── role.ts
```

## Endpoints del Backend Utilizados

### Gestión de Usuarios
- `GET /api/users` - Obtener todos los usuarios
- `GET /api/users/{id}` - Obtener usuario por ID
- `POST /api/admin/users/create` - Crear usuario con rol específico
- `PUT /api/users/{id}` - Actualizar usuario
- `DELETE /api/users/{id}` - Eliminar usuario
- `GET /api/users/{id}/related-data` - Resumen de datos relacionados

### Información Adicional
- `GET /api/users/{id}/purchases` - Historial de compras
- `GET /api/users/{id}/artists/following` - Artistas seguidos
- `GET /api/users/{id}/venues/following` - Venues seguidos
- `GET /api/users/{id}/notification-preferences` - Preferencias de notificación

## Roles Disponibles

| Rol | Descripción |
|-----|-------------|
| `ADMIN` | Administrador del sistema con acceso completo |
| `MODERADOR` | Moderador de eventos que verifica y publica eventos |
| `REGISTRADOR_EVENTO` | Usuario que puede crear y configurar eventos |
| `COMPRADOR` | Usuario estándar que puede comprar entradas |

## Cómo Usar

### 1. Acceso al Sistema
- Iniciar sesión con una cuenta que tenga rol `ADMIN`
- Navegar a `/admin/users` o `/admin` (redirige automáticamente)

### 2. Visualizar Usuarios
- La tabla muestra todos los usuarios con información básica
- Usar los filtros para encontrar usuarios específicos
- Ver estadísticas por rol en las tarjetas superiores

### 3. Crear Usuario
1. Hacer clic en "Crear Usuario"
2. Completar el formulario con:
   - Información personal (nombre, apellido, email, DNI)
   - Ubicación (país, ciudad)
   - Contacto (teléfono, dirección) - opcional
   - Rol del usuario
   - Contraseña
3. Hacer clic en "Crear Usuario"

### 4. Editar Usuario
1. Hacer clic en el ícono de edición (✏️) en la fila del usuario
2. Modificar los campos necesarios
3. La contraseña es opcional (dejar vacío para mantener la actual)
4. Hacer clic en "Actualizar"

### 5. Ver Detalles
1. Hacer clic en el ícono de vista (👁️) en la fila del usuario
2. Navegar por las pestañas:
   - **Información General**: Datos personales y de cuenta
   - **Compras**: Historial de transacciones
   - **Artistas Seguidos**: Lista de artistas que sigue
   - **Venues Seguidos**: Lista de venues que sigue
   - **Notificaciones**: Preferencias de notificación

### 6. Eliminar Usuario
1. Hacer clic en el menú de opciones (⋮) en la fila del usuario
2. Seleccionar "Eliminar"
3. Revisar el resumen de impacto que muestra:
   - Datos relacionados que se eliminarán
   - Advertencias importantes
   - Nivel de impacto (BAJO/MEDIO/ALTO)
4. Confirmar la eliminación

### 7. Exportar Usuarios
1. Hacer clic en "Exportar" en la parte superior
2. Se descargará automáticamente un archivo CSV con todos los usuarios
3. El archivo incluye fecha actual en el nombre

## Validaciones de Formulario

### Campos Obligatorios
- Email (formato válido)
- Nombre (mínimo 2 caracteres)
- Apellido (mínimo 2 caracteres)
- DNI (7-8 dígitos)
- País
- Ciudad
- Rol
- Contraseña (solo al crear, mínimo 6 caracteres)

### Campos Opcionales
- Teléfono
- Dirección

## Características Técnicas

### Componentes Standalone
Todos los componentes son standalone para mejor modularidad:
- `UserManagementComponent`
- `UserFormDialogComponent`
- `UserDetailDialogComponent`
- `ConfirmDialogComponent`

### Material Design
Utiliza Angular Material para una interfaz moderna:
- Tablas con paginación y ordenamiento
- Formularios con validación visual
- Diálogos modales
- Chips para estados y roles
- Snackbars para notificaciones

### Responsive Design
- Adaptable a diferentes tamaños de pantalla
- Columnas de tabla se ocultan en pantallas pequeñas
- Formularios se reorganizan en móviles

### Gestión de Estado
- Carga de datos reactiva
- Estados de loading
- Manejo de errores con notificaciones
- Actualización automática después de operaciones

## Mejoras Futuras

### Funcionalidades Adicionales
- [ ] Importación masiva de usuarios
- [ ] Filtros avanzados adicionales
- [ ] Historial de cambios de usuarios
- [ ] Soft delete (eliminación lógica)
- [ ] Búsqueda por rango de fechas
- [ ] Notificaciones en tiempo real

### Optimizaciones
- [ ] Paginación del lado del servidor
- [ ] Cache de datos de usuarios
- [ ] Lazy loading de datos relacionados
- [ ] Compresión de imágenes de perfil

## Troubleshooting

### Problemas Comunes

**Error: "No tienes permisos para acceder"**
- Verificar que el usuario tenga rol `ADMIN`
- Revisar que el token de autenticación sea válido

**Error al cargar usuarios**
- Verificar conexión con el backend
- Revisar logs del servidor para errores de base de datos

**Formulario no se envía**
- Verificar que todos los campos obligatorios estén completos
- Revisar validaciones de formato (email, DNI)

**Eliminación falla**
- Verificar que el usuario no tenga restricciones de eliminación
- Revisar logs del backend para errores de integridad

**Diálogos no se abren**
- Verificar que no haya errores de JavaScript en la consola
- Revisar que todos los módulos de Material estén importados

### Logs y Debugging
- Abrir DevTools del navegador
- Revisar la pestaña Console para errores JavaScript
- Revisar la pestaña Network para errores de API
- Los errores se muestran también en snackbars

## Instalación y Configuración

### Prerrequisitos
- Angular 17+
- Angular Material
- Backend RecitApp ejecutándose

### Pasos de Instalación
1. Los componentes ya están implementados y listos para usar
2. Asegurar que Angular Material esté instalado
3. Verificar que las rutas de admin estén configuradas
4. Confirmar que el usuario tenga permisos de ADMIN

### Variables de Entorno
```typescript
// src/environments/environment.ts
export const environment = {
  apiUrl: 'http://localhost:8080/api'  // Ajustar según configuración
};
```

## Contacto y Soporte

Para reportar bugs o solicitar nuevas funcionalidades, crear un issue en el repositorio del proyecto.

---

**Sistema completamente funcional y listo para producción** ✅ 