# Деплой: Vercel + Render + Cockroach Cloud + R2

Бесплатный контур для демо: фронт на Vercel (тот же origin, cookie `SameSite=Lax`), API на Render, база CockroachDB Cloud, файлы Cloudflare R2.

Локальный Docker (Cockroach + MinIO) для разработки не трогайте.

## Текущий демо-контур

| Что | URL |
|---|---|
| Фронт | https://professional-network-cards-arari-projects.vercel.app |
| API | https://pnc-api.onrender.com |
| Health | https://pnc-api.onrender.com/health → `{"status":"ok"}` |

`FRONTEND_ORIGIN` и база `S3_PUBLIC_URL` (`…/storage/files`) — этот Vercel-хост. Если имя Render-сервиса не `pnc-api`, поправьте host в [`frontend/vercel.json`](../frontend/vercel.json).

## Секреты: что куда класть

Живые ключи, connection string, JWT и S3 **не коммитить**. В репозитории только шаблоны ([`backend/.env.example`](../backend/.env.example), [`frontend/.env.example`](../frontend/.env.example)) и имена переменных в [`render.yaml`](../render.yaml) (`sync: false` / `generateValue`).

Корень [`.gitignore`](../.gitignore) отсекает `.env`, `.env.*` (кроме `*.example`), `mcp.json`, сертификаты, SSH-ключи, `.dev.vars`, Wrangler.

| Где | Что хранить |
|---|---|
| Render → Environment | `DATABASE_URL`, `JWT_*`, `S3_*`, `FRONTEND_ORIGIN` |
| Cloudflare R2 | Access Key / Secret токена (показывают один раз) |
| Cockroach Cloud | SQL-пароль пользователя |
| `backend/.env` / `frontend/.env` | только локальная машина |
| `~/.cursor/mcp.json` | API-ключи плагинов (вне репозитория) |

Не кладите в git и в чаты прод-значения. Токен Cloudflare `cfat_…` приложению **не нужен** — Nest ходит в R2 по S3 Access Key / Secret.

## 1. CockroachDB Cloud

1. Аккаунт: https://www.cockroachlabs.com/get-started-cockroachdb/
2. Кластер **Serverless / Basic (free)**.
3. База `pnc_db` (`CREATE DATABASE IF NOT EXISTS pnc_db;`).
4. Connection string → `DATABASE_URL` **только** в Render.
5. SSL: в кабинете часто `sslmode=verify-full` + CA. На Render (Alpine) обычно хватает `sslmode=require`. Локальный `~/.postgresql/root.crt` на dyno не копируется.

## 2. Cloudflare R2 (S3)

1. R2 → бакет, например `pnc-cards`.
2. Overview → **Manage** у API Tokens → User или Account token, **Object Read & Write**, скоуп на этот бакет.
3. Endpoint: `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.
4. На Render:

| Переменная | Значение |
|---|---|
| `S3_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `S3_REGION` | `auto` |
| `S3_ACCESS_KEY` | Access Key ID |
| `S3_SECRET_KEY` | Secret Access Key |
| `S3_BUCKET` | `pnc-cards` |
| `S3_PUBLIC_URL` | `https://<vercel-домен>/storage/files` |

Браузер в R2 не ходит: `GET /storage/files/...` на API, Vercel проксирует на Render.

Плагин Cursor **Cloudflare** создаёт бакет; S3-ключи всё равно из кабинета (Bindings MCP токен не выдаёт). Render MCP/API S3 не создаёт.

## 3. Render (API)

Имя сервиса: **`pnc-api`**. Blueprint: [`render.yaml`](../render.yaml). Docker: [`backend/Dockerfile`](../backend/Dockerfile), контекст `backend/`, health `/health`. Старт: `prisma migrate deploy`, затем Nest.

Слушайте **`PORT` от Render** (часто `10000`). Не фиксируйте `PORT=3000`, если платформа подставляет свой. Bind: `0.0.0.0`.

Env (не копировать из `.env.example` в прод):

| Переменная | Значение |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Cockroach Cloud |
| `JWT_SECRET` | длинная случайная строка |
| `JWT_REFRESH_SECRET` | другая случайная строка |
| `FRONTEND_ORIGIN` | `https://<проект>.vercel.app` без `/` в конце |
| `S3_*` | таблица R2 |
| `LOG_LEVEL` | `info` |
| `LOG_FORMAT` | `json` |

Free: первый запрос после простоя ~минута. Проверка: `https://pnc-api.onrender.com/health`.

Миграции при каждом старте контейнера. Сид на Cloud **сам не бежит**. Один раз с локальной машины (пишет в Cloud) или регистрация на проде:

```bash
cd backend
DATABASE_URL='<cloud>' npm run prisma:seed
```

`DATABASE_URL` в эту команду не коммитьте и не оставляйте в истории shell, если строка с паролем.

## 4. Vercel (фронт)

1. Import репозитория. **Root Directory:** `frontend`. Node 24 (`frontend/package.json` `engines`).
2. Env для production можно не задавать: GraphQL = `/graphql`, REST = тот же origin ([`frontend/src/constants.ts`](../frontend/src/constants.ts)).
3. Другой host API → все `destination` в [`frontend/vercel.json`](../frontend/vercel.json) и новый деплой фронта.

Превью-ветки Vercel CORS не пустит, пока origin ≠ `FRONTEND_ORIGIN`.

## 5. Проверка после деплоя

1. Сайт на Vercel, прогрев Render.
2. Регистрация → дашборд → редактор (фото в R2) → `/c/:slug`, `.vcf`.
3. Второй аккаунт: «Предложить» → принять заявку.

```bash
chmod +x scripts/smoke-prod.sh
./scripts/smoke-prod.sh https://professional-network-cards-arari-projects.vercel.app
```

Ожидание: `/health` → `ok`, `POST /graphql { me { id } }` → `me: null` (200).

Логин «не держится»: `FRONTEND_ORIGIN`, HTTPS, запросы на хост Vercel (`/graphql`), не напрямую на `onrender.com`.

## Локальная имитация прокси

Vite проксирует `/graphql`, `/auth`, `/cards`, `/storage`, `/contacts`, `/health` на `localhost:3000`. Как на Vercel — в **локальном** `frontend/.env` (файл в git не попадает):

```
VITE_GRAPHQL_URL=/graphql
VITE_API_URL=
```
