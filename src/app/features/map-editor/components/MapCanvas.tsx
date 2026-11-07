"use client";

import { useEffect, useRef, useState } from "react";
import { boundsOf } from "../domain/geometry";
import { createMapEngine } from "../engine/create-engine";
import type { MapEngine } from "../engine/contracts";
import { useEngineBridge, useViewState, useWorkspaceState } from "../react/hooks";

interface Props {
  minimapContainer: HTMLElement | null;
}

/**
 * Owns the engine's React lifecycle and nothing else. It forwards application state to the
 * engine (`renderModel`, `config`) and engine events back to the workspace. Safe under
 * React Strict Mode: every effect that creates something destroys it in its cleanup.
 */
export function MapCanvas({ minimapContainer }: Props) {
  const bridge = useEngineBridge();
  const bridgeRef = useRef(bridge);
  useEffect(() => {
    bridgeRef.current = bridge;
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const [engine, setEngine] = useState<MapEngine | null>(null);
  const fittedRef = useRef(false);
  const { isMapReady } = useViewState();
  const { features } = useWorkspaceState();

  // Create/destroy the engine exactly once per mount. Runtime config changes never recreate it.
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;
    const current = bridgeRef.current;
    const created = createMapEngine({ container: element, config: current.config });
    if (created.isErr()) {
      current.report(created.error, "create-engine");
      return;
    }
    const instance = created.value;
    const unsubscribe = instance.subscribe((event) => bridgeRef.current.handleEngineEvent(event));
    current.registerEngine(instance);
    setEngine(instance);
    fittedRef.current = false;
    return () => {
      unsubscribe();
      current.registerEngine(null);
      instance.destroy();
      setEngine(null);
    };
  }, []);

  useEffect(() => {
    engine?.applyConfig(bridge.config).mapErr((error) => bridge.report(error, "apply-config"));
  }, [engine, bridge.config, bridge]);

  useEffect(() => {
    engine?.syncRenderModel(bridge.renderModel).mapErr((error) => bridge.report(error, "sync"));
  }, [engine, bridge.renderModel, bridge]);

  useEffect(() => {
    engine?.setMinimapContainer(minimapContainer);
  }, [engine, minimapContainer]);

  // Frame the data once, the first time features are available.
  useEffect(() => {
    if (!engine || !isMapReady || fittedRef.current || features.features.length === 0) return;
    const bounds = boundsOf(features.features);
    if (!bounds) return;
    fittedRef.current = true;
    engine.commands.fitBounds(bounds, { animate: false }).mapErr((error) => bridge.report(error, "fit-bounds"));
  }, [engine, isMapReady, features, bridge]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}
