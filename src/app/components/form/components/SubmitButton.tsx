import { useFormContext } from "../hooks/formContext";

interface SubmitButtonProps {
  label?: string;
  loadingText?: string;
}

export default function SubmitButton({
  label = "ثبت اطلاعات",
  loadingText = "در حال ثبت...",
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
          disabled={!canSubmit || isSubmitting}
          className="w-1/2 py-2.5 rounded-lg bg-action-primary hover:bg-action-primary-hover transition duration-300 cursor-pointer"
        >
          {isSubmitting ? loadingText : label}
        </button>
      )}
    </form.Subscribe>
  );
}