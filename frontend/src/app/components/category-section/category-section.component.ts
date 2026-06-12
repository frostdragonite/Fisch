import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
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
                <th></th>
                <th>รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              @for (row of rows(); track row.id) {
                <tr [class.checked-row]="row.checked">
                  <td class="check-cell">
                    <app-checklist-checkbox
                      [checked]="row.checked"
                      [ariaLabel]="'ติ๊ก ' + row.name"
                      (checkedChange)="toggle.emit({ id: row.id, checked: $event })"
                    />
                  </td>
                  <td class="thumb-cell">
                    <app-item-thumbnail [imageUrl]="row.image_url" [name]="row.name" />
                  </td>
                  <td class="name-cell">
                    @if (row.color) {
                      <span class="item-name" [style.color]="row.color">{{ row.name }}</span>
                    } @else if (row.rarity) {
                      <span class="item-name" [class]="rarityClass(row.rarity)">{{ row.name }}</span>
                    } @else {
                      <span class="item-name">{{ row.name }}</span>
                    }
                  </td>
                  <td class="wiki-cell">
                    <a
                      class="btn btn-sm wiki-btn"
                      [href]="row.wiki_url"
                      target="_blank"
                      rel="noopener"
                      [attr.aria-label]="'เปิด Wiki: ' + row.name"
                    >
                      Wiki
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

  rarityClass(rarity: string | null | undefined): string {
    if (!rarity) {
      return 'item-name';
    }
    return `item-name name--rarity-${rarity}`;
  }

  onConfirmCheckAll(): void {
    this.checkAll.emit(this.uncheckedIds());
    this.confirmOpen.set(false);
  }
}
