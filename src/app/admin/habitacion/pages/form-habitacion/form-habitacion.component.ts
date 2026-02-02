import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HabitacionService } from '../../../../services/habitacion.service';
import { TipoHabitacionService } from '../../../../services/tipo-habitacion.service';
import { HabitacionRequest, HabitacionResponse, TipoHabitacionResponse } from '../../../../interfaces';

@Component({
  standalone: true,
  selector: 'app-form-habitacion',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './form-habitacion.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FormHabitacionPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private habitacionService = inject(HabitacionService);
  private tipoHabitacionService = inject(TipoHabitacionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  hotelId = signal<number | null>(null);
  habitacionId = signal<number | null>(null);
  loading = signal<boolean>(true);
  error = signal<string | null>(null);
  tipos = signal<TipoHabitacionResponse[]>([]);

  form = this.fb.group({
    numero: ['', Validators.required],
    capacidad: [1, [Validators.required, Validators.min(1)]],
    precio: [0, [Validators.required, Validators.min(0)]],
    tipoHabitacionId: ['', Validators.required],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const hotelId = this.route.snapshot.paramMap.get('hotelId');

    if (id) {
      this.habitacionId.set(Number(id));
      this.cargarTipos(() => this.cargarHabitacion(Number(id)));
      return;
    }

    if (hotelId) {
      this.hotelId.set(Number(hotelId));
      this.cargarTipos(() => this.loading.set(false));
      return;
    }

    this.router.navigate(['/admin/hotel/list']);
  }

  cargarTipos(onComplete: () => void): void {
    this.tipoHabitacionService.getAll().subscribe({
      next: (data) => {
        this.tipos.set(data);
        onComplete();
      },
      error: (err) => {
        console.error('Error cargando tipos:', err);
        this.error.set('No se pudieron cargar los tipos de habitación');
        this.loading.set(false);
      },
    });
  }

  cargarHabitacion(id: number): void {
    this.loading.set(true);
    this.habitacionService.getById(id).subscribe({
      next: (data: HabitacionResponse) => {
        this.hotelId.set(data.hotelId);
        this.form.patchValue({
          numero: data.numero,
          capacidad: data.capacidad,
          precio: data.precio,
          tipoHabitacionId: data.tipoHabitacion?.id ? String(data.tipoHabitacion.id) : '',
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando habitación:', err);
        this.error.set('No se pudo cargar la habitación');
        this.loading.set(false);
      },
    });
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const hotelId = this.hotelId();
    if (!hotelId) {
      this.error.set('Hotel inválido');
      return;
    }

    const payload: HabitacionRequest = {
      numero: this.form.value.numero!,
      capacidad: Number(this.form.value.capacidad),
      precio: Number(this.form.value.precio),
      hotelId: hotelId,
      tipoHabitacionId: Number(this.form.value.tipoHabitacionId),
    };

    const habitacionId = this.habitacionId();
    if (habitacionId) {
      this.habitacionService.update(habitacionId, payload).subscribe({
        next: () => this.router.navigate(['/admin/habitacion/hotel', hotelId]),
        error: (err) => {
          console.error('Error actualizando habitación:', err);
          this.error.set('No se pudo actualizar la habitación');
        },
      });
      return;
    }

    this.habitacionService.create(payload).subscribe({
      next: () => this.router.navigate(['/admin/habitacion/hotel', hotelId]),
      error: (err) => {
        console.error('Error creando habitación:', err);
        this.error.set('No se pudo crear la habitación');
      },
    });
  }
}
