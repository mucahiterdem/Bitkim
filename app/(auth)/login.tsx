import React, { useState } from 'react';
import { View, TextInput, Button, StyleSheet, Alert, Text } from 'react-native';
import { supabase } from '../../src/lib/supabase';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) Alert.alert('Giriş Hatalı', error.message);
    setLoading(false);
  }

  async function handleSignUp() {
    setLoading(true);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) Alert.alert('Kayıt Hatalı', error.message);
    else Alert.alert('Başarılı', 'Kayıt olundu, giriş yapabilirsiniz!');
    setLoading(false);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bitkim Uygulaması</Text>
      <TextInput
        placeholder="E-posta"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        placeholder="Şifre"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />
      <View style={styles.buttonContainer}>
        <Button title={loading ? 'Bekleyin...' : 'Giriş Yap'} onPress={handleLogin} color="#2e7d32" />
        <Button title="Kayıt Ol" onPress={handleSignUp} color="#1565c0" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', gap: 12 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#2e7d32' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 12, borderRadius: 8 },
  buttonContainer: { gap: 10, marginTop: 10 },
});