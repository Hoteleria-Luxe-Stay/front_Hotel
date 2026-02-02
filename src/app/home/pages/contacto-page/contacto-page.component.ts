import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../enviroments/environment';

@Component({
  standalone: true,
  selector: 'app-contacto-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './contacto-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactoPageComponent {
  private http = inject(HttpClient);

  // Formulario
  nombre = signal<string>('');
  email = signal<string>('');
  telefono = signal<string>('');
  asunto = signal<string>('');
  mensaje = signal<string>('');

  // Estados
  enviando = signal<boolean>(false);
  enviado = signal<boolean>(false);
  error = signal<string | null>(null);

  onSubmit(): void {
    // Validaciones
    if (!this.nombre().trim()) {
      this.error.set('El nombre es obligatorio');
      return;
    }
    if (!this.email().trim()) {
      this.error.set('El correo electrónico es obligatorio');
      return;
    }
    if (!this.validarEmail(this.email())) {
      this.error.set('Ingrese un correo electrónico válido');
      return;
    }
    if (!this.mensaje().trim()) {
      this.error.set('El mensaje es obligatorio');
      return;
    }

    this.error.set(null);
    this.enviando.set(true);

    const contacto = {
      nombre: this.nombre(),
      email: this.email(),
      telefono: this.telefono(),
      asunto: this.asunto(),
      mensaje: this.mensaje()
    };

    this.http.post(`${environment.apiUrl}/api/v1/contacto`, contacto).subscribe({
      next: () => {
        this.enviando.set(false);
        this.enviado.set(true);
        this.limpiarFormulario();
      },
      error: (err) => {
        console.error('Error enviando contacto:', err);
        this.enviando.set(false);
        this.error.set('No se pudo enviar el mensaje. Intente nuevamente.');
      },
    });
  }

  validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  limpiarFormulario(): void {
    this.nombre.set('');
    this.email.set('');
    this.telefono.set('');
    this.asunto.set('');
    this.mensaje.set('');
  }

  volverAFormulario(): void {
    this.enviado.set(false);
  }

  onInputChange(field: string, event: Event): void {
    const input = event.target as HTMLInputElement | HTMLTextAreaElement;
    switch (field) {
      case 'nombre':
        this.nombre.set(input.value);
        break;
      case 'email':
        this.email.set(input.value);
        break;
      case 'telefono':
        this.telefono.set(input.value.replace(/\D/g, ''));
        break;
      case 'asunto':
        this.asunto.set(input.value);
        break;
      case 'mensaje':
        this.mensaje.set(input.value);
        break;
    }
  }
}
