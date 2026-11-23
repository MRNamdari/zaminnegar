'use client';

import { Activity, useRef, useState, type ComponentType } from 'react';
import type { Draft } from '../domain/lifecycle';
import { useWorkspaceActions, useWorkspaceState } from './hooks';
import { Dialog } from '@/app/_components/Dialog';

export type DraftConfigurationValues<V extends Record<string, unknown>> =
  Readonly<Partial<V>>;

export interface DraftConfigurationStepProps<
  V extends Record<string, unknown>,
> {
  /** The geometry and core metadata produced when drawing finished. */
  draft: Draft;

  /** Values submitted by this and all preceding steps. */
  values: DraftConfigurationValues<V>;

  /** Submit this step's values; the coordinator advances or creates on the last step. */
  onSubmit: (values: Partial<V>) => void;

  /** Return to the preceding step without losing submitted values. */
  onBack: () => void;

  /** Cancel the entire drawing/configuration session. */
  onCancel: () => void;

  /** True for the first configured step. */
  isFirst: boolean;

  /** True for the final configured step. */
  isLast: boolean;

  /** True while the final configuration command is being accepted. */
  isSubmitting: boolean;

  /** A synchronous validation/action error from final submission, if any. */
  errorMessage?: string;
}

export interface DraftConfigurationStep<V extends Record<string, unknown>> {
  id: string;
  label?: string;
  description?: string;
  component: ComponentType<DraftConfigurationStepProps<V>>;
}

export interface DraftConfigurationFlowProps<
  V extends Record<string, unknown>,
> {
  /** Ordered forms. The final form submission automatically creates the feature. */
  steps: readonly DraftConfigurationStep<V>[];
}

/**
 * Coordinates sequential forms for a newly drawn feature.
 * Each step is responsible for rendering its own dialog/popover and its own Zod form.
 */
export function DraftConfigurationFlow<V extends Record<string, unknown>>({
  steps,
}: DraftConfigurationFlowProps<V>) {
  const { lifecycle } = useWorkspaceState();

  if (steps.length === 0) return null;

  const configuring = lifecycle.status === 'configuring' ? lifecycle : undefined;

  return (
    // Keyed by draft: the step reached and the values entered belong to one drawn feature, so a new draft starts
    // from the first step with empty forms instead of inheriting the previous feature's answers.
    <DraftConfigurationSession<V>
      key={configuring?.draft.draftId ?? 'none'}
      draft={configuring?.draft}
      dialogOpen={configuring?.dialogOpen ?? false}
      steps={steps}
    />
  );
}

interface DraftConfigurationSessionProps<V extends Record<string, unknown>> {
  draft?: Draft;
  /** False after the dialog was closed without submitting; the draft (and what was entered) is kept. */
  dialogOpen: boolean;
  steps: readonly DraftConfigurationStep<V>[];
}

function DraftConfigurationSession<V extends Record<string, unknown>>({
  draft,
  dialogOpen,
  steps,
}: DraftConfigurationSessionProps<V>) {
  const actions = useWorkspaceActions();

  const [stepIndex, setStepIndex] = useState(0);

  const [values, setValues] = useState<Partial<V>>({});

  const [errorMessage, setErrorMessage] = useState<string>();

  const [submitting, setSubmitting] = useState(false);

  const submittingRef = useRef(false);

  const handleSubmit = (stepValues: Partial<V>) => {
    if (submittingRef.current) return;

    const nextValues: Partial<V> = {
      ...values,
      ...stepValues,
    };

    setValues(nextValues);
    setErrorMessage(undefined);

    if (stepIndex < steps.length - 1) {
      setStepIndex((current) => current + 1);
      return;
    }

    submittingRef.current = true;
    setSubmitting(true);

    const result = actions.completeDraftConfiguration(nextValues);

    if (result.isErr()) {
      submittingRef.current = false;
      setSubmitting(false);
      setErrorMessage(result.error.message);
    }

    if (result.isOk()){
      submittingRef.current = false;
      setSubmitting(false)
    }
  };

  const handleCancel = () => {
    actions.cancelSession();
  };

  // Closing the dialog is not cancelling: the draft stays, and the status bar offers to open the dialog again.
  const handleDismiss = () => {
    actions.dismissDraftConfiguration();
  };

  return (
    <Dialog
      open={draft !== undefined && dialogOpen}
      onOpenChange={(open) => {
        !open && handleDismiss();
      }}
      title={steps[stepIndex]?.label}
      description={steps[stepIndex]?.description}
      closeOnBackdropClick={false}
      closeOnEscape={false}
    >
      {draft &&
        steps.map((step, index) => (
          <step.component
            key={step.id}
            draft={draft}
            values={values}
            onSubmit={handleSubmit}
            onBack={() => {
              if (stepIndex > 0) {
                setErrorMessage(undefined);
                setStepIndex((current) => current - 1);
              }
            }}
            onCancel={handleCancel}
            isFirst={stepIndex === 0}
            isLast={stepIndex === steps.length - 1}
            isSubmitting={submitting}
            errorMessage={errorMessage}
          />
        ))}
    </Dialog>
  );
}
