// Synthesis message
export interface SynthesisMessage {
  id: string;
  text: string;
  timestamp: number; // Unix ms
  theta: number; // 0–1
  markers: SynthesisMarker[];
}

// Marker in synthesis text
export interface SynthesisMarker {
  type: 'contradiction' | 'empty' | 'uncertain' | 'inferred' | 'speculative';
  start: number; // Character index
  end: number;
  content: string;
}

// Zustand store state
export interface SynthesisStoreState {
  synthesis: string;
  theta: number;
  thetaHistory: number[];
  messages: SynthesisMessage[];
  inputValue: string;
  isStreaming: boolean;
  crisisMode: boolean;
  uiPreferences: UIPreferences;
  wsConnected: boolean;
}

// UI preferences
export interface UIPreferences {
  theme: 'light' | 'dark';
  fontSize: 'sm' | 'md' | 'lg';
  compactMode: boolean;
  soundAlerts: boolean;
}

// WebSocket message types
export type WSMessageType = 'synthesis_chunk' | 'theta_update' | 'complete' | 'error';

export interface WSMessage {
  type: WSMessageType;
  payload: Record<string, any>;
}
