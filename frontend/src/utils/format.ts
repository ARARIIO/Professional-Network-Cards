export function initialsFromName(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter((part) => part.length > 0);
  if (parts.length === 0) {
    return '';
  }
  return parts
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}

export function formatCount(value: number): string {
  return value.toLocaleString('ru-RU');
}

export function formatUpdated(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) {
    return 'обновлено сегодня';
  }
  if (days === 1) {
    return 'обновлено 1 день назад';
  }
  if (days < 5) {
    return `обновлено ${days} дня назад`;
  }
  return `обновлено ${days} дней назад`;
}

export function formatShortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatRelative(iso: string): string {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) {
    return 'только что';
  }
  if (minutes < 60) {
    return `${minutes} мин назад`;
  }
  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} ч назад`;
  }
  const days = Math.floor(hours / 24);
  if (days === 1) {
    return 'вчера';
  }
  return formatShortDate(iso);
}

const WEEKDAYS = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];

export function weekdayShort(iso: string): string {
  const label = WEEKDAYS.at(new Date(iso).getDay());
  if (typeof label !== 'string') {
    return '';
  }
  return label;
}

export function hrefOrNull(value: string | null): string | null {
  if (value === null) {
    return null;
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    return null;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
