#!/bin/sh
set -eu
base="${1:-}"
if [ -z "$base" ]; then
  echo "usage: scripts/smoke-prod.sh https://your-app.vercel.app" >&2
  exit 1
fi
base="${base%/}"

echo "1. Checking Render health..."
health="$(curl -sS "$base/health")"
echo "$health"
case "$health" in
  *'"status":"ok"'*) ;;
  *)
    echo "health check failed (Render may still be waking)" >&2
    exit 1
    ;;
esac

echo "2. Checking GraphQL endpoint..."
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

echo "3. Checking SPA client routes (must return index.html, not NestJS 404)..."
for route in "/" "/auth" "/dashboard" "/card/edit" "/contacts" "/analytics" "/profile" "/c/demo-user"; do
  body="$(curl -sS "$base$route")"
  case "$body" in
    *"Cannot GET"*)
      echo "FAIL: $route returned NestJS 404 error instead of SPA!" >&2
      exit 1
      ;;
    *"<div id=\"root\">"*|*"<!doctype html>"*|*"<!DOCTYPE html>"*)
      echo "ok: $route"
      ;;
    *)
      echo "FAIL: $route returned unexpected response (not SPA index.html)" >&2
      exit 1
      ;;
  esac
done

echo
echo "All smoke checks passed successfully!"
