import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { ItemThumbnailComponent } from '../item-thumbnail/item-thumbnail.component';

export interface ChecklistRow {
  id: string;
  name: string;
  detail: string;
  wiki_url: string;
  image_url?: string | null;
  checked: boolean;
}

@Component({
  selector: 'app-category-section',
  standalone: true,
  imports: [ItemThumbnailComponent, ConfirmDialogComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="category-section card">
      <div class="category-header">
        <button
          type="button"
          class="category-toggle"
          (click)="collapsed.set(!collapsed())"
          [attr.aria-expanded]="!collapsed()"
        >
          <span class="chevron" [class.chevron--open]="!collapsed()">›</span>
          <span class="category-title">{{ title() }}</span>
          <span class="muted">{{ checkedCount() }} / {{ rows().length }}</span>
        </button>

        @if (uncheckedIds().length) {
          <button
            type="button"
            class="btn btn-sm check-all-btn"
            (click)="confirmOpen.set(true)"
          >
            ติ๊กทั้งหมด
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
                <th>ชื่อ</th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.id) {
                <tr [class.checked-row]="row.checked">
                  <td>
                    <input
                      type="checkbox"
                      [checked]="row.checked"
                      (change)="toggle.emit({ id: row.id, checked: $any($event.target).checked })"
                    />
                  </td>
                  <td class="thumb-cell">
                    <app-item-thumbnail [imageUrl]="row.image_url" [name]="row.name" />
                  </td>
                  <td>
                    <a [href]="row.wiki_url" target="_blank" rel="noopener">{{ row.name }}</a>
                  </td>
                  <td class="muted detail">{{ row.detail }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      }
    </section>

    <app-confirm-dialog
      [open]="confirmOpen()"
      title="ติ๊กทั้งหมด"
      [message]="confirmMessage()"
      confirmLabel="ติ๊กทั้งหมด"
      (confirm)="onConfirmCheckAll()"
      (cancel)="confirmOpen.set(false)"
    />
  `,
  styleUrl: './category-section.component.scss',
})
export class CategorySectionComponent {
  readonly title = input.required<string>();
  readonly rows = input.required<ChecklistRow[]>();
  readonly checkedCount = input.required<number>();
  readonly collapsed = signal(false);
  readonly confirmOpen = signal(false);

  readonly toggle = output<{ id: string; checked: boolean }>();
  readonly checkAll = output<string[]>();

  readonly uncheckedIds = computed(() =>
    this.rows().filter((row) => !row.checked).map((row) => row.id)
  );

  readonly confirmMessage = computed(
    () =>
      `ติ๊กทั้งหมดในหมวด «${this.title()}» (${this.uncheckedIds().length} รายการ) ใช่ไหม?`
  );

  onConfirmCheckAll(): void {
    this.checkAll.emit(this.uncheckedIds());
    this.confirmOpen.set(false);
  }
}
