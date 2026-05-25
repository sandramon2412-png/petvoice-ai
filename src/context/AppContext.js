import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  savePet,
  loadPet,
  saveHistory,
  loadHistory,
  saveUser,
  loadUser,
} from '../services/storageService';

const AppContext = createContext(null);

const getTodayDateString = () => new Date().toISOString().split('T')[0];

const DEFAULT_USER = {
  isPremium: false,
  translationsToday: 0,
  lastResetDate: getTodayDateString(),
};

export const AppProvider = ({ children }) => {
  const [pet, setPet] = useState(null);
  const [user, setUser] = useState(DEFAULT_USER);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load persisted data on mount
  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [loadedPet, loadedHistory, loadedUser] = await Promise.all([
          loadPet(),
          loadHistory(),
          loadUser(),
        ]);

        if (loadedPet) setPet(loadedPet);
        if (loadedHistory) setHistory(loadedHistory);

        if (loadedUser) {
          // Reset daily counter if date changed
          const today = getTodayDateString();
          if (loadedUser.lastResetDate !== today) {
            const resetUser = {
              ...loadedUser,
              translationsToday: 0,
              lastResetDate: today,
            };
            setUser(resetUser);
            await saveUser(resetUser);
          } else {
            setUser(loadedUser);
          }
        }
      } catch (err) {
        console.error('AppContext bootstrap error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const resetDailyIfNeeded = useCallback(async () => {
    const today = getTodayDateString();
    if (user.lastResetDate !== today) {
      const resetUser = {
        ...user,
        translationsToday: 0,
        lastResetDate: today,
      };
      setUser(resetUser);
      await saveUser(resetUser);
    }
  }, [user]);

  const savePetData = useCallback(async (newPet) => {
    try {
      setPet(newPet);
      await savePet(newPet);
    } catch (err) {
      console.error('Error saving pet:', err);
    }
  }, []);

  const canTranslate = useCallback(() => {
    return user.isPremium || user.translationsToday < 3;
  }, [user]);

  const addTranslation = useCallback(
    async (result) => {
      // Build the chat bubble entry for the pet's "message"
      const petEntry = {
        id: result.id || Date.now().toString(),
        type: 'pet_translation',
        isFromPet: true,
        message: result.traduccion,
        emotion: result.emocion,
        colorAlerta: result.color_alerta,
        advice: result.consejo_veterinario,
        timestamp: result.timestamp || new Date().toISOString(),
        audioUri: result.audioUri,
      };

      const newHistory = [petEntry, ...history];
      setHistory(newHistory);
      await saveHistory(newHistory);

      // Increment daily counter
      const updatedUser = {
        ...user,
        translationsToday: user.translationsToday + 1,
        lastResetDate: getTodayDateString(),
      };
      setUser(updatedUser);
      await saveUser(updatedUser);
    },
    [history, user]
  );

  const addHumanMessage = useCallback(
    async (message) => {
      const entry = {
        id: Date.now().toString(),
        type: 'human_reply',
        isFromPet: false,
        message,
        timestamp: new Date().toISOString(),
      };

      const newHistory = [entry, ...history];
      setHistory(newHistory);
      await saveHistory(newHistory);
    },
    [history]
  );

  const setPremium = useCallback(async (value) => {
    const updatedUser = { ...user, isPremium: value };
    setUser(updatedUser);
    await saveUser(updatedUser);
  }, [user]);

  const clearHistory = useCallback(async () => {
    setHistory([]);
    await saveHistory([]);
  }, []);

  const value = {
    pet,
    user,
    history,
    isLoading,
    savePet: savePetData,
    addTranslation,
    addHumanMessage,
    canTranslate,
    resetDailyIfNeeded,
    setPremium,
    clearHistory,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
};

export default AppContext;
