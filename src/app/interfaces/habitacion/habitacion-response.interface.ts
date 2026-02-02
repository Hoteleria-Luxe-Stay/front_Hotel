import { TipoHabitacionResponse } from '../tipo-habitacion/tipo-habitacion-response.interface';

/**
 * DTO de respuesta de habitación - Coincide con backend HabitacionResponse.java
 */
export interface HabitacionResponse {
  id: number;
  numero: string;
  precio: number;
  capacidad: number;
  tipoHabitacion: TipoHabitacionResponse;
  hotelId: number;
}

/**
 * DTO para habitaciones disponibles - Coincide con backend HabitacionesDisponiblesResponse.java
 */
export interface HabitacionesDisponiblesResponse {
  hotelId: number;
  fechaInicio: string;
  fechaFin: string;
  habitaciones: HabitacionResponse[];
}
