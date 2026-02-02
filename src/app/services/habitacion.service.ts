import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, Observable, throwError } from 'rxjs';
import { environment } from '../enviroments/environment';
import { HabitacionRequest, HabitacionResponse, MessageResponse } from '../interfaces';

const baseUrl = `${environment.apiUrl}/api/v1`;

@Injectable({
  providedIn: 'root',
})
export class HabitacionService {
  private http = inject(HttpClient);

  listarPorHotel(hotelId: number): Observable<HabitacionResponse[]> {
    return this.http.get<HabitacionResponse[]>(`${baseUrl}/hoteles/${hotelId}/habitaciones`).pipe(
      catchError((error: any) => {
        console.error('Error al listar habitaciones:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: number): Observable<HabitacionResponse> {
    return this.http.get<HabitacionResponse>(`${baseUrl}/habitaciones/${id}`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener habitacion:', error);
        return throwError(() => error);
      })
    );
  }

  create(request: HabitacionRequest): Observable<HabitacionResponse> {
    return this.http.post<HabitacionResponse>(`${baseUrl}/habitaciones`, request).pipe(
      catchError((error: any) => {
        console.error('Error al crear habitacion:', error);
        return throwError(() => error);
      })
    );
  }

  update(id: number, request: HabitacionRequest): Observable<HabitacionResponse> {
    return this.http.put<HabitacionResponse>(`${baseUrl}/habitaciones/${id}`, request).pipe(
      catchError((error: any) => {
        console.error('Error al actualizar habitacion:', error);
        return throwError(() => error);
      })
    );
  }

  delete(id: number): Observable<MessageResponse> {
    return this.http.delete<MessageResponse>(`${baseUrl}/habitaciones/${id}`).pipe(
      catchError((error: any) => {
        console.error('Error al eliminar habitacion:', error);
        return throwError(() => error);
      })
    );
  }
}
