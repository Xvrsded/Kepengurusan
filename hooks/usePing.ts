import { useState, useEffect, useRef } from "react";

export function usePing(interval: number = 3000) {
  const [latency, setLatency] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "good" | "warning" | "error">("loading");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const ping = async () => {
    const startTime = Date.now();
    try {
      const response = await fetch("/api/ping");
      const data = await response.json();
      const endTime = Date.now();
      const ms = endTime - startTime;
      
      setLatency(ms);
      
      if (ms < 80) {
        setStatus("good");
      } else if (ms < 200) {
        setStatus("warning");
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Ping error:", error);
      setLatency(null);
      setStatus("error");
    }
  };

  useEffect(() => {
    ping(); // Initial ping
    
    intervalRef.current = setInterval(() => {
      ping();
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [interval]);

  return { latency, status };
}
