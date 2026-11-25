import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable({ providedIn: 'root' })
export class ApiService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  private get headers(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${this.auth.token}` });
  }

  // Watchlist
  getWatchlist(): Observable<any> {
    return this.http.get('/api/watchlist', { headers: this.headers });
  }
  addCoin(symbol: string, name: string, type = 'crypto'): Observable<any> {
    return this.http.post('/api/watchlist', { symbol, name, type }, { headers: this.headers });
  }
  deleteCoin(symbol: string): Observable<any> {
    return this.http.delete(`/api/watchlist/${symbol}`, { headers: this.headers });
  }

  // Alerts
  getAlerts(): Observable<any> {
    return this.http.get('/api/alerts', { headers: this.headers });
  }
  createAlert(symbol: string, target_price: number, direction: string): Observable<any> {
    return this.http.post('/api/alerts', { symbol, target_price, direction }, { headers: this.headers });
  }
  deleteAlert(id: number): Observable<any> {
    return this.http.delete(`/api/alerts/${id}`, { headers: this.headers });
  }
  resetAlert(id: number): Observable<any> {
    return this.http.patch(`/api/alerts/${id}/reset`, {}, { headers: this.headers });
  }

  // Prices
  getCurrentPrices(): Observable<any> {
    return this.http.get('/api/prices/current', { headers: this.headers });
  }
  getPriceHistory(symbol: string, days = 7): Observable<any> {
    return this.http.get(`/api/prices/history/${symbol}?days=${days}`, { headers: this.headers });
  }
  searchCoins(q: string): Observable<any> {
    return this.http.get(`/api/prices/search?q=${encodeURIComponent(q)}`, { headers: this.headers });
  }
  getDemoPrices(): Observable<any> {
    return this.http.get('/api/prices/demo', { headers: this.headers });
  }
}
