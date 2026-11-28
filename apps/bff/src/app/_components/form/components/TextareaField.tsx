import React from "react";
import { useSelector } from "@tanstack/react-form";
import { useFieldContext } from "../hooks/formContext";

interface TextAreaFieldProps {
  label: string;
  placeholder: string;
  rows?: number;
  required?: boolean;
  className?: string;
}

export function TextareaField({
  label,
  placeholder,
  rows = 3,
  required = false,
  className
}: TextAreaFieldProps) {
  const field = useFieldContext<string>();

  const errors = useSelector(field.store, (state) => state.meta.errors);

  return (
    <div className="flex flex-col gap-1">
      <label className="block text-foreground text-sm mb-2">
        {label}
        {required && <span className="text-red-400">*</span>}
      </label>
      <textarea
        className={`w-full px-2.5 py-4 text-text font-medium rounded-lg bg-surface outline-none ${className ?? ''}`}
        required={required}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      ></textarea>
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
