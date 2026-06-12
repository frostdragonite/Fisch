import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProgressState } from '../models/catalog.models';
import { ProgressIdService } from './progress-id.service';

interface ProgressResponse {
  id: string;
  rods: Record<string, boolean>;
  fish: Record<string, boolean>;
}

@Injectable({ providedIn: 'root' })
export class ProgressService {
  private readonly http = inject(HttpClient);
  private readonly progressIdService = inject(ProgressIdService);

  readonly rods = signal<Record<string, boolean>>({});
  readonly fish = signal<Record<string, boolean>>({});
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  private saveTimer: ReturnType<typeof setTimeout> | null = null;

  private loadVersion = 0;

  async load(progressId: string): Promise<void> {
    const version = ++this.loadVersion;
    this.loading.set(true);
    this.error.set(null);

    try {
      const data = await firstValueFrom(
        this.http.get<ProgressResponse>(
          `${environment.apiUrl}/api/progress/${progressId}`
        )
      );
      if (version !== this.loadVersion) {
        return;
      }
      this.rods.set(data.rods ?? {});
      this.fish.set(data.fish ?? {});
    } catch {
      if (version !== this.loadVersion) {
        return;
      }
      this.rods.set({});
      this.fish.set({});
      this.error.set('โหลด progress ไม่สำเร็จ — ใช้งาน offline ชั่วคราว');
    } finally {
      if (version === this.loadVersion) {
        this.loading.set(false);
      }
    }
  }

  toggleRod(id: string, checked: boolean): void {
    this.rods.update((current) => {
      const next = { ...current };
      if (checked) {
        next[id] = true;
      } else {
        delete next[id];
      }
      return next;
    });
    this.scheduleSave();
  }

  toggleFish(id: string, checked: boolean): void {
    this.fish.update((current) => {
      const next = { ...current };
      if (checked) {
        next[id] = true;
      } else {
        delete next[id];
      }
      return next;
    });
    this.scheduleSave();
  }

  checkRods(ids: string[]): void {
    if (!ids.length) {
      return;
    }
    this.rods.update((current) => {
      const next = { ...current };
      for (const id of ids) {
        next[id] = true;
      }
      return next;
    });
    this.scheduleSave();
  }

  checkFish(ids: string[]): void {
    if (!ids.length) {
      return;
    }
    this.fish.update((current) => {
      const next = { ...current };
      for (const id of ids) {
        next[id] = true;
      }
      return next;
    });
    this.scheduleSave();
  }

  private scheduleSave(): void {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
    }
    this.saveTimer = setTimeout(() => this.flushSave(), 500);
  }

  async flushSave(progressId?: string): Promise<void> {
    const id = progressId ?? this.progressIdService.progressId();
    if (!id) {
      return;
    }

    const payload: ProgressState = {
      rods: this.rods(),
      fish: this.fish(),
    };

    this.saving.set(true);
    try {
      await firstValueFrom(
        this.http.put<ProgressResponse>(
          `${environment.apiUrl}/api/progress/${id}`,
          payload
        )
      );
      this.error.set(null);
    } catch {
      this.error.set('บันทึก progress ไม่สำเร็จ');
    } finally {
      this.saving.set(false);
    }
  }

  countChecked(map: Record<string, boolean>): number {
    return Object.keys(map).length;
  }
}
