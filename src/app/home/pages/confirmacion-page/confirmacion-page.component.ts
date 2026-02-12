import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { ReservaPublicService } from '../../services/reserva-public.service';
import { NotificacionService } from '../../../services/notificacion.service';
import { ReservaResponse } from '../../../interfaces';
import jsPDF from 'jspdf';

@Component({
  standalone: true,
  selector: 'app-confirmacion-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './confirmacion-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmacionPageComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private reservaService = inject(ReservaPublicService);
  private notificacionService = inject(NotificacionService);

  reservaId = signal<number | null>(null);
  reserva = signal<ReservaResponse | null>(null);
  loading = signal<boolean>(true);
  error = signal<boolean>(false);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('reservaId');

    if (id) {
      this.reservaId.set(Number(id));
      this.loadReserva(Number(id));
    }
  }

  loadReserva(id: number): void {
    this.loading.set(true);

    this.reservaService.getReservaDetalle(id).subscribe({
      next: (data) => {
        this.reserva.set(data);
        this.loading.set(false);
        // Actualizar contador de notificaciones después de confirmar reserva
        this.notificacionService.actualizarContadorNoLeidas();
      },
      error: (err) => {
        console.error('Error cargando reserva:', err);
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  // ==================== GETTERS PARA ACCESO A DATOS ====================

  get hotelNombre(): string {
    return this.reserva()?.hotel?.nombre || 'N/A';
  }

  get hotelDireccion(): string {
    return this.reserva()?.hotel?.direccion || 'N/A';
  }

  get clienteNombreCompleto(): string {
    const cliente = this.reserva()?.cliente;
    if (!cliente) return 'N/A';
    return `${cliente.nombre} ${cliente.apellido}`.trim() || 'N/A';
  }

  get clienteDni(): string {
    return this.reserva()?.cliente?.dni || 'N/A';
  }

  get clienteEmail(): string {
    return this.reserva()?.cliente?.email || 'N/A';
  }

  // ==================== UTILIDADES ====================

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  formatCurrency(amount: number): string {
    return `S/ ${amount.toFixed(2)}`;
  }

  calcularNoches(): number {
    const reserva = this.reserva();
    if (!reserva) return 0;

    const inicio = new Date(reserva.fechaInicio);
    const fin = new Date(reserva.fechaFin);
    const diff = fin.getTime() - inicio.getTime();

    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Obtiene información de habitación desde el hotel
   */
  getHabitacionInfo(habitacionId: number): { numero: string; tipo: string } {
    return {
      numero: habitacionId.toString(),
      tipo: 'Habitación',
    };
  }

  /**
   * Calcula el subtotal por noche (suma de precios de habitaciones)
   */
  calcularSubtotalPorNoche(): number {
    const reserva = this.reserva();
    if (!reserva?.detalles) return 0;

    return reserva.detalles.reduce((sum, detalle) => sum + detalle.precioNoche, 0);
  }

  // ==================== GENERAR PDF ====================

  descargarPDF(): void {
    const reserva = this.reserva();
    if (!reserva) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // Colores
    const primaryColor: [number, number, number] = [79, 70, 229]; // indigo-600
    const grayColor: [number, number, number] = [107, 114, 128];
    const blackColor: [number, number, number] = [0, 0, 0];
    
    let y = 20;

    // Header con fondo
    doc.setFillColor(79, 70, 229);
    doc.rect(0, 0, pageWidth, 45, 'F');

    // Logo/Título
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Hotel LuxeStay', pageWidth / 2, 20, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Comprobante de Reserva', pageWidth / 2, 32, { align: 'center' });

    y = 60;

    // Número de reserva
    doc.setTextColor(...blackColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`Reserva N° ${reserva.id.toString().padStart(6, '0')}`, 20, y);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...grayColor);
    const fechaActual = new Date().toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.text(`Fecha de emisión: ${fechaActual}`, pageWidth - 20, y, { align: 'right' });

    y += 15;

    // Línea separadora
    doc.setDrawColor(229, 231, 235);
    doc.line(20, y, pageWidth - 20, y);
    y += 15;

    // Sección: Datos del Hotel
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL HOTEL', 20, y);
    y += 8;

    doc.setTextColor(...blackColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Hotel: ${this.hotelNombre}`, 20, y);
    y += 6;
    doc.text(`Dirección: ${this.hotelDireccion}`, 20, y);
    y += 15;

    // Sección: Datos del Huésped
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL HUÉSPED', 20, y);
    y += 8;

    doc.setTextColor(...blackColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Nombre: ${this.clienteNombreCompleto}`, 20, y);
    y += 6;
    doc.text(`DNI: ${this.clienteDni}`, 20, y);
    y += 6;
    doc.text(`Email: ${this.clienteEmail}`, 20, y);
    y += 15;

    // Sección: Detalles de la Estadía
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLES DE LA ESTADÍA', 20, y);
    y += 8;

    doc.setTextColor(...blackColor);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    doc.text(`Check-in: ${reserva.fechaInicio}`, 20, y);
    doc.text(`Check-out: ${reserva.fechaFin}`, pageWidth / 2, y);
    y += 6;
    doc.text(`Noches: ${this.calcularNoches()}`, 20, y);
    y += 15;

    // Sección: Habitaciones
    doc.setTextColor(...primaryColor);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('HABITACIONES RESERVADAS', 20, y);
    y += 10;

    // Tabla de habitaciones
    doc.setFillColor(243, 244, 246);
    doc.rect(20, y - 5, pageWidth - 40, 8, 'F');
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Habitación', 25, y);
    doc.text('Tipo', 80, y);
    doc.text('Precio/Noche', pageWidth - 45, y);
    y += 10;

    doc.setTextColor(...blackColor);
    doc.setFont('helvetica', 'normal');
    
    let subtotal = 0;
    if (reserva.detalles && reserva.detalles.length > 0) {
      for (const detalle of reserva.detalles) {
        const habInfo = this.getHabitacionInfo(detalle.habitacionId);
        doc.text(`N° ${habInfo.numero}`, 25, y);
        doc.text(habInfo.tipo, 80, y);
        doc.text(this.formatCurrency(detalle.precioNoche), pageWidth - 45, y);
        subtotal += detalle.precioNoche;
        y += 7;
      }
    }

    y += 5;

    // Línea separadora
    doc.setDrawColor(229, 231, 235);
    doc.line(20, y, pageWidth - 20, y);
    y += 10;

    // Totales
    doc.setFontSize(11);
    doc.text('Subtotal/noche:', pageWidth - 80, y);
    doc.text(this.formatCurrency(subtotal), pageWidth - 45, y);
    y += 7;

    const noches = this.calcularNoches();
    doc.text(`x ${noches} noche(s):`, pageWidth - 80, y);
    doc.text(this.formatCurrency(subtotal * noches), pageWidth - 45, y);
    y += 10;

    // Total
    doc.setFillColor(79, 70, 229);
    doc.rect(pageWidth - 100, y - 5, 80, 12, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', pageWidth - 95, y + 3);
    doc.text(this.formatCurrency(reserva.total), pageWidth - 25, y + 3, { align: 'right' });

    y += 25;

    // Estado de pago
    doc.setFillColor(34, 197, 94);
    doc.roundedRect(20, y, 60, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('PAGADO', 50, y + 7, { align: 'center' });

    y += 25;

    // Notas
    doc.setTextColor(...grayColor);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('* Presente este comprobante al momento del check-in.', 20, y);
    y += 5;
    doc.text('* El check-in es a partir de las 14:00 hrs y el check-out hasta las 12:00 hrs.', 20, y);
    y += 5;
    doc.text('* Para cancelaciones, comuníquese con al menos 24 horas de anticipación.', 20, y);

    // Footer
    const footerY = doc.internal.pageSize.getHeight() - 20;
    doc.setDrawColor(229, 231, 235);
    doc.line(20, footerY - 10, pageWidth - 20, footerY - 10);
    
    doc.setTextColor(...grayColor);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Hotel LuxeStay - Sistema de Reservas', pageWidth / 2, footerY, { align: 'center' });
    doc.text('www.hotelluxestay.com | reservas@hotelluxestay.com | +51 999 888 777', pageWidth / 2, footerY + 5, { align: 'center' });

    // Descargar
    doc.save(`reserva-${reserva.id.toString().padStart(6, '0')}.pdf`);
  }

  imprimirComprobante(): void {
    window.print();
  }
}
