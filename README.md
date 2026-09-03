# Professional Network Cards

Веб-платформа цифровых визиток: регистрация, публичная карточка `/c/:slug`, контакты, QR, аналитика просмотров, CSV, фото в S3.

Стек: **TypeScript**, **NestJS**, **GraphQL**, **Prisma**, **CockroachDB**, **Docker**, **S3** (локально MinIO), **React 19**, **Vite**.

## Что нужно заранее

- Node.js 26+ (см. `.nvmrc`)
- npm
- Docker Desktop (для CockroachDB и MinIO)

## 1. Клонировать и зависимости

```bash
cd "Professional Network Cards"
cd backend && npm install && cd ..
cd frontend && npm install && cd ..
```

## 2. Переменные окружения

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

Для локального запуска значения из example уже подходят (Cockroach на `localhost:26257`, MinIO на `9000`, API на `3000`).

## 3. Поднять Docker: база и S3

В корне репозитория:

```bash
docker compose up -d db db-init minio minio-init
```

Дождись, пока `db` станет healthy (`docker compose ps`). Консоль Cockroach: http://localhost:8080  
Консоль MinIO: http://localhost:9001 (логин `minio`, пароль `miniosecret`).

Если контейнер `db` сразу падает — не указывай `--listen-addr=0.0.0.0` (Cockroach 26 в insecure-режиме это запрещает). В репозитории уже команда `start-single-node --insecure`.

## 4. Миграции Prisma и seed

Из каталога `backend/`:

```bash
cd backend
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
```

`prisma db seed` без npm может не найти `tsx`. Сид: `npm run prisma:seed`.

Демо-аккаунт:

| | |
|---|---|
| Email | `demo@pnc.local` |
| Пароль | `Demo12345!` |
| Публичная визитка | `/c/demo-user` |

Второй пользователь: `alex@pnc.local` / тот же пароль, slug `alex-ivanova`.

## 5. Запустить API

Всё ещё в `backend/`:

```bash
npm run start:dev
```

Проверка: http://localhost:3000/health → `{"status":"ok"}`  
GraphiQL: http://localhost:3000/graphql

## 6. Запустить фронтенд

В другом терминале:

```bash
cd frontend
npm run dev
```

Приложение: http://localhost:5173  

Войди демо-пользователем, открой редактор, дашборд, контакты, аналитику и публичную ссылку.

Фото визитки пишется в MinIO, в браузере отдаётся через API: `GET /storage/files/avatars/...`. После загрузки фото сохранится в карточке; если картинка не видна — перезапусти backend после смены `.env` и загрузи файл ещё раз.

## Полезные URL

| Что | Адрес |
|---|---|
| UI | http://localhost:5173 |
| API / GraphQL | http://localhost:3000/graphql |
| Health | http://localhost:3000/health |
| Cockroach DB console | http://localhost:8080 |
| MinIO console | http://localhost:9001 |

## Тесты и сборка

```bash
cd backend
npm run lint
npm test
npm run build

cd ../frontend
npm run lint
npm run build
```

E2E (`npm run test:e2e` в `backend/`) требуют живую Cockroach по `DATABASE_URL` и переменные S3 из `.env`.

## CI/CD

GitHub Actions, Node из `.nvmrc` (сейчас 26, `check-latest` берёт последний патч).

- **CI** (`.github/workflows/ci.yml`) — на PR и `main`: lint / unit-тесты / сборка backend и frontend, плюс сборка Docker-образов без публикации.
- **CD** (`.github/workflows/cd.yml`) — на пуш в `main` (и вручную): публикация `backend` и `frontend` в [GHCR](https://github.com/features/packages):
  `ghcr.io/<owner>/<repo>/backend:latest` и `.../frontend:latest` (также тег = git SHA).

Чтобы фронтенд-образ смотрел на прод API, задай в Settings → Variables: `VITE_GRAPHQL_URL`, `VITE_API_URL`. Без них в образ попадают localhost-значения из `.env.example`.

Пакет в GHCR должен быть доступен аккаунту репозитория (Settings → Actions → General → Workflow permissions: Read and write).

## Схема API (кратко)

- GraphQL — основной API (auth, карточка, контакты, аналитика).
- REST: `GET /cards/:slug` (публичный просмотр + запись просмотра), `POST /auth/refresh`, `GET /contacts/export`, `POST /storage/avatar` (JWT), `GET /storage/files/avatars/:userId/:name`.

JWT в httpOnly cookie, CORS только на origin фронтенда.

## Остановка

```bash
docker compose stop
```

Данные Cockroach и MinIO остаются в Docker volumes. Полный сброс: `docker compose down -v` — после этого снова шаги 3–4.
