import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DepartamentoResponse } from '../../../../interfaces';
import { DepartamentoService } from '../../../../services/departamento.service';

@Component({
  standalone: true,
  selector: 'app-list-departamento',
  imports: [CommonModule, RouterLink],
  templateUrl: './list-departamento.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ListDepartamentoComponent implements OnInit {
  private departamentoService = inject(DepartamentoService);

  departamentos = signal<DepartamentoResponse[]>([]);
  loading = signal<boolean>(true);

  // Modal eliminar
  showModalEliminar = signal<boolean>(false);
  departamentoSeleccionado = signal<DepartamentoResponse | null>(null);
  procesando = signal<boolean>(false);
  successMessage = signal<string | null>(null);

  ngOnInit(): void {
    this.loadDepartamentos();
  }

  loadDepartamentos(): void {
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

  // Modal eliminar
  abrirModalEliminar(dep: DepartamentoResponse): void {
    this.departamentoSeleccionado.set(dep);
    this.showModalEliminar.set(true);
  }

  cerrarModalEliminar(): void {
    this.showModalEliminar.set(false);
    this.departamentoSeleccionado.set(null);
  }

  confirmarEliminar(): void {
    const dep = this.departamentoSeleccionado();
    if (!dep?.id) return;

    this.procesando.set(true);
    this.departamentoService.delete(dep.id).subscribe({
      next: () => {
        this.successMessage.set(`Departamento "${dep.nombre}" eliminado exitosamente`);
        this.cerrarModalEliminar();
        this.procesando.set(false);
        this.loadDepartamentos();

        // Ocultar mensaje después de 5 segundos
        setTimeout(() => this.successMessage.set(null), 5000);
      },
      error: (err) => {
        console.error('Error eliminando departamento', err);
        alert('No se pudo eliminar el departamento. Puede tener hoteles asociados.');
        this.procesando.set(false);
      },
    });
  }
}
