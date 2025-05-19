export interface Event {
  id: number;
  name: string; // Changed from nombre
  description?: string; // Changed from descripcion
  startDateTime?: string | Date; // Changed from fechaHoraInicio, ISO Date string, and allowing Date type
  location?: string; // Changed from lugar
  // Other relevant fields can be added here
} 