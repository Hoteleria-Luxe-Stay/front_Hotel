/**
 * DTO de estadísticas del dashboard 
 */
export interface DashboardStats {
  // Contadores generales
  totalDepartamentos: number;
  totalHoteles: number;
  totalHabitaciones: number;
  totalReservas: number;

  // Reservas por estado
  reservasPorEstado: Record<string, number>;

  // Ingresos
  ingresosTotales: number;

  // Distribuciones
  hotelesPorDepartamento: Record<string, number>;
  reservasPorMes: Record<string, number>;
  ingresosPorMes: Record<string, number>;

  // Rankings
  topHoteles: TopHotel[];
  reservasRecientes: ReservaReciente[];
}

export interface TopHotel {
  nombre: string;
  reservas: number;
}

/**
 * Reserva reciente simplificada
 */
export interface ReservaReciente {
  id: number;
  cliente: string;
  hotel: string;
  fechaInicio: string;
  fechaFin: string;
  total: number;
  estado: string;
}
