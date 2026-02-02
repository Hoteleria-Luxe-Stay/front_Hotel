import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../enviroments/environment';
import { catchError, Observable, throwError } from 'rxjs';
import { DepartamentoResponse, DepartamentoRequest } from '../interfaces';

const baseUrl = `${environment.apiUrl}/api/v1`;

@Injectable({
  providedIn: 'root',
})
export class DepartamentoService {
  private http = inject(HttpClient);

  getAll(): Observable<DepartamentoResponse[]> {
    return this.http.get<DepartamentoResponse[]>(`${baseUrl}/departamentos`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener departamentos:', error);
        return throwError(() => error);
      })
    );
  }

  getById(id: number): Observable<DepartamentoResponse> {
    return this.http.get<DepartamentoResponse>(`${baseUrl}/departamentos/${id}`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener departamento:', error);
        return throwError(() => error);
      })
    );
  }

  create(departamento: DepartamentoRequest): Observable<DepartamentoResponse> {
    return this.http.post<DepartamentoResponse>(`${baseUrl}/departamentos`, departamento).pipe(
      catchError((error: any) => {
        console.error('Error al crear departamento:', error);
        return throwError(() => error);
      })
    );
  }

  update(id: number, departamento: DepartamentoRequest): Observable<DepartamentoResponse> {
    return this.http.put<DepartamentoResponse>(`${baseUrl}/departamentos/${id}`, departamento).pipe(
      catchError((error: any) => {
        console.error('Error al actualizar departamento:', error);
        return throwError(() => error);
      })
    );
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${baseUrl}/departamentos/${id}`).pipe(
      catchError((error: any) => {
        console.error('Error al eliminar departamento:', error);
        return throwError(() => error);
      })
    );
  }
}
