#!/usr/bin/env node

/**
 * Script para aplicar estilos unificados a componentes existentes
 * Uso: node scripts/apply-unified-styles.js [module-name] [component-type]
 * 
 * Tipos de componente:
 * - list: Para componentes de lista
 * - form: Para componentes de formulario  
 * - detail: Para componentes de detalle
 */

const fs = require('fs');
const path = require('path');

// Función para calcular la ruta relativa correcta
function getImportPath(componentPath) {
  // Calcular el número de niveles desde el componente hasta src/app
  const relativePath = path.relative('src/app', componentPath);
  const levels = relativePath.split(path.sep).length - 1; // -1 porque el archivo no cuenta
  const backLevels = '../'.repeat(levels);
  return `${backLevels}shared/styles/global-component-styles`;
}

// Plantillas de estilos unificados
const templates = {
  list: `// {COMPONENT_NAME} Component Styles - Using Unified App Styles
// Following artist module patterns for consistency

// Import and apply unified app styles
@import '{IMPORT_PATH}';

// Apply the list component styling pattern
@include app-list-component;

// {MODULE_NAME}-specific customizations
.{ITEM_NAME}-card {
  .{ITEM_NAME}-image {
    height: 200px;
    object-fit: cover;
    width: 100%;
    transition: transform 0.3s ease;
  }
  
  .{ITEM_NAME}-image-placeholder {
    height: 200px;
    background: linear-gradient(135deg, var(--dark-card-hover), var(--dark-card));
    display: flex;
    align-items: center;
    justify-content: center;
    
    i {
      font-size: 3rem;
      color: var(--dark-text-muted);
    }
  }
  
  &:hover .{ITEM_NAME}-image {
    transform: scale(1.05);
  }
}

// Additional responsive improvements
@media (max-width: 768px) {
  .{ITEM_NAME}s-grid {
    .{ITEM_NAME}-card {
      .card-body {
        padding: 1.25rem;
        
        .card-title {
          font-size: 1.125rem;
        }
      }
    }
  }
}`,

  form: `// {COMPONENT_NAME} Component Styles - Using Unified App Styles
// Following artist module patterns for consistency

// Import and apply unified app styles
@import '{IMPORT_PATH}';

// Apply the form component styling pattern
@include app-form-component;

// {MODULE_NAME}-specific customizations
.{MODULE_NAME}-form {
  .form-section {
    .form-section-title {
      color: var(--primary-green);
      font-weight: 700;
      font-size: 1rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.5rem;
      border-bottom: 2px solid rgba(34, 197, 94, 0.2);
      
      i {
        color: var(--primary-green);
        margin-right: 0.5rem;
      }
    }
  }
}

// Responsive improvements
@media (max-width: 768px) {
  .{MODULE_NAME}-form {
    .form-section {
      padding: 1.5rem;
    }
  }
}`,

  detail: `// {COMPONENT_NAME} Component Styles - Using Unified App Styles
// Following artist module patterns for consistency

// Import and apply unified app styles
@import '{IMPORT_PATH}';

// Apply the detail component styling pattern
@include app-detail-component;

// {MODULE_NAME}-specific customizations
.{MODULE_NAME}-detail {
  .detail-section {
    .section-title {
      color: var(--primary-green);
      font-weight: 700;
      font-size: 1.25rem;
      margin-bottom: 1.5rem;
      display: flex;
      align-items: center;
      
      &::before {
        content: '';
        width: 4px;
        height: 1.5rem;
        background: linear-gradient(135deg, var(--primary-green), var(--primary-green-hover));
        border-radius: 2px;
        margin-right: 0.75rem;
      }
      
      i {
        margin-right: 0.5rem;
        color: var(--primary-green);
      }
    }
  }
}

// Responsive improvements
@media (max-width: 768px) {
  .{MODULE_NAME}-detail {
    .detail-section {
      padding: 1rem;
    }
  }
}`
};

function applyUnifiedStyles(moduleName, componentType, componentPath) {
  if (!templates[componentType]) {
    console.error(`Tipo de componente no válido: ${componentType}`);
    console.error('Tipos válidos: list, form, detail');
    process.exit(1);
  }

  const template = templates[componentType];
  const componentName = path.basename(componentPath, '.component.scss');
  const itemName = moduleName.replace(/-/g, '');
  const importPath = getImportPath(componentPath);
  
  // Reemplazar placeholders en la plantilla
  let content = template
    .replace(/{COMPONENT_NAME}/g, componentName.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' '))
    .replace(/{MODULE_NAME}/g, moduleName)
    .replace(/{ITEM_NAME}/g, itemName)
    .replace(/{IMPORT_PATH}/g, importPath);

  // Escribir el archivo
  const scssPath = componentPath;
  
  try {
    // Crear backup si el archivo existe
    if (fs.existsSync(scssPath)) {
      const backupPath = scssPath + '.backup';
      fs.copyFileSync(scssPath, backupPath);
      console.log(`✅ Backup creado: ${backupPath}`);
    }
    
    // Escribir nuevo contenido
    fs.writeFileSync(scssPath, content);
    console.log(`✅ Estilos unificados aplicados a: ${scssPath}`);
    console.log(`📍 Ruta de importación: ${importPath}`);
    
  } catch (error) {
    console.error(`❌ Error al escribir archivo: ${error.message}`);
    process.exit(1);
  }
}

