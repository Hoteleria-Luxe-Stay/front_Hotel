import { Component, signal, inject, effect, ElementRef, HostListener } from '@angular/core';
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
  private hostElement = inject(ElementRef<HTMLElement>);

  // Signals derivados del AuthService, para no tener que duplicar
  usuario = this.authService.user;
  isAuthenticated = this.authService.isAuthenticated;

  // Signal para notificaciones no leidas
  notificacionesNoLeidas = this.notificacionService.notificacionesNoLeidas;
  notificacionesReservasNoLeidas = this.notificacionService.notificacionesReservasNoLeidas;
  notificacionesSesionesNoLeidas = this.notificacionService.notificacionesSesionesNoLeidas;

  // Signals locales para UI
  userMenuOpen = signal(false);
  mobileMenuOpen = signal(false);
  notificationsMenuOpen = signal(false);

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
    if (!this.mobileMenuOpen()) {
      this.notificationsMenuOpen.set(false);
    }
  }

  toggleNotificationsMenu() {
    this.notificationsMenuOpen.update(value => !value);
  }

  closeNotificationsMenu() {
    this.notificationsMenuOpen.set(false);
  }

  onNotificationsItemClick() {
    this.closeNotificationsMenu();
    this.mobileMenuOpen.set(false);
  }

  logout() {
    if (confirm('¿Estás seguro de cerrar sesión?')) {
      this.authService.logout();
      this.userMenuOpen.set(false);
      this.router.navigate(['/auth/login']);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node | null;
    if (target && !this.hostElement.nativeElement.contains(target)) {
      this.notificationsMenuOpen.set(false);
      this.userMenuOpen.set(false);
      this.mobileMenuOpen.set(false);
    }
  }

  eliminarReservas(): void {
    this.notificacionService.eliminarNotificacionesPorOrigen('reservas').subscribe({
      error: (err) => console.error('[Navbar] Error eliminando reservas:', err)
    });
  }

  eliminarSesiones(): void {
    this.notificacionService.eliminarNotificacionesPorOrigen('sesiones').subscribe({
      error: (err) => console.error('[Navbar] Error eliminando sesiones:', err)
    });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    this.notificationsMenuOpen.set(false);
    this.userMenuOpen.set(false);
    this.mobileMenuOpen.set(false);
  }
}
