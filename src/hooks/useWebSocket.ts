import { useEffect, useRef } from 'react';
import { useSynthesisStore } from '../store/synthesisStore';
import { WSMessage } from '../types/synthesis';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseBackoff = 1000; // 1s

  const {
    setWsConnected,
    setSynthesis,
    setTheta,
    addMessage,
    setStreaming,
    isStreaming,
    synthesis,
    theta
  } = useSynthesisStore();

  useEffect(() => {
    const connect = () => {
      const wsUrl = import.meta.env.VITE_WS_URL || 'wss://localhost:8000/ws/synthesis';
      
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('[WS] Connected to synthesis engine');
          setWsConnected(true);
          reconnectAttemptsRef.current = 0;
        };

        ws.onmessage = (event) => {
          try {
            const message: WSMessage = JSON.parse(event.data);
            
            switch (message.type) {
              case 'synthesis_chunk':
                if (message.payload.text) {
                  setSynthesis(useSynthesisStore.getState().synthesis + message.payload.text);
                }
                break;
              case 'theta_update':
                if (message.payload.theta !== undefined) {
                  setTheta(message.payload.theta);
                }
                break;
              case 'complete':
                setStreaming(false);
                addMessage({
                  id: message.payload.messageId || Date.now().toString(),
                  text: useSynthesisStore.getState().synthesis,
                  timestamp: message.payload.timestamp || Date.now(),
                  theta: useSynthesisStore.getState().theta,
                  markers: [], // Markers are parsed on the fly
                });
                setSynthesis('');
                break;
              case 'error':
                console.error('[WS] Error from server:', message.payload.error);
                setStreaming(false);
                break;
            }
          } catch (err) {
            console.error('[WS] Failed to parse message:', err);
          }
        };

        ws.onclose = () => {
          console.log('[WS] Disconnected');
          setWsConnected(false);
          handleReconnect();
        };

        ws.onerror = (error) => {
          console.error('[WS] Connection error:', error);
        };
      } catch (err) {
        console.error('[WS] Failed to create WebSocket:', err);
        handleReconnect();
      }
    };

    const handleReconnect = () => {
      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        const backoff = Math.min(30000, baseBackoff * Math.pow(2, reconnectAttemptsRef.current));
        console.log(`[WS] Reconnecting in ${backoff}ms...`);
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttemptsRef.current++;
          connect();
        }, backoff);
      } else {
        console.error('[WS] Max reconnect attempts reached');
      }
    };

    // We only connect if we actually have a real backend, but for this demo we might not.
    // We will attempt to connect.
    connect();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = (text: string) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      setStreaming(true);
      setSynthesis('');
      wsRef.current.send(JSON.stringify({
        type: 'user_input',
        payload: { text }
      }));
    } else {
      console.warn('[WS] Cannot send message, not connected');
      // Fallback for demo purposes if no real WS server exists
      simulateResponse();
    }
  };

  const simulateResponse = () => {
    setStreaming(true);
    setSynthesis('');
    
    const mockResponse = "The void is ⊗ being and non-being simultaneously. [INFERRED] from Nāgārjuna's analysis. ∅ concept exists in the apophatic tradition. ~Perhaps this is the core insight~ [SPECULATIVE]";
    let i = 0;
    
    const interval = setInterval(() => {
      if (i < mockResponse.length) {
        setSynthesis(useSynthesisStore.getState().synthesis + mockResponse[i]);
        if (i % 10 === 0) {
          // Fluctuating theta for demo
          const currentTheta = useSynthesisStore.getState().theta;
          const newTheta = Math.max(0, Math.min(1, currentTheta + (Math.random() - 0.5) * 0.1));
          setTheta(newTheta);
        }
        i++;
      } else {
        clearInterval(interval);
        setStreaming(false);
        addMessage({
          id: Date.now().toString(),
          text: useSynthesisStore.getState().synthesis,
          timestamp: Date.now(),
          theta: useSynthesisStore.getState().theta,
          markers: [],
        });
        setSynthesis('');
      }
    }, 50);
  };

  return { sendMessage };
}
