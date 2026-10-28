# ТОЧКА

Мессенджер сотрудников. Сайт: `public/index.html`; прокси Supabase: `netlify/functions/gateway.mjs`.

В Netlify подключите этот GitHub-репозиторий; Build command оставьте пустым, Publish directory: `public`.

Проверка API: `/.netlify/functions/gateway?path=%2Fauth%2Fv1%2Fhealth`.

Проверить без VPN регистрацию, вход, сообщения и приглашения. Push при закрытом браузере ещё не реализован.

## Vercel (тестовый перенос)

Ветка `vercel-migration-preview` содержит совместимый с Vercel API: `api/gateway.mjs`.
В проекте Vercel задайте Framework Preset: Other, Root Directory: корень репозитория,
Build Command: пусто, Output Directory: `public`. Файл `vercel.json` уже задаёт
`outputDirectory` и перенаправляет старый маршрут
`/.netlify/functions/gateway` на `/api/gateway`.

Проверка после деплоя:
1. Открывается главная страница.
2. `/.netlify/functions/gateway?path=%2Fauth%2Fv1%2Fhealth` отвечает через прокси без 404.
3. Успешно работают вход и регистрация.
4. Проверить отправку и чтение сообщений двумя тестовыми пользователями.
5. Проверить создание команды и приглашение сотрудника.

Netlify не затрагивается. **Не переключайте действующий домен**, пока не проверены
все сценарии. Push при закрытом браузере не реализован: текущие уведомления
работают только при открытой странице и выданном разрешении браузера.
