import { Routes } from "@angular/router";
import { AuthLayoutComponent } from "./layout/auth-layout.component/auth-layout.component";
import { LoginPageComponent } from "./pages/login-page/login-page.component";
import { RegisterPageComponent } from "./pages/register-page/register-page.component";
import { ForgotPasswordPageComponent } from "./pages/forgot-password-page/forgot-password-page.component";
import { VerifyResetCodePageComponent } from "./pages/verify-reset-code-page/verify-reset-code-page.component";
import { ResetPasswordPageComponent } from "./pages/reset-password-page/reset-password-page.component";

export const authRoutes: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        component: LoginPageComponent
      },
      {
        path: 'register',
        component: RegisterPageComponent
      },
      {
        path: 'forgot-password',
        component: ForgotPasswordPageComponent
      },
      {
        path: 'verify-reset',
        component: VerifyResetCodePageComponent
      },
      {
        path: 'reset-password',
        component: ResetPasswordPageComponent
      }
    ]
  }
]

export default authRoutes;
