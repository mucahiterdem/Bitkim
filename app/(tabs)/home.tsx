import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { supabase } from '../../src/lib/supabase';

export default function HomeScreen() {
  const [plants, setPlants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Günün sözü
  const dailyQuote = "“Yeşili sev, doğayı koru; çünkü her bitki hayatın sessiz birer nefesidir.”";

  // Sayfa her ekrana geldiğinde Supabase'den güncel bitkileri çeker
  const fetchPlants = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('plants').select('*');
      if (error) {
        console.error('Bitkiler çekilirken hata:', error.message);
      } else {
        setPlants(data || []);
      }
    } catch (err) {
      console.error('Beklenmeyen hata:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPlants();
    }, [])
  );

  // Bitkiyi silme fonksiyonu
  const handleDelete = async (id: string) => {
    Alert.alert(
      'Bitkiyi Sil',
      'Bu bitkiyi silmek istediğinize emin misiniz?',
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            const { error } = await supabase.from('plants').delete().eq('id', id);
            if (error) {
              Alert.alert('Hata', 'Bitki silinemedi: ' + error.message);
            } else {
              setPlants(plants.filter((plant) => plant.id !== id));
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Günün Sözü Alanı */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteTitle}>Günün Sözünü Söyler Misin Kardesim</Text>
        <Text style={styles.quoteText}>{dailyQuote}</Text>
      </View>

      <Text style={styles.title}>Bitkilerim🌱</Text>
      
      {plants.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>Henüz hiç bitki eklemediniz.</Text>
        </View>
      ) : (
        <FlatList
          data={plants}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.card} 
              onPress={() => router.push(`/plant/${item.id}`)}
            >
              <View style={{ flex: 1 }}>
                <Text style={styles.plantName}>{item.name}</Text>
                <Text style={styles.plantSpecies}>{item.species || 'Tür belirtilmemiş'}</Text>
              </View>
              <TouchableOpacity style={styles.deleteButton} onPress={() => handleDelete(item.id)}>
                <Text style={styles.deleteButtonText}>Sil</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
          style={{ flex: 1 }}
        />
      )}

      {/* Yeni Bitki Ekle Butonu */}
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => router.push('/add-plant')}
      >
        <Text style={styles.addButtonText}>+ Yeni Bitki Ekle</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  quoteCard: {
    backgroundColor: '#e8f5e9',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#2e7d32',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
    marginTop: 10,
  },
  quoteTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2e7d32',
    marginBottom: 6,
  },
  quoteText: {
    fontSize: 13,
    color: '#333',
    fontStyle: 'italic',
    lineHeight: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  plantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  plantSpecies: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  deleteButton: {
    backgroundColor: '#d32f2f',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  addButton: {
    backgroundColor: '#2e7d32',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});