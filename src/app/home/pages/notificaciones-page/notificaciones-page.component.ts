import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
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
  private route = inject(ActivatedRoute);

  notificaciones = signal<NotificacionUsuarioResponse[]>([]);
  loading = signal<boolean>(true);
  eliminando = signal<boolean>(false);
  error = signal<string | null>(null);
  tabActivo = signal<'reservas' | 'sesiones'>('reservas');

  reservasNoLeidas = this.notificacionService.notificacionesReservasNoLeidas;
  sesionesNoLeidas = this.notificacionService.notificacionesSesionesNoLeidas;

  notificacionesReservas = computed(() =>
    this.notificaciones().filter(n => this.isReservaEvent((n.eventType || '').toUpperCase()))
  );

  notificacionesSesiones = computed(() =>
    this.notificaciones().filter(n => this.isSessionEvent((n.eventType || '').toUpperCase()))
  );

  notificacionesActuales = computed(() =>
    this.tabActivo() === 'reservas' ? this.notificacionesReservas() : this.notificacionesSesiones()
  );

  noLeidasActuales = computed(() =>
    this.notificacionesActuales().filter(n => !n.leida).length
  );

  constructor() {
    this.route.queryParamMap.subscribe((params) => {
      const origen = params.get('origen');
      this.tabActivo.set(origen === 'sesiones' ? 'sesiones' : 'reservas');
    });
    this.cargarNotificaciones();
  }

  cargarNotificaciones(): void {
    this.loading.set(true);
    this.error.set(null);
    this.notificacionService.getMisNotificaciones().subscribe({
      next: (data) => {
        this.notificaciones.set(data);
        this.notificacionService.actualizarContadorNoLeidas();
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las notificaciones.');
        this.loading.set(false);
      },
    });
  }

  cambiarTab(tab: 'reservas' | 'sesiones'): void {
    this.tabActivo.set(tab);
    this.error.set(null);
  }

  marcarComoLeida(id: number): void {
    this.notificacionService.marcarComoLeida(id).subscribe({
      next: () => this.cargarNotificaciones(),
      error: () => this.error.set('No se pudo marcar la notificación como leída.'),
    });
  }

  marcarTodasComoLeidas(): void {
    this.notificacionService.marcarTodasComoLeidas().subscribe({
      next: () => this.cargarNotificaciones(),
      error: () => this.error.set('No se pudieron marcar todas las notificaciones.'),
    });
  }

  eliminarTab(): void {
    this.eliminando.set(true);
    this.error.set(null);
    this.notificacionService.eliminarNotificacionesPorOrigen(this.tabActivo()).subscribe({
      next: () => {
        this.eliminando.set(false);
        this.cargarNotificaciones();
      },
      error: () => {
        this.error.set('No se pudieron eliminar las notificaciones.');
        this.eliminando.set(false);
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

  getEventTypeLabel(eventType?: string): string {
    if (!eventType) return 'Notificación';
    switch (eventType.toUpperCase()) {
      case 'CONFIRMED':       return 'Confirmada';
      case 'PENDING':
      case 'CREATED':         return 'Pendiente';
      case 'CANCELLED_ADMIN': return 'Cancelada por admin';
      case 'CANCELLED':       return 'Cancelada';
      case 'LOGIN':           return 'Inicio de sesión';
      default:                return eventType;
    }
  }

  getEventTypeBadgeClass(eventType?: string): string {
    switch ((eventType || '').toUpperCase()) {
      case 'CONFIRMED':       return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'PENDING':
      case 'CREATED':         return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'CANCELLED_ADMIN':
      case 'CANCELLED':       return 'bg-red-500/20 text-red-300 border-red-500/30';
      case 'LOGIN':           return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      default:                return 'bg-slate-700/40 text-slate-300 border-slate-600/30';
    }
  }

  private isSessionEvent(eventType: string): boolean {
    return eventType === 'LOGIN';
  }

  private isReservaEvent(eventType: string): boolean {
    if (!eventType) return false;
    const reservaEvents = new Set([
      'CONFIRMED', 'PENDING', 'CREATED', 'CANCELLED', 'CANCELLED_ADMIN',
      'RESERVA_CONFIRMADA', 'RESERVA_PENDIENTE', 'RESERVA_CANCELADA'
    ]);
    return reservaEvents.has(eventType) || eventType.includes('RESERVA');
  }
}
