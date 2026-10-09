// ==================================================
// FILE: useForm.js
// PURPOSE: Keeps form values and checks input errors
// VIVA: Edit input changes, validation, submit and reset here
// ==================================================

// ===== IMPORTS =====
import { useMemo, useState } from 'react';

export function useForm(initialValues, validate, onSubmit) {
  // ===== FORM VALUES =====
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  // ===== INPUT CHANGE =====
  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  // ===== FORM VALIDATION / SUBMIT =====
  const handleSubmit = async () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return false;
    await onSubmit(values);
    return true;
  };

  // ===== FORM RESET =====
  const reset = (nextValues = initialValues) => {
    setValues(nextValues);
    setErrors({});
  };

  const isValid = useMemo(() => Object.keys(validate(values)).length === 0, [values, validate]);
  return { values, errors, handleChange, handleSubmit, reset, isValid };
}
