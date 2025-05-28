# Credenciales de Prueba - RecitApp

## Usuarios Disponibles

### 1. Administrador
- **Email:** `admin@recitapp.com`
- **Contraseña:** `admin123`
- **Rol:** ADMIN
- **Permisos:** Acceso completo a todas las funcionalidades

### 2. Moderador
- **Email:** `moderador@recitapp.com`
- **Contraseña:** `moderador123`
- **Rol:** MODERADOR
- **Permisos:** Verificación de eventos y publicación

### 3. Usuario Regular
- **Email:** `usuario@recitapp.com`
- **Contraseña:** `password`
- **Rol:** COMPRADOR
- **Permisos:** Búsqueda, compra de entradas, seguimiento de artistas

## Notas Importantes

1. **Problema de Credenciales Inválidas:** Si recibes este error, verifica que estés usando exactamente las credenciales listadas arriba.

2. **Problema de "No refresh token available":** Este error ocurre cuando intentas acceder a rutas protegidas sin estar autenticado. La solución es:
   - Ir a `/auth/login`
   - Hacer login con una de las credenciales válidas
   - Luego navegar a las rutas protegidas

3. **Rutas por Defecto:** 
   - La aplicación ahora redirige automáticamente a `/auth/login` cuando accedes a la raíz
   - Las rutas 404 también redirigen a `/auth/login`

## Flujo de Autenticación Recomendado

1. Abrir la aplicación (automáticamente va a `/auth/login`)
2. Usar una de las credenciales de arriba
3. Una vez autenticado, navegar a las diferentes secciones:
   - `/events` - Lista de eventos
   - `/artists` - Lista de artistas
   - `/venues` - Lista de recintos
   - `/user/profile` - Perfil de usuario (requiere autenticación)

## Solución de Problemas

### Error: "Credenciales inválidas"
- Verifica que el email y contraseña sean exactamente como se muestran arriba
- Asegúrate de que el backend esté ejecutándose en `http://localhost:8080`
- Verifica que la base de datos tenga los usuarios de prueba cargados

### Error: "No refresh token available"
- Esto es normal si no estás autenticado
- Simplemente ve a `/auth/login` e inicia sesión

### Error: "Full authentication is required"
- Ocurre cuando intentas acceder a rutas protegidas sin autenticación
- Solución: Hacer login primero 