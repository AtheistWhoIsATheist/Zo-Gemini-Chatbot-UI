import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SynthesisStoreState, SynthesisMessage, UIPreferences } from '../types/synthesis';

interface SynthesisStore extends SynthesisStoreState {
  setSynthesis: (text: string) => void;
  setTheta: (score: number) => void;
  addMessage: (message: SynthesisMessage) => void;
  setInputValue: (value: string) => void;
  setStreaming: (active: boolean) => void;
  setWsConnected: (connected: boolean) => void;
  updateUiPreferences: (prefs: Partial<UIPreferences>) => void;
  clearMessages: () => void;
  resetState: () => void;
}

const initialState = {
  synthesis: '',
  theta: 0.2, // Default safe theta
  thetaHistory: [0.2],
  messages: [],
  inputValue: '',
  isStreaming: false,
  crisisMode: false,
  wsConnected: false,
};

export const useSynthesisStore = create<SynthesisStore>()(
  persist(
    (set) => ({
      ...initialState,
      uiPreferences: {
        theme: 'dark',
        fontSize: 'md',
        compactMode: false,
        soundAlerts: false,
      },
      setSynthesis: (text) => set({ synthesis: text }),
      setTheta: (score) => set((state) => {
        const newHistory = [...state.thetaHistory, score].slice(-100);
        return {
          theta: score,
          thetaHistory: newHistory,
          crisisMode: score >= 0.85,
        };
      }),
      addMessage: (message) => set((state) => ({
        messages: [...state.messages, message],
      })),
      setInputValue: (value) => set({ inputValue: value }),
      setStreaming: (active) => set({ isStreaming: active }),
      setWsConnected: (connected) => set({ wsConnected: connected }),
      updateUiPreferences: (prefs) => set((state) => ({
        uiPreferences: { ...state.uiPreferences, ...prefs },
      })),
      clearMessages: () => set({ messages: [] }),
      resetState: () => set(initialState),
    }),
    {
      name: 'ang_ui_prefs',
      partialize: (state) => ({ uiPreferences: state.uiPreferences }),
    }
  )
);

// Selectors
export const selectSynthesis = (state: SynthesisStore) => state.synthesis;
export const selectTheta = (state: SynthesisStore) => state.theta;
export const selectCrisisMode = (state: SynthesisStore) => state.crisisMode;
export const selectMessages = (state: SynthesisStore) => state.messages;
export const selectIsStreaming = (state: SynthesisStore) => state.isStreaming;
export const selectThetaHistory = (state: SynthesisStore) => state.thetaHistory;
export const selectUiPreferences = (state: SynthesisStore) => state.uiPreferences;
export const selectWsConnected = (state: SynthesisStore) => state.wsConnected;
export const selectInputValue = (state: SynthesisStore) => state.inputValue;
