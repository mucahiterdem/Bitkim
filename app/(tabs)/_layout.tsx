import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ tabBarActiveTintColor: '#2e7d32' }}>
      <Tabs.Screen
        name="home"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: (props: any) => <Ionicons name="home" size={props.size} color={props.color} />,
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: 'QR Okut',
          tabBarIcon: (props: any) => <Ionicons name="qr-code" size={props.size} color={props.color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: (props: any) => <Ionicons name="person" size={props.size} color={props.color} />,
        }}
      />
    </Tabs>
  );
}