import { Component, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RegisterRequest } from '../../interfaces/auth.interface';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './register-page.component.html',
})
export class RegisterPageComponent {
  fb = inject(FormBuilder);
  router = inject(Router);
  authService = inject(AuthService);

  hasError = signal(false);
  isPosting = signal(false);
  errorMessage = signal('');

  registerForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9,15}$/)]],
    password: ['', [Validators.required, Validators.minLength(8)]],
    repeatPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  // Getters para acceso fácil a los controles del formulario
  get usernameField() {
    return this.registerForm.get('username');
  }

  get emailField() {
    return this.registerForm.get('email');
  }

  get telefonoField() {
    return this.registerForm.get('telefono');
  }

  get passwordField() {
    return this.registerForm.get('password');
  }

  get repeatPasswordField() {
    return this.registerForm.get('repeatPassword');
  }

  // Validación de contraseñas coincidentes
  get passwordsMatch(): boolean {
    const password = this.registerForm.get('password')?.value;
    const repeatPassword = this.registerForm.get('repeatPassword')?.value;
    return password === repeatPassword;
  }

  // Indicador de fuerza de contraseña
  getPasswordStrength(): { level: number; label: string; color: string } {
    const password = this.getPasswordValue();
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (strength <= 2) return { level: strength, label: 'Débil', color: 'bg-red-500' };
    if (strength <= 4) return { level: strength, label: 'Media', color: 'bg-yellow-500' };
    return { level: strength, label: 'Fuerte', color: 'bg-green-500' };
  }

  // Métodos helper para validaciones de contraseña (evita errores de null)
  getPasswordValue(): string {
    return this.passwordField?.value || '';
  }

  hasMinLength(): boolean {
    return this.getPasswordValue().length >= 8;
  }

  hasUppercase(): boolean {
    return /[A-Z]/.test(this.getPasswordValue());
  }

  hasNumber(): boolean {
    return /[0-9]/.test(this.getPasswordValue());
  }

  showPasswordStrength(): boolean {
    return this.getPasswordValue().length > 0;
  }

  onSubmit() {
    console.log('🔵 Formulario enviado');
    console.log('Formulario válido:', this.registerForm.valid);
    console.log('Valores:', this.registerForm.value);

    // Marcar todos los campos como touched para mostrar errores
    if (this.registerForm.invalid) {
      console.log('❌ Formulario inválido');
      this.registerForm.markAllAsTouched();
      this.showError('Por favor completa todos los campos correctamente');
      return;
    }

    const { username, email, telefono, password, repeatPassword } = this.registerForm.value;

    // Validar que las contraseñas coincidan
    if (password !== repeatPassword) {
      console.log('Las contraseñas no coinciden');
      this.showError('Las contraseñas no coinciden');
      return;
    }


    const registerRequest: RegisterRequest = {
      username: username!,
      email: email!,
      telefono: telefono!,
      password: password!
    };

    console.log('📤 Enviando registro:', registerRequest);
    this.isPosting.set(true);


    this.authService.register(registerRequest).subscribe({
      next: (resp) => {
        console.log('✅ Registro exitoso:', resp);
        this.isPosting.set(false);
        if (resp) {
          // Auto-login exitoso, redirigir al home del cliente
          this.router.navigate(['/home']);
        } else {
          this.showError('Error al crear la cuenta');
        }
      },
      error: (error) => {
        console.error('❌ Error en registro:', error);
        this.isPosting.set(false);
        const message = error.userMessage || 'Error al crear la cuenta. Inténtalo de nuevo.';
        this.showError(message);
      }
    });
  }

  private showError(message: string) {
    this.errorMessage.set(message);
    this.hasError.set(true);
    setTimeout(() => {
      this.hasError.set(false);
      this.errorMessage.set('');
    }, 10000);
  }
}
