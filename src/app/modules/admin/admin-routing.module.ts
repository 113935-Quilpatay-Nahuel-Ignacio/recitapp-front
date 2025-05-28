import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationManagerComponent } from './components/reservation-manager/reservation-manager.component';
import { EventSalesReportComponent } from './components/event-sales-report/event-sales-report.component';
import { TicketValidationComponent } from './components/ticket-validation/ticket-validation.component';
import { PromotionalTicketFormComponent } from './components/promotional-ticket-form/promotional-ticket-form.component';
import { UserManagementComponent } from './components/user-management/user-management.component';

const routes: Routes = [
  {
    path: 'users',
    component: UserManagementComponent
  },
  {
    path: 'manage-reservations',
    component: ReservationManagerComponent
    // Aquí podríamos añadir el guard si lo tuviéramos: canActivate: [AdminRoleGuard]
  },
  {
    path: 'event-sales-report',
    component: EventSalesReportComponent
  },
  {
    path: 'validate-ticket',
    component: TicketValidationComponent
  },
  {
    path: 'create-promotional-ticket',
    component: PromotionalTicketFormComponent
  },
  // Redirigir por defecto a gestión de usuarios
  {
    path: '',
    redirectTo: 'users',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { } 