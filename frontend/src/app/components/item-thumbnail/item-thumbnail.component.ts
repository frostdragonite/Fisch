import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

@Component({
  selector: 'app-item-thumbnail',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="thumb" [class.thumb--fallback]="showFallback()">
      @if (imageUrl() && !showFallback()) {
        <img
          [src]="imageUrl()!"
          [alt]="name()"
          loading="lazy"
          referrerpolicy="no-referrer"
          (error)="showFallback.set(true)"
        />
      } @else {
        <span class="thumb-letter">{{ initial() }}</span>
      }
    </div>
  `,
  styleUrl: './item-thumbnail.component.scss',
})
export class ItemThumbnailComponent {
  readonly imageUrl = input<string | null | undefined>(null);
  readonly name = input.required<string>();

  readonly showFallback = signal(false);

  initial(): string {
    return (this.name().trim()[0] ?? '?').toUpperCase();
  }
}
