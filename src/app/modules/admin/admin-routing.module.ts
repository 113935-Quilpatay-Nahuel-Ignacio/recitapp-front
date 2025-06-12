import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReservationManagerComponent } from './components/reservation-manager/reservation-manager.component';
import { EventSalesReportComponent } from './components/event-sales-report/event-sales-report.component';
import { TicketValidationComponent } from './components/ticket-validation/ticket-validation.component';
import { PromotionalTicketFormComponent } from './components/promotional-ticket-form/promotional-ticket-form.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { MusicGenreAdminComponent } from '../artist/pages/music-genre-admin/music-genre-admin.component';
import { NotificationTestComponent } from './pages/notification-test/notification-test.component';
import { AdminDashboardComponent } from './pages/admin-dashboard/admin-dashboard.component';

const routes: Routes = [
  {
    path: 'dashboard',
    component: AdminDashboardComponent
  },
  {
    path: 'users',
    component: UserManagementComponent
  },
  {
    path: 'genres',
    component: MusicGenreAdminComponent
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
  {
    path: 'notification-test',
    component: NotificationTestComponent
  },
  // Redirigir por defecto al dashboard
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { } 