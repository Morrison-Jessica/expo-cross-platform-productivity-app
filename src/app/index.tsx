import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getTaskDatabase, type Task } from '@/db/tasks';

const priorityColors = {
  High: 'bg-red-100 text-red-800',
  Medium: 'bg-amber-100 text-amber-800',
  Low: 'bg-green-100 text-green-800',
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    setError(null);

    async function loadTasks() {
      try {
        const db = await getTaskDatabase();
        const rows = await db.getAllAsync<Task>(
          'SELECT id, title, description, priority FROM tasks ORDER BY id DESC'
        );
        if (active) setTasks(rows);
      } catch (error) {
        if (active) setError(`Could not load tasks: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadTasks();
    return () => { active = false; };
  }, []));

  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerClassName="p-6 pb-12">
          <View className="mx-auto w-full max-w-2xl gap-6">
            <View className="gap-2">
              <Text accessibilityRole="header" className="text-3xl font-bold text-slate-900">
                Home / Tasks
              </Text>
              <Text className="text-base text-slate-600">Your tasks, all in one place.</Text>
            </View>
            {loading ? (
              <Text className="text-base text-slate-600">Loading tasks…</Text>
            ) : error ? (
              <Text accessibilityRole="alert" className="text-base text-red-700">{error}</Text>
            ) : tasks.length === 0 ? (
              <View className="gap-2 rounded-xl border border-slate-200 bg-white p-6">
                <Text className="text-lg font-semibold text-slate-900">No tasks yet</Text>
                <Text className="text-base leading-6 text-slate-600">
                  Your task list will appear here. Use the Add Task tab to visit the task entry screen.
                </Text>
              </View>
            ) : tasks.map((task) => (
              <View key={task.id} className="gap-3 rounded-xl border border-slate-200 bg-white p-6">
                <Text className="text-lg font-semibold text-slate-900">{task.title}</Text>
                <Text className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${priorityColors[task.priority]}`}>
                  {task.priority} priority
                </Text>
                {task.description ? <Text className="text-base leading-6 text-slate-600">{task.description}</Text> : null}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
