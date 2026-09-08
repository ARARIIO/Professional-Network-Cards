# Backend

NestJS 12, GraphQL (Apollo) + несколько REST-эндпоинтов.

Как поднять весь проект — в [корневом README](../README.md). Контракт API — в [docs/API.md](../docs/API.md). Схема GraphQL — [`src/graphql/schema.graphql`](src/graphql/schema.graphql); в development её же показывает GraphiQL: http://localhost:3000/graphql.

Локальные секреты — `backend/.env` (копия с [`.env.example`](.env.example), файл в git игнорируется). Прод: env на Render, не в репозитории; см. [docs/DEPLOY.md](../docs/DEPLOY.md).
