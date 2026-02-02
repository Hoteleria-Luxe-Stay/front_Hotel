import { ActivatedRoute, Router } from '@angular/router';
import { Component, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DepartamentoResponse } from '../../../../interfaces';

import { CommonModule } from '@angular/common';
import { HotelService } from '../../../../services/hotel.service';
import { DepartamentoService } from '../../../../services/departamento.service';

@Component({
  selector: 'app-create-hotel.component',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './create-hotel.component.html',
})
export class CreateHotelPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private hotelService = inject(HotelService);
  private departamentoService = inject(DepartamentoService);
  private route = inject(ActivatedRoute);
  router = inject(Router);

  departamentos = signal<DepartamentoResponse[]>([]);
  departamentoIdPreseleccionado = signal<number | null>(null);
  saving = signal<boolean>(false);

  hotelForm = this.fb.group({
    nombre: ['', Validators.required],
    direccion: ['', Validators.required],
    departamentoId: ['', Validators.required],
  });

  ngOnInit(): void {
    // Obtener departamentoId de queryParams si existe
    this.route.queryParams.subscribe((params) => {
      if (params['departamentoId']) {
        const depId = Number(params['departamentoId']);
        this.departamentoIdPreseleccionado.set(depId);
        this.hotelForm.patchValue({ departamentoId: String(depId) });
      }
    });

    this.loadDepartamentos();
  }

  loadDepartamentos() {
    this.departamentoService.getAll().subscribe((data) => {
      this.departamentos.set(data);
    });
  }

  onSubmit() {
    if (this.hotelForm.invalid) return;

    this.saving.set(true);
    const formValue = this.hotelForm.getRawValue();

    const hotelData = {
      nombre: formValue.nombre ?? '',
      direccion: formValue.direccion ?? '',
      departamentoId: Number(formValue.departamentoId),
    };

    this.hotelService.createHotel(hotelData).subscribe({
      next: () => {
        alert('Hotel creado exitosamente');
        this.hotelForm.reset();

        // Redirigir al departamento si estaba preseleccionado
        const depId = this.departamentoIdPreseleccionado();
        if (depId) {
          this.router.navigate(['/admin/hotel/departamento', depId]);
        } else {
          this.router.navigate(['/admin/hotel/list']);
        }
      },
      error: (err: any) => {
        console.error('Error creando hotel:', err);
        alert('Error al crear el hotel');
        this.saving.set(false);
      },
    });
  }

  volver(): void {
    const depId = this.departamentoIdPreseleccionado();
    if (depId) {
      this.router.navigate(['/admin/hotel/departamento', depId]);
    } else {
      this.router.navigate(['/admin/hotel/list']);
    }
  }
}
