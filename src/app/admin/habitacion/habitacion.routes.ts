import { Routes } from '@angular/router';

import { ListHabitacionPageComponent } from './pages/list-habitacion/list-habitacion.component';
import { FormHabitacionPageComponent } from './pages/form-habitacion/form-habitacion.component';

export const habitacionRoutes: Routes = [
  {
    path: 'hotel/:hotelId',
    component: ListHabitacionPageComponent,
  },
  {
    path: 'crear/:hotelId',
    component: FormHabitacionPageComponent,
  },
  {
    path: 'editar/:id',
    component: FormHabitacionPageComponent,
  },
];

export default habitacionRoutes;
