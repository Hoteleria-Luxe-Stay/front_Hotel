import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HotelService } from '../../../../services/hotel.service';
import { DepartamentoService } from '../../../../services/departamento.service';
import { HotelResponse } from '../../../../interfaces';
import { DepartamentoResponse } from '../../../../interfaces';

@Component({
  standalone: true,
  selector: 'app-list-hotel',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './list-hotel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListHotelPageComponent implements OnInit {
  private hotelService = inject(HotelService);
  private departamentoService = inject(DepartamentoService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  departamentoId = signal<number | null>(null);
  departamento = signal<DepartamentoResponse | null>(null);
  hoteles = signal<HotelResponse[]>([]);
  loading = signal<boolean>(true);

  // Filtros de fecha
  fechaInicio = signal<string>('');
  fechaFin = signal<string>('');

  // Modal eliminar
  showModalEliminar = signal<boolean>(false);
  hotelSeleccionado = signal<HotelResponse | null>(null);
  procesando = signal<boolean>(false);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    const depId = this.route.snapshot.paramMap.get('departamentoId');

    if (depId) {
      this.departamentoId.set(Number(depId));
      this.loadDepartamento(Number(depId));
      this.loadHoteles(Number(depId));
    } else {
      this.router.navigate(['/admin/hotel/list']);
    }
  }

  loadDepartamento(id: number): void {
    this.departamentoService.getById(id).subscribe({
      next: (dep) => this.departamento.set(dep),
      error: (err) => console.error('Error cargando departamento:', err),
    });
  }

  loadHoteles(departamentoId: number): void {
    this.loading.set(true);
    this.hotelService.getByDepartamento(departamentoId).subscribe({
      next: (data) => {
        this.hoteles.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando hoteles:', err);
        this.loading.set(false);
      },
    });
  }

  buscarHabitacionesDisponibles(): void {
    const inicio = this.fechaInicio();
    const fin = this.fechaFin();

    if (!inicio || !fin) {
      alert('Seleccione ambas fechas');
      return;
    }

    // Aquí podrías implementar la búsqueda de habitaciones disponibles
    console.log('Buscando habitaciones disponibles:', inicio, fin);
  }

  // Modal eliminar
  abrirModalEliminar(hotel: HotelResponse): void {
    this.hotelSeleccionado.set(hotel);
    this.showModalEliminar.set(true);
  }

  cerrarModalEliminar(): void {
    this.showModalEliminar.set(false);
    this.hotelSeleccionado.set(null);
  }

  confirmarEliminar(): void {
    const hotel = this.hotelSeleccionado();
    if (!hotel?.id) return;

    this.procesando.set(true);
    this.hotelService.delete(hotel.id).subscribe({
      next: () => {
        this.successMessage.set(`Hotel "${hotel.nombre}" eliminado exitosamente`);
        this.cerrarModalEliminar();
        this.procesando.set(false);

        // Recargar lista
        const depId = this.departamentoId();
        if (depId) {
          this.loadHoteles(depId);
        }

        // Ocultar mensaje después de 5 segundos
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        console.error('Error eliminando hotel:', err);
        alert('Error al eliminar el hotel');
        this.procesando.set(false);
      },
    });
  }

  getCantidadHabitaciones(): string {
    return 'N/D';
  }
}
