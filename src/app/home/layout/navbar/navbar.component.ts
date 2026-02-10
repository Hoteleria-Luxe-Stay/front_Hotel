import { Component, signal, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificacionService } from '../../../services/notificacion.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  authService = inject(AuthService);
  notificacionService = inject(NotificacionService);
  private router = inject(Router);

  // Signals derivados del AuthService, para no tener que duplicar
  usuario = this.authService.user;
  isAuthenticated = this.authService.isAuthenticated;

  // Signal para notificaciones no leidas
  notificacionesNoLeidas = this.notificacionService.notificacionesNoLeidas;

  // Signals locales para UI
  userMenuOpen = signal(false);
  mobileMenuOpen = signal(false);

  constructor() {
    effect(() => {
      const currentUser = this.usuario();
      const authStatus = this.isAuthenticated();

      console.log('Navbar - Estado de autenticacion:', {
        usuario: currentUser,
        autenticado: authStatus
      });

      // Cargar notificaciones no leidas cuando el usuario este autenticado
      if (authStatus && currentUser) {
        this.notificacionService.actualizarContadorNoLeidas();
      } else {
        this.notificacionService.limpiarContador();
      }
    });
  }

  toggleUserMenu() {
    this.userMenuOpen.update(value => !value);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen.update(value => !value);
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
      this.userMenuOpen.set(false);
      this.router.navigate(['/auth/login']);
    }
  }
}
