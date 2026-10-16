import React from 'react';
import { Tabs, Redirect } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { FontSize, Radius, Spacing } from '@/constants/tokens';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  title: string;
  icon: IoniconsName;
  iconFocused: IoniconsName;
}

const TABS: TabConfig[] = [
  { name: 'dashboard',    title: 'Command',      icon: 'grid-outline',         iconFocused: 'grid' },
  { name: 'appointments', title: 'Schedule',     icon: 'calendar-outline',     iconFocused: 'calendar' },
  { name: 'patients',     title: 'Patients',     icon: 'people-outline',       iconFocused: 'people' },
  { name: 'profile',      title: 'Account',      icon: 'person-circle-outline', iconFocused: 'person-circle' },
];

export default function TabsLayout() {
  const { colors, isDark } = useTheme();
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner fullScreen message="Verifying session…" />;
  if (!isAuthenticated) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={({ route }) => {
        const tab = TABS.find(t => t.name === route.name);
        return {
          headerShown: false,
          tabBarShowLabel: true,
          tabBarActiveTintColor: colors.brand,
          tabBarInactiveTintColor: colors.mutedForeground,
          tabBarLabelStyle: {
            fontSize: FontSize.xs - 1,
            fontWeight: '600' as const,
            marginBottom: Platform.OS === 'ios' ? 0 : 4,
          },
          tabBarStyle: {
            backgroundColor: colors.surface1,
            borderTopColor: colors.border,
            borderTopWidth: 1,
            height: Platform.OS === 'ios' ? 84 : 64,
            paddingTop: 6,
            elevation: 8,
            shadowColor: colors.foreground,
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
          },
          tabBarIcon: ({ focused, color, size }) => (
            <View style={[styles.iconWrap, focused && { backgroundColor: colors.infoSoft }]}>
              <Ionicons
                name={focused ? (tab?.iconFocused ?? tab?.icon ?? 'ellipse') : (tab?.icon ?? 'ellipse-outline')}
                size={22}
                color={color}
              />
            </View>
          ),
        };
      }}
    >
      {TABS.map(tab => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{ title: tab.title }}
        />
      ))}
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconWrap: {
    width: 36,
    height: 28,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
