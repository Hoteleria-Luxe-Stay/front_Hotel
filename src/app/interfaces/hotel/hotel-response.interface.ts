import { DepartamentoResponse } from '../departamento/departamento-response.interface';
import { HabitacionResponse } from '../habitacion/habitacion-response.interface';

/**
 * DTO de respuesta de hotel - Coincide con backend HotelResponse.java
 */
export interface HotelResponse {
  id: number;
  nombre: string;
  direccion: string;
  descripcion: string | null;
  telefono: string | null;
  email: string | null;
  imagenUrl: string | null;
  departamento: DepartamentoResponse;
}

/**
 * DTO de detalle completo de hotel - Coincide con backend HotelDetalleResponse.java
 */
export interface HotelDetalleResponse {
  id: number;
  nombre: string;
  direccion: string;
  descripcion: string | null;
  telefono: string | null;
  email: string | null;
  imagenUrl: string | null;
  departamento: DepartamentoResponse;
  habitaciones: HabitacionResponse[];
  precioMinimo: number;
  precioMaximo: number;
}
