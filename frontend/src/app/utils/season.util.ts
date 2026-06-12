import { SEASON_WIDGET_STYLES } from '../config/fish-condition.config';

export type SeasonName = 'Spring' | 'Summer' | 'Autumn' | 'Winter';

export const SEASONS: readonly SeasonName[] = [
  'Spring',
  'Summer',
  'Autumn',
  'Winter',
] as const;

/** Real-life seconds per in-game season (matches fischipedia Countdowns.js). */
export const SEASON_DURATION_SEC = 576 * 60;

export const ALL_SEASONS_DURATION_SEC = 4 * SEASON_DURATION_SEC;

export interface SeasonStatus {
  name: SeasonName;
  isCurrent: boolean;
  label: 'ends_in' | 'starts_in';
  targetSeason: SeasonName;
  endsAtMs: number;
  secondsRemaining: number;
  icon: string;
  iconActive: string;
  color: string;
}

export function getCurrentSeason(nowMs = Date.now()): SeasonName {
  return SEASONS[Math.floor(nowMs / 1000 / SEASON_DURATION_SEC) % 4];
}

export function getNextSeasonStartMs(season: SeasonName, nowMs = Date.now()): number {
  const seasonNum = SEASONS.indexOf(season);
  const nowSec = nowMs / 1000;
  const cycleStartSec =
    Math.floor(nowSec / ALL_SEASONS_DURATION_SEC + (1 - seasonNum / 4)) *
    ALL_SEASONS_DURATION_SEC;
  return (cycleStartSec + SEASON_DURATION_SEC * seasonNum) * 1000;
}

export function nextSeasonName(season: SeasonName): SeasonName {
  return SEASONS[(SEASONS.indexOf(season) + 1) % SEASONS.length];
}

export function getSeasonStatus(season: SeasonName, nowMs = Date.now()): SeasonStatus {
  const isCurrent = getCurrentSeason(nowMs) === season;
  const targetSeason = isCurrent ? nextSeasonName(season) : season;
  const endsAtMs = getNextSeasonStartMs(targetSeason, nowMs);

  const styles = SEASON_WIDGET_STYLES[season];

  return {
    name: season,
    isCurrent,
    label: isCurrent ? 'ends_in' : 'starts_in',
    targetSeason,
    endsAtMs,
    secondsRemaining: Math.max(0, Math.floor((endsAtMs - nowMs) / 1000)),
    icon: styles.inactive,
    iconActive: styles.active,
    color: styles.color,
  };
}

export function getAllSeasonStatuses(nowMs = Date.now()): SeasonStatus[] {
  return SEASONS.map((season) => getSeasonStatus(season, nowMs));
}

export function formatSeasonCountdown(totalSeconds: number): string {
  let remaining = totalSeconds;
  const days = Math.floor(remaining / 86400);
  remaining %= 86400;
  const hours = Math.floor(remaining / 3600);
  remaining %= 3600;
  const mins = Math.floor(remaining / 60);
  const secs = Math.ceil(remaining % 60);

  const parts: string[] = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0 || days > 0) parts.push(`${hours}h`);
  if (mins > 0 || hours > 0 || days > 0) parts.push(`${mins}m`);
  if (secs > 0 || !parts.length) parts.push(`${secs}s`);
  return parts.join(' ');
}
