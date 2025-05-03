import { Routes } from '@angular/router';
import { UserRegisterComponent } from './modules/user/pages/user-register/user-register.component';
import { UserProfileComponent } from './modules/user/pages/user-profile/user-profile.component';
import { PurchaseHistoryComponent } from './modules/user/pages/purchase-history/purchase-history.component';
import { UserFollowingComponent } from './modules/user/pages/user-following/user-following.component';
import { NotificationPreferencesComponent } from './modules/user/pages/notification-preferences/notification-preferences.component';

export const routes: Routes = [
  { path: '', redirectTo: '/user/register', pathMatch: 'full' },
  { path: 'user/register', component: UserRegisterComponent },
  { path: 'user/profile', component: UserProfileComponent },
  { path: 'user/purchases', component: PurchaseHistoryComponent },
  { path: 'user/following', component: UserFollowingComponent },
  { path: 'user/notifications', component: NotificationPreferencesComponent },
];
