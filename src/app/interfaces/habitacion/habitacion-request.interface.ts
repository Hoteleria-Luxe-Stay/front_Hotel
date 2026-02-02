/**
 * DTO de request para crear/actualizar habitación - Coincide con backend HabitacionRequest.java
 */
export interface HabitacionRequest {
  numero: string;
  precio: number;
  capacidad: number;
  hotelId: number;
  tipoHabitacionId: number;
}
