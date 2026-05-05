"use client";

import { useEffect, useRef } from "react";
import { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { createClient } from "./supabase/client";

const supabase = createClient();

export type RealtimeEvent = {
  table: string;
  eventType: "INSERT" | "UPDATE" | "DELETE";
  old: any;
  new: any;
};

export function useRealtime(
  tables: string[],
  onEvent: (event: RealtimeEvent) => void,
  filter?: string
) {
  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    if (!tables.length) return;

    const channel = supabase.channel(`realtime-${tables.join("-")}`);

    tables.forEach((table) => {
      const subscription = channel
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table,
            filter,
          },
          (payload: RealtimePostgresChangesPayload<any>) => {
            onEvent({
              table,
              eventType: payload.eventType,
              old: payload.old,
              new: payload.new,
            });
          }
        )
        .subscribe((status) => {
          if (status === "SUBSCRIBED") {
            console.log(`Subscribed to ${table} changes`);
          } else if (status === "CLOSED" || status === "CHANNEL_ERROR") {
            console.error(`Realtime subscription error for ${table}:`, status);
          }
        });
    });

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [tables, filter, onEvent]);

  return channelRef.current;
}
