import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationManagerComponent } from './components/reservation-manager/reservation-manager.component';

const routes: Routes = [
  {
    path: 'manage-reservations',
    component: ReservationManagerComponent
    // Aquí podríamos añadir el guard si lo tuviéramos: canActivate: [AdminRoleGuard]
  },
  // Podríamos añadir una ruta por defecto para /admin o redirigir
  {
    path: '',
    redirectTo: 'manage-reservations',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { } 