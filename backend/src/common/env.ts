export function env(name: string): string {
  const value = process.env[name];
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`Missing required environment variable ${name}`);
  }
  return value;
}

export function envOr(name: string, fallback: string): string {
  const value = process.env[name];
  if (typeof value !== 'string' || value.length === 0) {
    return fallback;
  }
  return value;
}
