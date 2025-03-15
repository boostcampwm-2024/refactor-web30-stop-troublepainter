import { SHORTCUT_KEYS } from '@/constants/shortcutKeys';

export type ShortcutKey = (typeof SHORTCUT_KEYS)[keyof typeof SHORTCUT_KEYS]['key'];
