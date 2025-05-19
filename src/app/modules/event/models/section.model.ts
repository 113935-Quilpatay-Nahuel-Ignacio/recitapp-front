export interface Section {
  id: number;
  name: string;
  capacity: number;
  price?: number; // Precio base de la sección, opcional si no se muestra
  currency?: string; // Moneda del precio, opcional
  // Otros campos relevantes para identificar una sección en el contexto de un evento
} 