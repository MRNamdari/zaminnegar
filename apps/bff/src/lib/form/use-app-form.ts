'use client';

import { createFormHook } from '@tanstack/react-form';
import { ColorField } from '@/components/form/color-field';
import { SliderField } from '@/components/form/slider-field';
import { SubmitButton } from '@/components/form/submit-button';
import { TextareaField } from '@/components/form/textarea-field';
import { TextField } from '@/components/form/text-field';
import { fieldContext, formContext } from './form-context';

/**
 * The one way to build forms in this app. Pre-bound field components keep markup,
 * accessibility and error display identical everywhere.
 *
 * @example
 * const form = useAppForm({ defaultValues: { name: '' }, validators: { onChange: schema } });
 * <form.AppField name="name">{(field) => <field.TextField label="Name" />}</form.AppField>
 */
export const { useAppForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: { TextField, TextareaField, SliderField, ColorField },
  formComponents: { SubmitButton },
});
