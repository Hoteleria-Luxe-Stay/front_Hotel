import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import jsPDF from 'jspdf';
import { ReservaResponse } from '../../../interfaces';
import { NotificacionService } from '../../../services/notificacion.service';
import { ReservaPublicService } from '../../services/reserva-public.service';

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
  hotelImagenUrl = signal<string | null>(null);
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
        this.cargarImagenHotel(data.hotel?.id);
        this.loading.set(false);
        this.notificacionService.actualizarContadorNoLeidas();
      },
      error: (err) => {
        console.error('Error cargando reserva:', err);
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }

  private cargarImagenHotel(hotelId?: number): void {
    if (!hotelId) {
      this.hotelImagenUrl.set(null);
      return;
    }

    this.reservaService.getHotelDetalle(hotelId).subscribe({
      next: (hotel) => this.hotelImagenUrl.set(hotel.imagenUrl || null),
      error: () => this.hotelImagenUrl.set(null),
    });
  }

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

  getHabitacionInfo(habitacionId: number): { numero: string; tipo: string } {
    return {
      numero: habitacionId.toString(),
      tipo: 'Habitacion',
    };
  }

  calcularSubtotalPorNoche(): number {
    const reserva = this.reserva();
    if (!reserva?.detalles) return 0;

    return reserva.detalles.reduce((sum, detalle) => sum + detalle.precioNoche, 0);
  }

  async descargarPDF(): Promise<void> {
    const reserva = this.reserva();
    if (!reserva) return;

    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const fondo = await this.obtenerImagenFondoPdf();
    if (fondo) {
      doc.addImage(fondo, 'JPEG', 0, 0, pageWidth, pageHeight);
    } else {
      doc.setFillColor(10, 20, 45);
      doc.rect(0, 0, pageWidth, pageHeight, 'F');
    }

    const cardX = 10;
    const cardY = 10;
    const cardW = pageWidth - 20;
    const cardH = pageHeight - 20;

    doc.setFillColor(245, 248, 252);
    doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'F');
    doc.setDrawColor(206, 215, 228);
    doc.roundedRect(cardX, cardY, cardW, cardH, 4, 4, 'S');

    const headerH = 34;
    doc.setFillColor(12, 28, 58);
    doc.roundedRect(cardX, cardY, cardW, headerH, 4, 4, 'F');
    doc.setFillColor(12, 28, 58);
    doc.rect(cardX, cardY + 4, cardW, headerH - 4, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(19);
    doc.text('Hotel LuxeStay', cardX + 8, cardY + 12);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Comprobante Oficial de Reserva', cardX + 8, cardY + 18);

    const fechaActual = new Date().toLocaleDateString('es-PE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
    doc.setTextColor(220, 230, 245);
    doc.text(`Emitido: ${fechaActual}`, cardX + cardW - 8, cardY + 12, { align: 'right' });

    const estado = reserva.estado;
    const estadoText =
      estado === 'CONFIRMADA'
        ? 'Pago confirmado'
        : estado === 'PENDIENTE'
          ? 'Pago pendiente'
          : 'Reserva cancelada';
    if (estado === 'CONFIRMADA') doc.setFillColor(16, 143, 109);
    else if (estado === 'PENDIENTE') doc.setFillColor(201, 142, 35);
    else doc.setFillColor(173, 54, 72);
    doc.roundedRect(cardX + cardW - 64, cardY + 18, 56, 8, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text(estadoText.toUpperCase(), cardX + cardW - 36, cardY + 23.4, { align: 'center' });

    let y = cardY + headerH + 8;

    doc.setTextColor(18, 33, 61);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text('Hotel', cardX + 8, y);
    y += 5.5;

    doc.setTextColor(28, 45, 74);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13.5);
    doc.text(this.hotelNombre, cardX + 8, y);
    y += 5.5;

    doc.setTextColor(84, 102, 132);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const direccion = doc.splitTextToSize(this.hotelDireccion, cardW - 16);
    doc.text(direccion, cardX + 8, y);
    y += direccion.length * 4.6 + 4;

    doc.setDrawColor(219, 227, 238);
    doc.line(cardX + 8, y, cardX + cardW - 8, y);
    y += 7;

    doc.setTextColor(18, 33, 61);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text('Huesped', cardX + 8, y);
    doc.text('Estadia', cardX + cardW / 2, y);
    y += 5.5;

    doc.setTextColor(28, 45, 74);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text(this.clienteNombreCompleto, cardX + 8, y);
    doc.text(`${reserva.fechaInicio} al ${reserva.fechaFin}`, cardX + cardW / 2, y);
    y += 4.8;

    doc.setTextColor(84, 102, 132);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`DNI: ${this.clienteDni}`, cardX + 8, y);
    doc.text(`${this.calcularNoches()} noche(s)`, cardX + cardW / 2, y);
    y += 4.8;
    const email = doc.splitTextToSize(this.clienteEmail, cardW / 2 - 12);
    doc.text(email, cardX + 8, y);
    y += email.length * 4.2 + 4;

    doc.line(cardX + 8, y, cardX + cardW - 8, y);
    y += 7;

    doc.setTextColor(18, 33, 61);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11.5);
    doc.text('Habitaciones Reservadas', cardX + 8, y);
    y += 6.5;

    doc.setFillColor(232, 238, 247);
    doc.rect(cardX + 8, y - 4.5, cardW - 16, 7, 'F');
    doc.setTextColor(66, 84, 116);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.text('Habitacion', cardX + 10, y);
    doc.text('Tipo', cardX + 66, y);
    doc.text('Precio/Noche', cardX + cardW - 10, y, { align: 'right' });
    y += 6.8;

    let subtotal = 0;
    doc.setTextColor(33, 48, 78);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.8);
    for (const detalle of reserva.detalles || []) {
      const habInfo = this.getHabitacionInfo(detalle.habitacionId);
      doc.text(`Habitacion ${habInfo.numero}`, cardX + 10, y);
      doc.text(habInfo.tipo, cardX + 66, y);
      doc.text(this.formatCurrency(detalle.precioNoche), cardX + cardW - 10, y, { align: 'right' });
      subtotal += detalle.precioNoche;
      y += 5.6;
    }

    y += 2;
    doc.line(cardX + 8, y, cardX + cardW - 8, y);
    y += 6;

    const totalX = cardX + cardW - 84;
    doc.setFillColor(12, 28, 58);
    doc.roundedRect(totalX, y - 2, 74, 20, 3, 3, 'F');
    doc.setTextColor(196, 211, 236);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Total de la reserva', totalX + 6, y + 4);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text(this.formatCurrency(reserva.total), totalX + 68, y + 13, { align: 'right' });

    doc.setTextColor(84, 102, 132);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9.3);
    doc.text(`Subtotal por noche: ${this.formatCurrency(subtotal)}`, cardX + 8, y + 4);
    doc.text(`Noches: ${this.calcularNoches()}`, cardX + 8, y + 9);
    doc.text(`Importe final: ${this.formatCurrency(reserva.total)}`, cardX + 8, y + 14);

    const footerY = cardY + cardH - 14;
    doc.setDrawColor(219, 227, 238);
    doc.line(cardX + 8, footerY - 5, cardX + cardW - 8, footerY - 5);
    doc.setTextColor(108, 124, 150);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.2);
    doc.text(
      'Presente este comprobante al momento del check-in. Documento valido para uso interno del hotel.',
      cardX + 8,
      footerY
    );

    doc.save(`comprobante-reserva-${this.getTimestampForFileName()}.pdf`);
  }

  private getTimestampForFileName(): string {
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mi = String(now.getMinutes()).padStart(2, '0');
    return `${yyyy}${mm}${dd}-${hh}${mi}`;
  }

  private async obtenerImagenFondoPdf(): Promise<string | null> {
    const imagenServicio = this.hotelImagenUrl();
    if (imagenServicio) {
      const dataUrl = await this.convertirUrlADataUrl(imagenServicio);
      if (dataUrl) return dataUrl;
    }

    const fallback = this.obtenerFallbackPorHotel();
    return this.convertirUrlADataUrl(fallback);
  }

  private obtenerFallbackPorHotel(): string {
    const nombre = (this.hotelNombre || '').toLowerCase();
    if (nombre.includes('cusco')) {
      return 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=80';
    }
    if (nombre.includes('lima')) {
      return 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?auto=format&fit=crop&w=1600&q=80';
    }
    return 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80';
  }

  private async convertirUrlADataUrl(url: string): Promise<string | null> {
    try {
      const response = await fetch(url);
      if (!response.ok) return null;
      const blob = await response.blob();
      return await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(String(reader.result));
        reader.onerror = () => reject(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }

  imprimirComprobante(): void {
    window.print();
  }
}
