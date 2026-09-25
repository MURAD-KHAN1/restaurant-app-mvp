import { useMemo, useState } from 'react';

export function useForm(initialValues, validate, onSubmit) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});

  const handleChange = (field, value) => {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return false;
    await onSubmit(values);
    return true;
  };

  const reset = (nextValues = initialValues) => {
    setValues(nextValues);
    setErrors({});
  };

  const isValid = useMemo(() => Object.keys(validate(values)).length === 0, [values, validate]);
  return { values, errors, handleChange, handleSubmit, reset, isValid };
}
