import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getTaskDatabase, type Task } from '@/db/tasks';

const priorityColors = {
  High: 'bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-200',
  Medium: 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-200',
  Low: 'bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-200',
};

export default function HomeScreen() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'All' | 'Active' | 'Completed'>('All');
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);
  const actionInProgress = useRef(false);
  const loadVersion = useRef(0);

  const completedCount = tasks.filter((task) => task.completed === 1).length;
  const visibleTasks = tasks.filter((task) =>
    filter === 'All' || (filter === 'Completed' ? task.completed === 1 : task.completed === 0)
  );

  useFocusEffect(useCallback(() => {
    let active = true;
    const version = ++loadVersion.current;
    setLoading(true);
    setError(null);
    setDeleteId(null);

    async function loadTasks() {
      try {
        const db = await getTaskDatabase();
        const rows = await db.getAllAsync<Task>(
          'SELECT id, title, description, priority, completed FROM tasks ORDER BY id DESC'
        );
        if (active && version === loadVersion.current) setTasks(rows);
      } catch (error) {
        if (active && version === loadVersion.current) setError(`Could not load tasks: ${error instanceof Error ? error.message : String(error)}`);
      } finally {
        if (active && version === loadVersion.current) setLoading(false);
      }
    }

    void loadTasks();
    return () => { active = false; };
  }, []));

  async function updateTask(task: Task, action: 'toggle' | 'delete') {
    if (actionInProgress.current || loading) return;
    if (action === 'delete' && deleteId !== task.id) return;
    actionInProgress.current = true;
    setBusy(true);
    setActionError(null);
    try {
      const db = await getTaskDatabase();
      if (action === 'delete') {
        await db.runAsync('DELETE FROM tasks WHERE id = ?', task.id);
      } else {
        await db.runAsync(
          'UPDATE tasks SET completed = ? WHERE id = ?',
          task.completed === 1 ? 0 : 1,
          task.id
        );
      }
      // Ignore any older focus reload that could overwrite this saved change.
      ++loadVersion.current;
      setLoading(false);
      setTasks((current) => action === 'delete'
        ? current.filter((item) => item.id !== task.id)
        : current.map((item) => item.id === task.id
          ? { ...item, completed: task.completed === 1 ? 0 : 1 }
          : item));
      setDeleteId(null);
    } catch (error) {
      setActionError(`Could not ${action === 'delete' ? 'delete' : 'update'} task: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      actionInProgress.current = false;
      setBusy(false);
    }
  }

  return (
    <View className="flex-1 bg-slate-50 dark:bg-slate-950">
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerClassName="p-6 pb-12">
          <View className="mx-auto w-full max-w-2xl gap-6">
            <View className="gap-2">
              <Text accessibilityRole="header" className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                Home / Tasks
              </Text>
              <Text className="text-base text-slate-600 dark:text-slate-300">Your tasks, all in one place.</Text>
            </View>
            {!loading && !error && (
              <Text accessibilityLiveRegion="polite" className="text-base font-semibold text-slate-700 dark:text-slate-200">
                Total tasks: {tasks.length} · Completed tasks: {completedCount}
              </Text>
            )}
            <View accessibilityRole="radiogroup" accessibilityLabel="Task status filter" className="flex-row flex-wrap gap-2">
              {(['All', 'Active', 'Completed'] as const).map((option) => (
                <Pressable
                  key={option}
                  accessibilityRole="radio"
                  accessibilityState={{ checked: filter === option, disabled: busy }}
                  disabled={busy}
                  onPress={() => { setFilter(option); setDeleteId(null); }}
                  className={filter === option
                    ? 'min-h-12 justify-center rounded-lg bg-blue-700 px-4 py-3'
                    : 'min-h-12 justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3'}>
                  <Text className={filter === option ? 'text-base font-semibold text-white' : 'text-base text-slate-700 dark:text-slate-200'}>
                    {option}
                  </Text>
                </Pressable>
              ))}
            </View>
            {actionError && <Text accessibilityRole="alert" className="text-base text-red-700 dark:text-red-300">{actionError}</Text>}
            {busy && <Text accessibilityLiveRegion="polite" className="text-base text-slate-600 dark:text-slate-300">Saving change…</Text>}
            {loading ? (
              <Text className="text-base text-slate-600 dark:text-slate-300">Loading tasks…</Text>
            ) : error ? (
              <Text accessibilityRole="alert" className="text-base text-red-700 dark:text-red-300">{error}</Text>
            ) : visibleTasks.length === 0 ? (
              <View className="gap-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <Text className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                  {tasks.length === 0 ? 'No tasks yet' : `No ${filter.toLowerCase()} tasks`}
                </Text>
                <Text className="text-base leading-6 text-slate-600 dark:text-slate-300">
                  {tasks.length === 0 ? 'Use the Add Task tab to create your first task.' : 'Choose another filter to see your other tasks.'}
                </Text>
              </View>
            ) : visibleTasks.map((task) => (
              <View key={task.id} className="gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6">
                <Text className={task.completed === 1 ? 'text-lg font-semibold text-slate-500 dark:text-slate-400 line-through' : 'text-lg font-semibold text-slate-900 dark:text-slate-100'}>
                  {task.title}
                </Text>
                <Text className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  {task.completed === 1 ? 'Completed' : 'Active'}
                </Text>
                <Text className={`self-start rounded-full px-3 py-1 text-sm font-semibold ${priorityColors[task.priority]}`}>
                  {task.priority} priority
                </Text>
                {task.description ? <Text className="text-base leading-6 text-slate-600 dark:text-slate-300">{task.description}</Text> : null}
                <View className="flex-row flex-wrap gap-3">
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityLabel={`Completed: ${task.title}`}
                    accessibilityState={{ checked: task.completed === 1, disabled: busy }}
                    disabled={busy}
                    onPress={() => updateTask(task, 'toggle')}
                    className="min-h-12 justify-center rounded-lg border border-slate-300 dark:border-slate-600 px-4 py-3">
                    <Text className="text-base font-semibold text-slate-700 dark:text-slate-200">
                      {task.completed === 1 ? 'Mark incomplete' : 'Mark complete'}
                    </Text>
                  </Pressable>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Delete ${task.title}`}
                    accessibilityState={{ disabled: busy }}
                    disabled={busy}
                    onPress={() => { setDeleteId(task.id); setActionError(null); }}
                    className="min-h-12 justify-center rounded-lg border border-red-300 dark:border-red-700 px-4 py-3">
                    <Text className="text-base font-semibold text-red-700 dark:text-red-300">Delete</Text>
                  </Pressable>
                </View>
                {deleteId === task.id && (
                  <View className="gap-3 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950 p-4">
                    <Text accessibilityRole="alert" className="text-base text-red-900 dark:text-red-100">
                      Delete “{task.title}”? This cannot be undone.
                    </Text>
                    <View className="flex-row flex-wrap gap-3">
                      <Pressable
                        accessibilityRole="button"
                        accessibilityState={{ disabled: busy }}
                        disabled={busy}
                        onPress={() => setDeleteId(null)}
                        className="min-h-12 justify-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 px-4 py-3">
                        <Text className="text-base text-slate-700 dark:text-slate-200">Cancel</Text>
                      </Pressable>
                      <Pressable
                        accessibilityRole="button"
                        accessibilityLabel={`Confirm delete ${task.title}`}
                        accessibilityState={{ disabled: busy }}
                        disabled={busy}
                        onPress={() => updateTask(task, 'delete')}
                        className="min-h-12 justify-center rounded-lg bg-red-700 px-4 py-3">
                        <Text className="text-base font-semibold text-white">Confirm delete</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
