import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NotificacionService } from '../../../services/notificacion.service';
import { NotificacionUsuarioResponse } from '../../../interfaces';

@Component({
  standalone: true,
  selector: 'app-notificaciones-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './notificaciones-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificacionesPageComponent {
  private notificacionService = inject(NotificacionService);

  notificaciones = signal<NotificacionUsuarioResponse[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  filtroLeidas = signal<'todas' | 'leidas' | 'no-leidas'>('todas');

  constructor() {
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {
    this.loading.set(true);
    this.error.set(null);

    const filtro = this.filtroLeidas();
    const leida = filtro === 'todas' ? undefined : filtro === 'leidas';

    this.notificacionService.getMisNotificaciones(leida).subscribe({
      next: (data) => {
        this.notificaciones.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando notificaciones:', err);
        this.error.set('No se pudieron cargar tus notificaciones');
        this.loading.set(false);
      },
    });
  }

  onFiltroChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroLeidas.set(select.value as 'todas' | 'leidas' | 'no-leidas');
    this.cargarNotificaciones();
  }

  marcarComoLeida(id: number): void {
    this.notificacionService.marcarComoLeida(id).subscribe({
      next: () => this.cargarNotificaciones(),
      error: (err) => {
        console.error('Error marcando notificacion:', err);
        this.error.set('No se pudo marcar la notificación');
      },
    });
  }

  marcarTodasComoLeidas(): void {
    this.notificacionService.marcarTodasComoLeidas().subscribe({
      next: () => this.cargarNotificaciones(),
      error: (err) => {
        console.error('Error marcando todas:', err);
        this.error.set('No se pudieron marcar todas las notificaciones');
      },
    });
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }

  getTipoLabel(tipo: string): string {
    switch (tipo) {
      case 'EMAIL':
        return 'Email';
      case 'SMS':
        return 'SMS';
      case 'PUSH':
        return 'Push';
      default:
        return tipo;
    }
  }

  getEventTypeLabel(eventType?: string): string {
    if (!eventType) return 'Notificación';

    switch (eventType) {
      case 'CONFIRMED':
        return 'Reserva confirmada';
      case 'CANCELLED_ADMIN':
        return 'Reserva cancelada por el administrador';
      case 'LOGIN':
        return 'Inicio de sesión';
      case 'REGISTRO':
        return 'Registro exitoso';
      default:
        return eventType;
    }
  }
}
