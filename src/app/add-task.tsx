import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AddTaskScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerClassName="p-6 pb-12">
          <View className="mx-auto w-full max-w-2xl gap-6">
            <View className="gap-2">
              <Text accessibilityRole="header" className="text-3xl font-bold text-slate-900">
                Add Task
              </Text>
              <Text className="text-base text-slate-600">A place for your next task.</Text>
            </View>
            <View className="gap-2 rounded-xl border border-slate-200 bg-white p-6">
              <Text className="text-lg font-semibold text-slate-900">Task entry</Text>
              <Text className="text-base leading-6 text-slate-600">
                The task form will be added in the next step. No tasks can be saved yet.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
