import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-reset-code-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './verify-reset-code-page.component.html',
})
export class VerifyResetCodePageComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  isPosting = signal(false);
  hasError = signal(false);
  errorMessage = signal('');
  email = signal('');

  form = this.fb.group({
    code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]],
  });

  constructor() {
    const email = this.route.snapshot.queryParamMap.get('email') || '';
    this.email.set(email);
  }

  get codeField() {
    return this.form.get('code');
  }

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.hasError.set(true);
      this.errorMessage.set('Ingresa el código de 6 dígitos');
      return;
    }

    const code = this.form.value.code ?? '';
    const email = this.email();
    this.isPosting.set(true);
    this.authService.verifyPasswordResetCode(email, code).subscribe({
      next: () => {
        this.isPosting.set(false);
        this.router.navigate(['/auth/reset-password'], { queryParams: { email, code } });
      },
      error: (err) => {
        this.isPosting.set(false);
        this.hasError.set(true);
        this.errorMessage.set(err?.userMessage || 'Código inválido');
      },
    });
  }
}
