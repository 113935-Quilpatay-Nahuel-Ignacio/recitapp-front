export interface Event {
  id: number;
  name: string; // Changed from nombre
  description?: string; // Changed from descripcion
  startDateTime?: string; // Changed from fechaHoraInicio, ISO Date string
  location?: string; // Changed from lugar
  // Other relevant fields can be added here
} 