import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../enviroments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { HotelDetalleResponse, HotelResponse, HotelRequest } from '../interfaces';

const baseUrl = `${environment.apiUrl}/api/v1`;

@Injectable({
  providedIn: 'root',
})
export class HotelService {
  private http = inject(HttpClient);

  getAll(): Observable<HotelResponse[]> {
    return this.http.get<HotelResponse[]>(`${baseUrl}/hoteles`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener hoteles:', error);
        return throwError(() => error);
      })
    );
  }

  getByDepartamento(depId: number): Observable<HotelResponse[]> {
    return this.http.get<HotelResponse[]>(`${baseUrl}/hoteles?departamentoId=${depId}`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener hoteles por departamento:', error);
        return throwError(() => error);
      })
    );
  }

  getById(idHotel: number): Observable<HotelDetalleResponse> {
    return this.http.get<HotelDetalleResponse>(`${baseUrl}/hoteles/${idHotel}`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener hotel:', error);
        return throwError(() => error);
      })
    );
  }

  create(hotelRequest: HotelRequest): Observable<HotelResponse> {
    return this.http.post<HotelResponse>(`${baseUrl}/hoteles`, hotelRequest).pipe(
      catchError((error: any) => {
        console.error('Error al crear hotel:', error);
        return throwError(() => error);
      })
    );
  }

  update(id: number, hotelRequest: HotelRequest): Observable<HotelResponse> {
    return this.http.put<HotelResponse>(`${baseUrl}/hoteles/${id}`, hotelRequest).pipe(
      catchError((error: any) => {
        console.error('Error al actualizar hotel:', error);
        return throwError(() => error);
      })
    );
  }

  delete(idHotel: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/hoteles/${idHotel}`).pipe(
      catchError((error: any) => {
        console.error('Error al eliminar hotel:', error);
        return throwError(() => error);
      })
    );
  }

  // Alias para compatibilidad
  createHotel(hotelRequest: HotelRequest): Observable<HotelResponse> {
    return this.create(hotelRequest);
  }

  updateHotel(id: number, hotelRequest: HotelRequest): Observable<HotelResponse> {
    return this.update(id, hotelRequest);
  }
}
