import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { LocaleService } from '../../services/locale.service';
import { ChecklistCheckboxComponent } from '../checklist-checkbox/checklist-checkbox.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { FishDetailComponent } from '../fish-detail/fish-detail.component';
import { ItemThumbnailComponent } from '../item-thumbnail/item-thumbnail.component';
import { FishDetailData } from '../../models/catalog.models';

export interface ChecklistRow {
  id: string;
  name: string;
  detail?: string;
  fishDetail?: FishDetailData;
  wiki_url: string;
  image_url?: string | null;
  color?: string | null;
  rarity?: string | null;
  checked: boolean;
}

@Component({
  selector: 'app-category-section',
  standalone: true,
  imports: [
    ChecklistCheckboxComponent,
    FishDetailComponent,
    ItemThumbnailComponent,
    ConfirmDialogComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="category-section card">
      <div class="category-header" [class.category-header--complete]="complete()">
        <button
          type="button"
          class="category-toggle"
          (click)="collapsed.set(!collapsed())"
          [attr.aria-expanded]="!collapsed()"
        >
          <span class="chevron" [class.chevron--open]="!collapsed()">›</span>
          <span class="category-title">{{ title() }}</span>
          <span class="category-progress">{{ checkedCount() }} / {{ totalCount() ?? rows().length }}</span>
        </button>

        @if (uncheckedIds().length) {
          <button
            type="button"
            class="btn btn-sm check-all-btn"
            (click)="confirmOpen.set(true)"
          >
            {{ locale.t('checklist.checkAll') }}
          </button>
        }
      </div>

      @if (!collapsed()) {
        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th></th>
                <th></th>
                <th>{{ locale.t('table.name') }}</th>
                <th>{{ locale.t('table.details') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.id) {
                <tr [class.checked-row]="row.checked">
                  <td class="check-cell">
                    <app-checklist-checkbox
                      [checked]="row.checked"
                      [ariaLabel]="locale.t('checklist.checkItem', { name: row.name })"
                      (checkedChange)="toggle.emit({ id: row.id, checked: $event })"
                    />
                  </td>
                  <td class="thumb-cell">
                    <app-item-thumbnail [imageUrl]="row.image_url" [name]="row.name" />
                  </td>
                  <td class="name-cell">
                    <a
                      [class]="nameLinkClass(row)"
                      [style.color]="row.color || null"
                      [href]="row.wiki_url"
                      target="_blank"
                      rel="noopener"
                      [attr.aria-label]="locale.t('common.openWiki', { name: row.name })"
                    >
                      {{ row.name }}
                    </a>
                  </td>
                  <td class="detail">
                    @if (row.fishDetail) {
                      <app-fish-detail [detail]="row.fishDetail" />
                    } @else {
                      <span class="muted">{{ row.detail }}</span>
                    }
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>

    <app-confirm-dialog
      [open]="confirmOpen()"
      [title]="locale.t('checklist.checkAll')"
      [message]="confirmMessage()"
      [confirmLabel]="locale.t('checklist.checkAll')"
      (confirm)="onConfirmCheckAll()"
      (cancel)="confirmOpen.set(false)"
    />
  `,
  styleUrl: './category-section.component.scss',
})
export class CategorySectionComponent {
  readonly locale = inject(LocaleService);

  readonly title = input.required<string>();
  readonly rows = input.required<ChecklistRow[]>();
  readonly checkedCount = input.required<number>();
  readonly totalCount = input<number | null>(null);
  readonly complete = input(false);
  readonly collapsed = signal(false);
  readonly confirmOpen = signal(false);

  readonly toggle = output<{ id: string; checked: boolean }>();
  readonly checkAll = output<string[]>();

  readonly uncheckedIds = computed(() =>
    this.rows().filter((row) => !row.checked).map((row) => row.id)
  );

  readonly confirmMessage = computed(() => {
    this.locale.locale();
    return this.locale.t('checklist.confirmMessage', {
      title: this.title(),
      count: this.uncheckedIds().length,
    });
  });

  nameLinkClass(row: ChecklistRow): string {
    const base = 'item-name item-name--link';
    if (row.rarity) {
      return `${base} name--rarity-${row.rarity}`;
    }
    return base;
  }

  onConfirmCheckAll(): void {
    this.checkAll.emit(this.uncheckedIds());
    this.confirmOpen.set(false);
  }
}
