import { Routes } from '@angular/router';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AuthenticatedLayoutComponent } from './layouts/authenticated-layout/authenticated-layout.component';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { publicGuard } from './core/guards/public.guard';
import { AdminShellComponent } from './features/administration/admin-shell.component';
import { GroupPickerComponent } from './features/group-picker/group-picker.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    canActivate: [publicGuard],
    loadComponent: () =>
      import('./features/home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: '',
    component: PublicLayoutComponent,
    canActivate: [publicGuard],
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'register',
        loadComponent: () =>
          import('./features/auth/register.component').then((m) => m.RegisterComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('./features/auth/forgot-password.component').then((m) => m.ForgotPasswordComponent),
      },
    ],
  },
  {
    path: '',
    component: AuthenticatedLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then((m) => m.DashboardComponent),
      },
      {
        path: 'predictions',
        children: [
          { path: '', component: GroupPickerComponent, data: { target: 'predictions' } },
          {
            path: 'group/:groupId',
            loadComponent: () =>
              import('./features/predictions/matchday-list.component').then(
                (m) => m.MatchdayListComponent,
              ),
          },
          {
            path: 'group/:groupId/matchday/:matchdayId',
            loadComponent: () =>
              import('./features/predictions/matchday-prediction.component').then(
                (m) => m.MatchdayPredictionComponent,
              ),
          },
        ],
      },
      {
        path: 'rankings',
        children: [
          { path: '', component: GroupPickerComponent, data: { target: 'rankings' } },
          {
            path: ':groupId/member/:userId',
            loadComponent: () =>
              import('./features/rankings/member-predictions.component').then(
                (m) => m.MemberPredictionsComponent,
              ),
          },
          {
            path: ':groupId',
            loadComponent: () =>
              import('./features/rankings/ranking.component').then((m) => m.RankingComponent),
          },
        ],
      },
      {
        path: 'preferences',
        loadComponent: () =>
          import('./features/preferences/preferences.component').then(
            (m) => m.PreferencesComponent,
          ),
      },
    ],
  },
  {
    path: 'admin',
    component: AuthenticatedLayoutComponent,
    canActivate: [authGuard, adminGuard],
    children: [
      {
        path: '',
        component: AdminShellComponent,
        children: [
          { path: '', redirectTo: 'competitions', pathMatch: 'full' },
          {
            path: 'competitions',
            loadComponent: () =>
              import('./features/administration/competitions/competition-admin.component').then(
                (m) => m.CompetitionAdminComponent,
              ),
          },
          {
            path: 'groups',
            loadComponent: () =>
              import('./features/administration/groups/group-admin.component').then(
                (m) => m.GroupAdminComponent,
              ),
          },
          {
            path: 'matches',
            loadComponent: () =>
              import('./features/administration/matches/match-admin.component').then(
                (m) => m.MatchAdminComponent,
              ),
          },
          {
            path: 'users',
            loadComponent: () =>
              import('./features/administration/users/user-admin.component').then(
                (m) => m.UserAdminComponent,
              ),
          },
        ],
      },
    ],
  },
  { path: '**', redirectTo: 'login' },
];
