import { createFormHookContexts } from '@tanstack/react-form';

/** Contexts that let field/form components read the form they are rendered in. */
export const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts();
