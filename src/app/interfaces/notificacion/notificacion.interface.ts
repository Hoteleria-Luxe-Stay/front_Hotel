export interface NotificacionUsuarioResponse {
  id: number;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: boolean;
  fechaCreacion: string;
}

export interface MessageResponse {
  message: string;
  timestamp?: string;
}
