import { Routes } from '@angular/router';

import { SelectDepartamentoHotelComponent } from './pages/select-departamento/select-departamento.component';
import { ListHotelPageComponent } from './pages/list-hotel/list-hotel.component';
import { CreateHotelPageComponent } from './pages/create-hotel/create-hotel.component';
import { UpdateHotelFormComponent } from './pages/update-page/update-page.component';

export const hotelAdminRoutes: Routes = [
  {
    path: 'list',
    component: SelectDepartamentoHotelComponent,
  },
  {
    path: 'departamento/:departamentoId',
    component: ListHotelPageComponent,
  },
  {
    path: 'crear',
    component: CreateHotelPageComponent,
  },
  {
    path: 'editar/:id',
    component: UpdateHotelFormComponent,
  },
];

export default hotelAdminRoutes;
