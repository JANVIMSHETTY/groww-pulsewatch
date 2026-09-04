import { useState, useEffect, useRef, useCallback } from "react";
import { ProcessedQuote } from "../types/market.js";

export function useMarketFeed() {
  const [quotes, setQuotes] = useState<ProcessedQuote[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<"CONNECTED" | "CONNECTING" | "DISCONNECTED">("CONNECTING");
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<any>(null);

  const connect = useCallback(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.port === "3000" ? "localhost:4000" : window.location.host;
    const wsUrl = `${protocol}//${host}/ws/market`;

    try {
      const socket = new WebSocket(wsUrl);
      wsRef.current = socket;
      setConnectionStatus("CONNECTING");

      socket.onopen = () => {
        setConnectionStatus("CONNECTED");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "INITIAL_STATE" || data.type === "MARKET_UPDATE") {
            setQuotes(data.quotes);
            setLastMessageTime(new Date());
          }
        } catch (err) {
          console.error("Error parsing WebSocket payload:", err);
        }
      };

      socket.onclose = () => {
        setConnectionStatus("DISCONNECTED");
        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, 2000);
      };

      socket.onerror = () => {
        socket.close();
      };
    } catch (e) {
      setConnectionStatus("DISCONNECTED");
      reconnectTimeoutRef.current = setTimeout(() => {
        connect();
      }, 3000);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
      if (wsRef.current) wsRef.current.close();
    };
  }, [connect]);

  return {
    quotes,
    connectionStatus,
    lastMessageTime,
  };
}
