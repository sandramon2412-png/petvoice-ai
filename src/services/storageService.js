import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PET: '@petvoice_pet',
  HISTORY: '@petvoice_history',
  USER: '@petvoice_user',
};

export const savePet = async (pet) => {
  try {
    await AsyncStorage.setItem(KEYS.PET, JSON.stringify(pet));
  } catch (error) {
    console.error('Error saving pet:', error);
    throw error;
  }
};

export const loadPet = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PET);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error loading pet:', error);
    return null;
  }
};

export const saveHistory = async (history) => {
  try {
    await AsyncStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  } catch (error) {
    console.error('Error saving history:', error);
    throw error;
  }
};

export const loadHistory = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.error('Error loading history:', error);
    return [];
  }
};

export const saveUser = async (user) => {
  try {
    await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Error saving user:', error);
    throw error;
  }
};

export const loadUser = async () => {
  try {
    const raw = await AsyncStorage.getItem(KEYS.USER);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.error('Error loading user:', error);
    return null;
  }
};

export const clearAll = async () => {
  try {
    await AsyncStorage.multiRemove([KEYS.PET, KEYS.HISTORY, KEYS.USER]);
  } catch (error) {
    console.error('Error clearing storage:', error);
    throw error;
  }
};
