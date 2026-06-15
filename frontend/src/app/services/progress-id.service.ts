import { Injectable, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

const STORAGE_KEY = 'fisch-masterline-progress-id';

@Injectable({ providedIn: 'root' })
export class ProgressIdService {
  private readonly router = inject(Router);
  readonly progressId = signal<string | null>(null);

  initFromRoute(route: ActivatedRoute): void {
    route.queryParamMap.subscribe((params) => {
      const urlId = params.get('p') ?? this.readIdFromUrl();

      if (urlId) {
        this.applyProgressId(urlId);
        return;
      }

      const stored = localStorage.getItem(STORAGE_KEY);
      const id = stored ?? crypto.randomUUID();
      this.applyProgressId(id);
    });
  }

  switchTo(id: string): void {
    const trimmed = id.trim();
    if (!trimmed) {
      return;
    }
    this.applyProgressId(trimmed);
  }

  getShareUrl(): string {
    const id = this.progressId();
    if (!id) {
      return window.location.href;
    }
    const url = new URL(window.location.href);
    url.searchParams.set('p', id);
    return url.toString();
  }

  private applyProgressId(id: string): void {
    localStorage.setItem(STORAGE_KEY, id);
    this.progressId.set(id);

    if (this.readIdFromUrl() !== id) {
      void this.router.navigate([], {
        queryParams: { p: id },
        queryParamsHandling: 'merge',
        replaceUrl: true,
      });
    }
  }

  private readIdFromUrl(): string | null {
    return new URLSearchParams(window.location.search).get('p');
  }
}
