import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProgressBarComponent } from '../../components/progress-bar/progress-bar.component';
import { CatalogService } from '../../services/catalog.service';
import { LocaleService } from '../../services/locale.service';
import { ProgressIdService } from '../../services/progress-id.service';
import { ProgressService } from '../../services/progress.service';
import { APP_VERSION } from '../../../environments/version.generated';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [RouterLink, ProgressBarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="dashboard">
      <h1>Masterline Rod Checklist</h1>
      <p class="muted">{{ locale.t('dashboard.subtitle') }}</p>

      @if (catalog.loading()) {
        <p class="muted">{{ locale.t('dashboard.loading') }}</p>
      } @else {
        <div class="stats card">
          <app-progress-bar
            label="Rod Journal"
            [checked]="rodsChecked()"
            [total]="rodsTotal()"
          />
          <app-progress-bar
            label="Bestiary"
            [checked]="fishChecked()"
            [total]="fishTotal()"
          />
          <app-progress-bar
            [label]="locale.t('dashboard.total')"
            [checked]="rodsChecked() + fishChecked()"
            [total]="rodsTotal() + fishTotal()"
          />
        </div>

        <div class="actions">
          <a routerLink="/rods" class="btn btn-primary">{{ locale.t('dashboard.viewRods') }}</a>
          <a routerLink="/fish" class="btn btn-primary">{{ locale.t('dashboard.viewFish') }}</a>
          <button type="button" class="btn" (click)="copyLink()">
            {{ copied() ? locale.t('dashboard.copied') : locale.t('dashboard.copyLink') }}
          </button>
        </div>

        <div class="save-panel card">
          <h2 class="save-panel__title">{{ locale.t('dashboard.saveTitle') }}</h2>
          <p class="muted save-panel__hint">{{ locale.t('dashboard.saveHint') }}</p>
          @if (progressId.progressId(); as id) {
            <div class="save-panel__current">
              <span class="muted">{{ locale.t('dashboard.currentSave') }}</span>
              <code>{{ id }}</code>
            </div>
          }
          <div class="save-panel__load">
            <input
              type="text"
              class="save-panel__input"
              [placeholder]="locale.t('dashboard.loadPlaceholder')"
              [value]="loadInput()"
              (input)="loadInput.set($any($event.target).value)"
              (keydown.enter)="loadSave()"
            />
            <button type="button" class="btn" (click)="loadSave()">
              {{ locale.t('dashboard.loadSave') }}
            </button>
          </div>
        </div>

        <p class="muted meta">
          {{ locale.t('dashboard.version', { version: appVersion }) }}
        </p>

        @if (scrapedAt()) {
          <p class="muted meta">{{ locale.t('dashboard.wikiUpdated') }} {{ scrapedAt() }}</p>
        }

        @if (progress.saving()) {
          <p class="muted">{{ locale.t('dashboard.saving') }}</p>
        }
        @if (progress.error()) {
          <p class="error">{{ progress.error() }}</p>
        }
      }
    </div>
  `,
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent {
  readonly locale = inject(LocaleService);
  readonly catalog = inject(CatalogService);
  readonly progress = inject(ProgressService);
  readonly progressId = inject(ProgressIdService);

  readonly copied = signal(false);
  readonly loadInput = signal('');
  readonly appVersion = APP_VERSION;

  readonly rodsTotal = computed(
    () => this.catalog.rodsCatalog()?.meta.total_required ?? 0
  );
  readonly fishTotal = computed(
    () => this.catalog.fishCatalog()?.meta.total_required ?? 0
  );
  readonly rodsChecked = computed(() =>
    this.progress.countChecked(this.progress.rods(), this.catalog.rodIds())
  );
  readonly fishChecked = computed(() =>
    this.progress.countChecked(this.progress.fish(), this.catalog.fishIds())
  );
  readonly scrapedAt = computed(() => {
    this.locale.locale();
    const rods = this.catalog.rodsCatalog()?.scraped_at;
    const fish = this.catalog.fishCatalog()?.scraped_at;
    if (!rods && !fish) return null;
    const date = new Date(rods ?? fish ?? '');
    return date.toLocaleString(this.locale.dateLocale());
  });

  async copyLink(): Promise<void> {
    const url = this.progressId.getShareUrl();
    await navigator.clipboard.writeText(url);
    this.copied.set(true);
    setTimeout(() => this.copied.set(false), 2000);
  }

  loadSave(): void {
    const id = this.loadInput().trim();
    if (!id) {
      return;
    }
    this.progressId.switchTo(id);
    this.loadInput.set('');
  }
}
