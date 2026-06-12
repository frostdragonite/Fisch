import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="progress-wrap">
      <div class="progress-label">
        <span>{{ label() }}</span>
        <span class="muted">{{ checked() }} / {{ total() }} ({{ percent() }}%)</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill" [style.width.%]="percent()"></div>
      </div>
    </div>
  `,
  styleUrl: './progress-bar.component.scss',
})
export class ProgressBarComponent {
  readonly label = input.required<string>();
  readonly checked = input.required<number>();
  readonly total = input.required<number>();

  percent(): number {
    const total = this.total();
    if (!total) {
      return 0;
    }
    return Math.round((this.checked() / total) * 100);
  }
}
