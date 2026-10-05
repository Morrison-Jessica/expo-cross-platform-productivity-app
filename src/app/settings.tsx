import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  return (
    <View className="flex-1 bg-slate-50">
      <SafeAreaView style={{ flex: 1 }} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerClassName="p-6 pb-12">
          <View className="mx-auto w-full max-w-2xl gap-6">
            <View className="gap-2">
              <Text accessibilityRole="header" className="text-3xl font-bold text-slate-900">
                Settings
              </Text>
              <Text className="text-base text-slate-600">Your app preferences.</Text>
            </View>
            <View className="gap-2 rounded-xl border border-slate-200 bg-white p-6">
              <Text className="text-lg font-semibold text-slate-900">No settings yet</Text>
              <Text className="text-base leading-6 text-slate-600">
                Settings controls will be added in a later step.
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
