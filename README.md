# Comments SPA — Backend

Backend часть SPA-приложения для комментариев с вложенными ответами. Реализована на NestJS, TypeScript, Sequelize и PostgreSQL.

## API host url

- base URL - [https://products-api-1kn6.onrender.com]

## Возможности

- Создание комментариев и ответов любой глубины вложенности.
- Хранение пользователей, комментариев и файловых вложений в PostgreSQL.
- Получение корневых комментариев вместе с деревом ответов.
- Пагинация корневых комментариев — по 25 записей на страницу.
- Сортировка по имени пользователя, email и дате создания; направления `ASC` и `DESC`.
- CAPTCHA: генерация изображения, проверка ответа, срок действия 5 минут и одноразовое использование.
- Загрузка файлов:
  - изображения JPG, PNG и GIF;
  - текстовые файлы TXT;
  - изображения пропорционально уменьшаются до максимального размера 320×240;
  - размер TXT — не более 100 KB.
- Проверка и очистка HTML в тексте комментария. Разрешённые теги: `a`, `code`, `i`, `strong`.
- Валидация входных данных на сервере.
- WebSocket-уведомление о создании нового комментария.
- Swagger UI для просмотра и ручного тестирования API.

## Технологии

- Node.js
- NestJS
- TypeScript
- PostgreSQL
- Sequelize / sequelize-typescript
- class-validator / class-transformer
- Swagger (`@nestjs/swagger`)
- WebSocket через `@nestjs/platform-ws`
- Multer и Sharp для загрузки и обработки файлов
- `sanitize-html` и `htmlparser2` для обработки HTML
- `svg-captcha` для CAPTCHA

## Структура данных

В базе используются три основные таблицы:

### `users`

Хранит данные автора комментария:

- `id`
- `username`
- `email`
- `homepage`
- `createdAt`
- `updatedAt`

### `comments`

Хранит комментарии и ответы:

- `id`
- `userId` — автор комментария;
- `parentId` — родительский комментарий; `NULL` для корневого комментария;
- `text`
- `createdAt`
- `updatedAt`

Связь `comments.parentId → comments.id` позволяет строить вложенные ответы любой глубины.

### `attachments`

Хранит метаданные прикреплённых файлов:

- `id`
- `commentId`
- `originalName`
- `filename`
- `mimeType`
- `size`
- `path`

ER-диаграмма модели базы данных находится в файле `comments_spa.mwb`. PostgreSQL остаётся основной СУБД проекта; файл `.mwb` подготовлен для визуализации структуры в MySQL Workbench.

## Установка и запуск

### 1. Клонирование репозитория

```bash
git clone <https://github.com/YevheniiZinych/comments-api.git>
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Set up your local PostgreSQL database

- Create a new database (e.g. `comments`)

### 4. Настройка переменных окружения

Создайте `.env` на основе используемого в проекте файла конфигурации.

   - POSTGRES_HOST=localhost
   - POSTGRES_PORT=yourpotr
   - POSTGRES_USER=youruser
   - POSTGRES_PASSWORD=yourpassword
   - POSTGRES_DB=yourdbname

В `.env` должны быть заданы параметры приложения и подключения к PostgreSQL. Названия переменных необходимо сверить с `src/config/configuration.ts` и `src/config/validation.ts`.

### 5. Запуск PostgreSQL

Запустите PostgreSQL через Docker Compose, `docker-compose.yml` включён в репозиторий:

```bash
docker compose up -d
```

Проверьте, что контейнер PostgreSQL запущен и параметры подключения в `.env` соответствуют настройкам контейнера.

### 6. Запуск backend

Запуск проекта в режиме разработки

```bash
npm run dev
```

## API

Глобальный префикс API: `/api`.

| Метод | Endpoint | Назначение |
|---|---|---|
| `GET` | `/api/captcha` | Сгенерировать CAPTCHA |
| `GET` | `/api/comments` | Получить корневые комментарии с ответами |
| `POST` | `/api/comments` | Создать комментарий или ответ; запрос `multipart/form-data`, файл передаётся в поле `file` |
| `GET` | `/api/uploads/:id` | Получить загруженный файл |

### Получение комментариев

Пример запроса:

```http
GET /api/comments?page=1&sortBy=createdAt&order=DESC
```

Параметры:

| Параметр | Значения | По умолчанию |
|---|---|---|
| `page` | целое число от 1 | `1` |
| `sortBy` | `username`, `email`, `createdAt` | `createdAt` |
| `order` | `ASC`, `DESC` | `DESC` |

На каждой странице возвращается до 25 корневых комментариев. Ответы включаются во вложенную структуру комментария и не занимают отдельные места в пагинации.

Пример общей формы ответа:

```json
{
  "data": [
    {
      "id": "comment-uuid",
      "userId": "user-uuid",
      "parentId": null,
      "text": "Comment text",
      "createdAt": "2026-01-01T10:00:00.000Z",
      "updatedAt": "2026-01-01T10:00:00.000Z",
      "author": {
        "id": "user-uuid",
        "username": "Alex01",
        "email": "alex@example.com",
        "homepage": "https://example.com"
      },
      "replies": [],
      "attachments": []
    }
  ],
  "meta": {
    "total": 1,
    "page": 1,
    "limit": 25,
    "totalPages": 1
  }
}
```

### CAPTCHA

Сначала запросите CAPTCHA:

```http
GET /api/captcha
```

Ответ содержит `captchaId` и изображение в формате Data URL. При создании комментария передайте `captchaId` и введённый пользователем `captchaText`.

### Создание комментария

`POST /api/comments` принимает `multipart/form-data`.

Основные поля:

- `username` — обязательное имя пользователя; латинские буквы и цифры;
- `email` — обязательный email;
- `homepage` — необязательный URL;
- `text` — обязательный текст комментария;
- `captchaId` и `captchaText` — данные CAPTCHA;
- `parentId` — необязательный UUID родительского комментария для ответа;
- `file` — необязательное вложение.

Точные ограничения и сообщения валидации определяются DTO и сервисами backend.

### Получение файла

```http
GET /api/uploads/:id
```

Файл ищется по ID записи в таблице `attachments` и возвращается как поток.

## Swagger

После запуска backend откройте:

```text
http://localhost:<APP_PORT>/api/docs
```

Замените `<APP_PORT>` на порт, заданный в `.env`.

Swagger позволяет просматривать схемы запросов и ответов и выполнять API-запросы из браузера.

## WebSocket

Backend использует WebSocket для отправки события после успешного создания комментария. Клиент может использовать это событие для обновления списка комментариев без ручного обновления страницы.

Адрес подключения и название события следует сверять с реализацией `EventsGateway` в `src/modules/events`.

