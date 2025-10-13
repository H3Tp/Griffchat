import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private prefix = 'gc:';
  get<T>(key: string, fallback: T): T {
    const raw = localStorage.getItem(this.prefix + key);
    return raw ? JSON.parse(raw) as T : fallback;
  }
  set<T>(key: string, value: T) {
    localStorage.setItem(this.prefix + key, JSON.stringify(value));
  }
}
