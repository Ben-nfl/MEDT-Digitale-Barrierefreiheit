// hier steht, welcher baustein bei welcher adresse angezeigt wird.
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
  // diese vier bereiche prüfen vor dem öffnen über die zugangskontrolle, ob ein token vorhanden ist.
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'watchlist', component: WatchlistComponent, canActivate: [authGuard] },
  { path: 'alerts', component: AlertsComponent, canActivate: [authGuard] },
  { path: 'prices', component: PricesComponent, canActivate: [authGuard] },
  // kontakt ist auch ohne konto erreichbar. so kommt man zumindest zum formular, wenn die anmeldung nicht klappt.
  { path: 'contact', component: ContactComponent },
  // auch die erklärung ist öffentlich. für sie wird zusätzlich ein eigener seitentitel gesetzt.
  { path: 'barrierefreiheit', component: BarrierefreiheitComponent, title: 'Erklärung zur Barrierefreiheit – CoinFinder' },
  // eine leere adresse führt zum dashboard. full verhindert, dass auch andere adressen hier passen.
  { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
  // unbekannte adressen landen ebenfalls beim dashboard und damit gegebenenfalls bei der anmeldung.
  { path: '**', redirectTo: '/dashboard' },
];
