import { useSelector } from "@tanstack/react-form";
import { useFieldContext } from "../hooks/formContext";
import React from "react";

interface TextFieldProps {
  label: string;
  placeholder?: string;
  type?: React.HTMLInputTypeAttribute;
  required?: boolean;
  disabled?: boolean;
}

export function TextField({
  label,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
}: TextFieldProps) {
  const field = useFieldContext<string>();
  const errors = useSelector(field.store, (state) => state.meta.errors);
  return (
    <div className="flex flex-col gap-1">
      <label className="block text-sm mb-2">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={field.state.value}
        disabled={disabled}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full p-2.5 rounded-lg bg-slate-700 text-white border border-border outline-none"
      />
      {errors.length > 0 && (
        <span className="text-xs text-red-400">
          {errors
            .map((error) => (typeof error === "string" ? error : error.message))
            .join("، ")}
        </span>
      )}
    </div>
  );
}
