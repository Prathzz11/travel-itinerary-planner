import { useState, useEffect, useCallback } from 'react';

export const useForm = ({ initialValues, validate, onSubmit, draftKey }) => {
  // Initialize values from localStorage if draftKey exists, else initialValues
  const [values, setValues] = useState(() => {
    if (draftKey) {
      const saved = localStorage.getItem(draftKey);
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error("Draft parse error", e); }
      }
    }
    return initialValues;
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isValid, setIsValid] = useState(false);

  // Auto-save draft
  useEffect(() => {
    if (draftKey) {
      localStorage.setItem(draftKey, JSON.stringify(values));
    }
  }, [values, draftKey]);

  // Run validation whenever values change
  useEffect(() => {
    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      setIsValid(Object.keys(validationErrors).length === 0);
    } else {
      setIsValid(true);
    }
  }, [values, validate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setValues(prev => ({ ...prev, [name]: val }));
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
  };

  const setFieldValue = (field, value) => {
    setValues(prev => ({ ...prev, [field]: value }));
  };

  const clearDraft = useCallback(() => {
    if (draftKey) {
      localStorage.removeItem(draftKey);
    }
  }, [draftKey]);

  const resetForm = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    clearDraft();
  }, [initialValues, clearDraft]);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mark all as touched on submit attempt
    const allTouched = Object.keys(values).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    if (validate) {
      const validationErrors = validate(values);
      setErrors(validationErrors);
      if (Object.keys(validationErrors).length > 0) {
        return; // Don't submit if invalid
      }
    }
    
    onSubmit(values, { resetForm, clearDraft });
  };

  return { 
    values, 
    errors, 
    touched, 
    isValid,
    handleChange, 
    handleBlur, 
    handleSubmit,
    setFieldValue,
    resetForm,
    clearDraft
  };
};