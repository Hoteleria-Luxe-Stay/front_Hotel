import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DepartamentoResponse } from '../../../interfaces';
import { DepartamentoService } from '../../../services/departamento.service';

@Component({
  standalone: true,
  selector: 'app-departamentos-page',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './departamentos-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DepartamentosPageComponent {

  private departamentoService = inject(DepartamentoService);

  departamentos = signal<DepartamentoResponse[]>([]);
  loading = signal<boolean>(true);
  busqueda = signal<string>('');

  // Computed para filtrar departamentos
  departamentosFiltrados = computed(() => {
    const termino = this.busqueda().toLowerCase().trim();
    if (!termino) {
      return this.departamentos();
    }
    return this.departamentos().filter(dep => 
      dep.nombre.toLowerCase().includes(termino)
    );
  });

  // Imágenes por departamento
  private imagenesDepartamentos: Record<string, string> = {
    'Lima': 'https://images.unsplash.com/photo-1531968455001-5c5272a41129?w=600',
    'Cusco': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600',
    'Cuzco': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=600',
    'Arequipa': 'https://images.unsplash.com/photo-1580619305218-8423a7ef79b4?w=600',
    'Piura': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600',
    'La Libertad': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=600',
    'Lambayeque': 'https://images.unsplash.com/photo-1599930113854-d6d7fd521f10?w=600',
    'Loreto': 'https://images.unsplash.com/photo-1601000938259-9e92002320b2?w=600',
    'Ica': 'https://images.unsplash.com/photo-1580820267682-426da823b514?w=600',
    'Puno': 'https://images.unsplash.com/photo-1580975929351-2ec71e529bdc?w=600',
    'Tacna': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
    'Madre de Dios': 'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=600',
    'Tumbes': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
  };

  // Descripciones por departamento
  private descripcionesDepartamentos: Record<string, string> = {
    'Lima': 'La capital del virú',
    'Cusco': 'La ciudad del sol',
    'Cuzco': 'La ciudad del sol',
    'Arequipa': 'La ciudad blanca',
    'Piura': 'Ciudad del eterno calor',
    'La Libertad': 'Cuna de la libertad',
    'Lambayeque': 'Tierra de los Mochicas',
    'Loreto': 'Puerta de la Amazonía',
    'Ica': 'Tierra del sol y vino',
    'Puno': 'Capital del folklore',
    'Tacna': 'Ciudad heroica',
    'Madre de Dios': 'Capital de la biodiversidad',
    'Tumbes': 'Playas del norte',
  };

  constructor() {
    this.loadDepartamentos();
  }

  loadDepartamentos() {
    this.loading.set(true);
    this.departamentoService.getAll().subscribe({
      next: (data) => {
        this.departamentos.set(data);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error cargando departamentos', err);
        this.loading.set(false);
      },
    });
  }

  buscar(): void {
    // El filtrado es reactivo con computed, no necesita hacer nada extra
  }

  limpiarBusqueda(): void {
    this.busqueda.set('');
  }

  getImagenDepartamento(nombre: string): string {
    return this.imagenesDepartamentos[nombre] || 
      `https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600`;
  }

  getDescripcion(nombre: string): string {
    return this.descripcionesDepartamentos[nombre] || 'Descubre este hermoso destino';
  }
}
