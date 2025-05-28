# Pruebas de Endpoints - Gestión de Usuarios

## Configuración Inicial

```bash
# Variables de entorno
export API_URL="http://localhost:8080/api"
export ADMIN_TOKEN="tu_token_de_admin_aqui"
```

## 1. Autenticación

### Obtener token de administrador
```bash
curl -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@recitapp.com",
    "password": "admin123"
  }'
```

## 2. Gestión de Usuarios

### Obtener todos los usuarios
```bash
curl -X GET "${API_URL}/users" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json"
```

### Obtener usuario por ID
```bash
curl -X GET "${API_URL}/users/1" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json"
```

### Crear usuario con rol específico
```bash
curl -X POST "${API_URL}/admin/users/create" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "nuevo.usuario@ejemplo.com",
    "password": "password123",
    "firstName": "Nuevo",
    "lastName": "Usuario",
    "dni": "12345678",
    "country": "Argentina",
    "city": "Córdoba",
    "roleName": "COMPRADOR"
  }'
```

### Actualizar usuario
```bash
curl -X PUT "${API_URL}/users/1" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Nombre Actualizado",
    "lastName": "Apellido Actualizado",
    "country": "Argentina",
    "city": "Buenos Aires"
  }'
```

### Obtener resumen de datos relacionados
```bash
curl -X GET "${API_URL}/users/1/related-data" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json"
```

### Eliminar usuario
```bash
curl -X DELETE "${API_URL}/users/1" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json"
```

## 3. Información Adicional de Usuarios

### Historial de compras
```bash
curl -X GET "${API_URL}/users/1/purchases" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json"
```

### Artistas seguidos
```bash
curl -X GET "${API_URL}/users/1/artists/following" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json"
```

### Venues seguidos
```bash
curl -X GET "${API_URL}/users/1/venues/following" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json"
```

### Preferencias de notificación
```bash
curl -X GET "${API_URL}/users/1/notification-preferences" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json"
```

### Actualizar preferencias de notificación
```bash
curl -X PUT "${API_URL}/users/1/notification-preferences" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "receiveReminderEmails": true,
    "receiveEventPush": true,
    "receiveArtistPush": false
  }'
```

## 4. Pruebas de Roles

### Crear usuario ADMIN
```bash
curl -X POST "${API_URL}/admin/users/create" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin.test@recitapp.com",
    "password": "admin123",
    "firstName": "Admin",
    "lastName": "Test",
    "dni": "87654321",
    "country": "Argentina",
    "city": "Córdoba",
    "roleName": "ADMIN"
  }'
```

### Crear usuario MODERADOR
```bash
curl -X POST "${API_URL}/admin/users/create" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "moderador.test@recitapp.com",
    "password": "mod123",
    "firstName": "Moderador",
    "lastName": "Test",
    "dni": "11223344",
    "country": "Argentina",
    "city": "Rosario",
    "roleName": "MODERADOR"
  }'
```

### Crear usuario REGISTRADOR_EVENTO
```bash
curl -X POST "${API_URL}/admin/users/create" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "registrador.test@recitapp.com",
    "password": "reg123",
    "firstName": "Registrador",
    "lastName": "Test",
    "dni": "55667788",
    "country": "Argentina",
    "city": "Mendoza",
    "roleName": "REGISTRADOR_EVENTO"
  }'
```

## 5. Pruebas de Validación

### Error: Email duplicado
```bash
curl -X POST "${API_URL}/admin/users/create" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@recitapp.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "Duplicado",
    "dni": "99999999",
    "country": "Argentina",
    "city": "Córdoba",
    "roleName": "COMPRADOR"
  }'
```

### Error: DNI duplicado
```bash
curl -X POST "${API_URL}/admin/users/create" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.dni@ejemplo.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "DNI",
    "dni": "12345678",
    "country": "Argentina",
    "city": "Córdoba",
    "roleName": "COMPRADOR"
  }'
```

### Error: Rol inválido
```bash
curl -X POST "${API_URL}/admin/users/create" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.rol@ejemplo.com",
    "password": "password123",
    "firstName": "Test",
    "lastName": "Rol",
    "dni": "88888888",
    "country": "Argentina",
    "city": "Córdoba",
    "roleName": "ROL_INEXISTENTE"
  }'
```

## 6. Verificación de Permisos

### Acceso sin token (debe fallar)
```bash
curl -X GET "${API_URL}/users" \
  -H "Content-Type: application/json"
```

