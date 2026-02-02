import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { HotelResponse } from '../../../interfaces';
import { HotelService } from '../../../services/hotel.service';
import { DepartamentoService } from '../../../services/departamento.service';
import { DepartamentoResponse } from '../../../interfaces';

@Component({
  standalone: true,
  selector: 'app-hoteles-page',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './hoteles-page.component.html',
})
export class HotelesPageComponent implements OnInit {

  private route = inject(ActivatedRoute);
  private hotelService = inject(HotelService);
  private departamentoService = inject(DepartamentoService);

  hoteles = signal<HotelResponse[]>([]);
  departamento = signal<DepartamentoResponse | null>(null);
  loading = signal(true);
  busqueda = signal<string>('');
  depId = signal<number | null>(null);

  // Computed para filtrar hoteles por búsqueda
  hotelesFiltrados = computed(() => {
    const termino = this.busqueda().toLowerCase().trim();
    if (!termino) {
      return this.hoteles();
    }
    return this.hoteles().filter(hotel => 
      hotel.nombre.toLowerCase().includes(termino) ||
      hotel.direccion?.toLowerCase().includes(termino)
    );
  });

  ngOnInit() {
    // Obtener el ID del departamento de la URL
    this.route.params.subscribe(params => {
      const id = params['depId'];
      if (id) {
        this.depId.set(+id);
        this.loadDepartamento(+id);
        this.loadHotelesByDepartamento(+id);
      } else {
        this.loadAllHoteles();
      }
    });
  }

  loadDepartamento(id: number) {
    this.departamentoService.getById(id).subscribe({
      next: (data) => {
        this.departamento.set(data);
      },
      error: (error) => {
        console.error('Error al cargar departamento:', error);
      }
    });
  }

  loadHotelesByDepartamento(depId: number) {
    this.loading.set(true);
    this.hotelService.getByDepartamento(depId).subscribe({
      next: (data) => {
        this.hoteles.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar hoteles:', error);
        this.loading.set(false);
      }
    });
  }

  loadAllHoteles() {
    this.loading.set(true);
    this.hotelService.getAll().subscribe({
      next: (data) => {
        this.hoteles.set(data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error al cargar hoteles:', error);
        this.loading.set(false);
      }
    });
  }

  limpiarBusqueda(): void {
    this.busqueda.set('');
  }

  // Imagen por defecto para hoteles sin imagen
  getImagenHotel(hotel: HotelResponse): string {
    if (hotel.imagenUrl) {
      return hotel.imagenUrl;
    }
    // Imágenes de hoteles de respaldo
    const imagenes = [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=500',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500',
    ];
    return imagenes[hotel.id % imagenes.length];
  }
}
