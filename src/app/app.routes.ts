import { Routes } from '@angular/router';
import { UserRegisterComponent } from './modules/user/pages/user-register/user-register.component';
import { UserProfileComponent } from './modules/user/pages/user-profile/user-profile.component';
import { PurchaseHistoryComponent } from './modules/user/pages/purchase-history/purchase-history.component';
import { UserFollowingComponent } from './modules/user/pages/user-following/user-following.component';
import { NotificationPreferencesComponent } from './modules/user/pages/notification-preferences/notification-preferences.component';

import { ArtistListComponent } from './modules/artist/pages/artist-list/artist-list.component';
import { ArtistDetailComponent } from './modules/artist/pages/artist-detail/artist-detail.component';
import { ArtistFormComponent } from './modules/artist/pages/artist-form/artist-form.component';
import { MusicGenreAdminComponent } from './modules/artist/pages/music-genre-admin/music-genre-admin.component';

export const routes: Routes = [
  { path: '', redirectTo: '/user/register', pathMatch: 'full' },
  
  { path: 'user/register', component: UserRegisterComponent },
  { path: 'user/profile', component: UserProfileComponent },
  { path: 'user/purchases', component: PurchaseHistoryComponent },
  { path: 'user/following', component: UserFollowingComponent },
  { path: 'user/notifications', component: NotificationPreferencesComponent },
  
  { path: 'artists', component: ArtistListComponent },
  { path: 'artists/new', component: ArtistFormComponent },
  { path: 'artists/:id', component: ArtistDetailComponent },
  { path: 'artists/:id/edit', component: ArtistFormComponent },
  
  { path: 'admin/genres', component: MusicGenreAdminComponent },
  
  { path: '**', redirectTo: '/artists' }
];