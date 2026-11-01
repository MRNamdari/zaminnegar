"use client";

import {
  useEffect,
  useId,
  useRef,
  type ReactNode,
  type RefObject,
  type SyntheticEvent,
  type MouseEvent,
} from "react";
import { AiOutlineClose } from "react-icons/ai";

/**
 * Props for the Dialog component.
 */
export interface DialogProps {
  /**
   * Controls whether the dialog is open.
   */
  open: boolean;

  /**
   * Called whenever the native dialog is closed or requests to close.
   */
  onOpenChange: (open: boolean) => void;

  /**
   * Content rendered inside the dialog.
   */
  children: ReactNode;

  /**
   * Accessible dialog title.
   * Automatically connected using aria-labelledby.
   */
  title?: string;

  /**
   * Accessible description of the dialog.
   * Automatically connected using aria-describedby.
   */
  description?: string;

  /**
   * Accessible name used when no title is provided.
   */
  ariaLabel?: string;

  /**
   * Additional Tailwind CSS classes applied to the dialog.
   */
  className?: string;

  /**
   * Whether to render the built-in close button.
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Whether clicking the backdrop closes the dialog.
   * @default true
   */
  closeOnBackdropClick?: boolean;

  /**
   * Whether pressing Escape closes the dialog.
   * @default true
   */
  closeOnEscape?: boolean;

  /**
   * Optional element to receive focus after the dialog opens.
   * If omitted, native browser focus behavior is used.
   */
  initialFocusRef?: RefObject<HTMLElement | null>;
}

/**
 * A responsive, accessible modal dialog built on the native HTML Dialog API.
 *
 * Features:
 * - Native modal behavior and focus trapping.
 * - Background inertness while open.
 * - Escape key handling.
 * - Optional backdrop dismissal.
 * - Native focus restoration.
 * - Mobile bottom-sheet layout.
 * - Accessible title and description.
 *
 * @example
 * ```tsx
 * <Dialog
 *   open={open}
 *   onOpenChange={setOpen}
 *   title="Delete item"
 *   description="This action cannot be undone."
 * >
 *   <p>Are you sure?</p>
 * </Dialog>
 * ```
 */
export function Dialog({
  open,
  onOpenChange,
  children,
  title,
  description,
  ariaLabel,
  className = "",
  showCloseButton = true,
  closeOnBackdropClick = true,
  closeOnEscape = true,
  initialFocusRef,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const titleId = useId();
  const descriptionId = useId();

  /**
   * Synchronizes React state with the native Dialog API.
   */
  useEffect(() => {
    const dialog = dialogRef.current;

    if (!dialog) return;

    if (open && !dialog.open) {
      dialog.showModal();

      initialFocusRef?.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open, initialFocusRef]);

  /**
   * Handles the native cancel event, normally triggered by Escape.
   */
  const handleCancel = (event: SyntheticEvent<HTMLDialogElement>) => {
    if (!closeOnEscape) {
      event.preventDefault();
      return;
    }

    onOpenChange(false);
  };

  /**
   * Synchronizes native dialog closure with React state.
   */
  const handleClose = () => {
    onOpenChange(false);
  };

  /**
   * Handles clicks directly on the dialog backdrop.
   */
  const handleBackdropClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onOpenChange(false);
    }
  };

  const handleCloseClick = () => {
    onOpenChange(false);
  };

  const accessibleName = title ? undefined : ariaLabel || "Dialog";

  return (
    <dialog
      ref={dialogRef}
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
      aria-label={accessibleName}
      onCancel={handleCancel}
      onClose={handleClose}
      onClick={handleBackdropClick}
      className={`
        ui-dialog
        m-0 mt-auto w-full max-w-none
        max-h-[calc(100dvh-env(safe-area-inset-top)-1rem)]
        overflow-y-auto overscroll-contain
        rounded-t-2xl border-0
        bg-surface-raised p-5 
        text-foreground shadow-2xl

        sm:m-auto sm:w-[calc(100%-2rem)]
        sm:max-w-lg sm:rounded-2xl sm:p-6

        focus:outline-none
        ${className}
      `}
    >
      {(title || description || showCloseButton) && (
        <header className="mb-5 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {title && (
              <h2
                id={titleId}
                className="text-lg text-foreground font-semibold"
              >
                {title}
              </h2>
            )}

            {description && (
              <p
                id={descriptionId}
                className="mt-1 text-sm leading-6 text-foreground-secondary"
              >
                {description}
              </p>
            )}
          </div>

          {showCloseButton && (
            <button
              type="button"
              onClick={handleCloseClick}
              aria-label="Close dialog"
              className="
                inline-flex size-11 shrink-0 items-center
                justify-center rounded-full
                text-foreground
                hover:text-foreground-hover
                transition-colors
                hover:bg-surface-raised-hover
                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-action-primary-hover
                focus-visible:ring-offset-2
                cursor-pointer
              "
            >
              <AiOutlineClose />
            </button>
          )}
        </header>
      )}

      {children}
    </dialog>
  );
}
