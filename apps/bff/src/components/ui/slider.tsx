'use client';

import { Slider as SliderPrimitive } from 'radix-ui';
import type { ComponentProps } from 'react';
import { cn } from '@/lib/utils/cn';

/** Single-thumb slider (Radix primitive), laid out right-to-left. */
export function Slider({ className, ...props }: ComponentProps<typeof SliderPrimitive.Root>) {
  return (
    <SliderPrimitive.Root dir="rtl" className={cn('relative flex h-5 w-full touch-none items-center select-none', className)} {...props}>
      <SliderPrimitive.Track className="relative h-1.5 grow rounded-full bg-line">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-field" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block size-4 rounded-full border-2 border-field bg-white shadow" />
    </SliderPrimitive.Root>
  );
}
