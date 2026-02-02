/**
 * DTO de respuesta de cliente - Coincide con backend ClienteResponse.java
 */
export interface ClienteResponse {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  dni: string;
}

/**
 * DTO de request para crear/actualizar cliente - Coincide con backend ClienteRequest.java
 */
export interface ClienteRequest {
  dni: string;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
}

/**
 * @deprecated Usar ClienteResponse en su lugar
 */
export type Cliente = ClienteResponse;
