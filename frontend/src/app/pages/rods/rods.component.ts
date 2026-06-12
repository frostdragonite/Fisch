import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  CategorySectionComponent,
  ChecklistRow,
} from '../../components/category-section/category-section.component';
import { FilterBarComponent } from '../../components/filter-bar/filter-bar.component';
import { ProgressBarComponent } from '../../components/progress-bar/progress-bar.component';
import { RodCategory, StatusFilter } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-rods',
  standalone: true,
  imports: [FilterBarComponent, ProgressBarComponent, CategorySectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1>Rod Journal</h1>
      <p class="muted">เบ็ดที่ต้องมีสำหรับ Masterline Rod (ยกเว้น Brick, Crew, Dave และ limited-time)</p>

      <app-progress-bar
        label="ความคืบหน้า"
        [checked]="checkedCount()"
        [total]="totalCount()"
      />

      <app-filter-bar
        [categories]="categoryNames()"
        [status]="statusFilter()"
        (statusChange)="statusFilter.set($event)"
        [category]="categoryFilter()"
        (categoryChange)="categoryFilter.set($event)"
        [search]="searchFilter()"
        (searchChange)="searchFilter.set($event)"
      />

      @for (section of visibleSections(); track section.name) {
        <app-category-section
          [title]="section.name"
          [rows]="section.rows"
          [checkedCount]="section.checkedCount"
          (toggle)="onToggle($event)"
          (checkAll)="onCheckAll($event)"
        />
      }

      @if (!visibleSections().length) {
        <p class="muted">ไม่พบรายการที่ตรงกับ filter</p>
      }
    </div>
  `,
  styleUrl: './rods.component.scss',
})
export class RodsComponent {
  private readonly catalog = inject(CatalogService);
  private readonly progress = inject(ProgressService);

  readonly statusFilter = signal<StatusFilter>('all');
  readonly categoryFilter = signal('');
  readonly searchFilter = signal('');

  readonly categoryNames = computed(
    () =>
      this.catalog.rodsCatalog()?.categories.map((c) => c.name) ?? []
  );

  readonly totalCount = computed(
    () => this.catalog.rodsCatalog()?.meta.total_required ?? 0
  );

  readonly checkedCount = computed(() =>
    this.progress.countChecked(this.progress.rods())
  );

  readonly visibleSections = computed(() => {
    const catalog = this.catalog.rodsCatalog();
    if (!catalog) {
      return [] as { name: string; rows: ChecklistRow[]; checkedCount: number }[];
    }

    const status = this.statusFilter();
    const category = this.categoryFilter();
    const search = this.searchFilter().toLowerCase().trim();
    const checkedMap = this.progress.rods();

    return catalog.categories
      .filter((cat) => !category || cat.name === category)
      .map((cat) => this.mapCategory(cat, status, search, checkedMap))
      .filter((section) => section.rows.length > 0);
  });

  private mapCategory(
    cat: RodCategory,
    status: StatusFilter,
    search: string,
    checkedMap: Record<string, boolean>
  ) {
    const rows: ChecklistRow[] = [];

    for (const rod of cat.rods) {
      const checked = !!checkedMap[rod.id];
      if (search && !rod.name.toLowerCase().includes(search)) {
        continue;
      }
      if (status === 'checked' && !checked) continue;
      if (status === 'unchecked' && checked) continue;

      rows.push({
        id: rod.id,
        name: rod.name,
        detail: rod.obtainment,
        wiki_url: rod.wiki_url,
        image_url: rod.image_url,
        checked,
      });
    }

    return {
      name: cat.name,
      rows,
      checkedCount: rows.filter((r) => r.checked).length,
    };
  }

  onToggle(event: { id: string; checked: boolean }): void {
    this.progress.toggleRod(event.id, event.checked);
  }

  onCheckAll(ids: string[]): void {
    this.progress.checkRods(ids);
  }
}
