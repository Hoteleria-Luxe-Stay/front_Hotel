import { ClienteRequest, ClienteResponse } from '../cliente/cliente.interface';
import { HotelResponse } from '../hotel/hotel-response.interface';

// ==================== TIPOS SIMPLES ====================

/**
 * Estados posibles de una reserva
 */
export type EstadoReserva = 'CONFIRMADA' | 'CANCELADA' | 'PENDIENTE';

/**
 * Detalle de reserva simplificado - Coincide con backend DetalleReservaResponse.java
 */
export interface DetalleReserva {
  id: number;
  habitacionId: number;
  precioNoche: number;
}

// ==================== TIPOS ANIDADOS PARA ReservaListResponse ====================

/**
 * Departamento simplificado dentro de reserva
 */
export interface DepartamentoSimple {
  id: number;
  nombre: string;
}

/**
 * Hotel simplificado dentro de reserva - Coincide con backend ReservaListResponse.HotelSimple
 */
export interface HotelSimple {
  id: number;
  nombre: string;
  direccion: string;
  departamento: DepartamentoSimple;
}

/**
 * Cliente simplificado dentro de reserva - Coincide con backend ReservaListResponse.ClienteSimple
 */
export interface ClienteSimple {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni: string;
}

/**
 * Detalle simplificado dentro de reserva - Coincide con backend ReservaListResponse.DetalleSimple
 */
export interface DetalleSimple {
  id: number;
  habitacionId: number;
  precioNoche: number;
}

// ==================== DTOs DE RESPUESTA ====================

/**
 * DTO de listado de reservas (admin y público) - Coincide con backend ReservaListResponse.java
 * Esta es la estructura principal que devuelve el backend para listados
 */
export interface ReservaListResponse {
  id: number;
  fechaReserva: string;
  fechaInicio: string;
  fechaFin: string;
  fechaCancelacion?: string;
  total: number;
  estado: string;
  motivoCancelacion?: string;
  hotel: HotelSimple;
  cliente: ClienteSimple;
  detalles: DetalleSimple[];
}

/**
 * DTO de respuesta completa de reserva - Coincide con backend ReservaResponse.java
 * Se usa para obtener detalle completo de una reserva
 */
export interface ReservaResponse {
  id: number;
  fechaReserva: string;
  fechaInicio: string;
  fechaFin: string;
  fechaCancelacion?: string;
  total: number;
  estado: string;
  motivoCancelacion?: string;
  hotel: HotelSimple;
  cliente: ClienteResponse;
  detalles: DetalleReserva[];
}

/**
 * DTO de respuesta al crear una reserva - Coincide con backend ReservaCreatedResponse.java
 */
export interface ReservaCreatedResponse {
  mensaje: string;
  id: number;
}

/**
 * DTO de respuesta al actualizar fechas - Coincide con backend ReservaUpdateResponse.java
 */
export interface ReservaUpdateResponse {
  message: string;
  nuevoTotal: number;
}

// ==================== DTOs DE REQUEST ====================

/**
 * DTO de request para crear reserva - Coincide con backend ReservaRequest.java
 */
export interface ReservaRequest {
  hotelId: number;
  fechaInicio: string;
  fechaFin: string;
  habitacionesIds: number[];
  cliente: ClienteRequest;
}

/**
 * DTO de request para actualizar fechas - Coincide con backend ReservaUpdateRequest.java
 */
export interface ReservaUpdateRequest {
  fechaInicio: string;
  fechaFin: string;
}

/**
 * DTO de request para actualizar reserva (admin) - Coincide con backend ReservaAdminUpdateDTO.java
 */
export interface ReservaAdminUpdateDTO {
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  hotelId: number;
  cliente: ClienteRequest;
  habitaciones: number[];
  motivoCancelacion?: string;
}

// ==================== TIPOS PARA MIS RESERVAS ====================

/**
 * Respuesta cuando no hay reservas
 */
export interface MisReservasVacio {
  mensaje: string;
  reservas: [];
}

export interface MisReservasItem {
  id: number;
  fechaInicio: string;
  fechaFin: string;
  fechaCancelacion?: string;
  total: number;
  estado: string;
  hotelNombre: string;
  cantidadHabitaciones: number;
  motivoCancelacion?: string;
}

/**
 * Respuesta de mis reservas - puede ser array de reservas o mensaje de vacío
 */
export type MisReservasResponse = MisReservasItem[] | MisReservasVacio;

// ==================== ALIAS PARA COMPATIBILIDAD ====================

/**
 * @deprecated Usar ReservaListResponse en su lugar
 */
export type Reserva = ReservaListResponse;

/**
 * @deprecated Usar ReservaListResponse en su lugar
 */
export type ReservaCompleta = ReservaListResponse;
