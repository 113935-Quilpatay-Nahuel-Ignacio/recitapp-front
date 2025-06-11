# Panel de Prueba de Notificaciones - RecitApp

Este componente proporciona una interfaz de administración para probar y demostrar los diferentes tipos de notificaciones disponibles en RecitApp.

## Acceso

- **URL**: `/admin/notification-test`
- **Permisos**: Solo usuarios con rol `ADMIN`
- **Autenticación**: Requerida

## Funcionalidades

### 1. Notificaciones por Email

Permite probar diferentes tipos de emails:

- **Personalizado**: Email con asunto y mensaje personalizado
- **Nuevo Evento**: Template específico para nuevos eventos
- **Baja Disponibilidad**: Template para alertas de pocas entradas
- **Recordatorio**: Template para recordatorios de eventos

#### Campos disponibles:
- Email destinatario
- Asunto
- Mensaje (solo personalizado)
- Datos del evento (para templates específicos)

### 2. Notificaciones por SMS

Permite probar mensajes SMS con diferentes templates:

- **Personalizado**: SMS con mensaje personalizado
- **Recordatorio de Evento**: Template para recordatorios
- **Confirmación de Ticket**: Template para confirmaciones
- **Cancelación de Evento**: Template para cancelaciones

#### Campos disponibles:
- Número de teléfono (formato internacional)
- Mensaje (máx. 160 caracteres)
- Template ID
- Datos del evento

### 3. Notificaciones Push

Permite probar notificaciones push de Firebase:

- **Simple**: Notificación básica con título y mensaje
- **Avanzada**: Notificación con datos adicionales, imagen y URL de acción
- **Por Tópico**: Notificación enviada a un tópico específico
- **De Evento**: Template específico para eventos

#### Gestión de Device Tokens:
- Validación de tokens
- Lista de tokens registrados del usuario
- Selección automática para pruebas

### 4. Historial de Resultados

- Muestra los últimos 10 resultados de pruebas
- Información de éxito/error
- Timestamp de cada operación
- Mensajes detallados de respuesta

## Endpoints de API Utilizados

### Email
- `POST /notifications/test/email` - Email personalizado
- `POST /notifications/email/new-event` - Template nuevo evento
- `POST /notifications/email/low-availability` - Template baja disponibilidad

### SMS
- `POST /notifications/test/sms` - SMS personalizado
- `POST /notifications/test/sms/template` - SMS con template

### Push Notifications
- `POST /notifications/test/push` - Push simple
- `POST /notifications/test/push/advanced` - Push avanzada
- `POST /notifications/test/push/topic` - Push por tópico
- `POST /notifications/test/push/event-notification` - Push de evento
- `POST /notifications/test/push/validate-token` - Validar token

### Device Tokens
- `GET /device-tokens/user/{userId}` - Obtener tokens del usuario

## Uso Recomendado

1. **Para Demostraciones**: Usar templates predefinidos con datos realistas
2. **Para Pruebas**: Usar opciones personalizadas para casos específicos
3. **Para Validación**: Verificar tokens antes de enviar push notifications
4. **Para Debugging**: Revisar el historial de resultados para identificar problemas

## Consideraciones Técnicas

- Los formularios incluyen validación en tiempo real
- Las operaciones son asíncronas con indicadores de carga
- Los resultados se almacenan localmente (no persisten al recargar)
- Compatible con responsive design para dispositivos móviles

## Configuración Necesaria

Para que funcione correctamente, asegúrate de que estén configurados:

1. **Email Service**: SMTP configurado en el backend
2. **SMS Service**: Twilio u otro proveedor configurado
3. **Firebase Cloud Messaging**: Para push notifications
4. **Device Tokens**: Usuarios deben tener tokens registrados

## Troubleshooting

### Errores Comunes

- **401 Unauthorized**: Verificar autenticación y rol de admin
- **Email failed**: Verificar configuración SMTP
- **SMS failed**: Verificar configuración Twilio
- **Push failed**: Verificar configuración Firebase y validez del token
- **Device token invalid**: Token expirado o formato incorrecto 