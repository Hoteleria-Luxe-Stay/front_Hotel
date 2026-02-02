import { Routes } from '@angular/router';
import { ListDepartamentoComponent } from './pages/list-departamento/list-departamento.component';
import { CreateDepartamentoComponent } from './pages/create-departamento/create-departamento.component';
import { EditDepartamentoComponent } from './pages/edit-departamento/edit-departamento.component';

export const departamentoRoutes: Routes = [
  {
    path: 'list',
    component: ListDepartamentoComponent,
  },
  {
    path: 'crear',
    component: CreateDepartamentoComponent,
  },
  {
    path: 'editar/:id',
    component: EditDepartamentoComponent,
  },
];

export default departamentoRoutes;
