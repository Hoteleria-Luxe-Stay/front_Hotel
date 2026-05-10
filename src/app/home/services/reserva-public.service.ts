import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../enviroments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import {
  DepartamentoResponse,
  HotelResponse,
  HotelDetalleResponse,
  HabitacionesDisponiblesResponse,
  ReservaRequest,
  ReservaCreatedResponse,
  ReservaResponse,
  MisReservasResponse,
} from '../../interfaces';

const baseUrl = `${environment.apiUrl}/api/v1`;

@Injectable({
  providedIn: 'root',
})
export class ReservaPublicService {
  private http = inject(HttpClient);

  // ==================== DEPARTAMENTOS ====================

  getDepartamentos(): Observable<DepartamentoResponse[]> {
    const url = `${baseUrl}/departamentos`;

    return this.http.get<DepartamentoResponse[]>(url).pipe(
      catchError((error: any) => {
        console.error('Error al obtener departamentos:', error);
        return throwError(() => error);
      })
    );
  }

  // ==================== HOTELES ====================

  getHotelesPorDepartamento(depId: number): Observable<HotelResponse[]> {
    return this.http
      .get<HotelResponse[]>(`${baseUrl}/hoteles?departamentoId=${depId}`)
      .pipe(
        catchError((error: any) => {
          console.error('Error al obtener hoteles:', error);
          return throwError(() => error);
        })
      );
  }

  getHotelDetalle(hotelId: number): Observable<HotelDetalleResponse> {
    return this.http.get<HotelDetalleResponse>(`${baseUrl}/hoteles/${hotelId}`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener detalle del hotel:', error);
        return throwError(() => error);
      })
    );
  }

  // ==================== HABITACIONES ====================

  getHabitacionesDisponibles(
    hotelId: number,
    fechaInicio: string,
    fechaFin: string
  ): Observable<HabitacionesDisponiblesResponse> {
    return this.http
      .get<HabitacionesDisponiblesResponse>(
        `${baseUrl}/habitaciones?hotelId=${hotelId}&fechaInicio=${fechaInicio}&fechaFin=${fechaFin}`
      )
      .pipe(
        catchError((error: any) => {
          console.error('Error al obtener habitaciones disponibles:', error);
          return throwError(() => error);
        })
      );
  }

  // ==================== RESERVAS ====================

  crearReserva(reserva: ReservaRequest): Observable<ReservaCreatedResponse> {
    return this.http
      .post<ReservaCreatedResponse>(`${baseUrl}/reservas`, reserva)
      .pipe(
        catchError((error: any) => {
          console.error('Error al crear reserva:', error);
          return throwError(() => error);
        })
      );
  }

  getReservaDetalle(reservaId: number): Observable<ReservaResponse> {
    return this.http.get<ReservaResponse>(`${baseUrl}/reservas/${reservaId}`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener detalle de reserva:', error);
        return throwError(() => error);
      })
    );
  }

  getMisReservas(fechaInicio?: string, fechaFin?: string, estado?: string): Observable<MisReservasResponse> {
    let url = `${baseUrl}/mis-reservas`;
    const params: string[] = [];

    if (fechaInicio) {
      params.push(`fechaInicio=${fechaInicio}`);
    }
    if (fechaFin) {
      params.push(`fechaFin=${fechaFin}`);
    }
    if (estado && estado !== 'TODOS') {
      params.push(`estado=${estado}`);
    }

    if (params.length > 0) {
      url += '?' + params.join('&');
    }

    return this.http.get<MisReservasResponse>(url).pipe(
      catchError((error: any) => {
        console.error('Error al buscar reservas:', error);
        return throwError(() => error);
      })
    );
  }

  iniciarPago(
    reservaId: number,
    successUrl?: string,
    cancelUrl?: string
  ): Observable<IniciarPagoResponse> {
    const idempotencyKey = crypto.randomUUID();
    const headers = { 'Idempotency-Key': idempotencyKey };
    const body = successUrl || cancelUrl ? { successUrl, cancelUrl } : {};
    return this.http
      .post<IniciarPagoResponse>(`${baseUrl}/reservas/${reservaId}/iniciar-pago`, body, { headers })
      .pipe(
        catchError((error: any) => {
          console.error('Error al iniciar pago:', error);
          return throwError(() => error);
        })
      );
  }
}

export interface IniciarPagoResponse {
  reservaId: number;
  pagoId: number;
  checkoutUrl: string;
  gatewayPaymentId: string;
  estado: string;
}
