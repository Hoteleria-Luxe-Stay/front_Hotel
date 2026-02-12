export interface NotificacionUsuarioResponse {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string; // Canal: EMAIL, SMS, PUSH
  eventType?: string; // Tipo de evento: CONFIRMED, CANCELLED_ADMIN, LOGIN, etc.
  leida: boolean;
  fechaCreacion: string;
}

export interface MessageResponse {
  message: string;
  timestamp?: string;
}
