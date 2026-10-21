import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, ActivityIndicator, Alert, TextInput } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../src/lib/supabase';

export default function PlantDetailScreen() {
  const { id } = useLocalSearchParams();
  const [plant, setPlant] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [savingNotes, setSavingNotes] = useState(false);

  useEffect(() => {
    if (id) {
      fetchPlantDetails();
      fetchPlantPhotos();
    }
  }, [id]);

  const fetchPlantDetails = async () => {
    const { data, error } = await supabase.from('plants').select('*').eq('id', id).single();
    if (error) {
      console.error('Bitki bilgisi çekilemedi:', error.message);
    } else {
      setPlant(data);
      setNotes(data.notes || '');
    }
    setLoading(false);
  };

  const fetchPlantPhotos = async () => {
    const { data, error } = await supabase.from('plant_photos').select('*').eq('plant_id', id).order('created_at', { ascending: false });
    if (error) console.error('Fotoğraflar çekilemedi:', error.message);
    else setPhotos(data || []);
  };

  // Notları kaydetme fonksiyonu
  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      const { error } = await supabase
        .from('plants')
        .update({ notes: notes })
        .eq('id', id);

      if (error) throw error;
      Alert.alert('Başarılı', 'Bakım notları kaydedildi!');
    } catch (error: any) {
      Alert.alert('Hata', 'Notlar kaydedilemedi: ' + error.message);
    } finally {
      setSavingNotes(false);
    }
  };

  const pickAndUploadImage = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('İzin Gerekli', 'Fotoğraf çekebilmek için kamera izni vermelisiniz.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.7,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      try {
        setUploading(true);
        const file = result.assets[0];
        const fileName = `${id}/${Date.now()}.jpg`;

        const { error: uploadError } = await supabase.storage
          .from('plant-photos')
          .upload(fileName, decodeBase64(file.base64!), {
            contentType: 'image/jpeg',
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage.from('plant-photos').getPublicUrl(fileName);

        const { error: dbError } = await supabase.from('plant_photos').insert([
          { plant_id: id, photo_url: urlData.publicUrl }
        ]);

        if (dbError) throw dbError;

        Alert.alert('Başarılı', 'Fotoğraf yüklendi!');
        fetchPlantPhotos();
      } catch (error: any) {
        Alert.alert('Yükleme Hatası', error.message || 'Fotoğraf yüklenemedi.');
      } finally {
        setUploading(false);
      }
    }
  };

  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes.buffer;
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#2e7d32" />
      </View>
    );
  }

  if (!plant) {
    return (
      <View style={styles.center}>
        <Text>Bitki bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <Text style={styles.title}>{plant.name}</Text>
      <Text style={styles.species}>{plant.species || 'Tür belirtilmemiş'}</Text>

      {/* Bakım Notları / Bilgi Alanı */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🌿 Bakım Notları & Detaylar</Text>
        <TextInput
          style={styles.textArea}
          placeholder="Örn: Haftada 2 kez sula, doğrudan güneş almayan aydınlık yerde tut."
          placeholderTextColor="#999"
          multiline
          value={notes}
          onChangeText={setNotes}
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveNotes} disabled={savingNotes}>
          <Text style={styles.saveButtonText}>{savingNotes ? 'Kaydediliyor...' : 'Notları Kaydet'}</Text>
        </TouchableOpacity>
      </View>

      {/* QR Kod Alanı */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Bitki QR Kodu</Text>
        <Text style={styles.qrSubtitle}>Bu QR kodu okutarak doğrudan bu sayfaya ulaşabilirsiniz.</Text>
        <View style={styles.qrBox}>
          <QRCode value={`bitkim://plant/${plant.id}`} size={150} />
        </View>
      </View>

      {/* Fotoğraf Galerisi */}
      <View style={styles.card}>
        <View style={styles.galleryHeader}>
          <Text style={styles.sectionTitle}>Fotoğraf Galerisi</Text>
          <TouchableOpacity style={styles.photoButton} onPress={pickAndUploadImage} disabled={uploading}>
            <Text style={styles.photoButtonText}>{uploading ? 'Yükleniyor...' : '📸 Fotoğraf Çek'}</Text>
          </TouchableOpacity>
        </View>

        {photos.length === 0 ? (
          <Text style={styles.emptyGallery}>Henüz bu bitkiye ait fotoğraf yüklenmedi.</Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.imageScroll}>
            {photos.map((item) => (
              <Image key={item.id} source={{ uri: item.photo_url }} style={styles.plantImage} />
            ))}
          </ScrollView>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2e7d32', marginTop: 10 },
  species: { fontSize: 16, color: '#666', marginBottom: 20 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginBottom: 20, elevation: 2 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 10 },
  textArea: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: '#fafafa',
    marginBottom: 10,
  },
  saveButton: { backgroundColor: '#2e7d32', paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  saveButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  qrSubtitle: { fontSize: 12, color: '#888', textAlign: 'center', marginVertical: 6 },
  qrBox: { alignItems: 'center', marginTop: 10, padding: 10 },
  galleryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  photoButton: { backgroundColor: '#2e7d32', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 8 },
  photoButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  emptyGallery: { color: '#888', fontStyle: 'italic', marginVertical: 10 },
  imageScroll: { flexDirection: 'row', marginTop: 5 },
  plantImage: { width: 130, height: 130, borderRadius: 12, marginRight: 12 },
});