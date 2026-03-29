import { Tabs } from 'expo-router';
import { Text } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: '#1a73e8' },
        headerTintColor: '#fff',
        headerTitleStyle: { fontWeight: 'bold' },
        tabBarActiveTintColor: '#1a73e8',
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '지도',
          headerTitle: 'TravelApp',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🗺</Text>,
        }}
      />
      <Tabs.Screen
        name="route"
        options={{
          title: 'AI 경로',
          headerTitle: 'AI 최적 경로',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>🧭</Text>,
        }}
      />
      <Tabs.Screen
        name="checklist"
        options={{
          title: '준비물',
          headerTitle: '여행 준비물',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>✅</Text>,
        }}
      />
      <Tabs.Screen
        name="warnings"
        options={{
          title: '주의사항',
          headerTitle: '여행 주의사항',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 22, color }}>⚠️</Text>,
        }}
      />
    </Tabs>
  );
}
