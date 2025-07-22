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
import { ArtistReportsComponent } from './pages/artist-reports/artist-reports.component';
import { RoleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  {
    path: 'dashboard',
    component: AdminDashboardComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'users',
    component: UserManagementComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'genres',
    component: MusicGenreAdminComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'manage-reservations',
    component: ReservationManagerComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'event-sales-report',
    component: EventSalesReportComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'artist-reports',
    component: ArtistReportsComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'validate-ticket',
    component: TicketValidationComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN', 'VERIFICADOR_ENTRADAS'] }
  },
  {
    path: 'create-promotional-ticket',
    component: PromotionalTicketFormComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  {
    path: 'notification-test',
    component: NotificationTestComponent,
    canActivate: [RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  // Redirigir por defecto al dashboard para ADMIN, o a validate-ticket para VERIFICADOR_ENTRADAS
  {
    path: '',
    redirectTo: 'validate-ticket',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { } 