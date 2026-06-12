import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  ConditionStyle,
  NONE_COLOR,
  SEASON_STYLES,
  TIME_STYLES,
  WEATHER_STYLES,
  isNoneValue,
  parseConditionTokens,
} from '../../config/fish-condition.config';
import { FishDetailData } from '../../models/catalog.models';

interface ConditionChip {
  label: string;
  icon: string | null;
  color: string;
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
          <span class="condition-chip" [style.color]="chip.color">
            @if (chip.icon) {
              <img
                class="condition-chip__icon"
                [src]="chip.icon"
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
    @if (baitLine()) {
      <div class="fish-detail__bait">{{ baitLine() }}</div>
    }
  </div>
  `,
  styleUrl: './fish-detail.component.scss',
})
export class FishDetailComponent {
  readonly detail = input.required<FishDetailData>();

  readonly conditionGroups = computed(() => {
    const data = this.detail();
    return [
      this.chipsForField(data.weather, WEATHER_STYLES),
      this.chipsForField(data.time, TIME_STYLES),
      this.chipsForField(data.season, SEASON_STYLES),
    ];
  });

  readonly baitLine = computed(() => {
    const bait = this.detail().bait?.trim();
    return bait || null;
  });

  private chipsForField(
    value: string | null,
    styles: Record<string, ConditionStyle>
  ): ConditionChip[] {
    const tokens = parseConditionTokens(value);
    if (tokens.length) {
      return tokens.map((token) => this.chipForToken(token, styles));
    }
    if (isNoneValue(value)) {
      return [{ label: 'None', icon: null, color: NONE_COLOR }];
    }
    return [{ label: value!.trim(), icon: null, color: 'var(--text)' }];
  }

  private chipForToken(
    token: string,
    styles: Record<string, ConditionStyle>
  ): ConditionChip {
    const style = styles[token];
    if (style) {
      return { label: token, icon: style.icon, color: style.color };
    }
    return { label: token, icon: null, color: 'var(--text)' };
  }
}
