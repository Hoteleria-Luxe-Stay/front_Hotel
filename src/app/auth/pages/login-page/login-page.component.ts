import { AuthResponse, LoginRequest } from '../../interfaces/auth.interface';
import { AuthService } from '../../services/auth.service';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login-page.component',
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
})
export class LoginPageComponent {
  fb = inject(FormBuilder);
  hasError = signal(false);
  isPosting = signal(false);
  errorMessage = signal('');

  router = inject(Router);

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  // Getters para acceso fácil a los controles del formulario
  get emailField() {
    return this.loginForm.get('email');
  }

  get passwordField() {
    return this.loginForm.get('password');
  }

  authService = inject(AuthService);

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.errorMessage.set('Por favor corrige los errores en el formulario');
      this.hasError.set(true);
      setTimeout(() => {
        this.hasError.set(false);
        this.errorMessage.set('');
      }, 3000);
      return;
    }

    const { email = '', password = '' } = this.loginForm.value;

    const loginRequest: LoginRequest = {
      email: email,
      password: password,
    };

    this.isPosting.set(true);

    this.authService.login(loginRequest).subscribe({
      next: (authResp: AuthResponse) => {
        console.log('AuthResponse:', authResp);
        this.isPosting.set(false);

        const user = authResp.user;

        if (!user) {
          console.error('User está undefined');
          this.hasError.set(true);
          return;
        }

        // Redirigir según el rol
        if (user.role === 'ADMIN') {
          this.router.navigate(['/admin']);
        } else {
          this.router.navigate(['/home']);
        }
      },
      error: (err) => {
        console.error('Login failed', err);
        this.isPosting.set(false);
        this.hasError.set(true);
        setTimeout(() => this.hasError.set(false), 3000);
      },
    });
  }
}
