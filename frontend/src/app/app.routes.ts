import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'rods',
    loadComponent: () =>
      import('./pages/rods/rods.component').then((m) => m.RodsComponent),
  },
  {
    path: 'fish',
    loadComponent: () =>
      import('./pages/fish/fish.component').then((m) => m.FishComponent),
  },
  { path: '**', redirectTo: '' },
];
