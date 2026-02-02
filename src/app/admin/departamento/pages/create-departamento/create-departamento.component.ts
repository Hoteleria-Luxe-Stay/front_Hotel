import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { DepartamentoService } from '../../../../services/departamento.service';

@Component({
  standalone: true,
  selector: 'app-create-departamento',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './create-departamento.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateDepartamentoComponent {
  private fb = inject(FormBuilder);
  private departamentoService = inject(DepartamentoService);
  private router = inject(Router);

  saving = signal<boolean>(false);

  departamentoForm = this.fb.group({
    nombre: ['', [Validators.required, Validators.minLength(3)]],
  });

  onSubmit(): void {
    if (this.departamentoForm.invalid) {
      this.departamentoForm.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const formValue = this.departamentoForm.getRawValue();

    const departamentoData = {
      nombre: formValue.nombre ?? '',
    };

    this.departamentoService.create(departamentoData).subscribe({
      next: () => {
        alert('Departamento creado exitosamente');
        this.router.navigate(['/admin/departamento/list']);
      },
      error: (err) => {
        console.error('Error al crear departamento:', err);
        alert('Error al crear el departamento');
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
