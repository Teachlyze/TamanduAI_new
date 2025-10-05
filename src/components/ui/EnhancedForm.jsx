// src/components/ui/EnhancedForm.jsx
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, CheckCircle, Eye, EyeOff, Info } from 'lucide-react';

/**
 * Campo de formulário aprimorado com validação visual
 */
export const EnhancedInput = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  error,
  success,
  helperText,
  required = false,
  disabled = false,
  loading = false,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  size = 'md',
  variant = 'default',
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-13 px-5 text-lg',
  };

  const variants = {
    default: 'input input-bordered',
    ghost: 'input input-ghost',
    primary: 'input input-primary',
  };

  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  const inputClasses = [
    'w-full transition-all duration-200',
    sizes[size],
    variants[variant],
    error ? 'input-error' : '',
    success ? 'input-success' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    loading ? 'animate-pulse' : '',
    isFocused ? 'ring-2 ring-primary/20' : '',
    LeftIcon ? 'pl-12' : '',
    (RightIcon || type === 'password') ? 'pr-12' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className="form-group">
      {label && (
        <label className={`form-label ${required ? 'after:content-["*"] after:ml-1 after:text-error' : ''}`}>
          {label}
        </label>
      )}

      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/60">
            <LeftIcon className={`h-5 w-5 ${size === 'sm' ? 'h-4 w-4' : ''}`} />
          </div>
        )}

        <input
          type={getInputType()}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          onFocus={() => setIsFocused(true)}
          disabled={disabled}
          className={inputClasses}
          {...props}
        />

        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {/* Indicadores visuais */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <AlertCircle className="h-5 w-5 text-error" />
              </motion.div>
            )}

            {success && !error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <CheckCircle className="h-5 w-5 text-success" />
              </motion.div>
            )}

            {type === 'password' && (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-base-content/60 hover:text-base-content transition-colors"
                disabled={disabled}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            )}

            {RightIcon && type !== 'password' && (
              <RightIcon className="h-5 w-5 text-base-content/60" />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Helper text e erro */}
      <AnimatePresence>
        {(error || success || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 mt-2 ${
              error ? 'form-error' : success ? 'text-success' : 'form-help'
            }`}
          >
            {error && <AlertCircle className="h-4 w-4" />}
            {success && <CheckCircle className="h-4 w-4" />}
            {helperText && !error && !success && <Info className="h-4 w-4" />}
            <span className="text-sm">{error || success || helperText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Select aprimorado
 */
export const EnhancedSelect = ({
  label,
  placeholder = 'Selecione uma opção',
  options = [],
  value,
  onChange,
  error,
  success,
  helperText,
  required = false,
  disabled = false,
  loading = false,
  className = '',
  size = 'md',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const sizes = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-11 px-4 text-base',
    lg: 'h-13 px-5 text-lg',
  };

  return (
    <div className="form-group">
      {label && (
        <label className={`form-label ${required ? 'after:content-["*"] after:ml-1 after:text-error' : ''}`}>
          {label}
        </label>
      )}

      <div className="dropdown dropdown-bottom w-full">
        <select
          tabIndex={0}
          className={`select select-bordered w-full ${sizes[size]} ${error ? 'select-error' : ''} ${success ? 'select-success' : ''} ${className}`}
          value={value}
          onChange={onChange}
          disabled={disabled}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {/* Helper text e erro */}
      <AnimatePresence>
        {(error || success || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 mt-2 ${
              error ? 'form-error' : success ? 'text-success' : 'form-help'
            }`}
          >
            {error && <AlertCircle className="h-4 w-4" />}
            {success && <CheckCircle className="h-4 w-4" />}
            {helperText && !error && !success && <Info className="h-4 w-4" />}
            <span className="text-sm">{error || success || helperText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Textarea aprimorado
 */
export const EnhancedTextarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  success,
  helperText,
  required = false,
  disabled = false,
  rows = 4,
  className = '',
  ...props
}) => {
  return (
    <div className="form-group">
      {label && (
        <label className={`form-label ${required ? 'after:content-["*"] after:ml-1 after:text-error' : ''}`}>
          {label}
        </label>
      )}

      <textarea
        className={`textarea textarea-bordered w-full transition-all duration-200 ${
          error ? 'textarea-error' : ''
        } ${success ? 'textarea-success' : ''} ${disabled ? 'opacity-50' : ''} ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        rows={rows}
        {...props}
      />

      {/* Helper text e erro */}
      <AnimatePresence>
        {(error || success || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 mt-2 ${
              error ? 'form-error' : success ? 'text-success' : 'form-help'
            }`}
          >
            {error && <AlertCircle className="h-4 w-4" />}
            {success && <CheckCircle className="h-4 w-4" />}
            {helperText && !error && !success && <Info className="h-4 w-4" />}
            <span className="text-sm">{error || success || helperText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Checkbox aprimorado
 */
export const EnhancedCheckbox = ({
  label,
  checked,
  onChange,
  error,
  helperText,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-control ${className}`}>
      <label className="label cursor-pointer">
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            disabled={disabled}
            className={`checkbox checkbox-primary ${error ? 'checkbox-error' : ''}`}
            {...props}
          />
          {label && (
            <span className={`label-text ${disabled ? 'opacity-50' : ''}`}>
              {label}
            </span>
          )}
        </div>
      </label>

      {/* Helper text e erro */}
      <AnimatePresence>
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 mt-2 ${
              error ? 'form-error' : 'form-help'
            }`}
          >
            {error && <AlertCircle className="h-4 w-4" />}
            {helperText && !error && <Info className="h-4 w-4" />}
            <span className="text-sm">{error || helperText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Switch aprimorado
 */
export const EnhancedSwitch = ({
  label,
  checked,
  onChange,
  disabled = false,
  className = '',
  ...props
}) => {
  return (
    <div className={`form-control ${className}`}>
      <label className="label cursor-pointer">
        <span className="label-text">{label}</span>
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          className="toggle toggle-primary"
          {...props}
        />
      </label>
    </div>
  );
};

/**
 * Radio group aprimorado
 */
export const EnhancedRadioGroup = ({
  label,
  options = [],
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  orientation = 'vertical',
  className = '',
  ...props
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && (
        <label className="form-label">
          {label}
        </label>
      )}

      <div className={`space-y-2 ${orientation === 'horizontal' ? 'flex flex-wrap gap-4 space-y-0' : ''}`}>
        {options.map((option) => (
          <label key={option.value} className="label cursor-pointer">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                value={option.value}
                checked={value === option.value}
                onChange={onChange}
                disabled={disabled}
                className={`radio radio-primary ${error ? 'radio-error' : ''}`}
                {...props}
              />
              <span className={`label-text ${disabled ? 'opacity-50' : ''}`}>
                {option.label}
              </span>
            </div>
          </label>
        ))}
      </div>

      {/* Helper text e erro */}
      <AnimatePresence>
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 mt-2 ${
              error ? 'form-error' : 'form-help'
            }`}
          >
            {error && <AlertCircle className="h-4 w-4" />}
            {helperText && !error && <Info className="h-4 w-4" />}
            <span className="text-sm">{error || helperText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * File upload aprimorado
 */
export const EnhancedFileUpload = ({
  label,
  accept,
  multiple = false,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  loading = false,
  preview = false,
  className = '',
  ...props
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      onChange(multiple ? files : files[0]);
    }
  };

  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}

      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 ${
          dragOver
            ? 'border-primary bg-primary/5'
            : error
            ? 'border-error bg-error/5'
            : 'border-base-300 hover:border-primary/50'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={(e) => onChange(multiple ? Array.from(e.target.files) : e.target.files[0])}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          {...props}
        />

        {loading ? (
          <div className="animate-pulse">
            <div className="w-12 h-12 bg-base-300 rounded-full mx-auto mb-4"></div>
            <p className="text-base-content/70">Enviando arquivo...</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-base-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              📁
            </div>
            <p className="text-base-content font-medium mb-2">
              Arraste e solte seu arquivo aqui
            </p>
            <p className="text-base-content/70 text-sm mb-4">
              ou clique para selecionar
            </p>
            {accept && (
              <p className="text-xs text-base-content/60">
                Formatos aceitos: {accept}
              </p>
            )}
          </>
        )}
      </div>

      {/* Preview de arquivos */}
      {preview && value && (
        <div className="mt-4">
          {Array.isArray(value) ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {value.map((file, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(file)}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newFiles = value.filter((_, i) => i !== index);
                      onChange(newFiles);
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-error text-error-content rounded-full flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3 bg-base-200 rounded-lg">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                📄
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{value.name}</p>
                <p className="text-xs text-base-content/70">
                  {(value.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <button
                type="button"
                onClick={() => onChange(null)}
                className="btn btn-ghost btn-sm"
              >
                Remover
              </button>
            </div>
          )}
        </div>
      )}

      {/* Helper text e erro */}
      <AnimatePresence>
        {(error || helperText) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`flex items-center gap-2 mt-2 ${
              error ? 'form-error' : 'form-help'
            }`}
          >
            {error && <AlertCircle className="h-4 w-4" />}
            {helperText && !error && <Info className="h-4 w-4" />}
            <span className="text-sm">{error || helperText}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
