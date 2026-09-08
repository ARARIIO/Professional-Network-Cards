# Деплой: Vercel + Render + Cockroach Cloud + R2

Бесплатный контур для демо: фронт на Vercel (тот же origin, cookie `SameSite=Lax`), API на Render, база CockroachDB Cloud, файлы Cloudflare R2.

Локальный Docker не трогайте.

## 1. CockroachDB Cloud

1. Заведите аккаунт: https://www.cockroachlabs.com/get-started-cockroachdb/
2. Создайте **Serverless / Basic (free)** кластер.
3. Создайте базу `pnc_db` (SQL: `CREATE DATABASE IF NOT EXISTS pnc_db;`).
4. Скопируйте connection string. Обычно нужен `sslmode=verify-full` и CA из кабинета Cloud.
5. Строку целиком положите в `DATABASE_URL` на Render. Не коммитьте её в git.

## 2. Cloudflare R2 (S3)

1. Cloudflare Dashboard → R2 → Create bucket, например `pnc-cards`.
2. Manage R2 API Tokens → Create API token (Object Read & Write на этот бакет).
3. Endpoint вида `https://<ACCOUNT_ID>.r2.cloudflarestorage.com`.
4. На Render:

| Переменная | Значение |
|---|---|
| `S3_ENDPOINT` | `https://<ACCOUNT_ID>.r2.cloudflarestorage.com` |
| `S3_REGION` | `auto` |
| `S3_ACCESS_KEY` | Access Key ID токена |
| `S3_SECRET_KEY` | Secret Access Key |
| `S3_BUCKET` | `pnc-cards` |
| `S3_PUBLIC_URL` | `https://<ваш-vercel-домен>/storage/files` |

Браузер не ходит в R2 напрямую: API отдаёт `GET /storage/files/...`, Vercel проксирует на Render.

## 3. Render (API)

Имя сервиса должно быть **`pnc-api`**, иначе поправьте host в [`frontend/vercel.json`](../frontend/vercel.json) (сейчас `https://pnc-api.onrender.com`).

1. New → Blueprint или Web Service из этого Git-репозитория. Файл [`render.yaml`](../render.yaml): Docker [`backend/Dockerfile`](../backend/Dockerfile), health `/health`.
2. Контекст Docker: `backend/`. Старт: `prisma migrate deploy`, затем Nest.
3. Env (секреты не из `.env.example`):

| Переменная | Значение |
|---|---|
| `NODE_ENV` | `production` |
| `PORT` | `3000` |
| `DATABASE_URL` | строка Cockroach Cloud |
| `JWT_SECRET` | длинная случайная строка |
| `JWT_REFRESH_SECRET` | другая длинная случайная строка |
| `FRONTEND_ORIGIN` | `https://<проект>.vercel.app` (без слэша в конце) |
| `S3_*` | см. таблицу R2 |
| `LOG_LEVEL` | `info` |
| `LOG_FORMAT` | `json` |

4. Дождитесь Deploy. Первый запрос на free-тарифе может идти ~минуту (холодный старт).
5. Проверка: `https://pnc-api.onrender.com/health` → `{"status":"ok"}`.

Миграции применяются при каждом старте контейнера. Сид на Cloud **не** гоняется сам. Один раз с локальной машины (осторожно, пишет в Cloud):

```bash
cd backend
DATABASE_URL='<cloud>' npm run prisma:seed
```

Либо зарегистрируйтесь на проде вручную.

## 4. Vercel (фронт)

1. Import репозитория. **Root Directory:** `frontend`.
2. Env можно не задавать: в production сборке GraphQL = `/graphql`, REST = тот же origin ([`frontend/src/constants.ts`](../frontend/src/constants.ts)).
3. Если Render URL не `https://pnc-api.onrender.com`, замените все destination в [`frontend/vercel.json`](../frontend/vercel.json) и задеплойте фронт снова.
4. После первого URL Vercel пропишите его в `FRONTEND_ORIGIN` на Render и задеплойте API ещё раз.

Превью-ветки Vercel (`*.vercel.app` другие) CORS не пустит, пока origin не совпадёт с `FRONTEND_ORIGIN`.

## 5. Проверка после деплоя

1. Откройте сайт на Vercel, подождите прогрева Render.
2. Регистрация → дашборд.
3. Редактор: создать визитку, загрузить фото.
4. Публичная `/c/:slug`, скачать `.vcf`.
5. Второй аккаунт: найти визитку → «Предложить» → в первом аккаунте принять.
6. Контакты и аналитика не пустые.

Быстрая проверка прокси (после прогрева Render):

```bash
chmod +x scripts/smoke-prod.sh
./scripts/smoke-prod.sh https://your-app.vercel.app
```

Ожидание: `/health` → `ok`, `POST /graphql { me { id } }` → `me: null` (200).

Если логин «не держится»: проверьте `FRONTEND_ORIGIN`, HTTPS, что запросы идут на тот же хост Vercel (`/graphql`, не прямой `onrender.com`).

## Локальная имитация прокси

Vite проксирует `/graphql`, `/auth`, `/cards`, `/storage`, `/contacts`, `/health` на `localhost:3000`. Чтобы ходить как на Vercel:

```
VITE_GRAPHQL_URL=/graphql
VITE_API_URL=
```

в `frontend/.env` (не коммитьте, если ломает привычный localhost).
