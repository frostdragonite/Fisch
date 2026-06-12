import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { FishCatalog, RodsCatalog } from '../models/catalog.models';
import { LocaleService } from './locale.service';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private readonly http = inject(HttpClient);
  private readonly locale = inject(LocaleService);

  readonly rodsCatalog = signal<RodsCatalog | null>(null);
  readonly fishCatalog = signal<FishCatalog | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  async loadAll(): Promise<void> {
    if (this.rodsCatalog() && this.fishCatalog()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const [rods, fish] = await Promise.all([
        firstValueFrom(this.http.get<RodsCatalog>('assets/data/rods.json')),
        firstValueFrom(this.http.get<FishCatalog>('assets/data/fish.json')),
      ]);
      this.rodsCatalog.set(rods);
      this.fishCatalog.set(fish);
    } catch {
      this.error.set(this.locale.t('error.catalogLoad'));
    } finally {
      this.loading.set(false);
    }
  }
}
