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
import { FishCategory, StatusFilter } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-fish',
  standalone: true,
  imports: [FilterBarComponent, ProgressBarComponent, CategorySectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1>Bestiary</h1>
      <p class="muted">
        ปลาที่ต้องมีสำหรับ Masterline Rod (ยกเว้น Secret, Apex, Divine Secret, Limited)
      </p>

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
  styleUrl: './fish.component.scss',
})
export class FishComponent {
  private readonly catalog = inject(CatalogService);
  private readonly progress = inject(ProgressService);

  readonly statusFilter = signal<StatusFilter>('all');
  readonly categoryFilter = signal('');
  readonly searchFilter = signal('');

  readonly categoryNames = computed(
    () =>
      this.catalog.fishCatalog()?.categories.map((c) => c.name) ?? []
  );

  readonly totalCount = computed(
    () => this.catalog.fishCatalog()?.meta.total_required ?? 0
  );

  readonly checkedCount = computed(() =>
    this.progress.countChecked(this.progress.fish())
  );

  readonly visibleSections = computed(() => {
    const catalog = this.catalog.fishCatalog();
    if (!catalog) {
      return [] as { name: string; rows: ChecklistRow[]; checkedCount: number }[];
    }

    const status = this.statusFilter();
    const category = this.categoryFilter();
    const search = this.searchFilter().toLowerCase().trim();
    const checkedMap = this.progress.fish();

    return catalog.categories
      .filter((cat) => !category || cat.name === category)
      .map((cat) => this.mapCategory(cat, status, search, checkedMap))
      .filter((section) => section.rows.length > 0);
  });

  private mapCategory(
    cat: FishCategory,
    status: StatusFilter,
    search: string,
    checkedMap: Record<string, boolean>
  ) {
    const rows: ChecklistRow[] = [];

    for (const fish of cat.fish) {
      const checked = !!checkedMap[fish.id];
      if (search && !fish.name.toLowerCase().includes(search)) {
        continue;
      }
      if (status === 'checked' && !checked) continue;
      if (status === 'unchecked' && checked) continue;

      rows.push({
        id: fish.id,
        name: fish.name,
        detail: this.formatFishDetail(fish),
        wiki_url: fish.wiki_url,
        image_url: fish.image_url,
        rarity: fish.rarity,
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
    this.progress.toggleFish(event.id, event.checked);
  }

  onCheckAll(ids: string[]): void {
    this.progress.checkFish(ids);
  }

  private formatFishDetail(fish: FishCategory['fish'][number]): string {
    const parts = [
      fish.weather && `Weather: ${fish.weather}`,
      fish.time && `Time: ${fish.time}`,
      fish.season && `Season: ${fish.season}`,
      fish.bait && `Bait: ${fish.bait}`,
    ].filter(Boolean);
    return parts.join(' · ') || '—';
  }
}
