import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  output,
} from '@angular/core';
import { LocaleService } from '../../services/locale.service';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (open()) {
      <div class="backdrop" (click)="cancel.emit()" aria-hidden="true"></div>
      <div class="dialog-wrap" role="presentation">
        <div
          class="dialog card"
          role="alertdialog"
          [attr.aria-labelledby]="'confirm-title'"
          [attr.aria-describedby]="'confirm-message'"
        >
          <h2 id="confirm-title" class="dialog-title">
            {{ title() || locale.t('confirm.title') }}
          </h2>
          <p id="confirm-message" class="dialog-message">{{ message() }}</p>
          <div class="dialog-actions">
            <button type="button" class="btn" (click)="cancel.emit()">
              {{ cancelLabel() || locale.t('confirm.cancel') }}
            </button>
            <button type="button" class="btn btn-primary" (click)="confirm.emit()">
              {{ confirmLabel() || locale.t('confirm.confirm') }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styleUrl: './confirm-dialog.component.scss',
})
export class ConfirmDialogComponent {
  readonly locale = inject(LocaleService);

  readonly open = input(false);
  readonly title = input('');
  readonly message = input('');
  readonly confirmLabel = input('');
  readonly cancelLabel = input('');

  readonly confirm = output<void>();
  readonly cancel = output<void>();
}
