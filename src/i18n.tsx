// Minimal i18n for the admin panel. Keys ARE the English source strings, so an
// untranslated string gracefully renders its English original — no missing-key
// placeholders ever reach the UI. Russian overrides live in RU below.
//
// Interpolation stays in the components (e.g. `${t('up to date')} (v${v})`);
// this layer only maps a fixed phrase to its translation.

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

export type Lang = 'en' | 'ru';
const LANG_KEY = 'dotmage:lang';

// eslint-disable-next-line react-refresh/only-export-components
export function getLang(): Lang {
  const v = localStorage.getItem(LANG_KEY);
  if (v === 'ru' || v === 'en') return v;
  return navigator.language?.toLowerCase().startsWith('ru') ? 'ru' : 'en';
}

// English phrase → Russian. Anything absent falls back to the English key.
const RU: Record<string, string> = {
  // Navigation
  Apps: 'Приложения',
  Devices: 'Устройства',
  Users: 'Пользователи',
  Audit: 'Аудит',
  Settings: 'Настройки',
  Logout: 'Выйти',

  // Status strip
  server: 'сервер',
  auth: 'вход',
  authenticated: 'выполнен',
  encryption: 'шифрование',
  'this device': 'это устройство',

  // Settings — About
  version: 'версия',
  mode: 'режим',
  features: 'возможности',
  you: 'вы',

  // Settings — Updates
  Updates: 'Обновления',
  status: 'статус',
  'checking…': 'проверяю…',
  'update available:': 'доступно обновление:',
  '(major — migration needed)': '(мажорное — нужна миграция)',
  'up to date': 'актуальная версия',
  channel: 'канал',
  'follow dev channel (prereleases)': 'следить за dev-каналом (предрелизы)',
  'Upgrade the server by re-running the installer (idempotent; the pinned major rides patches and minors):':
    'Обновите сервер, перезапустив установщик (идемпотентно; закреплённый мажор подхватывает патчи и минорные версии):',
  'Release notes:': 'Список изменений:',

  // Settings — Interface (new)
  Interface: 'Интерфейс',
  language: 'язык',
  'interface scale': 'масштаб интерфейса',

  // Login
  'Pair this device': 'Привяжите это устройство',
  'dotMage has no password. You authorize this browser with a one-time login code from the CLI.':
    'В dotMage нет пароля. Браузер авторизуется одноразовым кодом входа из CLI.',
  '// login code': '// код входа',
  'paste the rest...': 'вставьте остаток...',
  'Login code expired or invalid. Run': 'Код входа истёк или неверен. Выполните',
  'again.': 'ещё раз.',
  Run: 'Выполните',
  'on any authenticated device. Copy the code it prints, paste it above. Server never sees your secrets -- only ciphertext.':
    'на любом авторизованном устройстве. Скопируйте выведенный код и вставьте его выше. Сервер не видит ваши секреты — только шифртекст.',
  'Verifying...': 'Проверяю...',
  'Verify device': 'Подтвердить устройство',
  'That login link expired or was already used. Run `dmage open` again.':
    'Ссылка для входа истекла или уже была использована. Выполните `dmage open` ещё раз.',

  // Shared
  'Loading...': 'Загрузка...',
  Cancel: 'Отмена',
  Done: 'Готово',
  Remove: 'Удалить',
  Revoke: 'Отозвать',
  active: 'активно',
  or: 'или',

  // Table headers
  App: 'Приложение',
  Environments: 'Окружения',
  Latest: 'Последняя',
  Updated: 'Обновлено',
  Name: 'Имя',
  Role: 'Роль',
  Status: 'Статус',
  Device: 'Устройство',
  'Last seen': 'Последняя активность',
  'Token expires': 'Токен истекает',
  Time: 'Время',
  Action: 'Действие',
  User: 'Пользователь',
  Env: 'Окружение',
  Rev: 'Ревизия',
  Created: 'Создано',
  Hash: 'Хеш',
  Note: 'Заметка',
  'Key gen': 'Поколение ключа',
  Joined: 'Присоединился',
  Expires: 'Истекает',

  // Status values (chips)
  revoked: 'отозвано',
  removed: 'удалён',
  pending: 'ожидает',

  // Apps
  Applications: 'Приложения',
  'filter apps...': 'фильтр приложений...',
  'No apps yet': 'Пока нет приложений',
  'Apps appear here the moment you push your first .env from any paired device. Start one from your project folder.':
    'Приложения появятся здесь, как только вы запушите первый .env с любого привязанного устройства. Начните из папки проекта.',
  'No matches': 'Ничего не найдено',
  'Nothing matches': 'Ничего не найдено по запросу',
  'Clear the filter to see all apps': 'Сбросьте фильтр, чтобы увидеть все приложения',

  // Devices
  'Add a device': 'Добавить устройство',
  'One-time token, expires in 15 min. On the new machine, install dmage and run:':
    'Одноразовый токен, действует 15 мин. На новой машине установите dmage и выполните:',
  'Web login link': 'Ссылка для входа в браузере',
  'One-time link, expires in 5 min. Open it in a browser to sign in:':
    'Одноразовая ссылка, действует 5 мин. Откройте её в браузере, чтобы войти:',
  'Could not create token': 'Не удалось создать токен',
  'Device revoked': 'Устройство отозвано',
  'can no longer sync': 'больше не может синхронизироваться',
  'No devices found': 'Устройства не найдены',
  'Pair a device by running dmage login on any machine.':
    'Привяжите устройство командой dmage login на любой машине.',
  'Adding a machine mints a one-time token; you finish with your master password on that machine — the browser never holds your key. A scoped CI token needs the key too, so mint it from the CLI:':
    'Добавление машины создаёт одноразовый токен; вход вы завершаете мастер-паролем на этой машине — браузер не хранит ваш ключ. Ограниченному CI-токену ключ тоже нужен, поэтому создавайте его из CLI:',
  'open the link': 'откройте ссылку',
  'in a new tab': 'в новой вкладке',
  'Revoke device': 'Отозвать устройство',
  'loses access immediately. Its token is invalidated server-side; future push / pull is rejected until it re-authenticates with a new token.':
    'теряет доступ немедленно. Его токен аннулируется на сервере; последующие push / pull отклоняются, пока устройство не пройдёт авторизацию заново с новым токеном.',

  // Users
  'Team mode is off on this server': 'Командный режим на этом сервере выключен',
  'This server runs with DOTMAGE_MODE=solo, so there is a single implicit owner and no user list. Enable team mode on the server to invite teammates.':
    'Сервер работает с DOTMAGE_MODE=solo, поэтому есть один неявный владелец, а списка пользователей нет. Включите командный режим на сервере, чтобы приглашать коллег.',
  'No users yet': 'Пока нет пользователей',
  'Invite a teammate with dmage user invite from an owner device.':
    'Пригласите коллегу командой dmage user invite с устройства владельца.',
  'Pending invitations': 'Ожидающие приглашения',
  'Remove user': 'Удалить пользователя',
  'loses access immediately: their key wraps are dropped and all their devices are revoked. Secrets they already pulled to disk are not recalled — rotate the account key if that matters.':
    'теряет доступ немедленно: его обёртки ключа удаляются, а все его устройства отзываются. Секреты, которые он уже выгрузил на диск, не отзываются — при необходимости смените ключ аккаунта.',
  'Role updated': 'Роль обновлена',
  'is now': 'теперь',
  'Could not change role': 'Не удалось изменить роль',
  'User removed': 'Пользователь удалён',
  'lost access; their devices are revoked': 'потерял доступ; его устройства отозваны',
  'Could not remove user': 'Не удалось удалить пользователя',

  // Audit
  'Audit log': 'Журнал аудита',
  'ALL APPS': 'ВСЕ ПРИЛОЖЕНИЯ',
  'No events yet': 'Пока нет событий',
  'Every auth, push, pull, rollback and device change is recorded here as soon as it happens.':
    'Каждый вход, push, pull, откат и изменение устройства фиксируется здесь сразу же.',

  // App detail
  REV: 'РЕВ',
  'Loading revisions...': 'Загрузка ревизий...',
  'No revisions in': 'Нет ревизий в',
  'This environment has no pushes yet. From a checkout with the right .env, run:':
    'В это окружение ещё ничего не пушили. Из рабочей копии с нужным .env выполните:',
  'rollback of': 'откат',
  'Secret values never appear here': 'Значения секретов здесь не показываются',
  'Revisions are encrypted on your devices before upload. The server stores only ciphertext + metadata and':
    'Ревизии шифруются на ваших устройствах перед загрузкой. Сервер хранит только шифртекст и метаданные и',
  'cannot decrypt them': 'не может их расшифровать',
  'To read values, decrypt locally:': 'Чтобы прочитать значения, расшифруйте локально:',

  // Update banner
  'Major update': 'Мажорное обновление',
  'available — review the migration notes before upgrading (the pinned major won’t update on its own).':
    'доступно — перед обновлением изучите заметки о миграции (закреплённый мажор сам не обновится).',
  'is available (you run': 'доступна (у вас',
  'release notes': 'заметки о релизе',
  Dismiss: 'Закрыть',

  // Command sidebar
  'Quick commands': 'Быстрые команды',
  Manage: 'Управление',
  Sync: 'Синхронизация',
  Admin: 'Админ',
  Execute: 'Запуск',

  // Copy
  'Copied to clipboard': 'Скопировано в буфер',
  'Failed to copy': 'Не удалось скопировать',
  'Click to copy': 'Нажмите, чтобы скопировать',
};

type I18n = { lang: Lang; setLang: (l: Lang) => void; t: (key: string) => string };

const Ctx = createContext<I18n>({ lang: 'en', setLang: () => {}, t: (k) => k });

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(getLang);

  const setLang = useCallback((l: Lang) => {
    localStorage.setItem(LANG_KEY, l);
    document.documentElement.lang = l;
    setLangState(l);
  }, []);

  const t = useCallback((key: string) => (lang === 'ru' ? RU[key] ?? key : key), [lang]);

  return <Ctx.Provider value={{ lang, setLang, t }}>{children}</Ctx.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useI18n(): I18n {
  return useContext(Ctx);
}
