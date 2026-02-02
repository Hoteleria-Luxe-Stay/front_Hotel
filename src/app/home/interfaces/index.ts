/**
 * Re-exporta las interfaces centralizadas para uso en el módulo home
 * Esto evita duplicación y mantiene consistencia con el backend
 */

// Re-exportar tipos desde interfaces centralizadas
export type {
  // Departamento
  DepartamentoResponse,
  DepartamentoRequest,

  // Tipo Habitación
  TipoHabitacionResponse,

  // Cliente
  ClienteResponse,
  ClienteRequest,

  // Habitación
  HabitacionResponse,
  HabitacionesDisponiblesResponse,

  // Hotel
  HotelResponse,
  HotelDetalleResponse,

  // Reserva
  ReservaListResponse,
  ReservaResponse,
  ReservaCreatedResponse,
  ReservaUpdateResponse,
  ReservaRequest,
  ReservaUpdateRequest,
  MisReservasResponse,
  MisReservasVacio,
  HotelSimple,
  ClienteSimple,
  DetalleSimple,
  EstadoReserva,
} from '../../interfaces';

// Alias para compatibilidad con código existente
export type DepartamentoPublic = import('../../interfaces').DepartamentoResponse;
export type HabitacionPublic = import('../../interfaces').HabitacionResponse;
export type TipoHabitacionPublic = import('../../interfaces').TipoHabitacionResponse;
export type HotelPublic = import('../../interfaces').HotelResponse;
export type ReservaCompleta = import('../../interfaces').ReservaListResponse;
export type ReservaDetalleResponse = import('../../interfaces').ReservaResponse;
