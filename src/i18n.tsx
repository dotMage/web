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
