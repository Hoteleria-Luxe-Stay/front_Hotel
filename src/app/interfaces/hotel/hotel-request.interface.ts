/**
 * DTO de request para crear/actualizar hotel - Coincide con backend HotelRequest.java
 */
export interface HotelRequest {
  nombre: string;
  direccion: string;
  descripcion?: string;
  telefono?: string;
  email?: string;
  departamentoId: number;
  imagenUrl?: string;
}
