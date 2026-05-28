import React, { createContext, useContext, useState, useCallback } from "react";

const AppContext = createContext(null);

const FREE_DAILY_LIMIT = 5;

export function AppProvider({ children }) {
  const [pet, setPet] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [recordingsToday, setRecordingsToday] = useState(0);
  const [lastAnalysisAudio, setLastAnalysisAudio] = useState(null);
  const [lastPosture, setLastPosture] = useState(null);
  const [lastEnvironment, setLastEnvironment] = useState(null);

  const savePet = useCallback((data) => { setPet(data); }, []);

  const saveResult = useCallback((result) => {
    setAnalysisResult(result);
    setRecordingsToday((n) => n + 1);
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
