'use client';

import { fa } from '@/messages/fa';
import { useWorkspace } from '../context/workspace-context';

const HINTS = { select: fa.map.hintSelect, draw: fa.map.hintDraw, edit: fa.map.hintEdit } as const;

/** One-line instruction for the active tool. */
export function WorkspaceHint() {
  const { mode } = useWorkspace();
  return <p className="rounded-full bg-ink/80 px-3 py-1 text-center text-xs text-white">{HINTS[mode]}</p>;
}
