import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

// User module
import { UserRegisterComponent } from './modules/user/pages/user-register/user-register.component';
import { UserProfileComponent } from './modules/user/pages/user-profile/user-profile.component';
import { PurchaseHistoryComponent } from './modules/user/pages/purchase-history/purchase-history.component';
import { UserFollowingComponent } from './modules/user/pages/user-following/user-following.component';
import { UserLoginComponent } from './modules/user/pages/user-login/user-login.component';
// import { NotificationPreferencesComponent } from './modules/user/pages/notification-preferences/notification-preferences.component'; // Old import

// Artist module
import { ArtistDetailComponent } from './modules/artist/pages/artist-detail/artist-detail.component';
import { ArtistListComponent } from './modules/artist/pages/artist-list/artist-list.component';
import { ArtistEditComponent } from './modules/artist/pages/artist-edit/artist-edit.component';
import { ArtistEventsComponent } from './modules/artist/pages/artist-events/artist-events.component';
import { ArtistStatisticsComponent } from './modules/artist/pages/artist-statistics/artist-statistics.component';
import { ArtistPlatformsComponent } from './modules/artist/pages/artist-platforms/artist-platforms.component';
import { ArtistManagementComponent } from './modules/artist/pages/artist-management/artist-management.component';
import { MusicGenreAdminComponent } from './modules/artist/pages/music-genre-admin/music-genre-admin.component';

// Event module
import { EventListComponent } from './modules/event/pages/event-list/event-list.component';
import { EventDetailComponent } from './modules/event/pages/event-detail/event-detail.component';
import { EventFormComponent } from './modules/event/pages/event-form/event-form.component';

// Venue module
import { VenueListComponent } from './modules/venue/pages/venue-list/venue-list.component';
import { VenueDetailComponent } from './modules/venue/pages/venue-detail/venue-detail.component';
import { VenueFormComponent } from './modules/venue/pages/venue-form/venue-form.component';
import { VenueAvailabilitySearchComponent } from './modules/venue/pages/venue-availability-search/venue-availability-search.component';

// Ticket module
import { TicketPurchaseComponent } from './modules/ticket/pages/ticket-purchase/ticket-purchase.component';
import { TicketListComponent } from './modules/ticket/pages/ticket-list/ticket-list.component';
import { TicketDetailComponent } from './modules/ticket/pages/ticket-detail/ticket-detail.component';

// Transaction module imports removed as it will be lazy loaded
// import { TransactionHistoryComponent } from './modules/transaction/pages/transaction-history/transaction-history.component';
// import { PaymentFormComponent } from './modules/transaction/pages/payment-form/payment-form.component';

// Notification module
import { NotificationCenterComponent } from './modules/notification/pages/notification-center/notification-center.component';
import { NotificationPreferencesComponent } from './modules/notification/pages/notification-preferences/notification-preferences.component'; // New import

export const routes: Routes = [
  // Default route
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  // Auth routes (lazy loaded)
  {
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth.module').then(m => m.AuthModule)
  },

  // Dashboard (protected) - TODO: Crear módulo dashboard
  // {
  //   path: 'dashboard',
  //   canActivate: [AuthGuard],
  //   loadChildren: () => import('./modules/dashboard/dashboard.module').then(m => m.DashboardModule)
  // },

  // User routes (legacy - mantener por compatibilidad)
  { path: 'register', redirectTo: '/auth/register' },
  { path: 'login', redirectTo: '/auth/login' },
  
  // Protected user routes
  { 
    path: 'user/profile', 
    component: UserProfileComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'user/purchases', 
    component: PurchaseHistoryComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'user/following', 
    component: UserFollowingComponent,
    canActivate: [AuthGuard]
  },

  // Artist routes
  { path: 'artists', component: ArtistListComponent },
  { 
    path: 'artists/new', 
    component: ArtistEditComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'REGISTRADOR_EVENTO'] }
  },
  { 
    path: 'artists/management', 
    component: ArtistManagementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'REGISTRADOR_EVENTO'] }
  },
  { path: 'artists/:id', component: ArtistDetailComponent },
  { 
    path: 'artists/:id/edit', 
    component: ArtistEditComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'REGISTRADOR_EVENTO'] }
  },
  { path: 'artists/:id/events', component: ArtistEventsComponent },
  { 
    path: 'artists/:id/statistics', 
    component: ArtistStatisticsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'REGISTRADOR_EVENTO'] }
  },
  { 
    path: 'artists/:id/platforms', 
    component: ArtistPlatformsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'REGISTRADOR_EVENTO'] }
  },

  // Event routes
  { path: 'events', component: EventListComponent },
  { 
    path: 'events/new', 
    component: EventFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'REGISTRADOR_EVENTO'] }
  },
  { path: 'events/:id', component: EventDetailComponent },
  { 
    path: 'events/:id/edit', 
    component: EventFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN', 'REGISTRADOR_EVENTO'] }
  },
  { 
    path: 'events/:id/tickets', 
    component: TicketPurchaseComponent,
    canActivate: [AuthGuard]
  },

  // Venue routes
  { path: 'venues', component: VenueListComponent },
  { 
    path: 'venues/new', 
    component: VenueFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },
  { path: 'venues/search-availability', component: VenueAvailabilitySearchComponent },
  { path: 'venues/:id', component: VenueDetailComponent },
  { 
    path: 'venues/:id/edit', 
    component: VenueFormComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },

  // Ticket routes
  { 
    path: 'tickets', 
    component: TicketListComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'ticket/:id', 
    component: TicketDetailComponent,
    canActivate: [AuthGuard]
  },

  // Transaction routes (lazy loaded and protected)
  {
    path: 'transactions',
    loadChildren: () => import('./modules/transaction/transaction.routes').then(m => m.TRANSACTION_ROUTES),
    canActivate: [AuthGuard]
  },

  // Notification routes (protected)
  { 
    path: 'notifications', 
    component: NotificationCenterComponent,
    canActivate: [AuthGuard]
  },
  { 
    path: 'user/preferences', 
    component: NotificationPreferencesComponent,
    canActivate: [AuthGuard]
  },

  // Admin routes (protected)
  { 
    path: 'admin/genres', 
    component: MusicGenreAdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },

  // Admin module (lazy loaded and protected)
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['ADMIN'] }
  },

  // Unauthorized page - TODO: Crear componente unauthorized
  // {
  //   path: 'unauthorized',
  //   loadComponent: () => import('./shared/components/unauthorized/unauthorized.component').then(c => c.UnauthorizedComponent)
  // },

  // Wildcard route for 404
  { path: '**', redirectTo: '/auth/login' },
];
