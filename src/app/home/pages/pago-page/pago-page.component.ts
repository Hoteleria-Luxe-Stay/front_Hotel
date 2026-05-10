import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReservaPublicService } from '../../services/reserva-public.service';
import { ReservaResponse } from '../../../interfaces';

@Component({
  standalone: true,
  selector: 'app-pago-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './pago-page.component.html',
})
export class PagoPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservaService = inject(ReservaPublicService);

  reservaId = signal<number | null>(null);
  reserva = signal<ReservaResponse | null>(null);
  loading = signal<boolean>(true);
  procesando = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  total = computed(() => this.reserva()?.total ?? 0);

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

  pagarConMercadoPago(): void {
    const reservaId = this.reservaId();
    if (!reservaId) {
      this.errorMessage.set('ID de reserva no válido');
      return;
    }

    this.procesando.set(true);
    this.errorMessage.set(null);

    const origin = window.location.origin;
    const successUrl = `${origin}/home/reserva/${reservaId}/confirmacion`;
    const cancelUrl = `${origin}/home/reserva/${reservaId}/pago`;

    this.reservaService.iniciarPago(reservaId, successUrl, cancelUrl).subscribe({
      next: (resp) => {
        window.location.href = resp.checkoutUrl;
      },
      error: (err) => {
        console.error('Error al iniciar pago:', err);
        this.procesando.set(false);
        this.errorMessage.set(
          err.error?.message || 'Error al iniciar el pago. Intente nuevamente.'
        );
      },
    });
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }
}
