import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../enviroments/environment';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { ReservaPublicService } from '../../services/reserva-public.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { MisReservasItem } from '../../../interfaces';
import { HttpClient } from '@angular/common/http';

@Component({
  standalone: true,
  selector: 'app-mis-reservas-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mis-reservas-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MisReservasPageComponent implements OnInit {
  private reservaService = inject(ReservaPublicService);
  private notificacionService = inject(NotificacionService);
  private http = inject(HttpClient);
  private router = inject(Router);

  reservas = signal<MisReservasItem[]>([]);
  reservasFiltradas = signal<MisReservasItem[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  successMessage = signal<string | null>(null);

  // Filtros por fecha
  filtroFechaInicio = signal<string>('');
  filtroFechaFin = signal<string>('');
  filtroEstado = signal<string>('TODOS');

  // Modal eliminar
  showModalEliminar = signal<boolean>(false);
  reservaSeleccionada = signal<MisReservasItem | null>(null);
  procesando = signal<boolean>(false);

  // Modal editar
  showModalEditar = signal<boolean>(false);
  editFechaInicio = signal<string>('');
  editFechaFin = signal<string>('');
  editError = signal<string | null>(null);

  ngOnInit(): void {
    this.cargarReservas();
  }

  cargarReservas(): void {
    this.loading.set(true);
    this.error.set(null);

    const fechaInicio = this.filtroFechaInicio() || undefined;
    const fechaFin = this.filtroFechaFin() || undefined;
    const estado = this.filtroEstado() !== 'TODOS' ? this.filtroEstado() : undefined;

    this.reservaService.getMisReservas(fechaInicio, fechaFin, estado).subscribe({
      next: (data) => {
        console.log(data);
        if (Array.isArray(data)) {
          this.reservas.set(data);
          this.aplicarFiltros();
        } else {
          this.reservas.set([]);
          this.reservasFiltradas.set([]);
        }
        this.loading.set(false);
      },
      error: (err: any) => {
        console.error('Error cargando reservas:', err);
        if (err.status === 401) {
          this.error.set('Debe iniciar sesión para ver sus reservas');
        } else {
          this.error.set('Error al cargar sus reservas. Intente nuevamente.');
        }
        this.reservas.set([]);
        this.reservasFiltradas.set([]);
        this.loading.set(false);
      },
    });
  }

  aplicarFiltros(): void {
    let resultado = this.reservas();

    // Filtrar por estado
    const estado = this.filtroEstado();
    if (estado !== 'TODOS') {
      resultado = resultado.filter((r) => r.estado === estado);
    }

    this.reservasFiltradas.set(resultado);
  }

  onFiltroFechaInicioChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroFechaInicio.set(input.value);
  }

  onFiltroFechaFinChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroFechaFin.set(input.value);
  }

  onFiltroEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroEstado.set(select.value);
    this.aplicarFiltros();
  }

  buscarConFiltros(): void {
    this.cargarReservas();
  }

  limpiarFiltros(): void {
    this.filtroFechaInicio.set('');
    this.filtroFechaFin.set('');
    this.filtroEstado.set('TODOS');
    this.cargarReservas();
  }

  // === MODAL ELIMINAR ===
  abrirModalEliminar(reserva: MisReservasItem): void {
    this.reservaSeleccionada.set(reserva);
    this.showModalEliminar.set(true);
  }

  cerrarModalEliminar(): void {
    this.showModalEliminar.set(false);
    this.reservaSeleccionada.set(null);
  }

  confirmarEliminar(): void {
    const reserva = this.reservaSeleccionada();
    if (!reserva) return;

    this.procesando.set(true);

    this.http.delete(`${environment.apiUrl}/api/v1/reservas/${reserva.id}/cancelar`).subscribe({
      next: () => {
        this.procesando.set(false);
        this.cerrarModalEliminar();
        this.successMessage.set(`Reserva #${reserva.id} cancelada exitosamente`);
        // Recargar lista
        this.cargarReservas();
        // Actualizar contador de notificaciones
        this.notificacionService.actualizarContadorNoLeidas();
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (err: any) => {
        console.error('Error cancelando reserva:', err);
        this.procesando.set(false);
        this.cerrarModalEliminar();
        if (err.status === 403) {
          this.error.set('No tiene permiso para cancelar esta reserva');
        } else {
          this.error.set('Error al cancelar la reserva. Intente nuevamente.');
        }
      },
    });
  }

  // === MODAL EDITAR ===
  abrirModalEditar(reserva: MisReservasItem): void {
    this.reservaSeleccionada.set(reserva);
    this.editFechaInicio.set(reserva.fechaInicio);
    this.editFechaFin.set(reserva.fechaFin);
    this.editError.set(null);
    this.showModalEditar.set(true);
  }

  cerrarModalEditar(): void {
    this.showModalEditar.set(false);
    this.reservaSeleccionada.set(null);
    this.editError.set(null);
  }

  onEditFechaInicioChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.editFechaInicio.set(input.value);
  }

  onEditFechaFinChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.editFechaFin.set(input.value);
  }

  calcularNochesEdit(): number {
    if (!this.editFechaInicio() || !this.editFechaFin()) return 0;

    const [y1, m1, d1] = this.editFechaInicio().split('-').map(Number);
    const [y2, m2, d2] = this.editFechaFin().split('-').map(Number);

    const inicio = new Date(y1, m1 - 1, d1);
    const fin = new Date(y2, m2 - 1, d2);

    return Math.max(0, Math.round((fin.getTime() - inicio.getTime()) / 86400000));
  }

  // Obtener fecha mínima (mañana - 24 horas de anticipación)
  getMinDate(): string {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  }

  confirmarEditar(): void {
    const reserva = this.reservaSeleccionada();
    if (!reserva) return;

    const fechaInicio = this.editFechaInicio();
    const fechaFin = this.editFechaFin();

    if (!fechaInicio || !fechaFin) {
      this.editError.set('Las fechas son obligatorias');
      return;
    }

    const hoy = new Date();
    const hoyISO = hoy.toISOString().split('T')[0];

    // mañana en formato yyyy-MM-dd
    const mananaISO = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + 1)
      .toISOString()
      .split('T')[0];

    if (fechaInicio < mananaISO) {
      this.editError.set('Las reservas deben realizarse con al menos 24 horas de anticipación');
      return;
    }

    if (fechaFin <= fechaInicio) {
      this.editError.set('La fecha de salida debe ser posterior a la de entrada');
      return;
    }

    this.procesando.set(true);
    this.editError.set(null);

    this.http
      .put(`${environment.apiUrl}/api/v1/mis-reservas/${reserva.id}`, {
        fechaInicio: fechaInicio,
        fechaFin: fechaFin,
      })
      .subscribe({
        next: () => {
          this.procesando.set(false);
          this.cerrarModalEditar();
          this.successMessage.set(`Reserva #${reserva.id} actualizada exitosamente`);
          this.cargarReservas();
          setTimeout(() => this.successMessage.set(null), 3000);
        },
        error: (err: any) => {
          console.error('Error actualizando reserva:', err);
          this.procesando.set(false);
          if (err.status === 403) {
            this.editError.set('No tiene permiso para actualizar esta reserva');
          } else {
            this.editError.set(err.error?.message || 'Error al actualizar la reserva');
          }
        },
      });
  }

  // === UTILIDADES ===
  formatDate(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  formatDateLong(dateString: string): string {
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-PE', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA':
        return 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40';
      case 'PENDIENTE':
        return 'bg-amber-500/20 text-amber-200 border border-amber-500/40';
      case 'CANCELADA':
        return 'bg-red-500/20 text-red-200 border border-red-500/40';
      default:
        return 'bg-slate-700/40 text-slate-200 border border-slate-600/60';
    }
  }

  calcularNoches(fechaInicio: string, fechaFin: string): number {
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const diff = fin.getTime() - inicio.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }
}
