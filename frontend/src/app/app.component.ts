import { Component, OnInit, effect, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SeasonWidgetComponent } from './components/season-widget/season-widget.component';
import { CatalogService } from './services/catalog.service';
import { ProgressIdService } from './services/progress-id.service';
import { ProgressService } from './services/progress.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, SeasonWidgetComponent],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <a routerLink="/" class="brand">Masterline Checklist</a>
        <nav>
          <a routerLink="/" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }">หน้าแรก</a>
          <a routerLink="/rods" routerLinkActive="active">เบ็ด</a>
          <a routerLink="/fish" routerLinkActive="active">ปลา</a>
        </nav>
      </header>
      <main class="app-main">
        <router-outlet />
      </main>
      <app-season-widget />
    </div>
  `,
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalog = inject(CatalogService);
  private readonly progressId = inject(ProgressIdService);
  private readonly progress = inject(ProgressService);

  constructor() {
    effect(() => {
      const id = this.progressId.progressId();
      if (id) {
        void this.progress.load(id);
      }
    });
  }

  ngOnInit(): void {
    this.progressId.initFromRoute(this.route);
    void this.catalog.loadAll();
  }
}
