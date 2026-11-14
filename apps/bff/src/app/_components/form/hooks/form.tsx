import { createFormHook } from '@tanstack/react-form';

import { fieldContext, formContext } from './formContext';
import { NumberField } from '../components/NumberField';
import { SelectField } from '../components/SelectField';
import SubmitButton from '../components/SubmitButton';
import { TextareaField } from '../components/TextareaField';
import { TextField } from '../components/TextField';

export const {
  useAppForm,
  withForm,
  withFieldGroup,
  extendForm,
  useTypedAppFormContext,
} = createFormHook({
  fieldContext,
  formContext,

  fieldComponents: {
    TextField,
    TextareaField,
    SelectField,
    NumberField,
  },

  formComponents: {
    SubmitButton,
  },
});
