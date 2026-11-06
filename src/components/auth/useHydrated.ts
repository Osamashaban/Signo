"use client";

import { useSyncExternalStore } from "react";

// False in the server HTML, true once React runs in the browser. Form buttons
// wait for it, so a tap before the page is ready cannot lose its answer.
const subscribe = () => () => {};
export function useHydrated(): boolean {
  return useSyncExternalStore(subscribe, () => true, () => false);
}
