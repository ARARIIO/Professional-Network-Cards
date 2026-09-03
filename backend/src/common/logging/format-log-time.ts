export function formatLogTime(date: Date): string {
  const year = String(date.getFullYear());
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hour = pad2(date.getHours());
  const minute = pad2(date.getMinutes());
  const second = pad2(date.getSeconds());
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? '+' : '-';
  const abs = Math.abs(offsetMinutes);
  const offsetHours = pad2(Math.floor(abs / 60));
  const offsetMins = pad2(abs % 60);
  return `${year}-${month}-${day} ${hour}:${minute}:${second} ${sign}${offsetHours}:${offsetMins}`;
}

function pad2(value: number): string {
  return String(value).padStart(2, '0');
}
