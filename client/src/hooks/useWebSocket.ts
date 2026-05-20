import { useEffect, useRef, useState, useCallback } from 'react';
import { WebSocketHook, WsMessage } from '../types';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:5000';

export const useWebSocket = (): WebSocketHook => {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const listenersRef = useRef<Record<string, (msg: WsMessage) => void>>({});

  const connect = useCallback(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(`${WS_URL}/ws?token=${token}`);

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onclose = () => {
      setIsConnected(false);
      setIsStreaming(false);
      console.log('WebSocket disconnected');
      setTimeout(() => connect(), 3000);
    };

    ws.onerror = (err) => {
      console.error('WebSocket error:', err);
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
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
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
