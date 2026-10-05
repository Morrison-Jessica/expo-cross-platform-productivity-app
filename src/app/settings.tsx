import { useFocusEffect } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { useCallback, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useSettings, type Settings } from '@/settings';

export default function SettingsScreen() {
  const { settings, ready, loadError, saveSettings } = useSettings();
  const { colorScheme } = useColorScheme();
  const [userName, setUserName] = useState('');
  const [theme, setTheme] = useState<Settings['theme']>('light');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const saveInProgress = useRef(false);

  useFocusEffect(useCallback(() => {
    if (ready) {
      setUserName(settings.userName);
      setTheme(settings.theme);
    }
  }, [ready, settings]));

  async function save() {
    if (!ready || saveInProgress.current) return;
    saveInProgress.current = true;
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      await saveSettings({ userName, theme });
      setMessage('Settings saved.');
    } catch (error) {
      setError(`Could not save settings: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      saveInProgress.current = false;
      setSaving(false);
    }
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerClassName="p-6 pb-12" keyboardShouldPersistTaps="handled">
            <View className="mx-auto w-full max-w-2xl gap-6">
              <View className="gap-2">
                <Text accessibilityRole="header" className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  Settings
                </Text>
                <Text className="text-base text-slate-600 dark:text-slate-300">Save to apply your name and theme.</Text>
              </View>
              {!ready && <Text className="text-base text-slate-600 dark:text-slate-300">Loading settings…</Text>}
              {loadError && <Text accessibilityRole="alert" className="text-base text-red-700 dark:text-red-300">{loadError}</Text>}
              <View className="gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <View className="gap-2">
                  <Text className="text-base font-semibold text-slate-900 dark:text-slate-100">User name</Text>
                  <TextInput
                    accessibilityLabel="User name"
                    className="min-h-12 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-3 py-3 text-base text-slate-900 dark:text-slate-100"
                    placeholder="Your name"
                    placeholderTextColor={colorScheme === 'dark' ? '#94a3b8' : '#64748b'}
                    keyboardAppearance={colorScheme === 'dark' ? 'dark' : 'light'}
                    value={userName}
                    onChangeText={(value) => { setUserName(value); setMessage(null); setError(null); }}
                    autoCapitalize="words"
                    maxLength={100}
                    editable={ready && !saving}
                  />
                </View>
                <Text className="text-base font-semibold text-slate-900 dark:text-slate-100">Theme</Text>
                <View accessibilityRole="radiogroup" accessibilityLabel="Theme preference" className="flex-row flex-wrap gap-2">
                  {(['light', 'dark'] as const).map((option) => (
                    <Pressable
                      key={option}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: theme === option, disabled: !ready || saving }}
                      disabled={!ready || saving}
                      onPress={() => { setTheme(option); setMessage(null); setError(null); }}
                      className={theme === option
                        ? 'min-h-12 justify-center rounded-lg bg-blue-700 px-4 py-3'
                        : 'min-h-12 justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3'}>
                      <Text className={theme === option ? 'text-base font-semibold text-white' : 'text-base text-slate-700 dark:text-slate-200'}>
                        {option === 'light' ? 'Light' : 'Dark'}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {message && <Text accessibilityLiveRegion="polite" className="text-base text-green-800 dark:text-green-300">{message}</Text>}
                {error && <Text accessibilityRole="alert" className="text-base text-red-700 dark:text-red-300">{error}</Text>}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: !ready || saving, busy: saving }}
                  disabled={!ready || saving}
                  onPress={save}
                  className={!ready || saving ? 'min-h-12 items-center justify-center rounded-lg bg-slate-500 p-3' : 'min-h-12 items-center justify-center rounded-lg bg-blue-700 p-3'}>
                  <Text className="text-base font-semibold text-white">{saving ? 'Saving…' : 'Save Settings'}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
