'use client';

import { useEffect } from 'react';
import { toast, type ToastOptions } from 'react-toastify';
import {
  consoleErrorReporter,
  describeError,
  type EditorError,
  type ErrorReporter,
} from '../core/errors';
import { toEditorError } from '../infrastructure/query/result-adapters';

/**
 * The only place the editor shows an error to the user: a react-toastify toast.
 *
 * Needs one `<ToastContainer />` somewhere in the app (set `rtl` for Persian). The wording is the error's own
 * message, which is already Persian and comes from `core/error-messages.ts`.
 */

/** The same failure shown twice (a retry, two failed requests) replaces the toast instead of stacking another. */
const toastIdOf = (error: EditorError): string =>
  `map-editor:${error.category}/${error.code}${'featureId' in error && error.featureId ? `:${error.featureId}` : ''}`;

function ErrorToast({ title, message }: { title: string; message: string }) {
  return (
    <div dir="rtl">
      <strong>{title}</strong>
      <div>{message}</div>
    </div>
  );
}

export function notifyError(error: EditorError, options: ToastOptions = {}): void {
  const { title, message } = describeError(error);
  toast.error(<ErrorToast title={title} message={message} />, {
    toastId: toastIdOf(error),
    ...options,
  });
}

/** For failures that did not come from the editor (a query, a request of the host app). */
export function notifyUnknownError(cause: unknown, options?: ToastOptions): void {
  notifyError(toEditorError(cause), options);
}

/**
 * Shows a toast whenever `cause` becomes a new error, e.g. `useErrorToast(features.error)`.
 * `null`/`undefined` (no error) shows nothing.
 */
export function useErrorToast(cause: unknown): void {
  useEffect(() => {
    if (cause !== null && cause !== undefined) notifyUnknownError(cause);
  }, [cause]);
}

/**
 * The provider's default `onError`: every failure the editor reports is logged for developers and shown as a toast.
 * Pass your own `onError` to the provider to change either.
 */
export const toastErrorReporter: ErrorReporter = (error, context) => {
  consoleErrorReporter(error, context);
  notifyError(error);
};
