import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppContext = createContext(null);

const FREE_DAILY_LIMIT = 20;
const HISTORY_KEY = "@petvoice_history";
const PET_KEY     = "@petvoice_pet";
const PETS_KEY    = "@petvoice_pets";

export function AppProvider({ children }) {
  const [pet, setPet]                         = useState(null);
  const [pets, setPets]                       = useState([]);
  const [analysisResult, setAnalysisResult]   = useState(null);
  const [recordingsToday, setRecordingsToday] = useState(0);
  const [lastAnalysisAudio, setLastAnalysisAudio] = useState(null);
  const [lastPosture, setLastPosture]         = useState(null);
  const [lastEnvironment, setLastEnvironment] = useState(null);
  const [history, setHistory]                 = useState([]);
  const [ready, setReady]                     = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(PET_KEY),
      AsyncStorage.getItem(HISTORY_KEY),
      AsyncStorage.getItem(PETS_KEY),
    ]).then(([petRaw, histRaw, petsRaw]) => {
      const activePet = petRaw ? JSON.parse(petRaw) : null;
      const allPets   = petsRaw ? JSON.parse(petsRaw) : [];
      if (activePet) {
        setPet(activePet);
        // Asegura que el perfil activo esté en el array
        if (!allPets.find(p => p.name === activePet.name)) {
          allPets.push(activePet);
        } else {
          const idx = allPets.findIndex(p => p.name === activePet.name);
          allPets[idx] = activePet;
        }
      }
      setPets(allPets);
      if (histRaw) setHistory(JSON.parse(histRaw));
    }).catch(() => {}).finally(() => setReady(true));
  }, []);

  const savePet = useCallback((data) => {
    setPet(data);
    setPets(prev => {
      const idx = prev.findIndex(p => p.name === data.name);
      const next = idx >= 0
        ? prev.map((p, i) => i === idx ? data : p)
        : [...prev, data];
      AsyncStorage.setItem(PETS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
    AsyncStorage.setItem(PET_KEY, JSON.stringify(data)).catch(() => {});
  }, []);

  const addPet = useCallback((data) => {
    setPets(prev => {
      const next = [...prev, data];
      AsyncStorage.setItem(PETS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  // Cambia la mascota activa sin crear un perfil nuevo
  const switchPet = useCallback((petName) => {
    setPets(prev => {
      const found = prev.find(p => p.name === petName);
      if (found) {
        setPet(found);
        AsyncStorage.setItem(PET_KEY, JSON.stringify(found)).catch(() => {});
      }
      return prev;
    });
  }, []);

  const saveResult = useCallback((result) => {
    setAnalysisResult(result);
    setRecordingsToday((n) => n + 1);
  }, []);

  const addToHistory = useCallback((entry) => {
    setHistory(prev => {
      const next = [entry, ...prev];
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const clearHistory = useCallback((petName) => {
    setHistory(prev => {
      const next = petName ? prev.filter(e => e.petName !== petName) : [];
      AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const canRecord = recordingsToday < FREE_DAILY_LIMIT;
  const remaining = FREE_DAILY_LIMIT - recordingsToday;

  return (
    <AppContext.Provider
      value={{
        pet, pets, savePet, addPet, switchPet,
        analysisResult, saveResult,
        recordingsToday, remaining, canRecord,
        lastAnalysisAudio, setLastAnalysisAudio,
        lastPosture, setLastPosture,
        lastEnvironment, setLastEnvironment,
        history, addToHistory, clearHistory,
        ready,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be inside AppProvider");
  return ctx;
}
