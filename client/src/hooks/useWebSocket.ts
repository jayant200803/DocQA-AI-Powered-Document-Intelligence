import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketHook, WsMessage } from '../types';

// Derive WS URL from VITE_WS_URL, or fall back to converting VITE_API_URL's
// scheme (https→wss, http→ws). This means only VITE_API_URL is needed in Render.
const WS_URL: string = (() => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL as string;
  if (import.meta.env.VITE_API_URL) {
    return (import.meta.env.VITE_API_URL as string).replace(/^https/, 'wss').replace(/^http(?!s)/, 'ws');
  }
  return 'ws://localhost:5000';
})();

export const useWebSocket = (): WebSocketHook => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const listenersRef = useRef<Record<string, (msg: WsMessage) => void>>({});
  const shouldReconnectRef = useRef(false);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Exponential backoff: 3s, 6s, 12s, 24s, capped at 30s
  const reconnectAttemptsRef = useRef(0);

  const connect = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const state = wsRef.current?.readyState;
    if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) return;

    shouldReconnectRef.current = true;
    const ws = new WebSocket(`${WS_URL}/ws?token=${token}`);

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttemptsRef.current = 0; // reset backoff on success
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsStreaming(false);
      if (shouldReconnectRef.current) {
        const delay = Math.min(3000 * 2 ** reconnectAttemptsRef.current, 30000);
        reconnectAttemptsRef.current += 1;
        reconnectTimerRef.current = setTimeout(() => connect(), delay);
      }
    };

    ws.onerror = () => {
      // onclose fires immediately after onerror — backoff handled there
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data as string) as WsMessage;
        const handler = listenersRef.current[message.type];
        if (handler) handler(message);
      } catch (err) {
        console.error('Failed to parse WS message:', err);
      }
    };

    wsRef.current = ws;
  }, []);

  const disconnect = useCallback(() => {
    shouldReconnectRef.current = false;
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      const ws = wsRef.current;
      wsRef.current = null;
      // Null handlers before closing to prevent stale state updates after unmount
      ws.onopen = null;
      ws.onclose = null;
      ws.onerror = null;
      ws.onmessage = null;
      if (ws.readyState < WebSocket.CLOSING) {
        ws.close();
      }
    }
  }, []);

  const on = useCallback((type: string, handler: (msg: WsMessage) => void) => {
    listenersRef.current[type] = handler;
  }, []);

  const off = useCallback((type: string) => {
    delete listenersRef.current[type];
  }, []);

  const sendMessage = useCallback(
    (question: string, documentIds: string[], sessionId: string) => {
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        console.error('WebSocket not connected');
        return;
      }
      setIsStreaming(true);
      wsRef.current.send(
        JSON.stringify({ type: 'ask', question, documentIds, sessionId })
      );
    },
    []
  );

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
  }, []);

  useEffect(() => {
    return () => disconnect();
  }, [disconnect]);

  return { connect, disconnect, sendMessage, on, off, isConnected, isStreaming, stopStreaming };
};
