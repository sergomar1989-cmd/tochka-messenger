# ТОЧКА

Мессенджер сотрудников. Сайт: `public/index.html`; прокси Supabase: `netlify/functions/gateway.mjs`.

В Netlify подключите этот GitHub-репозиторий; Build command оставьте пустым, Publish directory: `public`.

Проверка API: `/.netlify/functions/gateway?path=%2Fauth%2Fv1%2Fhealth`.

Проверить без VPN регистрацию, вход, сообщения и приглашения. Push при закрытом браузере ещё не реализован.
