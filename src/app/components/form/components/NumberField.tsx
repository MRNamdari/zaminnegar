import { useSelector } from "@tanstack/react-form";
import { useFieldContext } from "../hooks/formContext";

interface NumberFieldProps {
  label: string;
  placeholder?: string;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function NumberField({
  label,
  placeholder,
  required = false,
  min,
  max,
  step = 1,
}: NumberFieldProps) {
  const field = useFieldContext<number | "">();

  const errors = useSelector(field.store, (state) => state.meta.errors);

  return (
    <div className="flex flex-col gap-1">
      <label className="block text-sm mb-2">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>

      <input
        type="number"
        required={required}
        min={min}
        max={max}
        step={step}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) =>
          field.handleChange(
            e.target.value === "" ? "" : Number(e.target.value)
          )
        }
        placeholder={placeholder}
        className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
      />

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