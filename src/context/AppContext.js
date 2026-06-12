import React, { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(null);

const FREE_DAILY_LIMIT = 5;

export function AppProvider({ children }) {
  const [pets, setPets] = useState([]);
  const [activePetIndex, setActivePetIndex] = useState(0);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recordingsToday, setRecordingsToday] = useState(0);
  const [lastAnalysisAudio, setLastAnalysisAudio] = useState(null);
  const [lastPosture, setLastPosture] = useState(null);
  const [lastEnvironment, setLastEnvironment] = useState(null);
  const [user, setUser] = useState({ isPremium: false, translationsToday: 0 });

  const pet = pets[activePetIndex] ?? null;

  const savePet = useCallback((data) => {
    setPets([data]);
    setActivePetIndex(0);
  }, []);

  const addPet = useCallback((data) => {
    setPets((prev) => [...prev, data]);
  }, []);

  const saveResult = useCallback((result) => {
    setAnalysisResult(result);
    setRecordingsToday((n) => n + 1);
    setUser((u) => ({ ...u, translationsToday: u.translationsToday + 1 }));
  }, []);

  const clearHistory = useCallback(async () => {}, []);

  const setPremium = useCallback((value) => {
    setUser((u) => ({ ...u, isPremium: value }));
  }, []);

  const canRecord = recordingsToday < FREE_DAILY_LIMIT;
  const remaining = FREE_DAILY_LIMIT - recordingsToday;

  return (
    <AppContext.Provider
      value={{
        pet, pets, savePet, addPet,
        activePetIndex, setActivePetIndex,
        analysisResult, saveResult,
        recordingsToday, remaining, canRecord,
        lastAnalysisAudio, setLastAnalysisAudio,
        lastPosture, setLastPosture,
        lastEnvironment, setLastEnvironment,
        user, setPremium, clearHistory,
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
