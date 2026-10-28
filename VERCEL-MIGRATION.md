# ТОЧКА — перенос на Vercel

Ветка `vercel-migration` содержит существующий сайт (`public/`) и функции (`api/`) для Vercel. Она использует прежнюю базу Supabase и не переносит пользовательские данные.

Настройка проекта: импорт `sergomar1989-cmd/tochka-messenger` в Vercel, Production Branch = `vercel-migration`, Framework Preset = Other, Output Directory = `public`. Команду сборки можно оставить автоматической (`npm install` уже запускает postinstall). Не включать публичные секреты в код.

Добавить в Production Environment Variables на Vercel (значения берутся из существующего Cloudflare проекта, не из GitHub):
- `VAPID_PUBLIC_KEY` — text
- `VAPID_PRIVATE_KEY` — secret
- `VAPID_SUBJECT` — text
- `SUPABASE_SERVICE_ROLE_KEY` — secret

После деплоя проверить: `/`, `/api/push-config`, регистрацию, вход, чтение/отправку сообщений, создание приглашений, переключатель уведомлений и push с двух устройств. Добавить новый адрес в Supabase Authentication -> URL Configuration -> Redirect URLs. Указать новый адрес Site URL только после успешного тестирования входа и регистрации. Старый адрес не удалять до подтверждения работы нового.

Важно: разрешения уведомлений привязаны к origin; пользователи должны заново подтвердить их на новом домене. При переносе не гарантируется доступность без VPN у каждого провайдера — проверить на сети сотрудника до переключения всех пользователей.
