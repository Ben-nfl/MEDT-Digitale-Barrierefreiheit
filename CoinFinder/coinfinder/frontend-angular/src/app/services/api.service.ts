// hier stehen die normalen anfragen ans backend gesammelt, damit die seiten sie nicht selbst zusammensetzen müssen.
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  // angular gibt uns den anfragedienst und die gespeicherte anmeldung für diese aufrufe.
  constructor(private http: HttpClient, private auth: AuthService) {}

  // hängt den gespeicherten token an die anfrage an. ob eine route ihn prüft, entscheidet das backend.
  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
  }

  // diese anfragen laden und verändern die watchlist auf dem server.
  // holt alle gespeicherten coins. die anfrage wird beim abonnieren gestartet.
  getWatchlist(): Observable<any> {
    return this.http.get('/api/watchlist', { headers: this.headers });
  }
  // schickt symbol, name und typ, damit der server einen coin speichern kann.
  addCoin(symbol: string, name: string, type = 'crypto'): Observable<any> {
    return this.http.post('/api/watchlist', { symbol, name, type }, { headers: this.headers });
  }
  // das symbol in der adresse sagt dem server, welchen coin er entfernen soll.
  deleteCoin(symbol: string): Observable<any> {
    return this.http.delete(`/api/watchlist/${symbol}`, { headers: this.headers });
  }

  // hier werden preisalarme geladen, erstellt, gelöscht oder wieder aktiviert.
  // holt die ganze alarm-liste für die übersicht.
  getAlerts(): Observable<any> {
    return this.http.get('/api/alerts', { headers: this.headers });
  }
  // schickt den gewünschten coin samt preisgrenze und richtung an den server.
  createAlert(symbol: string, target_price: number, direction: string): Observable<any> {
    return this.http.post('/api/alerts', { symbol, target_price, direction }, { headers: this.headers });
  }
  // löscht einen bestimmten alarm über seine nummer.
  deleteAlert(id: number): Observable<any> {
    return this.http.delete(`/api/alerts/${id}`, { headers: this.headers });
  }
  // ändert den zustand eines alarms wieder auf aktiv. weitere eingabedaten sind dafür nicht nötig.
  resetAlert(id: number): Observable<any> {
    return this.http.patch(`/api/alerts/${id}/reset`, {}, { headers: this.headers });
  }

  // die eigentlichen kursdaten holt das backend von coingecko.
  // holt die aktuellen preise zu den coins aus der watchlist.
  getCurrentPrices(): Observable<any> {
    return this.http.get('/api/prices/current', { headers: this.headers });
  }
  // holt den preisverlauf für einen coin und den gewählten zeitraum, standardmäßig sieben tage.
  getPriceHistory(symbol: string, days = 7): Observable<any> {
    return this.http.get(`/api/prices/history/${symbol}?days=${days}`, { headers: this.headers });
  }
  // verpackt den suchtext für die adresse, damit auch leerzeichen oder sonderzeichen richtig ankommen.
  searchCoins(q: string): Observable<any> {
    return this.http.get(`/api/prices/search?q=${encodeURIComponent(q)}`, { headers: this.headers });
  }
  // kann feste beispielpreise laden. dieser aufruf wird hier nur angeboten, nicht automatisch ausgeführt.
  getDemoPrices(): Observable<any> {
    return this.http.get('/api/prices/demo', { headers: this.headers });
  }
}
