"use client";

import { useRef, useState, type ComponentType } from "react";
import type { Draft } from "../domain/lifecycle";
import { useWorkspaceActions, useWorkspaceState } from "./hooks";

export type DraftConfigurationValues = Readonly<Record<string, unknown>>;

export interface DraftConfigurationStepProps {
  /** The geometry and core metadata produced when drawing finished. */
  draft: Draft;
  /** Values submitted by this and all preceding steps. */
  values: DraftConfigurationValues;
  /** Submit this step's values; the coordinator advances or creates on the last step. */
  onSubmit: (values: DraftConfigurationValues) => void;
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

export interface DraftConfigurationStep {
  id: string;
  component: ComponentType<DraftConfigurationStepProps>;
}

export interface DraftConfigurationFlowProps {
  /** Ordered forms. The final form submission automatically creates the feature. */
  steps: readonly DraftConfigurationStep[];
}

/**
 * Coordinates sequential forms for a newly drawn feature.
 * Each step is responsible for rendering its own dialog/popover and its own Zod form.
 */
export function DraftConfigurationFlow({
  steps,
}: DraftConfigurationFlowProps) {
  const { lifecycle } = useWorkspaceState();

  if (lifecycle.status !== "configuring") return null;
  if (steps.length === 0) return null;

  return (
    <DraftConfigurationSession
      key={lifecycle.draft.draftId}
      draft={lifecycle.draft}
      steps={steps}
    />
  );
}

function DraftConfigurationSession({
  draft,
  steps,
}: {
  draft: Draft;
  steps: readonly DraftConfigurationStep[];
}) {
  const actions = useWorkspaceActions();
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<DraftConfigurationValues>({});
  const [errorMessage, setErrorMessage] = useState<string>();
  const [submitting, setSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const step = steps[stepIndex];
  if (!step) return null;
  const StepComponent = step.component;

  const handleSubmit = (stepValues: DraftConfigurationValues) => {
    if (submittingRef.current) return;

    const nextValues = { ...values, ...stepValues };
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
  };

  const handleCancel = () => {
    actions.cancelSession();
  };

  return (
    <StepComponent
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
  );
}
