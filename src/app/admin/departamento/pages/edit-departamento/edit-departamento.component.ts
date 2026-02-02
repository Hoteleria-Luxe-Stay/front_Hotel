import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DepartamentoService } from '../../../../services/departamento.service';

@Component({
  standalone: true,
  selector: 'app-edit-departamento',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-departamento.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditDepartamentoComponent implements OnInit {
  private fb = inject(FormBuilder);
  private departamentoService = inject(DepartamentoService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  departamentoId = signal<number | null>(null);
  loading = signal<boolean>(true);
  saving = signal<boolean>(false);

  departamentoForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (id) {
      this.departamentoId.set(Number(id));
      this.loadDepartamento(Number(id));
    } else {
      this.router.navigate(['/admin/departamento/list']);
    }
  }

  loadDepartamento(id: number): void {
    this.loading.set(true);
    this.departamentoService.getById(id).subscribe({
      next: (departamento) => {
        this.departamentoForm.patchValue({
          nombre: departamento.nombre,
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar departamento:', err);
        alert('No se pudo cargar el departamento');
        this.router.navigate(['/admin/departamento/list']);
      },
    });
  }

  onSubmit(): void {
    if (this.departamentoForm.invalid) {
      this.departamentoForm.markAllAsTouched();
      return;
    }

    const id = this.departamentoId();
    if (!id) return;

    this.saving.set(true);
    const formValue = this.departamentoForm.getRawValue();

    const departamentoData = {
      nombre: formValue.nombre ?? '',
    };

    this.departamentoService.update(id, departamentoData).subscribe({
      next: () => {
        alert('Departamento actualizado exitosamente');
        this.router.navigate(['/admin/departamento/list']);
      },
      error: (err) => {
        console.error('Error al actualizar departamento:', err);
        alert('Error al actualizar el departamento');
        this.saving.set(false);
      },
    });
  }

  // Getters para validaciones en el template
  get nombreInvalid(): boolean {
    const control = this.departamentoForm.get('nombre');
    return !!(control?.invalid && control?.touched);
  }

}
