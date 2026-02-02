import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ReservaService } from '../../../../services/reserva.service';
import { Reserva } from '../../../../interfaces';

@Component({
  standalone: true,
  selector: 'app-list-reserva',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './list-reserva.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListReservaComponent {
  private reservaService = inject(ReservaService);

  reservas = signal<Reserva[]>([]);
  reservasFiltradas = signal<Reserva[]>([]);
  loading = signal<boolean>(true);
  successMessage = signal<string | null>(null);

  // Filtros
  filtroFechaDesde = signal<string>('');
  filtroFechaHasta = signal<string>('');
  filtroEstado = signal<string>('TODOS');

  // Modal eliminar
  showModalEliminar = signal<boolean>(false);
  reservaSeleccionada = signal<Reserva | null>(null);
  procesando = signal<boolean>(false);

  constructor() {
    this.loadReservas();
  }

  loadReservas(): void {
    this.loading.set(true);

    this.reservaService.getAll().subscribe({
      next: (data) => {
        this.reservas.set(data);
        this.aplicarFiltros();
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando reservas', err);
        this.loading.set(false);
      },
    });
  }

  aplicarFiltros(): void {
    let resultado = this.reservas();

    // Filtrar por fecha de reserva DESDE (fechaReserva >= filtroFechaDesde)
    const fechaDesde = this.filtroFechaDesde();
    if (fechaDesde) {
      resultado = resultado.filter((r) => r.fechaReserva >= fechaDesde);
    }

    // Filtrar por fecha de reserva HASTA (fechaReserva <= filtroFechaHasta)
    const fechaHasta = this.filtroFechaHasta();
    if (fechaHasta) {
      resultado = resultado.filter((r) => r.fechaReserva <= fechaHasta);
    }

    // Filtrar por estado
    const estado = this.filtroEstado();
    if (estado !== 'TODOS') {
      resultado = resultado.filter((r) => r.estado === estado);
    }

    this.reservasFiltradas.set(resultado);
  }

  onFiltroFechaDesdeChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroFechaDesde.set(input.value);
    this.aplicarFiltros();
  }

  onFiltroFechaHastaChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.filtroFechaHasta.set(input.value);
    this.aplicarFiltros();
  }

  onFiltroEstadoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.filtroEstado.set(select.value);
    this.aplicarFiltros();
  }

  limpiarFiltros(): void {
    this.filtroFechaDesde.set('');
    this.filtroFechaHasta.set('');
    this.filtroEstado.set('TODOS');
    this.aplicarFiltros();
  }

  hayFiltrosActivos(): boolean {
    return (
      this.filtroFechaDesde() !== '' ||
      this.filtroFechaHasta() !== '' ||
      this.filtroEstado() !== 'TODOS'
    );
  }

  // === MODAL ELIMINAR ===
  abrirModalEliminar(reserva: Reserva): void {
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

    this.reservaService.delete(reserva.id).subscribe({
      next: () => {
        this.procesando.set(false);
        this.cerrarModalEliminar();
        this.successMessage.set(`Reserva #${reserva.id} eliminada exitosamente`);

        // Recargar lista
        this.loadReservas();

        // Ocultar mensaje después de 5 segundos
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        console.error('Error eliminando reserva', err);
        this.procesando.set(false);
        this.cerrarModalEliminar();
        alert('No se pudo eliminar la reserva');
      },
    });
  }

  getEstadoClass(estado: string): string {
    switch (estado) {
      case 'CONFIRMADA':
        return 'bg-green-100 text-green-800';
      case 'PENDIENTE':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELADA':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';

    // Si viene como yyyy-MM-dd o yyyy-MM-ddTHH:mm:ss
    const [year, month, day] = dateString.split('T')[0].split('-');

    return `${day}/${month}/${year}`;
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }
}
