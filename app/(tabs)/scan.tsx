import React, { useState } from 'react';
import { View, Text, StyleSheet, Button, TouchableOpacity, Alert } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={{ textAlign: 'center', marginBottom: 10 }}>
          QR Kodu okutabilmek için kamera izni gerekiyor.
        </Text>
        <Button onPress={requestPermission} title="İzin Ver" color="#2e7d32" />
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    // QR kodu formatı: bitkim://plant/UUID
    if (data.includes('bitkim://plant/')) {
      const plantId = data.replace('bitkim://plant/', '');
      router.push(`/plant/${plantId}`);
    } else {
      Alert.alert('Geçersiz QR', 'Bu QR kodu bir Bitkim QR kodu değil.', [
        { text: 'Tamam', onPress: () => setScanned(false) }
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.absoluteFill}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.targetBox} />
          <Text style={styles.instructionText}>Bitki QR Kodunu kutunun içine hizalayın</Text>
        </View>
      </CameraView>

      {scanned && (
        <TouchableOpacity style={styles.rescanButton} onPress={() => setScanned(false)}>
          <Text style={styles.rescanText}>Tekrar Tara</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  absoluteFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  targetBox: { width: 220, height: 220, borderWidth: 2, borderColor: '#fff', borderRadius: 16, backgroundColor: 'transparent' },
  instructionText: { color: '#fff', marginTop: 20, fontSize: 14, fontWeight: '500' },
  rescanButton: { position: 'absolute', bottom: 40, alignSelf: 'center', backgroundColor: '#2e7d32', padding: 15, borderRadius: 12 },
  rescanText: { color: '#fff', fontWeight: 'bold' },
});