# SpecToRent

Платформа для аренды оборудования, связывающая владельцев техники с арендаторами.

## Структура проекта

```
SpecToRent/
├── backend/          # Spring Boot REST API (Java 17, Maven)
├── frontend/         # React + TypeScript + Vite
├── database/         # SQL скрипты для инициализации базы данных
│   ├── init.sql      # Схема базы данных
│   └── sample-data.sql # Тестовые данные
├── docs/             # Документация по тестированию
│   ├── mind_map_str.drawio
│   ├── test-cases.csv
│   └── Результаты_запусков_тестов.docx
└── README.md
```

## Запуск с помощью Docker

Самый простой способ запустить весь проект одной командой — использовать Docker Compose.

### Запуск

```bash
docker compose up --build
```

Эта команда автоматически:
- Поднимет базу данных PostgreSQL и выполнит `database/init.sql`
- Соберёт и запустит backend (Spring Boot)
- Соберёт и запустит frontend (Nginx + React)

После запуска приложение доступно по адресу **http://localhost** (порт 80).

### Остановка

```bash
docker compose down
```

Чтобы также удалить тома с данными (база данных, загруженные файлы):

```bash
docker compose down -v
```

---

## Инструменты и технологии

Перед запуском проекта локально установите следующие компоненты:

1. **Java 17** (JDK) — https://www.oracle.com/java/technologies/javase/jdk17-archive-downloads.html
2. **Maven 3.9+** — https://maven.apache.org/docs/3.9.0/release-notes.html
3. **Node.js 20+** — https://nodejs.org/en/download
4. **PostgreSQL 14+** — https://www.postgresql.org/download/

## Локальная настройка

### Шаг 1: Создание базы данных

```bash
# Подключение к PostgreSQL
psql -U postgres

# Создание базы данных
CREATE DATABASE spectorrent;

# Подключение к новой базе данных
\c spectorrent

# Запуск скрипта инициализации
\i database/init.sql

# (Опционально) Загрузка тестовых данных
\i database/sample-data.sql

# Выход
\q
```

### Шаг 2: Настройка backend

Backend читает учётные данные базы данных из переменных окружения. Установите их перед запуском:

**Linux/macOS:**
```bash
export PGHOST=localhost
export PGPORT=5432
export PGDATABASE=spectorrent
export PGUSER=postgres
export PGPASSWORD=your_password
```

**Windows (PowerShell):**
```powershell
$env:PGHOST="localhost"
$env:PGPORT="5432"
$env:PGDATABASE="spectorrent"
$env:PGUSER="postgres"
$env:PGPASSWORD="your_password"
```

Или отредактируйте `backend/src/main/resources/application.yml` напрямую:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/spectorrent
    username: postgres
    password: your_password
```

### Шаг 3: Запуск backend

```bash
cd backend
mvn spring-boot:run
```

Backend запускается на **http://localhost:8080**.

### Шаг 4: Установка зависимостей frontend

```bash
cd frontend
npm install
```

### Шаг 5: Запуск frontend

```bash
cd frontend
npm run dev
```

Frontend запускается на **http://localhost:5000**.

Откройте **http://localhost:5000** в браузере.

## Технологический стек

| Компонент | Технология |
|-----------|-----------|
| Backend   | Java 17, Spring Boot 3.3, Spring Data JPA, Maven |
| Frontend  | React 18, TypeScript, Vite 5, Tailwind CSS |
| База данных | PostgreSQL 14+ |
| WebSocket | STOMP over SockJS |
| Документы | Apache POI (генерация договоров Word) |

## API эндпоинты

| Метод | Эндпоинт | Описание |
|-------|----------|----------|
| POST   | /api/users/register | Регистрация пользователя |
| POST   | /api/users/login | Аутентификация пользователя |
| PATCH  | /api/users/{id} | Обновление профиля пользователя |
| GET    | /api/items | Список всего оборудования |
| GET    | /api/items/{id} | Получить детали оборудования |
| POST   | /api/items | Создать объявление об оборудовании |
| DELETE | /api/items/{id} | Удалить объявление |
| GET    | /api/requests | Список заявок на аренду |
| POST   | /api/requests | Создать заявку на аренду |
| PATCH  | /api/requests/{id}/status | Обновить статус заявки |
| POST   | /api/upload | Загрузить изображение |
| GET    | /api/chat/{roomId}/messages | Получить историю чата |
| GET    | /api/requests/{id}/contract | Скачать договор аренды (Word) |

## Роли пользователей

- **OWNER** — может размещать оборудование, управлять заявками, одобрять/отклонять аренду
- **RENTER** — может просматривать оборудование, отправлять заявки на аренду, общаться с владельцами

## Запуск тестов

**Тесты frontend:**
```bash
cd frontend
npm test
```

**Тесты backend:**
```bash
cd backend
mvn test
```

## Тестовые учётные данные

Если вы загрузили `sample-data.sql`:
- Владелец: `user2@user2.ru` / `user2`
- Арендатор: `user1@user1.ru` / `user1`
#