function findComponentFiles(moduleName) {
  const modulePath = path.join('src', 'app', 'modules', moduleName);
  
  if (!fs.existsSync(modulePath)) {
    console.error(`❌ Módulo no encontrado: ${modulePath}`);
    process.exit(1);
  }
  
  const components = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        scanDirectory(itemPath);
      } else if (item.endsWith('.component.scss')) {
        components.push(itemPath);
      }
    }
  }
  
  scanDirectory(modulePath);
  return components;
}

function detectComponentType(componentPath) {
  const componentName = path.basename(componentPath, '.component.scss');
  
  if (componentName.includes('list')) return 'list';
  if (componentName.includes('form') || componentName.includes('edit') || componentName.includes('create')) return 'form';
  if (componentName.includes('detail') || componentName.includes('view') || componentName.includes('profile')) return 'detail';
  
  // Analizar contenido del archivo si existe
  if (fs.existsSync(componentPath)) {
    const content = fs.readFileSync(componentPath, 'utf8');
    
    if (content.includes('.card-grid') || content.includes('pagination')) return 'list';
    if (content.includes('.form-control') || content.includes('form-group')) return 'form';
    if (content.includes('.card-header') || content.includes('detail')) return 'detail';
  }
  
  return 'list'; // Default
}

// Función principal
function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log(`
🎨 Script de Aplicación de Estilos Unificados - RecitApp

Uso:
  node scripts/apply-unified-styles.js <module-name> [component-type]
  node scripts/apply-unified-styles.js <module-name> --auto

Ejemplos:
  node scripts/apply-unified-styles.js event list
  node scripts/apply-unified-styles.js user --auto
  node scripts/apply-unified-styles.js ticket form

Tipos de componente:
  - list: Para componentes de lista (eventos, artistas, etc.)
  - form: Para componentes de formulario (crear, editar)
  - detail: Para componentes de detalle (perfil, vista)
  - --auto: Detecta automáticamente el tipo de componente

Módulos disponibles:
  - event
  - user  
  - ticket
  - venue
  - auth
  - admin
  - notification
  - transaction
    `);
    process.exit(0);
  }
  
  const moduleName = args[0];
  const componentTypeOrAuto = args[1];
  
  if (componentTypeOrAuto === '--auto') {
    // Modo automático: encontrar todos los componentes y aplicar estilos
    console.log(`🔍 Buscando componentes en el módulo: ${moduleName}`);
    
    const components = findComponentFiles(moduleName);
    
    if (components.length === 0) {
      console.log(`❌ No se encontraron componentes SCSS en el módulo: ${moduleName}`);
      process.exit(1);
    }
    
    console.log(`📁 Encontrados ${components.length} componentes:`);
    
    for (const componentPath of components) {
      const detectedType = detectComponentType(componentPath);
      console.log(`  - ${componentPath} (tipo: ${detectedType})`);
      applyUnifiedStyles(moduleName, detectedType, componentPath);
    }
    
    console.log(`\n✨ ¡Estilos unificados aplicados a todos los componentes del módulo ${moduleName}!`);
    
  } else {
    // Modo específico: aplicar a un tipo específico
    const componentType = componentTypeOrAuto || 'list';
    
    console.log(`🔍 Buscando componentes de tipo "${componentType}" en el módulo: ${moduleName}`);
    
    const components = findComponentFiles(moduleName);
    const filteredComponents = components.filter(comp => {
      const detectedType = detectComponentType(comp);
      return detectedType === componentType;
    });
    
    if (filteredComponents.length === 0) {
      console.log(`❌ No se encontraron componentes de tipo "${componentType}" en el módulo: ${moduleName}`);
      process.exit(1);
    }
    
    for (const componentPath of filteredComponents) {
      applyUnifiedStyles(moduleName, componentType, componentPath);
    }
    
    console.log(`\n✨ ¡Estilos unificados aplicados a ${filteredComponents.length} componentes!`);
  }
  
  console.log(`
📖 Próximos pasos:
1. Revisar los archivos generados
2. Ajustar customizaciones específicas si es necesario
3. Probar la aplicación en diferentes tamaños de pantalla
4. Verificar que los estilos se vean correctamente

📚 Consultar la guía completa en: STYLE_GUIDE.md
  `);
}

// Ejecutar script
if (require.main === module) {
  main();
}

module.exports = { applyUnifiedStyles, findComponentFiles, detectComponentType }; 