# Recitapp Front

Frontend para la plataforma Recitapp, desarrollado en Angular 17 y TypeScript. Este proyecto implementa una arquitectura modular, facilitando la escalabilidad, el mantenimiento y la colaboración.

## Integración con Backend

El código backend de Recitapp se encuentra disponible en https://github.com/113935-Quilpatay-Nahuel-Ignacio/recitapp-api, específicamente en el directorio https://github.com/113935-Quilpatay-Nahuel-Ignacio/recitapp-api/tree/master/src/main.

## Estructura del Proyecto

```
src/
│
├── app/
│   ├── core/                # Módulos y servicios centrales
│   ├── modules/             # Módulos funcionales principales
│   │   ├── artist/          # Funcionalidad relacionada con artistas
│   │   │   ├── components/
│   │   │   ├── models/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   ├── event/           # Funcionalidad de eventos
│   │   │   ├── components/
│   │   │   ├── models/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   ├── notification/    # Notificaciones
│   │   │   ├── components/
│   │   │   ├── models/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   ├── ticket/          # Tickets
│   │   │   ├── components/
│   │   │   ├── models/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   ├── transaction/     # Transacciones
│   │   │   ├── models/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   ├── user/            # Usuarios
│   │   │   ├── components/
│   │   │   ├── models/
│   │   │   ├── pages/
│   │   │   └── services/
│   │   └── venue/           # Recintos
│   │       ├── components/
│   │       ├── models/
│   │       ├── pages/
│   │       └── services/
│   ├── shared/              # Componentes y módulos compartidos
│   │   └── components/
│   ├── app.component.*      # Componente raíz
│   ├── app.routes.ts        # Rutas principales
│   └── app.config.ts        # Configuración global
│
├── assets/                  # Recursos estáticos (imágenes, etc.)
│
├── environments/            # Configuración de entornos
│
├── styles.scss              # Estilos globales
│
└── main.ts                  # Punto de entrada de la aplicación
```

## Principios y Guías de Desarrollo (Angular 17)

Estas reglas y principios guían el desarrollo de este proyecto para asegurar la calidad, mantenibilidad y consistencia del código.

### Reglas Generales

*   No te disculpes.
*   No agradezcas al usuario.
*   Comunícate de forma natural, como un humano.
*   Verifica siempre la información antes de realizar cambios.
*   Preserva todas las estructuras de código existentes a menos que haya una razón clara y justificada para modificarlas.
*   Responde de forma concisa y con relevancia.
*   Valida toda la lógica y las suposiciones antes de confirmar los cambios.
*   Si se utiliza la palabra clave "EN", escribe en inglés. (Los comentarios de código siempre deben estar en inglés).
*   Si se utiliza la palabra clave "ES", escribe en español.
*   Explica claramente por qué se escribió cualquier código, incluyendo el razonamiento (por ejemplo, mejores prácticas, requisitos del proyecto, aportes de los interesados).
*   Prueba todos los métodos a fondo para asegurar la cobertura — esto es crítico.
*   **Always write code comments in English.**

### Infracciones que Serán Penalizadas

*   Omitir pasos de razonamiento.
*   Dejar marcadores de posición o comentarios TODO para otros.
*   Entregar código que no esté completamente listo para producción.

### Debes

*   Seguir la intención del usuario exactamente.
*   Nunca romper la funcionalidad existente a menos que puedas restaurarla completamente y con confianza.
*   Minimizar tu diff — los cambios más pequeños posibles ganan.

### Cambios Archivo por Archivo

*   Realiza cambios en pasos pequeños e incrementales.
*   Prueba todos los cambios rigurosamente antes de confirmar.
*   Documenta los cambios de manera clara y significativa en los mensajes de commit.

### Estilo de Código y Formato (Angular 17)

*   Sigue los estándares de codificación del proyecto con precisión (ver `.eslintrc.json`, `.prettierrc`, `.editorconfig`).
*   Utiliza convenciones de nomenclatura consistentes y descriptivas.
*   No utilices bibliotecas, funciones o APIs obsoletas. Mantente actualizado con las mejores prácticas de Angular 17.
*   Las líneas no deben exceder los 80 caracteres.
*   Las funciones y métodos no deben tener más de 4 parámetros.
*   Las funciones no deben tener más than 50 líneas ejecutables.
*   No anidar código más de 2 niveles de profundidad.
*   Preferir el uso de la función `forNext` (ubicada en `libs/smart-ngrx/src/common/for-next.function.ts`) en lugar de `for(let i;i < length;i++)`, `forEach` o `for(x of y)`.
*   Al refactorizar código existente, mantener intactos los comentarios JSDoc.

