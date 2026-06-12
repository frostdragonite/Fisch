export interface ConditionStyle {
  icon: string;
  color: string;
}

const WIKI = 'https://static.wikitide.net/fischwiki/thumb';

export const NONE_COLOR = '#ffffff57';

const weather = (path: string, color: string): ConditionStyle => ({
  icon: `${WIKI}${path}`,
  color,
});

export const WEATHER_STYLES: Record<string, ConditionStyle> = {
  Clear: weather('/6/62/Clear.png/20px-Clear.png', '#ffe377'),
  Foggy: weather('/b/bc/Foggy.png/20px-Foggy.png', '#c8c8e0'),
  Windy: weather('/0/04/Windy.png/20px-Windy.png', '#b8e86c'),
  Rain: weather('/1/1d/Rain.png/20px-Rain.png', '#6cb4ee'),
  Stormy: weather('/5/5d/Stormy.png/20px-Stormy.png', '#9b7ede'),
  Eclipse: weather('/c/c5/Eclipse.png/20px-Eclipse.png', '#c87800'),
  Starfall: weather('/a/a6/Starfall.png/20px-Starfall.png', '#e8c8ff'),
  'Aurora Borealis': weather('/c/cd/Aurora_Borealis.png/20px-Aurora_Borealis.png', '#2effb9'),
  Rainbow: weather('/1/1e/Rainbow.png/20px-Rainbow.png', '#eb5380'),
  'Frost Moon': weather('/6/66/Frost_Moon.png/20px-Frost_Moon.png', '#90f0ff'),
  'Sovereign Surge': weather('/4/45/Sovereign_Storm.png/20px-Sovereign_Storm.png', '#89c6ff'),
  'Sovereign Storm': weather('/4/45/Sovereign_Storm.png/20px-Sovereign_Storm.png', '#89c6ff'),
  'Sovereign Reckoning': weather('/4/45/Sovereign_Storm.png/20px-Sovereign_Storm.png', '#89c6ff'),
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

export const SEASON_STYLES: Record<string, ConditionStyle> = {
  Spring: {
    icon: `${WIKI}/9/9c/Spring.png/20px-Spring.png`,
    color: '#ff96b4',
  },
  Summer: {
    icon: `${WIKI}/8/85/Summer.png/20px-Summer.png`,
    color: '#ffb347',
  },
  Autumn: {
    icon: `${WIKI}/e/e6/Autumn.png/20px-Autumn.png`,
    color: '#d4844a',
  },
  Winter: {
    icon: `${WIKI}/a/a7/Winter.png/20px-Winter.png`,
    color: '#90f0ff',
  },
};

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
