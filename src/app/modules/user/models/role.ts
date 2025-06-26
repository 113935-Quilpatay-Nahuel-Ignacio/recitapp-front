export interface Role {
  id: number;
  name: string;
  description: string;
}

export const AVAILABLE_ROLES = [
  { value: 'ADMIN', label: 'Administrador', description: 'Administrador del sistema con acceso completo a todas las funcionalidades' },
  { value: 'MODERADOR', label: 'Moderador', description: 'Moderador de eventos que verifica la legitimidad de eventos y los publica' },
  { value: 'REGISTRADOR_EVENTO', label: 'Registrador de Eventos', description: 'Usuario que puede crear y configurar eventos (manager, organizador, artista)' },
  { value: 'COMPRADOR', label: 'Comprador', description: 'Usuario estándar que puede buscar, comprar entradas y seguir artistas/eventos' },
  { value: 'VERIFICADOR_ENTRADAS', label: 'Verificador de Entradas', description: 'Usuario especializado en verificar códigos QR de entradas en eventos' }
] as const;

export type RoleName = typeof AVAILABLE_ROLES[number]['value'];
