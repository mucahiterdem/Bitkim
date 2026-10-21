import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { supabase } from '../../src/lib/supabase';

export default function ProfileScreen() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) setEmail(user.email || null);
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profilim</Text>
      {email && <Text style={styles.email}>Oturum Açan: {email}</Text>}
      <Button title="Çıkış Yap" onPress={() => supabase.auth.signOut()} color="#d32f2f" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 16, backgroundColor: '#f5f5f5' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333' },
  email: { fontSize: 16, color: '#666', marginBottom: 10 },
});