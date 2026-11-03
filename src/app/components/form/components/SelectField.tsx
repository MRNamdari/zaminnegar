import { useSelector } from "@tanstack/react-form";
import { useFieldContext } from "../hooks/formContext";

interface SelectOption {
  label: string;
  value: string;
}

interface SelectFieldProps {
  label: string;
  placeholder?: string;
  options: SelectOption[];
  required?: boolean;
}

export function SelectField({
  label,
  placeholder = "انتخاب کنید",
  options,
  required = false,
}: SelectFieldProps) {
  const field = useFieldContext<string>();

  const errors = useSelector(field.store, (state) => state.meta.errors);

  return (
    <div className="flex flex-col gap-1">
      <label className="block text-sm mb-2">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>

      <select
        required={required}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none cursor-pointer"
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {errors.length > 0 && (
        <span className="text-xs text-red-400">
          {errors
            .map((error) =>
              typeof error === "string" ? error : error.message
            )
            .join("، ")}
        </span>
      )}
    </div>
  );
}