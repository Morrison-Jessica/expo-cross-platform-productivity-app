import { colorScheme } from 'nativewind';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

export type Settings = { userName: string; theme: 'light' | 'dark' };
const defaultSettings: Settings = { userName: '', theme: 'light' };
const storageKey = 'productivity_settings';

async function readSettings(): Promise<Settings> {
  const value = Platform.OS === 'web'
    ? window.localStorage.getItem(storageKey)
    : await (await import('expo-secure-store')).getItemAsync(storageKey);
  if (value === null) return defaultSettings;
  const settings = JSON.parse(value);
  if (!settings || typeof settings.userName !== 'string' ||
      (settings.theme !== 'light' && settings.theme !== 'dark')) {
    throw new Error('Saved settings could not be read. Please save your preferences again.');
  }
  return { userName: settings.userName, theme: settings.theme };
}

async function writeSettings(settings: Settings) {
  const value = JSON.stringify(settings);
  if (Platform.OS === 'web') {
    window.localStorage.setItem(storageKey, value);
  } else {
    await (await import('expo-secure-store')).setItemAsync(storageKey, value);
  }
}

const SettingsContext = createContext<{
  settings: Settings;
  ready: boolean;
  loadError: string | null;
  saveSettings: (settings: Settings) => Promise<void>;
} | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const saving = useRef(false);

  useEffect(() => {
    let active = true;
    async function restoreSettings() {
      try {
        colorScheme.set('light');
        const saved = await readSettings();
        if (active) {
          colorScheme.set(saved.theme);
          setSettings(saved);
        }
      } catch (error) {
        if (active) setLoadError(`Could not load settings: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        if (active) setReady(true);
      }
    }
    void restoreSettings();
    return () => { active = false; };
  }, []);

  async function saveSettings(next: Settings) {
    if (!ready || saving.current) throw new Error('Please wait and try again.');
    saving.current = true;
    try {
      const saved = { ...next, userName: next.userName.trim() };
      await writeSettings(saved);
      colorScheme.set(saved.theme);
      setSettings(saved);
      setLoadError(null);
    } finally {
      saving.current = false;
    }
  }

  return (
    <SettingsContext.Provider value={{ settings, ready, loadError, saveSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('SettingsProvider is required.');
  return context;
}