### Acceso con token de usuario no-admin (debe fallar)
```bash
# Primero obtener token de usuario normal
curl -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@recitapp.com",
    "password": "password"
  }'

# Luego intentar acceder con ese token
curl -X GET "${API_URL}/users" \
  -H "Authorization: Bearer ${USER_TOKEN}" \
  -H "Content-Type: application/json"
```

## 7. Script de Prueba Completo

```bash
#!/bin/bash

# Configuración
API_URL="http://localhost:8080/api"
ADMIN_EMAIL="admin@recitapp.com"
ADMIN_PASSWORD="admin123"

echo "🚀 Iniciando pruebas de gestión de usuarios..."

# 1. Obtener token de admin
echo "📝 Obteniendo token de administrador..."
ADMIN_RESPONSE=$(curl -s -X POST "${API_URL}/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"${ADMIN_EMAIL}\",\"password\":\"${ADMIN_PASSWORD}\"}")

ADMIN_TOKEN=$(echo $ADMIN_RESPONSE | jq -r '.token')

if [ "$ADMIN_TOKEN" = "null" ]; then
  echo "❌ Error: No se pudo obtener token de administrador"
  exit 1
fi

echo "✅ Token obtenido exitosamente"

# 2. Obtener lista de usuarios
echo "📋 Obteniendo lista de usuarios..."
USERS_RESPONSE=$(curl -s -X GET "${API_URL}/users" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}")

USER_COUNT=$(echo $USERS_RESPONSE | jq '. | length')
echo "✅ Se encontraron ${USER_COUNT} usuarios"

# 3. Crear usuario de prueba
echo "👤 Creando usuario de prueba..."
TEST_USER_RESPONSE=$(curl -s -X POST "${API_URL}/admin/users/create" \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test.user@ejemplo.com",
    "password": "test123",
    "firstName": "Usuario",
    "lastName": "Prueba",
    "dni": "99887766",
    "country": "Argentina",
    "city": "Córdoba",
    "roleName": "COMPRADOR"
  }')

TEST_USER_ID=$(echo $TEST_USER_RESPONSE | jq -r '.id')

if [ "$TEST_USER_ID" != "null" ]; then
  echo "✅ Usuario creado con ID: ${TEST_USER_ID}"
  
  # 4. Obtener resumen de datos relacionados
  echo "📊 Obteniendo resumen de datos relacionados..."
  SUMMARY_RESPONSE=$(curl -s -X GET "${API_URL}/users/${TEST_USER_ID}/related-data" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}")
  
  TOTAL_RECORDS=$(echo $SUMMARY_RESPONSE | jq -r '.totalRelatedRecords')
  echo "✅ Total de registros relacionados: ${TOTAL_RECORDS}"
  
  # 5. Eliminar usuario de prueba
  echo "🗑️ Eliminando usuario de prueba..."
  DELETE_RESPONSE=$(curl -s -X DELETE "${API_URL}/users/${TEST_USER_ID}" \
    -H "Authorization: Bearer ${ADMIN_TOKEN}")
  
  echo "✅ Usuario eliminado exitosamente"
else
  echo "❌ Error al crear usuario de prueba"
fi

echo "🎉 Pruebas completadas exitosamente"
```

## Respuestas Esperadas

### Usuario creado exitosamente
```json
{
  "id": 123,
  "email": "nuevo.usuario@ejemplo.com",
  "firstName": "Nuevo",
  "lastName": "Usuario",
  "dni": "12345678",
  "country": "Argentina",
  "city": "Córdoba",
  "registrationDate": "2024-01-15T10:30:00",
  "roleName": "COMPRADOR",
  "authMethod": "EMAIL"
}
```

### Resumen de datos relacionados
```json
{
  "userId": 123,
  "email": "usuario@ejemplo.com",
  "fullName": "Usuario Ejemplo",
  "role": "COMPRADOR",
  "registrationDate": "2024-01-15T10:30:00",
  "active": true,
  "relatedDataCounts": {
    "refreshTokens": 0,
    "passwordResetTokens": 0,
    "notificationHistory": 0,
    "transactions": 0,
    "tickets": 0,
    "savedEvents": 0,
    "artistFollowers": 0,
    "venueFollowers": 0,
    "waitingRoomEntries": 0,
    "notificationPreferences": 1
  },
  "totalRelatedRecords": 1,
  "warnings": [],
  "deletionImpact": "BAJO"
}
``` 