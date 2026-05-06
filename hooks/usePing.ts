import { useState, useEffect, useRef } from "react";

export function usePing(activeInterval: number = 3000, inactiveInterval: number = 10000) {
  const [latency, setLatency] = useState<number | null>(null);
  const [status, setStatus] = useState<"loading" | "good" | "warning" | "error">("loading");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const latenciesRef = useRef<number[]>([]);

  const calculateMovingAverage = (newLatency: number) => {
    const latencies = latenciesRef.current;
    latencies.push(newLatency);
    
    // Keep only last 5 measurements
    if (latencies.length > 5) {
      latencies.shift();
    }
    
    const sum = latencies.reduce((acc, val) => acc + val, 0);
    return sum / latencies.length;
  };

  const ping = async () => {
    // Abort previous request if still pending
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    const timeoutId = setTimeout(() => {
      abortController.abort();
    }, 3000); // 3 second timeout

    try {
      const startTime = performance.now();
      const response = await fetch("/api/ping", {
        signal: abortController.signal,
      });
      const data = await response.json();
      const endTime = performance.now();
      clearTimeout(timeoutId);
      
      const ms = endTime - startTime;
      const avgLatency = calculateMovingAverage(ms);
      
      setLatency(Math.round(avgLatency));
      
      if (avgLatency < 80) {
        setStatus("good");
      } else if (avgLatency < 150) {
        setStatus("warning");
      } else {
        setStatus("error");
      }
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error?.name === "AbortError") {
        console.warn("Ping request aborted (timeout)");
      } else {
        console.error("Ping error:", error);
      }
      setLatency(null);
      setStatus("error");
    } finally {
      abortControllerRef.current = null;
    }
  };

  useEffect(() => {
    ping(); // Initial ping
    
    const updateInterval = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      
      const interval = document.visibilityState === "visible" ? activeInterval : inactiveInterval;
      intervalRef.current = setInterval(() => {
        ping();
      }, interval);
    };

    updateInterval();

    // Listen for visibility changes
    const handleVisibilityChange = () => {
      updateInterval();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [activeInterval, inactiveInterval]);

  return { latency, status };
}
