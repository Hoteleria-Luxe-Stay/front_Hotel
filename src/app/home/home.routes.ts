import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home-page/home-page.component';
import { DepartamentosPageComponent } from './pages/departamentos-page/departamentos-page.component';
import { HotelesPageComponent } from './pages/hoteles-page/hoteles-page.component';
import { ReservaPageComponent } from './pages/reserva-page/reserva-page.component';
import { PagoPageComponent } from './pages/pago-page/pago-page.component';
import { ConfirmacionPageComponent } from './pages/confirmacion-page/confirmacion-page.component';
import { MisReservasPageComponent } from './pages/mis-reservas-page/mis-reservas-page.component';
import { ContactoPageComponent } from './pages/contacto-page/contacto-page.component';
import { ClienteLayoutComponent } from './layout/cliente-layout/cliente-layout.component';
import { NotificacionesPageComponent } from './pages/notificaciones-page/notificaciones-page.component';
import { authGuard } from '../auth/guards/auth.guard';

export const homeRoutes: Routes = [
  {
    path: '',
    component: ClienteLayoutComponent,
    children: [
      {
        path: '',
        component: HomePageComponent,
      },
      {
        path: 'hoteles',
        component: HotelesPageComponent,
      },
      {
        path: 'departamentos',
        component: DepartamentosPageComponent,
      },
      {
        path: 'hoteles/:depId',
        component: HotelesPageComponent,
      },
      {
        path: 'hotel/:hotelId/reservar',
        component: ReservaPageComponent,
      },
      {
        path: 'reserva/:reservaId/pago',
        component: PagoPageComponent,
        canActivate: [authGuard],
      },
      {
        path: 'reserva/:reservaId/confirmacion',
        component: ConfirmacionPageComponent,
        canActivate: [authGuard],
      },
      {
        path: 'mis-reservas',
        component: MisReservasPageComponent,
        canActivate: [authGuard],
      },
      {
        path: 'notificaciones',
        component: NotificacionesPageComponent,
        canActivate: [authGuard],
      },
      {
        path: 'contacto',
        component: ContactoPageComponent,
      },
    ],
  },
];

export default homeRoutes;
