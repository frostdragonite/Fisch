import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { APP_VERSION } from '../../environments/version.generated';
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

  readonly fishIds = computed(() => {
    const catalog = this.fishCatalog();
    if (!catalog) {
      return new Set<string>();
    }
    return new Set(
      catalog.categories.flatMap((category) => category.fish.map((fish) => fish.id))
    );
  });

  readonly rodIds = computed(() => {
    const catalog = this.rodsCatalog();
    if (!catalog) {
      return new Set<string>();
    }
    return new Set(
      catalog.categories.flatMap((category) => category.rods.map((rod) => rod.id))
    );
  });

  async loadAll(): Promise<void> {
    if (this.rodsCatalog() && this.fishCatalog()) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    const cacheBust = `v=${encodeURIComponent(APP_VERSION)}`;

    try {
      const [rods, fish] = await Promise.all([
        firstValueFrom(
          this.http.get<RodsCatalog>(`assets/data/rods.json?${cacheBust}`)
        ),
        firstValueFrom(
          this.http.get<FishCatalog>(`assets/data/fish.json?${cacheBust}`)
        ),
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
