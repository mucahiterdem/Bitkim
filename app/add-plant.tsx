import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '../src/lib/supabase';

export default function AddPlantScreen() {
  const [name, setName] = useState('');
  const [species, setSpecies] = useState('');
  const router = useRouter();

  const handleAdd = async () => {
    if (!name) {
      Alert.alert('Hata', 'Lütfen bitki adını girin.');
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from('plants').insert([
      { name, species, owner_id: user.id },
    ]);

    if (error) {
      Alert.alert('Hata', error.message);
    } else {
      router.back();
    }
  };

  return (
    <View style={styles.container}>
      <TextInput placeholder="Bitki Adı" value={name} onChangeText={setName} style={styles.input} />
      <TextInput placeholder="Türü (Örn: Sukulend)" value={species} onChangeText={setSpecies} style={styles.input} />
      <Button title="Kaydet" onPress={handleAdd} color="#2e7d32" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', gap: 15 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 },
});