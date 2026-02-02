import { Component, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';

import { forkJoin } from 'rxjs';
import { HotelService } from '../../../../services/hotel.service';
import { DepartamentoService } from '../../../../services/departamento.service';

@Component({
  selector: 'app-hotel-form',
  standalone: true,
  templateUrl: './update-page.component.html',
  imports: [ReactiveFormsModule, CommonModule, RouterModule]
})
export class UpdateHotelFormComponent implements OnInit {
  hotelForm!: FormGroup;


  departamentos = signal<any[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  hotelId!: number;

  constructor(
    private fb: FormBuilder,
    private hotelService: HotelService,
    private departamentoService: DepartamentoService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.hotelId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.hotelId || isNaN(this.hotelId)) {
      this.error.set('ID de hotel inválido');
      this.loading.set(false);
      return;
    }

    this.initForm();
    this.loadData();
  }

  initForm() {
    this.hotelForm = this.fb.group({
      nombre: ['', Validators.required],
      direccion: ['', Validators.required],
      departamento: ['', Validators.required]
    });
  }

  loadData() {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      departamentos: this.departamentoService.getAll(),
      hotel: this.hotelService.getById(this.hotelId)
    }).subscribe({
      next: ({ departamentos, hotel }) => {
        this.departamentos.set(departamentos);

        this.hotelForm.patchValue({
          nombre: hotel.nombre,
          direccion: hotel.direccion,
          departamento: hotel.departamento?.id || ''
        });

        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);

        let errorMsg = 'Error al cargar los datos';
        if (err.status === 404) {
          errorMsg = 'Hotel no encontrado';
        } else if (err.status === 403) {
          errorMsg = 'No tienes permisos para acceder a este hotel';
        } else if (err.status === 0) {
          errorMsg = 'No se puede conectar con el servidor';
        }

        this.error.set(errorMsg);
        this.loading.set(false);
      }
    });
  }

  onSubmit() {
    if (this.hotelForm.invalid) {
      alert('Por favor completa todos los campos requeridos');
      this.hotelForm.markAllAsTouched();
      return;
    }

    const payload = {
      nombre: this.hotelForm.value.nombre,
      direccion: this.hotelForm.value.direccion,
      departamentoId: Number(this.hotelForm.value.departamento),
    };

    console.log('Payload a enviar:', payload);

    this.hotelService.updateHotel(this.hotelId, payload).subscribe({
      next: (response: any) => {
        console.log('Respuesta del servidor:', response);
        alert('Hotel actualizado correctamente');
        this.router.navigate(['/admin/hotel/list']);
      },
      error: (err: any) => {
        console.error('Error al guardar:', err);

        let errorMsg = 'Error desconocido';
        if (err.error?.message) {
          errorMsg = err.error.message;
        } else if (err.message) {
          errorMsg = err.message;
        } else if (err.status === 400) {
          errorMsg = 'Datos inválidos';
        } else if (err.status === 403) {
          errorMsg = 'No tienes permisos para actualizar este hotel';
        }

        alert('Error al guardar el hotel: ' + errorMsg);
      }
    });
  }
}
