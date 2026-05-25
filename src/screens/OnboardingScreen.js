import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useApp } from '../context/AppContext';
import { COLORS } from '../constants/colors';
import { FONTS } from '../constants/typography';

const AGE_OPTIONS = [
  { label: 'Cachorro', sublabel: '0–1 año', value: 'cachorro' },
  { label: 'Joven', sublabel: '1–3 años', value: 'joven' },
  { label: 'Adulto', sublabel: '3–8 años', value: 'adulto' },
  { label: 'Senior', sublabel: '8+ años', value: 'senior' },
];

const OnboardingScreen = ({ navigation }) => {
  const { savePet } = useApp();
  const [photo, setPhoto] = useState(null);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState(null);
  const [breed, setBreed] = useState('');
  const [age, setAge] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const pickPhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(
        'Permiso requerido',
        'Necesitamos acceso a tu galería para elegir la foto de tu mascota.'
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Por favor ingresa el nombre de tu mascota.');
      return;
    }
    if (!species) {
      Alert.alert('Especie requerida', 'Selecciona si tu mascota es perro o gato.');
      return;
    }

    setIsSaving(true);
    try {
      await savePet({
        name: name.trim(),
        species,
        breed: breed.trim(),
        age: age || 'adulto',
        photo,
      });
      navigation.replace('MainTabs');
    } catch (err) {
      Alert.alert('Error', 'No se pudo guardar la información. Intenta de nuevo.');
    } finally {
      setIsSaving(false);
    }
  };

  const nameInitials = name.trim().charAt(0).toUpperCase() || '🐾';

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo + heading */}
        <View style={styles.logoArea}>
          <Text style={styles.appLogo}>🐾 PetVoice AI</Text>
          <Text style={styles.title}>Configura tu mascota</Text>
          <Text style={styles.subtitle}>
            Cuéntanos sobre ella para personalizar las traducciones
          </Text>
        </View>

        {/* Photo picker */}
        <View style={styles.photoPicker}>
          <TouchableOpacity style={styles.photoCircle} onPress={pickPhoto} activeOpacity={0.8}>
            {photo ? (
              <Image source={{ uri: photo }} style={styles.photoImage} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoPlaceholderText}>
                  {name.trim() ? nameInitials : '📷'}
                </Text>
                <Text style={styles.photoHint}>Toca para agregar foto</Text>
              </View>
            )}
          </TouchableOpacity>
          {photo && (
            <TouchableOpacity onPress={pickPhoto} style={styles.changePhotoBtn}>
              <Text style={styles.changePhotoText}>Cambiar foto</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Name input */}
        <View style={styles.section}>
          <Text style={styles.label}>Nombre de la mascota *</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Luna, Max, Mochi..."
            placeholderTextColor={COLORS.MUTED}
            value={name}
            onChangeText={setName}
            maxLength={30}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Species selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Especie *</Text>
          <View style={styles.speciesRow}>
            <TouchableOpacity
              style={[
                styles.speciesBtn,
                species === 'dog' && styles.speciesBtnSelected,
              ]}
              onPress={() => setSpecies('dog')}
              activeOpacity={0.8}
            >
              <Text style={styles.speciesEmoji}>🐶</Text>
              <Text
                style={[
                  styles.speciesLabel,
                  species === 'dog' && styles.speciesLabelSelected,
                ]}
              >
                Perro
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.speciesBtn,
                species === 'cat' && styles.speciesBtnSelected,
              ]}
              onPress={() => setSpecies('cat')}
              activeOpacity={0.8}
            >
              <Text style={styles.speciesEmoji}>🐱</Text>
              <Text
                style={[
                  styles.speciesLabel,
                  species === 'cat' && styles.speciesLabelSelected,
                ]}
              >
                Gato
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Breed input */}
        <View style={styles.section}>
          <Text style={styles.label}>Raza (opcional)</Text>
          <TextInput
            style={styles.input}
            placeholder="Ej. Labrador, Siamés, Mestizo..."
            placeholderTextColor={COLORS.MUTED}
            value={breed}
            onChangeText={setBreed}
            maxLength={40}
            autoCapitalize="words"
            returnKeyType="next"
          />
        </View>

        {/* Age selector */}
        <View style={styles.section}>
          <Text style={styles.label}>Edad</Text>
          <View style={styles.ageGrid}>
            {AGE_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt.value}
                style={[
                  styles.ageBtn,
                  age === opt.value && styles.ageBtnSelected,
                ]}
                onPress={() => setAge(opt.value)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.ageBtnLabel,
                    age === opt.value && styles.ageBtnLabelSelected,
                  ]}
                >
                  {opt.label}
                </Text>
                <Text
                  style={[
                    styles.ageBtnSublabel,
                    age === opt.value && styles.ageBtnSublabelSelected,
                  ]}
                >
                  {opt.sublabel}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.submitBtn, isSaving && styles.submitBtnDisabled]}
          onPress={handleSubmit}
          activeOpacity={0.85}
          disabled={isSaving}
        >
          <Text style={styles.submitBtnText}>
            {isSaving ? 'Guardando...' : 'Comenzar 🐾'}
          </Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: COLORS.BG },
  container: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoArea: {
    alignItems: 'center',
    marginBottom: 32,
  },
  appLogo: {
    fontSize: FONTS.size.xxl,
    fontWeight: FONTS.weight.extrabold,
    color: COLORS.PRIMARY,
    marginBottom: 12,
    letterSpacing: -0.5,
  },
  title: {
    fontSize: FONTS.size.xl,
    fontWeight: FONTS.weight.bold,
    color: COLORS.DARK,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: FONTS.size.md,
    color: COLORS.MUTED,
    textAlign: 'center',
    lineHeight: 22,
  },

  // Photo picker
  photoPicker: {
    alignItems: 'center',
    marginBottom: 28,
  },
  photoCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#EEF2FF',
    borderWidth: 2.5,
    borderColor: COLORS.PRIMARY,
    borderStyle: 'dashed',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  photoPlaceholder: {
    alignItems: 'center',
    gap: 4,
  },
  photoPlaceholderText: {
    fontSize: 36,
  },
  photoHint: {
    fontSize: FONTS.size.xs,
    color: COLORS.PRIMARY,
    fontWeight: FONTS.weight.medium,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  changePhotoBtn: {
    marginTop: 10,
  },
  changePhotoText: {
    fontSize: FONTS.size.sm,
    color: COLORS.PRIMARY,
    fontWeight: FONTS.weight.semibold,
  },

  // Form sections
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: FONTS.size.sm,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.DARK,
    marginBottom: 10,
    letterSpacing: 0.2,
  },
  input: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: FONTS.size.md,
    color: COLORS.DARK,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.06,
        shadowRadius: 4,
      },
      android: { elevation: 1 },
    }),
  },

  // Species
  speciesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  speciesBtn: {
    flex: 1,
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.BORDER,
    paddingVertical: 16,
    alignItems: 'center',
    gap: 6,
  },
  speciesBtnSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: '#EEF2FF',
  },
  speciesEmoji: {
    fontSize: 32,
  },
  speciesLabel: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.MUTED,
  },
  speciesLabelSelected: {
    color: COLORS.PRIMARY,
  },

  // Age
  ageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  ageBtn: {
    width: '47.5%',
    backgroundColor: COLORS.WHITE,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.BORDER,
    paddingVertical: 14,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  ageBtnSelected: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: '#EEF2FF',
  },
  ageBtnLabel: {
    fontSize: FONTS.size.md,
    fontWeight: FONTS.weight.semibold,
    color: COLORS.DARK,
    marginBottom: 2,
  },
  ageBtnLabelSelected: {
    color: COLORS.PRIMARY,
  },
  ageBtnSublabel: {
    fontSize: FONTS.size.xs,
    color: COLORS.MUTED,
  },
  ageBtnSublabelSelected: {
    color: COLORS.PRIMARY,
  },

  // Submit
  submitBtn: {
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: { elevation: 8 },
    }),
  },
  submitBtnDisabled: {
    opacity: 0.65,
  },
  submitBtnText: {
    fontSize: FONTS.size.lg,
    fontWeight: FONTS.weight.bold,
    color: COLORS.WHITE,
    letterSpacing: 0.3,
  },
  bottomSpacer: { height: 20 },
});

export default OnboardingScreen;
