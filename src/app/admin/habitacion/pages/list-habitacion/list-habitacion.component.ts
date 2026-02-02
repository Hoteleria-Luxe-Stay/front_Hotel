import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitacionService } from '../../../../services/habitacion.service';
import { HotelService } from '../../../../services/hotel.service';
import { HabitacionResponse, HotelDetalleResponse } from '../../../../interfaces';

@Component({
  standalone: true,
  selector: 'app-list-habitacion',
  imports: [CommonModule, RouterLink],
  templateUrl: './list-habitacion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListHabitacionPageComponent implements OnInit {
  private habitacionService = inject(HabitacionService);
  private hotelService = inject(HotelService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  hotelId = signal<number | null>(null);
  hotel = signal<HotelDetalleResponse | null>(null);
  habitaciones = signal<HabitacionResponse[]>([]);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);

  showModalEliminar = signal<boolean>(false);
  habitacionSeleccionada = signal<HabitacionResponse | null>(null);
  procesando = signal<boolean>(false);

  ngOnInit(): void {
    const hotelId = this.route.snapshot.paramMap.get('hotelId');
    if (!hotelId) {
      this.router.navigate(['/admin/hotel/list']);
      return;
    }

    this.hotelId.set(Number(hotelId));
    this.cargarHotel(Number(hotelId));
    this.cargarHabitaciones(Number(hotelId));
  }

  cargarHotel(id: number): void {
    this.hotelService.getById(id).subscribe({
      next: (data) => this.hotel.set(data),
      error: (err) => {
        console.error('Error cargando hotel:', err);
        this.error.set('No se pudo cargar el hotel');
      },
    });
  }

  cargarHabitaciones(hotelId: number): void {
    this.loading.set(true);
    this.habitacionService.listarPorHotel(hotelId).subscribe({
      next: (data) => {
        this.habitaciones.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando habitaciones:', err);
        this.error.set('No se pudieron cargar las habitaciones');
        this.loading.set(false);
      },
    });
  }

  abrirModalEliminar(habitacion: HabitacionResponse): void {
    this.habitacionSeleccionada.set(habitacion);
    this.showModalEliminar.set(true);
  }

  cerrarModalEliminar(): void {
    this.showModalEliminar.set(false);
    this.habitacionSeleccionada.set(null);
  }

  confirmarEliminar(): void {
    const habitacion = this.habitacionSeleccionada();
    if (!habitacion?.id) return;

    this.procesando.set(true);
    this.habitacionService.delete(habitacion.id).subscribe({
      next: () => {
        this.procesando.set(false);
        this.cerrarModalEliminar();
        const hotelId = this.hotelId();
        if (hotelId) {
          this.cargarHabitaciones(hotelId);
        }
      },
      error: (err) => {
        console.error('Error eliminando habitacion:', err);
        this.procesando.set(false);
        this.cerrarModalEliminar();
      },
    });
  }
}
