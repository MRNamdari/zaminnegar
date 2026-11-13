<<<<<<< HEAD
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
=======
import { createFormHook } from "@tanstack/react-form";
import SubmitButton from "../components/SubmitButton";

import {
  fieldContext,
  formContext,
} from "./formContext";

import { TextField } from "../components/TextField";
import { TextareaField } from "../components/TextareaField";
import { SelectField } from "../components/SelectField";
import { NumberField } from "../components/NumberField";

export const { useAppForm, withForm, withFieldGroup, extendForm, useTypedAppFormContext } = createFormHook({
>>>>>>> 4cb1c72 (chore(bff): rename component dir to _component)
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
<<<<<<< HEAD
});
=======
});
>>>>>>> 4cb1c72 (chore(bff): rename component dir to _component)
