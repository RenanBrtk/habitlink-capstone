import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'register', loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage) },
  {
    path: 'dashboard',
    loadComponent: () => import('./pages/dashboard/dashboard.page').then(m => m.DashboardPage),
    canActivate: [authGuard]
  },
  {
    path: 'habits',
    loadComponent: () => import('./pages/habits/habits.page').then(m => m.HabitsPage),
    canActivate: [authGuard]
  },
  {
    path: 'habits',
    loadComponent: () => import('./pages/habits/habits.page').then(m => m.HabitsPage)
  },
  {
    path: 'all-habits',
    loadComponent: () => import('./pages/all-habits/all-habits.page').then(m => m.AllHabitsPage),
    canActivate: [authGuard]
  },
  {
    path: 'all-habits',
    loadComponent: () => import('./pages/all-habits/all-habits.page').then(m => m.AllHabitsPage)
  },
  {
    path: 'create-habit',
    loadComponent: () => import('./pages/create-habit/create-habit.page').then(m => m.CreateHabitPage),
    canActivate: [authGuard]
  },
  {
    path: 'create-habit',
    loadComponent: () => import('./pages/create-habit/create-habit.page').then(m => m.CreateHabitPage)
  },
  {
    path: 'habit/:habit_id',
    loadComponent: () => import('./pages/habit-details/habit-details.page').then(m => m.HabitDetailsPage),
    canActivate: [authGuard]
  },
  {
    path: 'habit-details',
    loadComponent: () => import('./pages/habit-details/habit-details.page').then( m => m.HabitDetailsPage)
  },
  {
    path: 'journal',
    loadComponent: () => import('./pages/journal/journal.page').then(m => m.JournalPage),
    canActivate: [authGuard]
  },
  {
    path: 'journal/create',
    loadComponent: () => import('./pages/journal-entry/journal-entry.page').then(m => m.JournalEntryPage),
    canActivate: [authGuard]
  },
  {
    path: 'journal/edit/:entry_id',
    loadComponent: () => import('./pages/journal-entry/journal-entry.page').then(m => m.JournalEntryPage),
    canActivate: [authGuard]
  },
  {
    path: 'journal/:entry_id',
    loadComponent: () => import('./pages/journal-detail/journal-detail.page').then(m => m.JournalDetailPage),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/profile/profile.page').then(m => m.ProfilePage),
    canActivate: [authGuard]
  },
];
