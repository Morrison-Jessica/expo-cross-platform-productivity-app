import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getTaskDatabase, type Priority } from '@/db/tasks';

export default function AddTaskScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const saveInProgress = useRef(false);

  async function saveTask() {
    if (saveInProgress.current) return;
    if (!title.trim()) {
      setError('Please enter a task title.');
      return;
    }
    if (!priority) {
      setError('Please select a priority.');
      return;
    }

    saveInProgress.current = true;
    setSaving(true);
    setError(null);
    try {
      const db = await getTaskDatabase();
      await db.runAsync(
        'INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)',
        title.trim(),
        description.trim(),
        priority
      );
    } catch (error) {
      setError(`Could not save task: ${error instanceof Error ? error.message : String(error)}`);
      return;
    } finally {
      saveInProgress.current = false;
      setSaving(false);
    }
    setTitle('');
    setDescription('');
    setPriority(null);
    router.navigate('/');
  }

  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          <ScrollView contentContainerClassName="p-6 pb-12" keyboardShouldPersistTaps="handled">
            <View className="mx-auto w-full max-w-2xl gap-6">
              <View className="gap-2">
                <Text accessibilityRole="header" className="text-3xl font-bold text-slate-900">
                  Add Task
                </Text>
                <Text className="text-base text-slate-600">A place for your next task.</Text>
              </View>
              <View className="gap-4 rounded-xl border border-slate-200 bg-white p-6">
                <View className="gap-2">
                  <Text className="text-base font-semibold text-slate-900">Title (required)</Text>
                  <TextInput
                    accessibilityLabel="Title (required)"
                    className="min-h-12 rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
                    placeholder="What needs to be done?"
                    placeholderTextColor="#64748b"
                    value={title}
                    onChangeText={setTitle}
                    editable={!saving}
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-base font-semibold text-slate-900">Description (optional)</Text>
                  <TextInput
                    accessibilityLabel="Description (optional)"
                    className="min-h-28 rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900"
                    placeholder="Add any details"
                    placeholderTextColor="#64748b"
                    multiline
                    textAlignVertical="top"
                    value={description}
                    onChangeText={setDescription}
                    editable={!saving}
                  />
                </View>
                <View className="gap-2">
                  <Text className="text-base font-semibold text-slate-900">Priority (required)</Text>
                  <View className="flex-row flex-wrap gap-2" accessibilityRole="radiogroup">
                    {(['High', 'Medium', 'Low'] as const).map((option) => (
                      <Pressable
                        key={option}
                        accessibilityRole="radio"
                        accessibilityState={{ checked: priority === option, disabled: saving }}
                        disabled={saving}
                        onPress={() => setPriority(option)}
                        className={priority === option
                          ? 'min-h-12 justify-center rounded-lg border border-blue-700 bg-blue-700 px-4 py-3'
                          : 'min-h-12 justify-center rounded-lg border border-slate-300 bg-white px-4 py-3'}>
                        <Text className={priority === option ? 'text-base font-semibold text-white' : 'text-base text-slate-700'}>
                          {option}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
                {error && <Text accessibilityRole="alert" className="text-base text-red-700">{error}</Text>}
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ disabled: saving, busy: saving }}
                  disabled={saving}
                  onPress={saveTask}
                  className={saving ? 'min-h-12 items-center justify-center rounded-lg bg-slate-500 p-3' : 'min-h-12 items-center justify-center rounded-lg bg-blue-700 p-3'}>
                  <Text className="text-base font-semibold text-white">{saving ? 'Saving…' : 'Save Task'}</Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}
