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

  marcarComoLeida(id: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${baseUrl}/mis-notificaciones/${id}/leer`, {}).pipe(
      tap(() => this.actualizarContadorNoLeidas()),
      catchError((error: any) => {
        console.error('Error al marcar notificacion:', error);
        return throwError(() => error);
      })
    );
  }

  marcarTodasComoLeidas(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${baseUrl}/mis-notificaciones/leer-todas`, {}).pipe(
      tap(() => this.notificacionesNoLeidas.set(0)),
      catchError((error: any) => {
        console.error('Error al marcar todas las notificaciones:', error);
        return throwError(() => error);
      })
    );
  }

  actualizarContadorNoLeidas(): void {
    this.getMisNotificaciones(false).subscribe({
      next: (notificaciones) => {
        this.notificacionesNoLeidas.set(notificaciones.length);
      },
      error: () => {
        this.notificacionesNoLeidas.set(0);
      }
    });
  }

  limpiarContador(): void {
    this.notificacionesNoLeidas.set(0);
  }
}
