import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { SeasonService } from '../../services/season.service';
import { SeasonStatus, formatSeasonCountdown } from '../../utils/season.util';

@Component({
  selector: 'app-season-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <aside class="season-float card" aria-label="Current season">
      <!-- Desktop: 3 small + 1 featured -->
      <div class="season-float__desktop">
        <div class="season-float__others" aria-label="Upcoming seasons">
          @for (season of otherSeasons(); track season.name) {
            <div
              class="season-float__cell season-float__cell--compact"
              [style.--season-color]="season.color"
              [title]="tooltip(season)"
            >
              <img
                class="season-float__icon season-float__icon--muted"
                [src]="season.icon"
                [alt]="season.name"
                width="28"
                height="28"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
              <span class="season-float__countdown season-float__countdown--compact">
                {{ formatCountdown(season.secondsRemaining) }}
              </span>
            </div>
          }
        </div>

        @if (currentSeason(); as current) {
          <div
            class="season-float__cell season-float__cell--featured"
            [style.--season-color]="current.color"
            [title]="tooltip(current)"
          >
            <img
              class="season-float__icon season-float__icon--featured"
              [src]="current.iconActive"
              [alt]="current.name"
              width="44"
              height="44"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
            <span class="season-float__name">{{ current.name }}</span>
            <span class="season-float__countdown season-float__countdown--featured">
              Ends in {{ formatCountdown(current.secondsRemaining) }}
            </span>
          </div>
        }
      </div>

      <!-- Mobile: current only + expand -->
      <div class="season-float__mobile">
        @if (currentSeason(); as current) {
          <div
            class="season-float__cell season-float__cell--featured season-float__cell--solo"
            [style.--season-color]="current.color"
            [title]="tooltip(current)"
          >
            <img
              class="season-float__icon season-float__icon--featured"
              [src]="current.iconActive"
              [alt]="current.name"
              width="40"
              height="40"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
            <span class="season-float__name">{{ current.name }}</span>
            <span class="season-float__countdown season-float__countdown--featured">
              Ends in {{ formatCountdown(current.secondsRemaining) }}
            </span>
          </div>
        }

        @if (mobileExpanded()) {
          <div class="season-float__mobile-list" aria-label="Other seasons">
            @for (season of otherSeasons(); track season.name) {
              <div
                class="season-float__cell season-float__cell--row"
                [style.--season-color]="season.color"
                [title]="tooltip(season)"
              >
                <img
                  class="season-float__icon season-float__icon--muted"
                  [src]="season.icon"
                  [alt]="season.name"
                  width="28"
                  height="28"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                />
                <span class="season-float__name season-float__name--row">{{ season.name }}</span>
                <span class="season-float__countdown">
                  Starts in {{ formatCountdown(season.secondsRemaining) }}
                </span>
              </div>
            }
          </div>
        }

        <button
          type="button"
          class="season-float__toggle"
          (click)="mobileExpanded.set(!mobileExpanded())"
          [attr.aria-expanded]="mobileExpanded()"
        >
          {{ mobileExpanded() ? 'Collapse' : 'More seasons' }}
        </button>
      </div>
    </aside>
  `,
  styleUrl: './season-widget.component.scss',
})
export class SeasonWidgetComponent {
  readonly seasonService = inject(SeasonService);
  readonly mobileExpanded = signal(false);

  readonly formatCountdown = formatSeasonCountdown;

  readonly currentSeason = computed(() =>
    this.seasonService.seasons().find((season) => season.isCurrent)
  );

  readonly otherSeasons = computed(() =>
    this.seasonService.seasons().filter((season) => !season.isCurrent)
  );

  tooltip(season: SeasonStatus): string {
    const label = season.isCurrent ? 'ends' : 'starts';
    return `${season.name} ${label}: ${new Date(season.endsAtMs).toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })}`;
  }
}
