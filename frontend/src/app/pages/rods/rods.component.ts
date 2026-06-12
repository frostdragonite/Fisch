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
import { RodCategory } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { LocaleService } from '../../services/locale.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-rods',
  standalone: true,
  imports: [FilterBarComponent, ProgressBarComponent, CategorySectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1>Rod Journal</h1>
      <p class="muted">{{ locale.t('rods.subtitle') }}</p>

      <app-progress-bar
        [label]="locale.t('progress.label')"
        [checked]="checkedCount()"
        [total]="totalCount()"
      />

      <app-filter-bar
        [categories]="categoryNames()"
        [category]="categoryFilter()"
        (categoryChange)="categoryFilter.set($event)"
        [search]="searchFilter()"
        (searchChange)="searchFilter.set($event)"
        [hideCompleteZones]="hideCompleteZones()"
        (hideCompleteZonesChange)="hideCompleteZones.set($event)"
        [hideCheckedItems]="hideCheckedRods()"
        (hideCheckedItemsChange)="hideCheckedRods.set($event)"
        hideCheckedItemsLabelKey="filter.hideCheckedRods"
      />

      @for (section of visibleSections(); track section.name) {
        <app-category-section
          [title]="section.name"
          [rows]="section.rows"
          [checkedCount]="section.checkedCount"
          [totalCount]="section.totalCount"
          [complete]="section.isComplete"
          (toggle)="onToggle($event)"
          (checkAll)="onCheckAll($event)"
        />
      }

      @if (!visibleSections().length) {
        <p class="muted">{{ locale.t('filter.noResults') }}</p>
      }
    </div>
  `,
  styleUrl: './rods.component.scss',
})
export class RodsComponent {
  readonly locale = inject(LocaleService);
  private readonly catalog = inject(CatalogService);
  private readonly progress = inject(ProgressService);

  readonly categoryFilter = signal('');
  readonly searchFilter = signal('');
  readonly hideCompleteZones = signal(false);
  readonly hideCheckedRods = signal(false);

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
      return [] as {
        name: string;
        rows: ChecklistRow[];
        checkedCount: number;
        totalCount: number;
        isComplete: boolean;
      }[];
    }

    const category = this.categoryFilter();
    const search = this.searchFilter().toLowerCase().trim();
    const hideCompleteZones = this.hideCompleteZones();
    const hideCheckedRods = this.hideCheckedRods();
    const checkedMap = this.progress.rods();

    return catalog.categories
      .filter((cat) => !category || cat.name === category)
      .filter(
        (cat) =>
          !hideCompleteZones ||
          !cat.rods.every((rod) => !!checkedMap[rod.id])
      )
      .map((cat) => this.mapCategory(cat, search, checkedMap, hideCheckedRods))
      .filter((section) => section.rows.length > 0);
  });

  private mapCategory(
    cat: RodCategory,
    search: string,
    checkedMap: Record<string, boolean>,
    hideCheckedRods: boolean
  ) {
    const rows: ChecklistRow[] = [];
    const checkedInZone = cat.rods.filter((rod) => !!checkedMap[rod.id]).length;
    const isComplete =
      cat.rods.length > 0 && checkedInZone === cat.rods.length;

    for (const rod of cat.rods) {
      const checked = !!checkedMap[rod.id];
      if (hideCheckedRods && checked) continue;
      if (search && !rod.name.toLowerCase().includes(search)) {
        continue;
      }

      rows.push({
        id: rod.id,
        name: rod.name,
        detail: rod.obtainment,
        wiki_url: rod.wiki_url,
        image_url: rod.image_url,
        color: rod.color,
        checked,
      });
    }

    return {
      name: cat.name,
      rows,
      checkedCount: checkedInZone,
      totalCount: cat.rods.length,
      isComplete,
    };
  }

  onToggle(event: { id: string; checked: boolean }): void {
    this.progress.toggleRod(event.id, event.checked);
  }

  onCheckAll(ids: string[]): void {
    this.progress.checkRods(ids);
  }
}
