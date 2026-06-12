import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Locale } from '../../i18n/translations';
import { LocaleService } from '../../services/locale.service';

@Component({
  selector: 'app-lang-toggle',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="lang-toggle"
      role="group"
      [attr.aria-label]="locale.t('lang.aria')"
    >
      <button
        type="button"
        class="lang-toggle__btn"
        [class.lang-toggle__btn--active]="locale.locale() === 'th'"
        (click)="setLocale('th')"
        [attr.aria-pressed]="locale.locale() === 'th'"
      >
        TH
      </button>
      <button
        type="button"
        class="lang-toggle__btn"
        [class.lang-toggle__btn--active]="locale.locale() === 'en'"
        (click)="setLocale('en')"
        [attr.aria-pressed]="locale.locale() === 'en'"
      >
        EN
      </button>
    </div>
  `,
  styleUrl: './lang-toggle.component.scss',
})
export class LangToggleComponent {
  readonly locale = inject(LocaleService);

  setLocale(value: Locale): void {
    this.locale.setLocale(value);
  }
}
