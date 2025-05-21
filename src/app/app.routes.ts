import { Routes } from '@angular/router';
// import { AuthGuard } from './guards/auth.guard';

// User module
import { UserRegisterComponent } from './modules/user/pages/user-register/user-register.component';
import { UserProfileComponent } from './modules/user/pages/user-profile/user-profile.component';
import { PurchaseHistoryComponent } from './modules/user/pages/purchase-history/purchase-history.component';
import { UserFollowingComponent } from './modules/user/pages/user-following/user-following.component';
import { UserLoginComponent } from './modules/user/pages/user-login/user-login.component';
import { NotificationPreferencesComponent } from './modules/user/pages/notification-preferences/notification-preferences.component';

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

export const routes: Routes = [
  // Default route
  { path: '', redirectTo: '/events', pathMatch: 'full' },

  // User routes
  { path: 'register', component: UserRegisterComponent },
  { path: 'login', component: UserLoginComponent },
  { path: 'user/profile', component: UserProfileComponent },
  { path: 'user/purchases', component: PurchaseHistoryComponent },
  { path: 'user/following', component: UserFollowingComponent },
  { path: 'user/notifications', component: NotificationPreferencesComponent },

  // Artist routes
  { path: 'artists', component: ArtistListComponent },
  { path: 'artists/new', component: ArtistEditComponent },
  { path: 'artists/management', component: ArtistManagementComponent },
  { path: 'artists/:id', component: ArtistDetailComponent },
  { path: 'artists/:id/edit', component: ArtistEditComponent },
  { path: 'artists/:id/events', component: ArtistEventsComponent },
  { path: 'artists/:id/statistics', component: ArtistStatisticsComponent },
  { path: 'artists/:id/platforms', component: ArtistPlatformsComponent },

  // Event routes
  { path: 'events', component: EventListComponent },
  { path: 'events/new', component: EventFormComponent },
  { path: 'events/:id', component: EventDetailComponent },
  { path: 'events/:id/edit', component: EventFormComponent },
  { path: 'events/:id/tickets', component: TicketPurchaseComponent },

  // Venue routes (Reorganizadas y consolidadas)
  { path: 'venues', component: VenueListComponent }, // Lista general de recintos
  { path: 'venues/new', component: VenueFormComponent }, // Crear nuevo recinto (antes de :id)
  { path: 'venues/search-availability', component: VenueAvailabilitySearchComponent }, // Búsqueda de disponibilidad
  { path: 'venues/:id', component: VenueDetailComponent }, // Detalle de recinto (después de /new y /search-availability)
  { path: 'venues/:id/edit', component: VenueFormComponent }, // Editar recinto

  // Ticket routes
  { path: 'tickets', component: TicketListComponent }, // Route to list/manage tickets (if any)
  { path: 'ticket/:id', component: TicketDetailComponent }, // View details of a specific ticket
  // The route for purchasing tickets for an event is events/:id/tickets

  // Transaction routes are now lazy-loaded
  {
    path: 'transactions',
    loadChildren: () => import('./modules/transaction/transaction.routes').then(m => m.TRANSACTION_ROUTES),
    // title: 'Transactions' // Optional: set a general title for the module section
  },

  // Notification routes
  { path: 'notifications', component: NotificationCenterComponent },

  // Admin routes
  { path: 'admin/genres', component: MusicGenreAdminComponent },

  // Lazy-loaded routes
  // {
  //   path: 'profile',
  //   loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule),
  //   canActivate: [AuthGuard]
  // },
  {
    path: 'admin',
    loadChildren: () => import('./modules/admin/admin.module').then(m => m.AdminModule)
    // Aquí podríamos añadir un canMatch o canActivate general para /admin si fuera necesario más adelante
  },
  // {
  //   path: 'terminos-y-condiciones',
  //   // ... existing code ... // This route is invalid as is
  // },

  // Wildcard route for 404
  { path: '**', redirectTo: '/events' },
];
