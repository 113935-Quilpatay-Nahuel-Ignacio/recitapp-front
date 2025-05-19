import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationManagerComponent } from './components/reservation-manager/reservation-manager.component';
import { EventSalesReportComponent } from './components/event-sales-report/event-sales-report.component';
import { TicketValidationComponent } from './components/ticket-validation/ticket-validation.component';
import { PromotionalTicketFormComponent } from './components/promotional-ticket-form/promotional-ticket-form.component';

const routes: Routes = [
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