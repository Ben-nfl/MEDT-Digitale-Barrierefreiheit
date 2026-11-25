// über diese verbindung kommen neue preise und alarme an, ohne dass die seite ständig selbst nachfragen muss.
import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { AuthService } from './auth.service';

// diese vier wörter beschreiben, ob die verbindung gerade startet, offen, getrennt oder fehlerhaft ist.
export type WsStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

// jede nachricht hat einen typ zum zuordnen und dazu die eigentlichen daten.
export interface WsMessage {
  type: string;
  payload: any;
}

@Injectable({ providedIn: 'root' })
export class WebsocketService implements OnDestroy {
  // merkt sich die verbindung und einen eventuell geplanten neuen verbindungsversuch.
  private ws: WebSocket | null = null;
  private reconnectTimer: any = null;

  // der status liefert auch neuen abonnenten sofort den aktuellen stand.
  // der nachrichtenkanal liefert dagegen nur nachrichten, die ab dem abonnieren eintreffen.
  status$ = new BehaviorSubject<WsStatus>('disconnected');
  messages$ = new Subject<WsMessage>();

  constructor(private auth: AuthService) {}

  // verbindet nur, wenn noch keine offene verbindung da ist und ein token vorhanden ist.
  connect(): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;

    const token = this.auth.token;
    if (!token) return;

    // bei einer verschlüsselten webseite nehmen wir auch eine verschlüsselte live-verbindung.
    // host übernimmt adresse und port der geöffneten seite, der token wird in der adresse mitgeschickt.
    const proto = location.protocol === 'https:' ? 'wss' : 'ws';
    const url   = `${proto}://${location.host}?token=${token}`;

    this.status$.next('connecting');
    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.status$.next('connected');
      console.log('[WS] Verbunden');
      // ab jetzt fragen wir alle 25 sekunden mit einer textnachricht nach, ob der server noch antwortet.
      this.startHeartbeat();
    };

    // liest eingehenden text als datenobjekt und verteilt ihn an alle interessierten seiten.
    // unlesbare nachrichten werden nur in der konsole gemeldet, damit der rest weiterläuft.
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
      // nach einer trennung wird in fünf sekunden ein neuer verbindungsversuch geplant.
      this.reconnectTimer = setTimeout(() => this.connect(), 5000);
    };

    this.ws.onerror = () => {
      this.status$.next('error');
    };
  }

  // löscht den bisherigen verbindungstimer und die regelmäßigen nachfragen und schließt die verbindung.
  // das schließereignis kann wieder einen versuch planen; ohne gespeicherten token verbindet dieser aber nicht.
  disconnect(): void {
    clearTimeout(this.reconnectTimer);
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
    this.status$.next('disconnected');
  }

  // verschickt nur bei offener verbindung. das objekt wird dafür in text umgewandelt.
  send(msg: WsMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(msg));
    }
  }

  private heartbeatInterval: any;

  // das ist unsere eigene ping-nachricht als json, kein websocket-steuersignal.
  // der server antwortet darauf mit pong. diese antwort wird wie die anderen nachrichten weitergegeben.
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      this.send({ type: 'ping', payload: {} });
    }, 25000);
  }

  // beendet die regelmäßigen nachfragen, wenn die verbindung weg ist.
  private stopHeartbeat(): void {
    clearInterval(this.heartbeatInterval);
  }

  // wenn angular diesen dienst abbaut, wird auch die verbindung geschlossen.
  ngOnDestroy(): void {
    this.disconnect();
  }
}
