# API

Продуктовый API — **GraphQL** (`POST /graphql`). Интерактивная документация: **GraphiQL** в development — [http://localhost:3000/graphql](http://localhost:3000/graphql). Схема: [`backend/src/graphql/schema.graphql`](../backend/src/graphql/schema.graphql).

Swagger / OpenAPI не используется: CRUD визиток, контактов и аналитики идёт через GraphQL, а не через REST. REST оставлен только для того, что GraphQL не покрывает (файл, CSV, refresh-cookie, публичный GET).

## Авторизация

После `register` / `login`:

- httpOnly cookies: `access_token` (24 ч), `refresh_token` (7 дней, `SameSite=Lax`);
- в ответе GraphQL поле `token` — тот же access JWT.

Фронт ходит с `credentials: include`. В GraphiQL после login добавь заголовок:

```http
Authorization: Bearer <token из login>
```

Или выполни `login` в GraphiQL в том же браузере — cookie тоже сядет на `localhost:3000`.

Публичные операции (без JWT): `register`, `login`, `getCard`, `recordCardView`. `me` без токена возвращает `null`, а не ошибку.

## GraphQL

### Query

| Операция | Auth | Описание |
|---|---|---|
| `me` | optional | Текущий пользователь или `null` |
| `myCard` | JWT | Своя визитка или `null` |
| `getCard(slug)` | optional | Публичная визитка; пишет просмотр (IP + user-agent) |
| `searchPublicCards(query, limit)` | JWT | Каталог чужих публичных визиток; просмотр не пишет |
| `myContacts(limit, offset)` | JWT | Сохранённые контакты |
| `incomingContactInvites` | JWT | Входящие заявки на сохранение вашей публичной визитки (`pending`) |
| `outgoingContactInvites` | JWT | Исходящие заявки |
| `cardAnalytics` | JWT | Счётчик, 7 дней, последние просмотры. Чужие просмотры не отдаются |

### Mutation

| Операция | Auth | Описание |
|---|---|---|
| `register` / `login` | no | Cookies + `token` |
| `logout` | JWT | Сброс cookies |
| `createCard` / `updateCard` / `deleteCard` | JWT | Своя визитка. Slug выдаёт сервер |
| `saveContact` / `deleteContact` | JWT | Ручной контакт / CSV. `sourceSlug` нельзя: чужую публичную визитку сохраняют через заявку |
| `sendContactInvite(sourceSlug)` | JWT | Запросить разрешение сохранить чужую публичную визитку |
| `respondContactInvite(id, accept)` | JWT | Принять или отклонить. При принятии контакты создаются; при отказе — нет |
| `recordCardView(cardId)` | optional | Просмотр по внутреннему `Card.id` (не slug) |

`PublicCard` без `id`, `slug`, `viewsCount`, `isPublic`. Пароль в GraphQL не возвращается.

### Пример: вход и своя карточка

```graphql
mutation Login($input: LoginInput!) {
  login(input: $input) {
    token
    user {
      id
      email
      name
    }
  }
}
```

Variables:

```json
{ "input": { "email": "demo@pnc.local", "password": "Demo12345!" } }
```

```graphql
query Mine {
  me { id email name contactsCount }
  myCard { id slug name email isPublic viewsCount savesCount }
}
```

```graphql
query Public {
  getCard(slug: "demo-user") {
    name
    role
    email
    skills
  }
}
```

## REST

База: `http://localhost:3000`. JSON-ответы публичной карточки обёрнуты в `{ "data": ... }`.

| Метод | Путь | Auth | Назначение |
|---|---|---|---|
| `GET` | `/health` | no | `{ "status": "ok" }` |
| `GET` | `/cards/:slug` | optional cookie | Публичная визитка + запись просмотра |
| `POST` | `/auth/refresh` | cookie `refresh_token` | Новый access/refresh |
| `GET` | `/contacts/export` | JWT | CSV, `contacts.csv` |
| `POST` | `/contacts/import` | JWT | JSON `{ "csv": "..." }` → `{ "imported": n }` |
| `POST` | `/storage/avatar` | JWT | `multipart/form-data` поле `file` (JPEG/PNG/WebP, до 50 МБ) → `{ "url": "..." }` |
| `GET` | `/storage/files/avatars/:userId/:name` | no | Файл аватара из S3 |

## Слои (backend)

`Resolver` / `Controller` → `Service` → `Repository` → Prisma. В резолверах Prisma нет.

CORS: только `FRONTEND_ORIGIN` (dev: `http://localhost:5173`), `credentials: true`.
