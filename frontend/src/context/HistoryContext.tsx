"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { AQIResponse, ForecastResponse } from "@/services/api";

export interface HistoryItem {
  id: string;
  city: string;
  timestamp: Date;
  data: AQIResponse;
  forecast: ForecastResponse;
}

interface HistoryContextType {
  history: HistoryItem[];
  addToHistory: (
    city: string,
    data: AQIResponse,
    forecast: ForecastResponse,
  ) => void;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export function HistoryProvider({ children }: { children: ReactNode }) {
  const [history, setHistory] = useState<HistoryItem[]>([]);

  const addToHistory = (
    city: string,
    data: AQIResponse,
    forecast: ForecastResponse,
  ) => {
    const newItem: HistoryItem = {
      id: crypto.randomUUID(),
      city,
      timestamp: new Date(),
      data,
      forecast,
    };
    // Add to top, prevent duplicates if needed (optional)
    setHistory((prev) => [newItem, ...prev]);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  return (
    <HistoryContext.Provider value={{ history, addToHistory, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
}

export function useHistory() {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error("useHistory must be used within a HistoryProvider");
  }
  return context;
}
