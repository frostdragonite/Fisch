import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { LocaleService } from '../../services/locale.service';
import { SeasonService } from '../../services/season.service';
import { SeasonStatus, formatSeasonCountdown } from '../../utils/season.util';

@Component({
  selector: 'app-season-widget',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="season-float-wrap">
      @if (!collapsed()) {
        <button
          type="button"
          class="season-float__minimize"
          (click)="minimize()"
          [attr.aria-label]="locale.t('season.minimize')"
        >
          −
        </button>
      }

      <aside
        class="season-float card"
        [class.season-float--collapsed]="collapsed()"
        [attr.aria-label]="locale.t('season.current')"
      >
      @if (collapsed()) {
        @if (currentSeason(); as current) {
          <button
            type="button"
            class="season-float__collapsed"
            [style.--season-color]="current.color"
            [title]="tooltip(current)"
            (click)="collapsed.set(false)"
            [attr.aria-label]="locale.t('season.expand')"
          >
            <img
              class="season-float__icon season-float__icon--mini"
              [src]="current.iconActive"
              [alt]="current.name"
              width="28"
              height="28"
              loading="lazy"
              referrerpolicy="no-referrer"
            />
            <span class="season-float__countdown season-float__countdown--mini">
              {{ formatCountdown(current.secondsRemaining) }}
            </span>
          </button>
        }
      } @else {
        <!-- Desktop: 3 small + 1 featured -->
        <div class="season-float__desktop">
          <div class="season-float__others" [attr.aria-label]="locale.t('season.upcoming')">
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
                {{ locale.t('season.endsIn') }} {{ formatCountdown(current.secondsRemaining) }}
              </span>
            </div>
          }
        </div>

        <!-- Mobile: current only + expand -->
        <div class="season-float__mobile">
          @if (currentSeason(); as current) {
            <div
              class="season-float__cell season-float__cell--featured season-float__cell--inline"
              [style.--season-color]="current.color"
              [title]="tooltip(current)"
            >
              <img
                class="season-float__icon season-float__icon--mobile"
                [src]="current.iconActive"
                [alt]="current.name"
                width="28"
                height="28"
                loading="lazy"
                referrerpolicy="no-referrer"
              />
              <span class="season-float__countdown season-float__countdown--featured">
                {{ formatCountdown(current.secondsRemaining) }}
              </span>
            </div>
          }

          @if (mobileExpanded()) {
            <div class="season-float__mobile-list" [attr.aria-label]="locale.t('season.other')">
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
                    width="24"
                    height="24"
                    loading="lazy"
                    referrerpolicy="no-referrer"
                  />
                  <span class="season-float__name season-float__name--row">{{ season.name }}</span>
                  <span class="season-float__countdown">
                    {{ formatCountdown(season.secondsRemaining) }}
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
            {{ mobileExpanded() ? locale.t('season.collapse') : locale.t('season.more') }}
          </button>
        </div>
      }
      </aside>
    </div>
  `,
  styleUrl: './season-widget.component.scss',
})
export class SeasonWidgetComponent {
  readonly locale = inject(LocaleService);
  readonly seasonService = inject(SeasonService);
  readonly mobileExpanded = signal(false);
  readonly collapsed = signal(false);

  readonly formatCountdown = formatSeasonCountdown;

  readonly currentSeason = computed(() =>
    this.seasonService.seasons().find((season) => season.isCurrent)
  );

  readonly otherSeasons = computed(() =>
    this.seasonService.seasons().filter((season) => !season.isCurrent)
  );

  minimize(): void {
    this.collapsed.set(true);
    this.mobileExpanded.set(false);
  }

  tooltip(season: SeasonStatus): string {
    const label = season.isCurrent
      ? this.locale.t('season.ends')
      : this.locale.t('season.starts');
    return `${season.name} ${label}: ${new Date(season.endsAtMs).toLocaleString(
      this.locale.dateLocale(),
      { dateStyle: 'medium', timeStyle: 'short' }
    )}`;
  }
}
