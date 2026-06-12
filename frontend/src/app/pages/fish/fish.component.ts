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
import { FishCategory } from '../../models/catalog.models';
import { CatalogService } from '../../services/catalog.service';
import { LocaleService } from '../../services/locale.service';
import { ProgressService } from '../../services/progress.service';

@Component({
  selector: 'app-fish',
  standalone: true,
  imports: [FilterBarComponent, ProgressBarComponent, CategorySectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <h1>Bestiary</h1>
      <p class="muted">{{ locale.t('fish.subtitle') }}</p>

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
        [hideCheckedItems]="hideCheckedFish()"
        (hideCheckedItemsChange)="hideCheckedFish.set($event)"
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
  styleUrl: './fish.component.scss',
})
export class FishComponent {
  readonly locale = inject(LocaleService);
  private readonly catalog = inject(CatalogService);
  private readonly progress = inject(ProgressService);

  readonly categoryFilter = signal('');
  readonly searchFilter = signal('');
  readonly hideCompleteZones = signal(false);
  readonly hideCheckedFish = signal(false);

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
    const hideCheckedFish = this.hideCheckedFish();
    const checkedMap = this.progress.fish();

    return catalog.categories
      .filter((cat) => !category || cat.name === category)
      .filter(
        (cat) =>
          !hideCompleteZones ||
          !cat.fish.every((fish) => !!checkedMap[fish.id])
      )
      .map((cat) => this.mapCategory(cat, search, checkedMap, hideCheckedFish))
      .filter((section) => section.rows.length > 0);
  });

  private mapCategory(
    cat: FishCategory,
    search: string,
    checkedMap: Record<string, boolean>,
    hideCheckedFish: boolean
  ) {
    const rows: ChecklistRow[] = [];
    const checkedInZone = cat.fish.filter((fish) => !!checkedMap[fish.id]).length;
    const isComplete =
      cat.fish.length > 0 && checkedInZone === cat.fish.length;

    for (const fish of cat.fish) {
      const checked = !!checkedMap[fish.id];
      if (hideCheckedFish && checked) continue;
      if (search && !fish.name.toLowerCase().includes(search)) {
        continue;
      }

      rows.push({
        id: fish.id,
        name: fish.name,
        fishDetail: {
          weather: fish.weather,
          time: fish.time,
          season: fish.season,
          bait: fish.bait,
          bait_items: fish.bait_items,
        },
        wiki_url: fish.wiki_url,
        image_url: fish.image_url,
        rarity: fish.rarity,
        checked,
      });
    }

    return {
      name: cat.name,
      rows,
      checkedCount: checkedInZone,
      totalCount: cat.fish.length,
      isComplete,
    };
  }

  onToggle(event: { id: string; checked: boolean }): void {
    this.progress.toggleFish(event.id, event.checked);
  }

  onCheckAll(ids: string[]): void {
    this.progress.checkFish(ids);
  }

}
