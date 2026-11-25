import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { WatchlistComponent } from './components/watchlist/watchlist.component';
import { AlertsComponent } from './components/alerts/alerts.component';
import { PricesComponent } from './components/prices/prices.component';
import { ContactComponent } from './components/contact/contact.component';
import { BarrierefreiheitComponent } from './components/barrierefreiheit/barrierefreiheit.component';
import { authGuard } from './services/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'watchlist', component: WatchlistComponent, canActivate: [authGuard] },
  { path: 'alerts', component: AlertsComponent, canActivate: [authGuard] },
  { path: 'prices', component: PricesComponent, canActivate: [authGuard] },
  // Kontakt ohne Anmeldung erreichbar, damit Barrieren auch ohne Konto gemeldet werden können
  { path: 'contact', component: ContactComponent },
  // Erklärung zur Barrierefreiheit: öffentlich, ohne Anmeldung
  { path: 'barrierefreiheit', component: BarrierefreiheitComponent, title: 'Erklärung zur Barrierefreiheit – CoinFinder' },
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '/dashboard' },
];
