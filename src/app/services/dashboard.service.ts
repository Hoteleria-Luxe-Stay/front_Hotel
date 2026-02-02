import { environment } from '../enviroments/environment';
import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { DashboardStats } from '../interfaces';

// Re-exportar para uso externo
export type { DashboardStats } from '../interfaces';

const baseUrl = `${environment.apiUrl}/api/v1/admin/dashboard`;

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private http = inject(HttpClient);

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${baseUrl}/stats`).pipe(
      catchError((error: any) => {
        console.error('Error al obtener estadísticas:', error);
        return throwError(() => error);
      })
    );
  }
}
