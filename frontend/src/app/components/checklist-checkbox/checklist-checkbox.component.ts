import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

@Component({
  selector: 'app-checklist-checkbox',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="check-box">
      <input
        type="checkbox"
        class="check-box__input"
        [checked]="checked()"
        [attr.aria-label]="ariaLabel()"
        (change)="onChange($event)"
      />
      <span class="check-box__mark" aria-hidden="true">
        @if (checked()) {
          <svg viewBox="0 0 12 10" class="check-box__icon">
            <path d="M1 5.2 4.2 8.4 11 1.4" />
          </svg>
        }
      </span>
    </label>
  `,
  styleUrl: './checklist-checkbox.component.scss',
})
export class ChecklistCheckboxComponent {
  readonly checked = input(false);
  readonly ariaLabel = input('ติ๊กรายการ');

  readonly checkedChange = output<boolean>();

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.checkedChange.emit(target.checked);
  }
}
