import { useSelector } from "@tanstack/react-form";
import { IoChevronDown } from "react-icons/io5";
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
    <div>
      <label className="block text-sm mb-2">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>

      <div className="relative">
        <select
          required={required}
          value={field.state.value}
          onChange={(e) => field.handleChange(e.target.value)}
          onBlur={field.handleBlur}
          className="w-full p-2.5 rounded-lg bg-surface text-foreground border border-border outline-none appearance-none cursor-pointer"
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

        <IoChevronDown
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          size={18}
        />

        {errors.map((error, index) => (
          <p key={index} className="text-action-error text-sm mt-1">
            {typeof error === "string" ? error : error?.message}
          </p>
        ))}
      </div>
    </div>
  );
}