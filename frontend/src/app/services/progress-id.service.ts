import { Injectable, inject, signal } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

const STORAGE_KEY = 'fisch-masterline-progress-id';

@Injectable({ providedIn: 'root' })
export class ProgressIdService {
  private readonly router = inject(Router);
  readonly progressId = signal<string | null>(null);

  initFromRoute(route: ActivatedRoute): void {
    route.queryParamMap.subscribe((params) => {
      let id = params.get('p');

      if (!id) {
        id = localStorage.getItem(STORAGE_KEY);
      }

      if (!id) {
        id = crypto.randomUUID();
      }

      localStorage.setItem(STORAGE_KEY, id);
      this.progressId.set(id);

      if (params.get('p') !== id) {
        void this.router.navigate([], {
          queryParams: { p: id },
          queryParamsHandling: 'merge',
          replaceUrl: true,
        });
      }
    });
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
}
