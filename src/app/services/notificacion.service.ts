import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { catchError, Observable, tap, throwError } from 'rxjs';
import { environment } from '../enviroments/environment';
import { MessageResponse, NotificacionUsuarioResponse } from '../interfaces';

const baseUrl = `${environment.apiUrl}/api/v1`;

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private http = inject(HttpClient);

  // Signal para notificaciones no leidas (contador en el header)
  notificacionesNoLeidas = signal<number>(0);
  notificacionesReservasNoLeidas = signal<number>(0);
  notificacionesSesionesNoLeidas = signal<number>(0);

  getMisNotificaciones(leida?: boolean, tipo?: string): Observable<NotificacionUsuarioResponse[]> {
    let params = new HttpParams();
    if (leida !== undefined) {
      params = params.set('leida', leida.toString());
    }
    if (tipo) {
      params = params.set('tipo', tipo);
    }

    return this.http.get<NotificacionUsuarioResponse[]>(`${baseUrl}/mis-notificaciones`, { params }).pipe(
      catchError((error: any) => {
        console.error('Error al obtener notificaciones:', error);
        return throwError(() => error);
      })
    );
  }

  marcarComoLeida(id: number, refreshCounter = true): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${baseUrl}/mis-notificaciones/${id}/leer`, {}).pipe(
      tap(() => {
        if (refreshCounter) {
          this.actualizarContadorNoLeidas();
        }
      }),
      catchError((error: any) => {
        console.error('Error al marcar notificacion:', error);
        return throwError(() => error);
      })
    );
  }

  marcarTodasComoLeidas(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${baseUrl}/mis-notificaciones/leer-todas`, {}).pipe(
      tap(() => {
        this.notificacionesNoLeidas.set(0);
        this.notificacionesReservasNoLeidas.set(0);
        this.notificacionesSesionesNoLeidas.set(0);
      }),
      catchError((error: any) => {
        console.error('Error al marcar todas las notificaciones:', error);
        return throwError(() => error);
      })
    );
  }

  eliminarNotificacionesPorOrigen(origen: 'reservas' | 'sesiones'): Observable<MessageResponse> {
    const params = new HttpParams().set('origen', origen);
    return this.http.delete<MessageResponse>(`${baseUrl}/mis-notificaciones/eliminar-por-origen`, { params }).pipe(
      tap(() => this.actualizarContadorNoLeidas()),
      catchError((error: any) => {
        console.error(`Error eliminando notificaciones de ${origen}:`, error);
        return throwError(() => error);
      })
    );
  }

  actualizarContadorNoLeidas(): void {
    this.getMisNotificaciones(false).subscribe({
      next: (notificaciones) => {
        const reservas = notificaciones.filter((notificacion) =>
          this.isReservaEvent((notificacion.eventType || '').toUpperCase())
        ).length;
        const sesiones = notificaciones.filter((notificacion) =>
          this.isSessionEvent((notificacion.eventType || '').toUpperCase())
        ).length;

        this.notificacionesReservasNoLeidas.set(reservas);
        this.notificacionesSesionesNoLeidas.set(sesiones);
        this.notificacionesNoLeidas.set(reservas + sesiones);
      },
      error: () => {
        this.notificacionesNoLeidas.set(0);
        this.notificacionesReservasNoLeidas.set(0);
        this.notificacionesSesionesNoLeidas.set(0);
      }
    });
  }

  limpiarContador(): void {
    this.notificacionesNoLeidas.set(0);
    this.notificacionesReservasNoLeidas.set(0);
    this.notificacionesSesionesNoLeidas.set(0);
  }

  private isSessionEvent(eventType: string): boolean {
    return eventType === 'LOGIN';
  }

  private isReservaEvent(eventType: string): boolean {
    if (!eventType) return false;

    const reservaEvents = new Set([
      'CONFIRMED',
      'PENDING',
      'CANCELLED',
      'CANCELLED_ADMIN',
      'RESERVA_CONFIRMADA',
      'RESERVA_PENDIENTE',
      'RESERVA_CANCELADA'
    ]);

    return reservaEvents.has(eventType) || eventType.includes('RESERVA');
  }
}
