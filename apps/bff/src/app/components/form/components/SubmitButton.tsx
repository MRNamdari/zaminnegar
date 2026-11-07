import { useFormContext } from "../hooks/formContext";

interface SubmitButtonProps {
  label?: string;
  loadingText?: string;
  disabled?: boolean;
}

export default function SubmitButton({
  label = "ثبت اطلاعات",
  loadingText = "در حال ثبت...",
  disabled = false,
}: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe
      selector={(state) => ({
        isSubmitting: state.isSubmitting,
        canSubmit: state.canSubmit,
      })}
    >
      {({ isSubmitting, canSubmit }) => (
        <button
          type="submit"
          disabled={disabled || !canSubmit || isSubmitting}
          className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer disabled:bg-action-primary/50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? loadingText : label}
        </button>
      )}
    </form.Subscribe>
  );
}