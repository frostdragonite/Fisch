export interface ConditionStyle {
  icon: string;
  color: string;
}

export interface SeasonConditionStyle extends ConditionStyle {
  iconActive: string;
}

const WIKI = 'https://static.wikitide.net/fischwiki/thumb';

export const NONE_COLOR = '#ffffff57';

const weather = (path: string, color: string): ConditionStyle => ({
  icon: `${WIKI}${path}`,
  color,
});

export const WEATHER_STYLES: Record<string, ConditionStyle> = {
  Clear: weather('/6/62/Clear.png/20px-Clear.png', '#ffffff'),
  Foggy: weather('/b/bc/Foggy.png/20px-Foggy.png', '#8bc7e8'),
  Windy: weather('/0/04/Windy.png/20px-Windy.png', '#a2befd'),
  Rain: weather('/1/1d/Rain.png/20px-Rain.png', '#2a6bf6'),
  Stormy: weather('/5/5d/Stormy.png/20px-Stormy.png', '#f1f6b1'),
  Eclipse: weather('/c/c5/Eclipse.png/20px-Eclipse.png', '#ff6a00'),
  Starfall: weather('/a/a6/Starfall.png/20px-Starfall.png', '#9378ff'),
  'Aurora Borealis': weather('/c/cd/Aurora_Borealis.png/20px-Aurora_Borealis.png', '#4effd9'),
  Rainbow: weather('/1/1e/Rainbow.png/20px-Rainbow.png', '#ff93c2'),
  'Frost Moon': weather('/6/66/Frost_Moon.png/20px-Frost_Moon.png', '#99b8ff'),
  'Sovereign Surge': weather('/4/45/Sovereign_Storm.png/20px-Sovereign_Storm.png', '#3183c4'),
  'Sovereign Storm': weather('/4/45/Sovereign_Storm.png/20px-Sovereign_Storm.png', '#7484f6'),
  'Sovereign Reckoning': weather('/4/45/Sovereign_Storm.png/20px-Sovereign_Storm.png', '#9849c3'),
};

export const TIME_STYLES: Record<string, ConditionStyle> = {
  Day: {
    icon: `${WIKI}/2/2d/Day.png/20px-Day.png`,
    color: '#ffe377',
  },
  Night: {
    icon: `${WIKI}/1/15/Night.png/20px-Night.png`,
    color: '#7b9fe0',
  },
};

const WIKI_STATIC = 'https://static.wikitide.net/fischwiki';

/** Full-size wiki PNGs for the season widget (no SVG on wiki). */
export const SEASON_WIDGET_STYLES: Record<
  string,
  { inactive: string; active: string; color: string }
> = {
  Spring: {
    inactive: `${WIKI_STATIC}/9/9c/Spring.png`,
    active: `${WIKI_STATIC}/e/e2/Spring_Current.png`,
    color: '#84f182',
  },
  Summer: {
    inactive: `${WIKI_STATIC}/8/85/Summer.png`,
    active: `${WIKI_STATIC}/5/50/Summer_Current.png`,
    color: '#ffe015',
  },
  Autumn: {
    inactive: `${WIKI_STATIC}/e/e6/Autumn.png`,
    active: `${WIKI_STATIC}/8/81/Autumn_Current.png`,
    color: '#ff8d59',
  },
  Winter: {
    inactive: `${WIKI_STATIC}/a/a7/Winter.png`,
    active: `${WIKI_STATIC}/d/d2/Winter_Current.png`,
    color: '#96c8ff',
  },
};

const SEASON_THUMB: Record<string, string> = {
  Spring: '/9/9c/Spring.png/20px-Spring.png',
  Summer: '/8/85/Summer.png/20px-Summer.png',
  Autumn: '/e/e6/Autumn.png/20px-Autumn.png',
  Winter: '/a/a7/Winter.png/20px-Winter.png',
};

/** Season chips in fish detail — colors/icons match the season widget. */
export const SEASON_STYLES: Record<string, SeasonConditionStyle> =
  Object.fromEntries(
    Object.entries(SEASON_WIDGET_STYLES).map(([name, widget]) => [
      name,
      {
        icon: `${WIKI}${SEASON_THUMB[name]}`,
        iconActive: widget.active,
        color: widget.color,
      },
    ])
  );

export function parseConditionTokens(value: string | null | undefined): string[] {
  if (!value) {
    return [];
  }
  const trimmed = value.trim();
  if (!trimmed || trimmed === 'None' || trimmed === 'NONE!') {
    return [];
  }
  return trimmed.split(/,\s*/).map((part) => part.trim()).filter(Boolean);
}

export function isNoneValue(value: string | null | undefined): boolean {
  if (!value) {
    return true;
  }
  const trimmed = value.trim();
  return !trimmed || trimmed === 'None' || trimmed === 'NONE!';
}
