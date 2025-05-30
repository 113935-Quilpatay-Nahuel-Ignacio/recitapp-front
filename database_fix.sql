-- Script para corregir el tamaño de las columnas de imagen en la base de datos
-- Ejecutar en el servidor de base de datos MySQL/MariaDB

-- Cambiar el tipo de columna flyer_image en events para soportar imágenes Base64
ALTER TABLE events MODIFY COLUMN flyer_image LONGTEXT;

-- También corregir profile_image en artists por consistencia
ALTER TABLE artists MODIFY COLUMN profile_image LONGTEXT;

-- Verificar los cambios
DESCRIBE events;
DESCRIBE artists; 