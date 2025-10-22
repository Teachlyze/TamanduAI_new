import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

/**
 * Advanced form builder component that generates forms from configuration
 * @param {Object} props
 * @param {Array} props.schema - Form field configuration array
 * @param {Object} props.initialValues - Initial form values
 * @param {Function} props.onSubmit - Form submission handler
 * @param {Function} props.onChange - Form change handler
 * @param {Function} props.validateField - Field validation function
 * @param {boolean} props.readOnly - Read-only mode
 * @param {string} props.layout - Form layout ('vertical' | 'horizontal' | 'grid')
 * @param {number} props.columns - Number of columns for grid layout
 * @param {string} props.className - Additional CSS classes
 */
export const [loading, setLoading] = useState(true);
  const AdvancedFormBuilder = ({
  schema = [],
  initialValues = {},
  onSubmit,
  onChange,
  validateField,
  readOnly = false,
  layout = 'vertical',
  columns = 2,
  className = '',
  ...props
}) => {
  const [values, setValues] = useState({ ...initialValues });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update values when initialValues prop changes
  useEffect(() => {
    setValues({ ...initialValues }, []); // TODO: Add dependencies
  }, [initialValues]);

  // Validate single field
  const validateSingleField = useCallback(async (name, value) => {
    if (validateField) {
      try {
        const error = await validateField(name, value, values);
        setErrors(prev => ({ ...prev, [name]: error }));
        return error;
      } catch (err) {
        console.error('Validation error:', err);
        return null;
      }
    }
    return null;
  }, [validateField, values]);

  // Handle field value change
  const handleFieldChange = useCallback(async (name, value) => {
    const newValues = { ...values, [name]: value };
    setValues(newValues);

    // Validate field if touched
    if (touched[name]) {
      await validateSingleField(name, value);
    }

    // Call external change handler
    onChange?.(newValues);
  }, [values, touched, validateSingleField, onChange]);

  // Handle field blur (mark as touched)
  const handleFieldBlur = useCallback(async (name) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate on blur
    if (values[name] !== undefined) {
      await validateSingleField(name, values[name]);
    }
  }, [values, validateSingleField]);

  // Handle form submission
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (readOnly) return;

    setIsSubmitting(true);

    try {
      // Validate all fields
      const validationErrors = {};
      for (const field of schema) {
        if (field.validation) {
          const error = await validateSingleField(field.name, values[field.name]);
          if (error) {
            validationErrors[field.name] = error;
          }
        }
      }

      setErrors(validationErrors);

      // Check if form is valid
      const hasErrors = Object.values(validationErrors).some(error => error);

      if (hasErrors) {
        setIsSubmitting(false);
        return;
      }

      // Submit form
      await onSubmit?.(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  }, [readOnly, schema, validateSingleField, values, onSubmit]);

  // Render field based on type
  const renderField = useCallback((field) => {
    const {
      name,
      type,
      label,
      placeholder,
      options = [],
      required = false,
      disabled = false,
      className: fieldClassName,
      ...fieldProps
    } = field;

    const fieldValue = values[name];
    const fieldError = errors[name];
    const fieldTouched = touched[name];

    const commonProps = {
      value: fieldValue,
      onChange: (value) => handleFieldChange(name, value),
      onBlur: () => handleFieldBlur(name),
      disabled: disabled || readOnly,
      className: cn(fieldClassName),
      ...fieldProps,
    };

    const fieldElement = (() => {
      switch (type) {
        case 'text':
        case 'email':
        case 'password':
        case 'number':
        case 'tel':
        case 'url':
  return (
            <Input
              {...commonProps}
              type={type}
              placeholder={placeholder}
              required={required}
            />
          );

        case 'textarea':
  return (
            <Textarea
              {...commonProps}
              placeholder={placeholder}
              required={required}
            />
          );

        case 'select':
  return (
            <Select
              {...commonProps}
              onValueChange={(value) => handleFieldChange(name, value)}
            >
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          );

        case 'checkbox':
  return (
            <div className="flex items-center space-x-2">
              <Checkbox
                {...commonProps}
                checked={fieldValue || false}
                onCheckedChange={(checked) => handleFieldChange(name, checked)}
              />
              <Label htmlFor={name} className="text-sm font-normal">
                {label}
              </Label>
            </div>
          );

        case 'radio':
  return (
            <RadioGroup
              {...commonProps}
              onValueChange={(value) => handleFieldChange(name, value)}
            >
              {options.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={option.value} id={`${name}-${option.value}`} />
                  <Label htmlFor={`${name}-${option.value}`} className="text-sm font-normal">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          );

        case 'switch':
  return (
            <div className="flex items-center space-x-2">
              <Switch
                {...commonProps}
                checked={fieldValue || false}
                onCheckedChange={(checked) => handleFieldChange(name, checked)}
              />
              <Label htmlFor={name} className="text-sm font-normal">
                {label}
              </Label>
            </div>
          );

        case 'file':
  return (
            <Input
              {...commonProps}
              type="file"
              onChange={(e) => handleFieldChange(name, e.target.files?.[0])}
            />
          );

        default:
  return (
            <Input
              {...commonProps}
              placeholder={placeholder}
              required={required}
            />
          );
      }
    })();
  return (
      <div className={cn(
        layout === 'horizontal' && "flex items-center gap-4",
        layout === 'grid' && "space-y-2",
        "space-y-2"
      )}>
        {label && type !== 'checkbox' && type !== 'radio' && type !== 'switch' && (
          <Label htmlFor={name} className={cn(
            "text-sm font-medium",
            layout === 'horizontal' && "min-w-[120px]",
            required && "after:content-['*'] after:text-destructive after:ml-1"
          )}>
            {label}
          </Label>
        )}

        <div className="flex-1">
          {fieldElement}

          {fieldError && fieldTouched && (
            <p className="text-sm text-destructive mt-1">{fieldError}</p>
          )}
        </div>
      </div>
    );
  }, [values, errors, touched, layout, readOnly, handleFieldChange, handleFieldBlur]);

  // Group fields by sections
  const groupedFields = useMemo(() => {
    const groups = {};

    schema.forEach(field => {
      const section = field.section || 'default';
      if (!groups[section]) {
        groups[section] = [];
      }
      groups[section].push(field);
    });

    return groups;
  }, [schema]);
  return (
    <form onSubmit={handleSubmit} className={cn("advanced-form-builder", className)} {...props}>
      <div className={cn(
        layout === 'grid' && `grid grid-cols-1 md:grid-cols-${columns} gap-6`,
        layout !== 'grid' && "space-y-6"
      )}>
        {Object.entries(groupedFields).map(([sectionName, fields]) => (
          <div key={sectionName} className={cn(
            layout === 'grid' && "space-y-4",
            layout !== 'grid' && "space-y-4"
          )}>
            {sectionName !== 'default' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">{sectionName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={cn(
                    layout === 'grid' && `grid grid-cols-1 md:grid-cols-${Math.min(columns, 2)} gap-4`,
                    layout !== 'grid' && "space-y-4"
                  )}>
                    {fields.map(field => (
                      <div key={field.name}>
                        {renderField(field)}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {sectionName === 'default' && (
              <div className="space-y-4">
                {fields.map(field => (
                  <div key={field.name}>
                    {renderField(field)}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Form actions */}
      <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            setValues({ ...initialValues });
            setErrors({});
            setTouched({});
          }}
          disabled={isSubmitting}
        >
          Resetar
        </Button>

        <Button
          type="submit"
          disabled={isSubmitting || readOnly}
        >
          {isSubmitting ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>

      {/* Form validation summary */}
      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
          <p className="text-sm font-medium text-destructive mb-2">
            Corrija os seguintes erros:
          </p>
          <ul className="text-sm text-destructive space-y-1">
            {Object.entries(errors).map(([fieldName, error]) => (
              <li key={fieldName}>• {error}</li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
};

export default AdvancedFormBuilder;
