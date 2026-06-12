import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { getAllSeasonStatuses, getCurrentSeason } from '../utils/season.util';

@Injectable({ providedIn: 'root' })
export class SeasonService {
  private readonly destroyRef = inject(DestroyRef);

  /** Ticks once per second for live countdowns. */
  readonly now = signal(Date.now());

  readonly currentSeason = computed(() => getCurrentSeason(this.now()));
  readonly seasons = computed(() => getAllSeasonStatuses(this.now()));

  constructor() {
    const timer = setInterval(() => this.now.set(Date.now()), 1000);
    this.destroyRef.onDestroy(() => clearInterval(timer));
  }

  isActiveSeason(name: string): boolean {
    return name === this.currentSeason();
  }

  matchesCurrentSeason(seasonField: string | null | undefined): boolean {
    if (!seasonField?.trim()) {
      return false;
    }
    const current = this.currentSeason();
    return seasonField
      .split(/,\s*/)
      .some((part) => part.trim() === current);
  }
}
