import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from './auth.service';

export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WsMessage {
  type: string;
  payload: any;
}

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;

  status$ = new BehaviorSubject<WsStatus>('disconnected');
  messages$ = new Subject<WsMessage>();

  constructor(private auth: AuthService) {}

  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const token = this.auth.token;
    if (!token) return;

    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const url   = `${proto}://${location.host}?token=${token}`;

    this.status$.next('connecting');
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.status$.next('connected');
      console.log('[WS] Verbunden');
      // Heartbeat: alle 25s einen Ping schicken
      this.startHeartbeat();
    };

    this.ws.onmessage = (event) => {
      try {
        const msg: WsMessage = JSON.parse(event.data);
        this.messages$.next(msg);
      } catch (e) {
        console.warn('[WS] Ungültige Nachricht:', event.data);
      }
    };

    this.ws.onclose = () => {
      this.status$.next('disconnected');
      this.stopHeartbeat();
      // Nach 5 Sekunden automatisch neu verbinden
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = () => {
      this.status$.next('error');
    };
  }

  disconnect(): void {
    clearTimeout(this.reconnectTimer);
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
    this.status$.next('disconnected');
  }

  send(msg: WsMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private heartbeatInterval: any;

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping', payload: {} });
    }, 25000);
  }

  private stopHeartbeat(): void {
    clearInterval(this.heartbeatInterval);
  }

  ngOnDestroy(): void {
    this.disconnect();
  }
}
