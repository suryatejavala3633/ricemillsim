import { productionService } from './ProductionService';
import { wagesService } from './WagesService';
import { hamaliService } from './HamaliService';
import { fciService } from './FCIService';
import { gunnyService } from './GunnyService';
import { frkService } from './FRKService';

export interface SyncEvent {
  type: 'production' | 'wages' | 'hamali' | 'fci' | 'gunny' | 'frk';
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  data: any;
  timestamp: number;
}

type SyncCallback = (event: SyncEvent) => void;

export class SyncEngine {
  private callbacks: Map<string, SyncCallback[]> = new Map();
  private unsubscribers: (() => void)[] = [];

  start() {
    const unsubProduction = productionService.subscribe((payload) => {
      this.emit({
        type: 'production',
        action: payload.eventType,
        data: payload.new || payload.old,
        timestamp: Date.now(),
      });
    });

    const unsubWages = wagesService.subscribe((payload) => {
      this.emit({
        type: 'wages',
        action: payload.eventType,
        data: payload.new || payload.old,
        timestamp: Date.now(),
      });
    });

    const unsubHamali = hamaliService.subscribe((payload) => {
      this.emit({
        type: 'hamali',
        action: payload.eventType,
        data: payload.new || payload.old,
        timestamp: Date.now(),
      });
    });

    const unsubFci = fciService.subscribe((payload) => {
      this.emit({
        type: 'fci',
        action: payload.eventType,
        data: payload.new || payload.old,
        timestamp: Date.now(),
      });
    });

    const unsubGunny = gunnyService.subscribe((payload) => {
      this.emit({
        type: 'gunny',
        action: payload.eventType,
        data: payload.new || payload.old,
        timestamp: Date.now(),
      });
    });

    const unsubFrk = frkService.subscribe((payload) => {
      this.emit({
        type: 'frk',
        action: payload.eventType,
        data: payload.new || payload.old,
        timestamp: Date.now(),
      });
    });

    this.unsubscribers = [
      unsubProduction,
      unsubWages,
      unsubHamali,
      unsubFci,
      unsubGunny,
      unsubFrk,
    ];
  }

  stop() {
    this.unsubscribers.forEach((unsub) => unsub());
    this.unsubscribers = [];
    this.callbacks.clear();
  }

  subscribe(eventType: SyncEvent['type'] | 'all', callback: SyncCallback): () => void {
    const key = eventType;
    const callbacks = this.callbacks.get(key) || [];
    callbacks.push(callback);
    this.callbacks.set(key, callbacks);

    return () => {
      const callbacks = this.callbacks.get(key);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }

  private emit(event: SyncEvent) {
    const specificCallbacks = this.callbacks.get(event.type) || [];
    const allCallbacks = this.callbacks.get('all') || [];

    [...specificCallbacks, ...allCallbacks].forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error('Error in sync callback:', error);
      }
    });
  }
}

export const syncEngine = new SyncEngine();
