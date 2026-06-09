import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const AppContext = createContext(null);

const FREE_DAILY_LIMIT = 5;
const HISTORY_KEY = "@petvoice_history";
const PET_KEY     = "@petvoice_pet";

export function AppProvider({ children }) {
  const [pet, setPet]                       = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recordingsToday, setRecordingsToday] = useState(0);
  const [lastAnalysisAudio, setLastAnalysisAudio] = useState(null);
  const [lastPosture, setLastPosture]       = useState(null);
  const [lastEnvironment, setLastEnvironment] = useState(null);
  const [history, setHistory]               = useState([]);
  const [ready, setReady]                   = useState(false);

  // Load persisted pet + history on mount
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(PET_KEY),
      AsyncStorage.getItem(HISTORY_KEY),
    ]).then(([petRaw, histRaw]) => {
      if (petRaw)  setPet(JSON.parse(petRaw));
      if (histRaw) setHistory(JSON.parse(histRaw));
    }).catch(() => {}).finally(() => setReady(true));
  }, []);

  const savePet = useCallback((data) => {
    setPet(data);
    AsyncStorage.setItem(PET_KEY, JSON.stringify(data)).catch(() => {});
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

  // Borra solo el historial de la mascota actual
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
        pet, savePet,
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
