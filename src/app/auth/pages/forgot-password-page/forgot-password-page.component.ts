import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './forgot-password-page.component.html',
})
export class ForgotPasswordPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);

  isPosting = signal(false);
  hasError = signal(false);
  errorMessage = signal('');

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get emailField() {
    return this.form.get('email');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.hasError.set(true);
      this.errorMessage.set('Ingresa un correo válido');
      return;
    }

    const email = this.form.value.email ?? '';
    this.isPosting.set(true);
    this.authService.requestPasswordReset(email).subscribe({
      next: () => {
        this.isPosting.set(false);
        this.router.navigate(['/auth/verify-reset'], { queryParams: { email } });
      },
      error: (err) => {
        this.isPosting.set(false);
        this.hasError.set(true);
        this.errorMessage.set(err?.userMessage || 'No se pudo enviar el código');
      },
    });
  }
}
