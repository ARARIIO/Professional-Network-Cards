import { envOr } from '../env.js';
import { formatLogTime } from './format-log-time.js';
import { isLogLevel, shouldLog, type LogLevel } from './levels.js';
import { redactSecrets } from './redact-secrets.js';

export type LogEntry = {
  at: string;
  level: LogLevel;
  context: string;
  msg: string;
  requestId: string | null;
  method: string | null;
  path: string | null;
  status: number | null;
  ms: number | null;
  operation: string | null;
};

export function emitLog(partial: {
  level: LogLevel;
  context: string;
  msg: string;
  requestId: string | null;
  method: string | null;
  path: string | null;
  status: number | null;
  ms: number | null;
  operation: string | null;
}): void {
  const minimum = configuredLevel();
  if (shouldLog(partial.level, minimum) === false) {
    return;
  }
  const entry: LogEntry = {
    at: formatLogTime(new Date()),
    level: partial.level,
    context: partial.context,
    msg: redactSecrets(partial.msg),
    requestId: partial.requestId,
    method: partial.method,
    path: partial.path,
    status: partial.status,
    ms: partial.ms,
    operation: partial.operation,
  };
  const line = logFormat() === 'json' ? `${JSON.stringify(entry)}\n` : `${formatPretty(entry)}\n`;
  if (entry.level === 'error') {
    process.stderr.write(line);
    return;
  }
  process.stdout.write(line);
}

export function emptyLogFields(): {
  requestId: string | null;
  method: string | null;
  path: string | null;
  status: number | null;
  ms: number | null;
  operation: string | null;
} {
  return {
    requestId: null,
    method: null,
    path: null,
    status: null,
    ms: null,
    operation: null,
  };
}

function configuredLevel(): LogLevel {
  const raw = envOr('LOG_LEVEL', 'info');
  if (isLogLevel(raw)) {
    return raw;
  }
  return 'info';
}

function logFormat(): 'json' | 'pretty' {
  const raw = envOr('LOG_FORMAT', envOr('NODE_ENV', 'development') === 'production' ? 'json' : 'pretty');
  if (raw === 'json' || raw === 'pretty') {
    return raw;
  }
  return 'pretty';
}

function formatPretty(entry: LogEntry): string {
  const bits = [`${entry.at} ${entry.level} [${entry.context}] ${entry.msg}`];
  if (entry.method !== null && entry.path !== null) {
    bits.push(`${entry.method} ${entry.path}`);
  }
  if (entry.status !== null) {
    bits.push(String(entry.status));
  }
  if (entry.ms !== null) {
    bits.push(`${entry.ms}ms`);
  }
  if (entry.operation !== null) {
    bits.push(`op=${entry.operation}`);
  }
  if (entry.requestId !== null) {
    bits.push(`rid=${entry.requestId}`);
  }
  return bits.join(' ');
}
