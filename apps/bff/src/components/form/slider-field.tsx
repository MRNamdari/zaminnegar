'use client';

import { useId } from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { useFieldContext } from '@/lib/form/form-context';

interface SliderFieldProps {
  label: string;
  min: number;
  max: number;
  step: number;
  /** Formats the current value for display next to the label. */
  formatValue?: (value: number) => string;
}

/** Numeric slider bound to the surrounding TanStack Form field. */
export function SliderField({ label, min, max, step, formatValue = String }: SliderFieldProps) {
  const field = useFieldContext<number>();
  const id = useId();
  return (
    <div className="grid gap-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>{label}</Label>
        <output className="font-medium">{formatValue(field.state.value)}</output>
      </div>
      <Slider id={id} min={min} max={max} step={step} value={[field.state.value]} onValueChange={([value]) => field.handleChange(value)} />
    </div>
  );
}
