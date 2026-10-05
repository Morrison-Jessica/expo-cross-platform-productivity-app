import '../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';

import AppTabs from '@/components/app-tabs';
import { SettingsProvider } from '@/settings';

export default function TabLayout() {
  return <SettingsProvider><Navigation /></SettingsProvider>;
}

function Navigation() {
  const { colorScheme } = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      <AppTabs />
    </ThemeProvider>
  );
}
