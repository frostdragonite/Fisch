import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslationKey } from '../../i18n/translations';
import { LocaleService } from '../../services/locale.service';

@Component({
  selector: 'app-filter-bar',
  standalone: true,
  imports: [FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="filter-bar card">
      <div class="filter-category-row">
        <label class="filter-field filter-category">
          {{ locale.t('filter.category') }}
          <select [ngModel]="category()" (ngModelChange)="categoryChange.emit($event)">
            <option value="">{{ locale.t('filter.categoryAll') }}</option>
            @for (cat of categories(); track cat) {
              <option [value]="cat">{{ cat }}</option>
            }
          </select>
        </label>

        <div class="filter-toggles">
            <label class="filter-toggle">
              <input
                type="checkbox"
                class="filter-toggle__input"
                [ngModel]="hideCompleteZones()"
                (ngModelChange)="hideCompleteZonesChange.emit($event)"
              />
              <span class="filter-toggle__track" aria-hidden="true"></span>
              <span class="filter-toggle__label">{{ locale.t('filter.hideCompleteZones') }}</span>
            </label>
            <label class="filter-toggle">
              <input
                type="checkbox"
                class="filter-toggle__input"
                [ngModel]="hideCheckedItems()"
                (ngModelChange)="hideCheckedItemsChange.emit($event)"
              />
              <span class="filter-toggle__track" aria-hidden="true"></span>
              <span class="filter-toggle__label">{{ locale.t(hideCheckedItemsLabelKey()) }}</span>
            </label>
          </div>
      </div>

      <label class="filter-field search-field">
        {{ locale.t('filter.search') }}
        <input
          type="search"
          [ngModel]="search()"
          (ngModelChange)="searchChange.emit($event)"
          [placeholder]="locale.t('filter.searchPlaceholder')"
        />
      </label>
    </div>
  `,
  styleUrl: './filter-bar.component.scss',
})
export class FilterBarComponent {
  readonly locale = inject(LocaleService);

  readonly categories = input.required<string[]>();
  readonly category = input('');
  readonly search = input('');
  readonly hideCompleteZones = input(false);
  readonly hideCheckedItems = input(false);
  readonly hideCheckedItemsLabelKey = input<TranslationKey>('filter.hideCheckedFish');

  readonly categoryChange = output<string>();
  readonly searchChange = output<string>();
  readonly hideCompleteZonesChange = output<boolean>();
  readonly hideCheckedItemsChange = output<boolean>();
}
