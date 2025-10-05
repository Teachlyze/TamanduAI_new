import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

export function Form({ schema, onSubmit, defaultValues, mode = 'onChange', children }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    reset,
  } = useForm({ resolver: schema ? zodResolver(schema) : undefined, defaultValues, mode });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {typeof children === 'function'
        ? children({ register, errors, isSubmitting, control, reset })
        : children}
    </form>
  );
}

export default Form;
