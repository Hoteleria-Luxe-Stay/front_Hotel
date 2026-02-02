import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../enviroments/environment';
import { MessageResponse, NotificacionUsuarioResponse } from '../interfaces';

const baseUrl = `${environment.apiUrl}/api/v1`;

@Injectable({
  providedIn: 'root',
})
export class NotificacionService {
  private http = inject(HttpClient);

  getMisNotificaciones(leida?: boolean): Observable<NotificacionUsuarioResponse[]> {
    const url = leida === undefined
      ? `${baseUrl}/mis-notificaciones`
      : `${baseUrl}/mis-notificaciones?leida=${leida}`;

    return this.http.get<NotificacionUsuarioResponse[]>(url).pipe(
      catchError((error: any) => {
        console.error('Error al obtener notificaciones:', error);
        return throwError(() => error);
      })
    );
  }

  marcarComoLeida(id: number): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${baseUrl}/mis-notificaciones/${id}/leer`, {}).pipe(
      catchError((error: any) => {
        console.error('Error al marcar notificacion:', error);
        return throwError(() => error);
      })
    );
  }

  marcarTodasComoLeidas(): Observable<MessageResponse> {
    return this.http.post<MessageResponse>(`${baseUrl}/mis-notificaciones/leer-todas`, {}).pipe(
      catchError((error: any) => {
        console.error('Error al marcar todas las notificaciones:', error);
        return throwError(() => error);
      })
    );
  }
}
