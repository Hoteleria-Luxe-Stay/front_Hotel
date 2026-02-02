import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout.component';
import { DashboardPageComponent } from './pages/dashboard-page/dashboard-page.component';

export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
      {
        path: 'dashboard',
        component: DashboardPageComponent,
      },
      {
        path: 'hotel',
        loadChildren: () => import('./hotel/hotel.routes').then((m) => m.hotelAdminRoutes),
      },
      {
        path: 'departamento',
        loadChildren: () =>
          import('./departamento/departamento.routes').then((m) => m.departamentoRoutes),
      },
      {
        path: 'reserva',
        loadChildren: () => import('./reserva/reserva.routes').then((m) => m.reservaRoutes),
      },
      {
        path: 'habitacion',
        loadChildren: () => import('./habitacion/habitacion.routes').then((m) => m.habitacionRoutes),
      },
    ],
  },
];

export default adminRoutes;
