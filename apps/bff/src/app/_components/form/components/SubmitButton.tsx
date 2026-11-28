import { useFormContext } from '../hooks/formContext';
import type { LucideIcon } from 'lucide-react';

interface SubmitButtonProps {
  label?: string;
  loadingText?: string;
  disabled?: boolean;
  icon?: LucideIcon;
}

export default function SubmitButton({
  label = 'ثبت اطلاعات',
  loadingText = 'در حال ثبت...',
  disabled = false,
  icon: Icon,
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
          className="w-full p-4 rounded-lg bg-action-primary font-medium text-dark hover:bg-action-primary-hover transition duration-300 cursor-pointer disabled:bg-action-primary/50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {Icon && <Icon size={18} />}

          {isSubmitting ? loadingText : label}
        </button>
      )}
    </form.Subscribe>
  );
}
