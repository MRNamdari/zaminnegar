'use client';

import { describeError, isRetryable } from '../core/errors';
import { activeSession } from '../domain/lifecycle';
import {
  useEditorConfig,
  useWorkspaceActions,
  useWorkspaceOperations,
  useWorkspaceState,
} from '../react/hooks';

const button =
  'rounded-lg px-3 py-1 text-xs font-semibold cursor-pointer bg-surface-raised-hover hover:bg-surface-muted-hover';

/** Shows the geometry lifecycle and offers the actions valid in the current state. */
export function StatusBar() {
  const { lifecycle } = useWorkspaceState();
  const { ui } = useEditorConfig();
  const actions = useWorkspaceActions();
  const operations = useWorkspaceOperations();
  const texts = ui.texts;
  const session = activeSession(lifecycle);

  let message: string | null = null;
  const controls: React.ReactNode[] = [];

  switch (lifecycle.status) {
    case 'drawing':
      message = 'Click to add points, Enter to finish, Esc to cancel';
      controls.push(
        <button
          key="c"
          className={button}
          onClick={() => void actions.cancelDrawing()}
        >
          {texts.cancel}
        </button>,
      );
      break;
    case 'draft':
      message = 'Unsaved drawing';
      controls.push(
        <button
          key="s"
          className={button}
          onClick={() => void operations.saveDraft()}
        >
          {texts.save}
        </button>,
      );
      controls.push(
        <button
          key="c"
          className={button}
          onClick={() => void actions.cancelSession()}
        >
          {texts.cancel}
        </button>,
      );
      break;
    case 'saving':
    case 'updating':
      message = 'در حال ذخیره سازی…';
      break;
    case 'editing':
      message = session?.conflict
        ? session.conflict.kind === 'deleted'
          ? 'این مرزبندی از سرور حذف شده است'
          : 'این مرزبندی در سرور تغییر کرده است'
        : 'مرزبندی ذخیره نشده است';
      if (session?.conflict?.kind === 'updated') {
        controls.push(
          <button
            key="k"
            className={button}
            onClick={() => void actions.resolveConflict('keep-local')}
          >
            {'این نسخه را نگه دار'}
          </button>,
        );
        controls.push(
          <button
            key="u"
            className={button}
            onClick={() => void actions.resolveConflict('use-server')}
          >
            {'نسخه سرور را نگه دار'}
          </button>,
        );
      } else if (session?.conflict?.kind === 'deleted') {
        controls.push(
          <button
            key="d"
            className={button}
            onClick={() => void actions.resolveConflict('use-server')}
          >
            Discard
          </button>,
        );
      } else {
        controls.push(
          <button
            key="s"
            className={button}
            onClick={() => void operations.saveEdit()}
          >
            {texts.save}
          </button>,
        );
        controls.push(
          <button
            key="c"
            className={`${button} bg-action-error`}
            onClick={() => void actions.cancelSession()}
          >
            {texts.cancel}
          </button>,
        );
      }
      break;
    case 'failed': {
      const { title, message: detail } = describeError(lifecycle.failure.error);
      message = `${title}: ${detail}`;
      if (isRetryable(lifecycle.failure.error)) {
        controls.push(
          <button
            key="r"
            className={button}
            onClick={() => void operations.retry()}
          >
            {texts.retry}
          </button>,
        );
      }
      controls.push(
        <button
          key="c"
          className={button}
          onClick={() => void actions.cancelSession()}
        >
          {texts.cancel}
        </button>,
      );
      break;
    }
    default:
      return null;
  }

  return (
    <div
      role="status"
      dir="rtl"
      className="absolute bottom-3 left-1/2 z-20 flex max-w-[70%] -translate-x-1/2 items-center gap-3 rounded-xl bg-surface-raised px-4 py-2 text-xs font-medium shadow"
    >
      <span>{message}</span>
      {controls}
    </div>
  );
}
