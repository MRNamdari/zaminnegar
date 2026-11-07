"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Controlled when `controlled !== undefined`; otherwise keeps its own state.
 * The setter always reports through `onChange`, and only mutates internal state when uncontrolled.
 */
export function useControllable<T>(
  controlled: T | undefined,
  initial: T,
  onChange?: (next: T) => void,
): readonly [T, (next: T) => void] {
  const [internal, setInternal] = useState(initial);
  const isControlled = controlled !== undefined;
  const onChangeRef = useRef(onChange);
  const controlledRef = useRef(isControlled);
  // Refs are refreshed after every commit so the stable setter never sees stale values.
  useRefSync(() => {
    onChangeRef.current = onChange;
    controlledRef.current = isControlled;
  });

  const set = useCallback((next: T) => {
    if (!controlledRef.current) setInternal(next);
    onChangeRef.current?.(next);
  }, []);

  return [isControlled ? controlled : internal, set] as const;
}

function useRefSync(fn: () => void) {
  useEffect(fn);
}
