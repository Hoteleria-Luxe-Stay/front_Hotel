import { EditReservaComponent } from './pages/edit-reserva/edit-reserva.component';
import { ListReservaComponent } from './pages/list-reserva/list-reserva.component';
import { Routes } from '@angular/router';

export const reservaRoutes: Routes = [
  {
    path: 'list',
    component: ListReservaComponent,
  },
  {
    path: 'editar/:id',
    component: EditReservaComponent,
  },
];

export default reservaRoutes;
