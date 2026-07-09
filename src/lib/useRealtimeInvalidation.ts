import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

/**
 * Subscribes to Supabase postgres_changes on `table` (optionally filtered to a
 * single row, e.g. filter = "match_id=eq.21") and invalidates the given TanStack
 * Query cache key whenever any change lands. Refetch-on-reconnect and
 * refetch-on-window-focus are left to TanStack Query's defaults.
 */
export function useRealtimeInvalidation(
  table: string,
  queryKey: readonly unknown[],
  filter?: string,
) {
  const queryClient = useQueryClient();
  const keySerialised = JSON.stringify(queryKey);

  useEffect(() => {
    const channel = supabase
      .channel(`rt:${table}:${keySerialised}:${filter ?? ""}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table, filter },
        () => {
          queryClient.invalidateQueries({ queryKey: [...queryKey] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [table, keySerialised, filter, queryClient]);
}