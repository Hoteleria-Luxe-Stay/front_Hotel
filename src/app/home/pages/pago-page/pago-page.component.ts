import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReservaPublicService } from '../../services/reserva-public.service';
import { ReservaResponse } from '../../../interfaces';

@Component({
  standalone: true,
  selector: 'app-pago-page',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './pago-page.component.html',
})
export class PagoPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservaService = inject(ReservaPublicService);

  reservaId = signal<number | null>(null);
  reserva = signal<ReservaResponse | null>(null);
  loading = signal<boolean>(true);
  procesando = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  // Formulario de pago
  pagoForm = this.fb.group({
    numeroTarjeta: ['', [Validators.required, Validators.pattern(/^\d{16}$/)]],
    nombreTitular: ['', [Validators.required, Validators.minLength(3)]],
    fechaExpiracion: ['', [Validators.required, Validators.pattern(/^(0[1-9]|1[0-2])\/\d{2}$/)]],
    cvv: ['', [Validators.required, Validators.pattern(/^\d{3,4}$/)]],
    tipoPago: ['tarjeta', Validators.required],
  });

  // Computed para el total
  total = computed(() => {
    const res = this.reserva();
    if (!res) return 0;
    return res.total;
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('reservaId');
    if (id) {
      this.reservaId.set(Number(id));
      this.loadReserva(Number(id));
    } else {
      this.router.navigate(['/home']);
    }
  }

  loadReserva(id: number): void {
    this.loading.set(true);
    this.reservaService.getReservaDetalle(id).subscribe({
      next: (data) => {
        this.reserva.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando reserva:', err);
        this.errorMessage.set('No se pudo cargar la información de la reserva');
        this.loading.set(false);
      },
    });
  }

  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    input.value = value;
    this.pagoForm.get('numeroTarjeta')?.setValue(value);
  }

  formatExpiration(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    input.value = value;
    this.pagoForm.get('fechaExpiracion')?.setValue(value);
  }

  procesarPago(): void {
    if (this.pagoForm.invalid) {
      this.pagoForm.markAllAsTouched();
      this.errorMessage.set('Complete todos los datos de pago correctamente');
      return;
    }

    this.procesando.set(true);
    this.errorMessage.set(null);

    const reservaId = this.reservaId();
    if (!reservaId) {
      this.errorMessage.set('ID de reserva no válido');
      this.procesando.set(false);
      return;
    }

    // Confirmar el pago en el backend
    this.reservaService.confirmarPago(reservaId).subscribe({
      next: () => {
        // Pago exitoso - redirigir a confirmación
        this.router.navigate(['/home/reserva', reservaId, 'confirmacion']);
      },
      error: (err) => {
        console.error('Error al confirmar pago:', err);
        this.procesando.set(false);
        this.errorMessage.set(err.error?.message || 'Error al procesar el pago. Intente nuevamente.');
      }
    });
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }

  // Getters para validaciones
  get numeroTarjetaInvalid(): boolean {
    const control = this.pagoForm.get('numeroTarjeta');
    return !!(control?.invalid && control?.touched);
  }

  get nombreTitularInvalid(): boolean {
    const control = this.pagoForm.get('nombreTitular');
    return !!(control?.invalid && control?.touched);
  }

  get fechaExpiracionInvalid(): boolean {
    const control = this.pagoForm.get('fechaExpiracion');
    return !!(control?.invalid && control?.touched);
  }

  get cvvInvalid(): boolean {
    const control = this.pagoForm.get('cvv');
    return !!(control?.invalid && control?.touched);
  }
}
