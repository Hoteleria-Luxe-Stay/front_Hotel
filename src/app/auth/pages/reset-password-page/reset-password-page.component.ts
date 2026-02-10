import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-reset-password-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './reset-password-page.component.html',
})
export class ResetPasswordPageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isPosting = signal(false);
  hasError = signal(false);
  errorMessage = signal('');
  email = signal('');
  code = signal('');

  form = this.fb.group({
    password: ['', [Validators.required, Validators.minLength(8)]],
    confirmPassword: ['', [Validators.required, Validators.minLength(8)]],
  });

  constructor() {
    this.email.set(this.route.snapshot.queryParamMap.get('email') || '');
    this.code.set(this.route.snapshot.queryParamMap.get('code') || '');
  }

  get passwordField() {
    return this.form.get('password');
  }

  get confirmPasswordField() {
    return this.form.get('confirmPassword');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.hasError.set(true);
      this.errorMessage.set('Completa los campos correctamente');
      return;
    }

    const password = this.form.value.password ?? '';
    const confirm = this.form.value.confirmPassword ?? '';
    if (password !== confirm) {
      this.hasError.set(true);
      this.errorMessage.set('Las contraseñas no coinciden');
      return;
    }

    this.isPosting.set(true);
    this.authService.resetPassword(this.email(), this.code(), password).subscribe({
      next: () => {
        this.isPosting.set(false);
        this.router.navigate(['/auth/login']);
      },
      error: (err) => {
        this.isPosting.set(false);
        this.hasError.set(true);
        this.errorMessage.set(err?.userMessage || 'No se pudo cambiar la contraseña');
      },
    });
  }
}
