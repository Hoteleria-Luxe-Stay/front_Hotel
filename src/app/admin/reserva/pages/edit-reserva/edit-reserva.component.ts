import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ReservaService } from '../../../../services/reserva.service';
import { HotelService } from '../../../../services/hotel.service';
import { DepartamentoService } from '../../../../services/departamento.service';

import { HotelDetalleResponse, HotelResponse, HabitacionResponse, Reserva, ReservaAdminUpdateDTO, DepartamentoResponse } from '../../../../interfaces';

interface HabitacionSeleccionada {
  index: number;
  habitacionId: number | null;
}

@Component({
  standalone: true,
  selector: 'app-edit-reserva',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-reserva.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditReservaComponent implements OnInit {
  private fb = inject(FormBuilder);
  private reservaService = inject(ReservaService);
  private hotelService = inject(HotelService);
  private departamentoService = inject(DepartamentoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  reservaId = signal<number | null>(null);
  reserva = signal<Reserva | null>(null);
  departamentos = signal<DepartamentoResponse[]>([]);
  hoteles = signal<HotelResponse[]>([]);
  hotelesFiltrados = signal<HotelResponse[]>([]);
  habitacionesDisponibles = signal<HabitacionResponse[]>([]);
  habitacionesSeleccionadas = signal<HabitacionSeleccionada[]>([{ index: 1, habitacionId: null }]);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  private nextIndex = 2;

  reservaForm = this.fb.group({
    departamentoId: [''],
    hotelId: ['', Validators.required],
    clienteNombre: ['', [Validators.required, Validators.minLength(2)]],
    clienteApellido: ['', [Validators.required, Validators.minLength(2)]],
    clienteDni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    clienteCorreo: ['', [Validators.required, Validators.email]],
    clienteTelefono: [''],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    estado: ['CONFIRMADA', Validators.required],
    motivoCancelacion: [''],
  });

  estados = [
    { value: 'PENDIENTE', label: 'Pendiente' },
    { value: 'CONFIRMADA', label: 'Confirmada' },
    { value: 'CANCELADA', label: 'Cancelada' },
  ];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.reservaId.set(Number(id));
      this.loadInitialData(Number(id));
    } else {
      this.router.navigate(['/admin/reserva/list']);
    }
  }

  loadInitialData(reservaId: number): void {
    this.loading.set(true);

    // Cargar todo en paralelo
    forkJoin({
      departamentos: this.departamentoService.getAll(),
      hoteles: this.hotelService.getAll(),
      reserva: this.reservaService.getById(reservaId),
    }).subscribe({
      next: ({ departamentos, hoteles, reserva }) => {
        console.log('Reserva cargada:', reserva);

        this.departamentos.set(departamentos);
        this.hoteles.set(hoteles);
        this.hotelesFiltrados.set(hoteles);
        this.reserva.set(reserva);

        // Precargar formulario con datos de la reserva
        this.precargarFormulario(reserva, hoteles);
      },
      error: (err) => {
        console.error('Error cargando datos:', err);
        alert('No se pudo cargar la reserva');
        this.router.navigate(['/admin/reserva/list']);
      },
    });
  }

  precargarFormulario(reserva: Reserva, hoteles: HotelResponse[]): void {
    // Buscar el departamento del hotel
    const departamentoId = reserva.hotel?.departamento?.id;

    // Filtrar hoteles por departamento
    if (departamentoId) {
      const filtrados = hoteles.filter((h) => h.departamento?.id === departamentoId);
      this.hotelesFiltrados.set(filtrados);
    }

    // Precargar valores del formulario
    this.reservaForm.patchValue({
      departamentoId: departamentoId ? String(departamentoId) : '',
      hotelId: reserva.hotel?.id ? String(reserva.hotel.id) : '',
      clienteNombre: reserva.cliente?.nombre || '',
      clienteApellido: reserva.cliente?.apellido || '',
      clienteDni: reserva.cliente?.dni || '',
      clienteCorreo: reserva.cliente?.email || '',
      clienteTelefono: reserva.cliente?.telefono || '',
      fechaInicio: reserva.fechaInicio || '',
      fechaFin: reserva.fechaFin || '',
      estado: reserva.estado || 'CONFIRMADA',
      motivoCancelacion: (reserva as any)?.motivoCancelacion || '',
    });

    // Cargar habitaciones del hotel
    if (reserva.hotel?.id) {
      this.hotelService.getById(reserva.hotel.id).subscribe({
        next: (hotelCompleto) => {
          this.habitacionesDisponibles.set(hotelCompleto.habitaciones || []);

          // Precargar habitaciones seleccionadas desde los detalles
          if (reserva.detalles && reserva.detalles.length > 0) {
            const seleccionadas: HabitacionSeleccionada[] = reserva.detalles.map((det, idx) => ({
              index: idx + 1,
              habitacionId: det.habitacionId,
            }));
            this.habitacionesSeleccionadas.set(seleccionadas);
            this.nextIndex = seleccionadas.length + 1;
          }

          this.loading.set(false);
        },
        error: (err) => {
          console.error('Error cargando habitaciones:', err);
          this.loading.set(false);
        },
      });
    } else {
      this.loading.set(false);
    }
  }

  onDepartamentoChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const depId = Number(select.value);

    if (depId) {
      const filtrados = this.hoteles().filter((h) => h.departamento?.id === depId);
      this.hotelesFiltrados.set(filtrados);
    } else {
      this.hotelesFiltrados.set(this.hoteles());
    }

    this.reservaForm.patchValue({ hotelId: '' });
    this.habitacionesDisponibles.set([]);
    this.habitacionesSeleccionadas.set([{ index: 1, habitacionId: null }]);
    this.nextIndex = 2;
  }

  onHotelChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const hotelId = Number(select.value);

    if (hotelId) {
      this.hotelService.getById(hotelId).subscribe({
        next: (hotel) => {
          this.habitacionesDisponibles.set(hotel.habitaciones || []);
        },
        error: (err) => {
          console.error('Error cargando habitaciones:', err);
          this.habitacionesDisponibles.set([]);
        },
      });
    } else {
      this.habitacionesDisponibles.set([]);
    }

    this.habitacionesSeleccionadas.set([{ index: 1, habitacionId: null }]);
    this.nextIndex = 2;
  }

  getHabitacionesParaSelect(currentIndex: number): HabitacionResponse[] {
    const habitaciones = this.habitacionesDisponibles();
    const seleccionadas = this.habitacionesSeleccionadas();
    const seleccionadasIds = seleccionadas
      .filter((s) => s.index !== currentIndex && s.habitacionId !== null)
      .map((s) => s.habitacionId);

    return habitaciones.filter((h) => !seleccionadasIds.includes(h.id!));
  }

  onHabitacionChange(index: number, event: Event): void {
    const select = event.target as HTMLSelectElement;
    const habitacionId = select.value ? Number(select.value) : null;

    const seleccionadas = this.habitacionesSeleccionadas();
    this.habitacionesSeleccionadas.set(
      seleccionadas.map((s) => (s.index === index ? { ...s, habitacionId } : s))
    );
  }

  agregarHabitacion(): void {
    const seleccionadas = this.habitacionesSeleccionadas();
    this.habitacionesSeleccionadas.set([
      ...seleccionadas,
      { index: this.nextIndex++, habitacionId: null },
    ]);
  }

  quitarHabitacion(index: number): void {
    const seleccionadas = this.habitacionesSeleccionadas();
    if (seleccionadas.length > 1) {
      this.habitacionesSeleccionadas.set(seleccionadas.filter((s) => s.index !== index));
    }
  }

  calcularTotal(): number {
    const habitaciones = this.habitacionesDisponibles();
    const seleccionadas = this.habitacionesSeleccionadas();
    const fechaInicio = this.reservaForm.get('fechaInicio')?.value;
    const fechaFin = this.reservaForm.get('fechaFin')?.value;

    if (!fechaInicio || !fechaFin || seleccionadas.length === 0) {
      return 0;
    }

    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const noches = Math.ceil((fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));

    if (noches <= 0) return 0;

    const totalPorNoche = habitaciones
      .filter((h) => seleccionadas.some((s) => s.habitacionId === h.id))
      .reduce((sum, h) => sum + (h.precio || 0), 0);

    return totalPorNoche * noches;
  }

  onSubmit(): void {
    if (this.reservaForm.invalid) {
      this.reservaForm.markAllAsTouched();
      this.errorMessage.set('Complete todos los campos correctamente');
      return;
    }

    const habitacionesIds = this.habitacionesSeleccionadas()
      .filter((s) => s.habitacionId !== null)
      .map((s) => s.habitacionId as number);

    if (habitacionesIds.length === 0) {
      this.errorMessage.set('Debe seleccionar al menos una habitación');
      return;
    }

    const id = this.reservaId();
    if (!id) return;

    const formValue = this.reservaForm.getRawValue();

    // Validar fechas
    const fechaInicio = new Date(formValue.fechaInicio!);
    const fechaFin = new Date(formValue.fechaFin!);

    if (fechaFin <= fechaInicio) {
      this.errorMessage.set('La fecha de salida debe ser posterior a la fecha de entrada');
      return;
    }

    const reservaData: ReservaAdminUpdateDTO = {
      fechaInicio: formValue.fechaInicio!,
      fechaFin: formValue.fechaFin!,
      estado: formValue.estado!,
      hotelId: Number(formValue.hotelId),
      cliente: {
        dni: formValue.clienteDni!,
        nombre: formValue.clienteNombre!,
        apellido: formValue.clienteApellido!,
        email: formValue.clienteCorreo!,
        telefono: formValue.clienteTelefono || undefined,
      },
      habitaciones: habitacionesIds,
    };

    if (formValue.estado === 'CANCELADA') {
      if (!formValue.motivoCancelacion?.trim()) {
        this.errorMessage.set('Debe ingresar un motivo de cancelación');
        return;
      }
      reservaData.motivoCancelacion = formValue.motivoCancelacion?.trim();
    }

    console.log('Enviando actualización:', reservaData);

    this.saving.set(true);
    this.errorMessage.set(null);

    this.reservaService.update(id, reservaData).subscribe({
      next: (response) => {
        console.log('Respuesta:', response);
        alert('Reserva actualizada exitosamente');
        this.router.navigate(['/admin/reserva/list']);
      },
      error: (err) => {
        console.error('Error actualizando reserva:', err);
        this.errorMessage.set(
          'Error al actualizar la reserva: ' + (err.error?.message || err.message)
        );
        this.saving.set(false);
      },
    });
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }

  formatDate(dateString?: string | null): string {
    if (!dateString) return 'No disponible';
    const date = new Date(dateString + 'T00:00:00');
    return date.toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  // Getters para validaciones
  get clienteNombreInvalid(): boolean {
    const control = this.reservaForm.get('clienteNombre');
    return !!(control?.invalid && control?.touched);
  }

  get clienteApellidoInvalid(): boolean {
    const control = this.reservaForm.get('clienteApellido');
    return !!(control?.invalid && control?.touched);
  }

  get clienteDniInvalid(): boolean {
    const control = this.reservaForm.get('clienteDni');
    return !!(control?.invalid && control?.touched);
  }

  get clienteCorreoInvalid(): boolean {
    const control = this.reservaForm.get('clienteCorreo');
    return !!(control?.invalid && control?.touched);
  }
}
