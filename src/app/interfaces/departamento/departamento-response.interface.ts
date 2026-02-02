/**
 * DTO de respuesta de departamento - Coincide con backend DepartamentoResponse.java
 */
export interface DepartamentoResponse {
  id: number;
  nombre: string;
}

/**
 * DTO de request para crear/actualizar departamento
 */
export interface DepartamentoRequest {
  nombre: string;
}
