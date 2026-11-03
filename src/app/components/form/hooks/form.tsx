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