### Depuración y Pruebas

*   Incluye información detallada de depuración en los archivos de registro.
*   Escribe una cobertura completa de pruebas unitarias para toda la lógica nueva.
*   Asegúrate de que todas las pruebas pasen antes de la fusión.

### Estructura del Proyecto

*   Mantén un diseño de proyecto limpio, organizado y lógico (como se describe en "Estructura del Proyecto").
*   Utiliza nombres significativos y legibles para todos los archivos y directorios.
*   Elimina los archivos no utilizados u obsoletos rápidamente para evitar el desorden.

### Principios de Código Limpio

*   **DRY – Don't Repeat Yourself (No te repitas)**: Evita la duplicación. Cualquier lógica debe existir en un solo lugar. Usa funciones, servicios o clases de Angular para reutilizar código.
*   **Curly's Law – Do One Thing (Ley de Curly - Haz una cosa)**: Cada componente de Angular (clase, función, variable) debe representar un concepto y hacer una sola cosa.
*   **KISS – Keep It Simple, Stupid (Mantenlo simple, estúpido)**: La simplicidad es tu estrategia por defecto. Prefiere código simple, obvio y legible.
*   **Don't Make Me Think (No me hagas pensar)**: Tu código debe ser instantáneamente legible y comprensible.
*   **YAGNI – You Aren't Gonna Need It (No lo vas a necesitar)**: Nunca implementes funcionalidad solo porque "podrías necesitarla más tarde".
*   **Premature Optimization Is the Root of All Evil (La optimización prematura es la raíz de todos los males)**: Optimiza solo cuando sea necesario y después de que el perfilado lo confirme.
*   **Boy Scout Rule (Regla del Boy Scout)**: Deja siempre el código mejor de lo que lo encontraste.
*   **Code for the Maintainer (Código para el mantenedor)**: Escribe código pensando en la claridad y mantenibilidad.
*   **Principle of Least Astonishment (Principio de menor asombro)**: El código debe comportarse como su nombre, estructura y documentación sugieren.

## Scripts Principales

-   `npm start` o `ng serve` — Inicia la aplicación en modo desarrollo. Navega a `http://localhost:4200/`. La aplicación se recargará automáticamente si cambias algún archivo fuente.
-   `npm run build` o `ng build` — Compila el proyecto. Los artefactos de compilación se almacenarán en el directorio `dist/`.
-   `npm test` o `ng test` — Ejecuta las pruebas unitarias vía Karma.

## Otros Comandos Útiles de Angular CLI

-   `ng generate component component-name` — Genera un nuevo componente. También puedes usar `ng generate directive|pipe|service|class|guard|interface|enum|module`.
-   `ng e2e` — Ejecuta las pruebas end-to-end. Necesitas añadir un paquete que implemente capacidades de prueba end-to-end.
-   `ng help` — Para obtener más ayuda sobre Angular CLI o consulta la [página de Angular CLI Overview and Command Reference](https://angular.io/cli).

## Requisitos

-   Node.js >= 18.x
-   Angular CLI >= 17.x

## Instalación

```bash
npm install
```

## Ejecución (Servidor de Desarrollo)

```bash
npm start
```
o
```bash
ng serve
```

## Estructura de Módulos Funcionales

Cada módulo funcional principal (por ejemplo, `artist`, `event`, `ticket`) sigue la siguiente convención:

-   `components/` — Componentes reutilizables específicos del módulo.
-   `models/` — Interfaces y modelos de datos del módulo.
-   `pages/` — Componentes que actúan como páginas o vistas principales del módulo.
-   `services/` — Servicios de Angular para la lógica de negocio y acceso a datos del módulo.

## Estilo y Convenciones Adicionales

-   Código en TypeScript.
-   Estilos en SCSS.
-   Linting y formateo definidos en `.eslintrc.json`, `.prettierrc`, `.editorconfig` (revisar la sección "Estilo de Código y Formato" para más detalles).

## Contribución

1.  Haz un fork del repositorio.
2.  Crea una rama para tu nueva funcionalidad (feature) o corrección de error (fix).
3.  Realiza tus cambios y haz commit siguiendo las convenciones del proyecto y las guías de este README.
4.  Asegúrate de que todas las pruebas pasen.
5.  Abre un Pull Request detallando tus cambios.
