import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { SeasonService } from '../../services/season.service';
import {
  ConditionStyle,
  NONE_COLOR,
  SEASON_STYLES,
  SeasonConditionStyle,
  TIME_STYLES,
  WEATHER_STYLES,
  isNoneValue,
  parseConditionTokens,
} from '../../config/fish-condition.config';
import { BaitItem, FishDetailData } from '../../models/catalog.models';
import { LocaleService } from '../../services/locale.service';

type ConditionKind = 'weather' | 'time' | 'season' | 'any';

interface ConditionChip {
  label: string;
  icon: string | null;
  iconActive: string | null;
  color: string;
  kind: ConditionKind;
}

@Component({
  selector: 'app-fish-detail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="fish-detail">
      <div class="fish-detail__conditions">
        @for (group of conditionGroups(); track $index) {
          @if (!$first) {
            <span class="condition-sep" aria-hidden="true">·</span>
          }
          @for (chip of group; track chip.label + $index) {
            <span
              class="condition-chip"
              [class.condition-chip--season-badge]="isSeasonBadge(chip)"
              [class.condition-chip--any]="chip.kind === 'any'"
              [style.--season-color]="chip.kind === 'season' ? chip.color : null"
              [style.color]="chip.color"
            >
              @if (chip.kind === 'any') {
                <svg
                  class="condition-chip__icon condition-chip__icon--any"
                  viewBox="0 0 20 12"
                  aria-hidden="true"
                >
                  <path
                    d="M1.5 7.5c2.2-3.5 4.3-3.5 6.5 0s4.3 3.5 6.5 0 4.3-3.5 6.5 0"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="1.6"
                    stroke-linecap="round"
                  />
                </svg>
              } @else if (chipIcon(chip)) {
                <img
                  class="condition-chip__icon"
                  [src]="chipIcon(chip)"
                  [alt]=""
                  loading="lazy"
                  referrerpolicy="no-referrer"
                />
              }
              <span class="condition-chip__label">{{ chip.label }}</span>
            </span>
          }
        }
      </div>
      @if (detail().source) {
        <div class="fish-detail__meta">
          <span class="fish-detail__meta-label">{{ locale.t('fishDetail.source') }}</span>
          <span class="fish-detail__meta-value">{{ detail().source }}</span>
        </div>
      }
      @if (baitItems().length) {
        <div class="fish-detail__meta">
          <span class="fish-detail__meta-label">{{ locale.t('fishDetail.bait') }}</span>
          <span class="fish-detail__meta-list">
            @for (bait of baitItems(); track bait.name; let last = $last) {
              <a
                [class]="baitLinkClass(bait)"
                [href]="bait.wiki_url"
                target="_blank"
                rel="noopener"
                [attr.aria-label]="locale.t('common.openWiki', { name: bait.name })"
              >
                {{ bait.name }}
              </a>
              @if (!last) {
                <span class="fish-detail__meta-sep">, </span>
              }
            }
          </span>
        </div>
      }
    </div>
  `,
  styleUrl: './fish-detail.component.scss',
})
export class FishDetailComponent {
  readonly locale = inject(LocaleService);
  private readonly seasonService = inject(SeasonService);

  readonly detail = input.required<FishDetailData>();

  readonly conditionGroups = computed(() => {
    const data = this.detail();
    return [
      this.chipsForField(data.weather, WEATHER_STYLES, 'weather'),
      this.chipsForField(data.time, TIME_STYLES, 'time'),
      this.chipsForField(data.season, SEASON_STYLES, 'season'),
    ];
  });

  readonly baitItems = computed((): BaitItem[] => {
    const items = this.detail().bait_items;
    if (items?.length) {
      return items;
    }

    const bait = this.detail().bait?.trim();
    if (!bait || isNoneValue(bait)) {
      return [];
    }

    return bait.split(/,\s*/).map((name) => ({
      name: name.trim(),
      wiki_url: `https://fischipedia.org/wiki/${encodeURIComponent(name.trim().replace(/ /g, '_'))}`,
    }));
  });

  isSeasonBadge(chip: ConditionChip): boolean {
    return (
      chip.kind === 'season' &&
      chip.label in SEASON_STYLES &&
      this.seasonService.isActiveSeason(chip.label)
    );
  }

  chipIcon(chip: ConditionChip): string | null {
    if (chip.kind === 'season') {
      return chip.iconActive ?? chip.icon;
    }
    return chip.icon;
  }

  baitLinkClass(bait: BaitItem): string {
    const base = 'fish-detail__bait-link';
    if (!bait.rarity) {
      return base;
    }
    return `${base} name--rarity-${bait.rarity}`;
  }

  private chipsForField(
    value: string | null,
    styles: Record<string, ConditionStyle | SeasonConditionStyle>,
    kind: ConditionKind
  ): ConditionChip[] {
    const tokens = parseConditionTokens(value);
    if (tokens.length) {
      return tokens.map((token) => this.chipForToken(token, styles, kind));
    }
    if (isNoneValue(value)) {
      return [{ label: 'Any', icon: null, iconActive: null, color: NONE_COLOR, kind: 'any' }];
    }
    return [{ label: value!.trim(), icon: null, iconActive: null, color: 'var(--text)', kind }];
  }

  private chipForToken(
    token: string,
    styles: Record<string, ConditionStyle | SeasonConditionStyle>,
    kind: ConditionKind
  ): ConditionChip {
    const style = styles[token];
    if (style) {
      const seasonStyle = kind === 'season' ? (style as SeasonConditionStyle) : null;
      return {
        label: token,
        icon: style.icon,
        iconActive: seasonStyle?.iconActive ?? null,
        color: style.color,
        kind,
      };
    }
    return { label: token, icon: null, iconActive: null, color: 'var(--text)', kind };
  }
}
