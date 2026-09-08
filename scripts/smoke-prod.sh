#!/bin/sh
set -eu
base="${1:-}"
if [ -z "$base" ]; then
  echo "usage: scripts/smoke-prod.sh https://your-app.vercel.app" >&2
  exit 1
fi
base="${base%/}"
health="$(curl -sS "$base/health")"
echo "$health"
case "$health" in
  *'"status":"ok"'*) ;;
  *)
    echo "health check failed (Render may still be waking)" >&2
    exit 1
    ;;
esac
curl -sS -o /tmp/pnc-smoke.json -w "%{http_code}" \
  -X POST "$base/graphql" \
  -H "content-type: application/json" \
  -d '{"query":"{ me { id } }"}' >/tmp/pnc-smoke.status
echo
cat /tmp/pnc-smoke.json
echo
status="$(cat /tmp/pnc-smoke.status)"
if [ "$status" != "200" ]; then
  echo "graphql HTTP $status" >&2
  exit 1
fi
echo "smoke ok"
