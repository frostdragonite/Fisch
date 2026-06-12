export interface RodItem {
  id: string;
  name: string;
  journal_category: string;
  obtainment: string;
  stage: number | null;
  wiki_url: string;
  image_url?: string | null;
  color?: string | null;
}

export interface FishItem {
  id: string;
  name: string;
  bestiary_location: string;
  weather: string | null;
  time: string | null;
  season: string | null;
  bait: string | null;
  wiki_url: string;
  image_url?: string | null;
  rarity?: string | null;
}

export interface RodCategory {
  name: string;
  rods: RodItem[];
}

export interface FishCategory {
  name: string;
  fish: FishItem[];
}

export interface CatalogMeta {
  total_required: number;
  total_excluded?: number;
  total_scraped?: number;
}

export interface RodsCatalog {
  scraped_at: string;
  wiki_version_note: string;
  categories: RodCategory[];
  meta: CatalogMeta;
}

export interface FishCatalog {
  scraped_at: string;
  wiki_version_note: string;
  categories: FishCategory[];
  meta: CatalogMeta;
}

export interface ProgressState {
  rods: Record<string, boolean>;
  fish: Record<string, boolean>;
}

export type StatusFilter = 'all' | 'checked' | 'unchecked';
