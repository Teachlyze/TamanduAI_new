import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';
import React, { useMemo, useCallback } from 'react';

// Enhanced variant classes with more options
const variantClasses = {
  default: 'btn btn-primary',
  secondary: 'btn btn-secondary',
  outline: 'btn btn-outline',
  ghost: 'btn btn-ghost',
  destructive: 'btn btn-error',
  link: 'btn btn-link text-primary no-underline hover:underline',
  soft: 'btn bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20',
  success: 'btn bg-green-500 hover:bg-green-600 text-white border-green-500',
  warning: 'btn bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-500',
  info: 'btn bg-blue-500 hover:bg-blue-600 text-white border-blue-500',
  loading: 'btn btn-primary loading',
};

const sizeClasses = {
  xs: 'btn-xs',
  sm: 'btn-sm',
  default: 'btn-md',
  lg: 'btn-lg',
  xl: 'btn-xl',
  icon: 'btn-square',
  'icon-sm': 'btn-square btn-sm',
  'icon-lg': 'btn-square btn-lg',
};

const baseClasses = 'btn inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 disabled:cursor-not-allowed active:translate-y-px';

const Button = React.forwardRef(({
  className,
  variant = 'default',
  size = 'default',
  asChild = false,
  loading = false,
  loadingText = 'Carregando...',
  leftIcon,
  rightIcon,
  fullWidth = false,
  rounded = false,
  onClick,
  disabled,
  children,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-expanded': ariaExpanded,
  'aria-haspopup': ariaHasPopup,
  'aria-controls': ariaControls,
  type = 'button',
  role,
  tabIndex,
  onKeyDown,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : 'button';

  // Generate accessible label if not provided
  const accessibleLabel = useMemo(() => {
    if (ariaLabel) return ariaLabel;

    // Generate label from children for screen readers
    if (typeof children === 'string') {
      if (loading) return loadingText;
      return children;
    }

    // For icon buttons, require explicit aria-label
    if (!children && (leftIcon || rightIcon)) {
      console.warn('Button: Icon buttons should have an explicit aria-label for accessibility');
      return 'Botão sem label acessível';
    }

    return undefined;
  }, [ariaLabel, children, loading, loadingText, leftIcon, rightIcon]);

  // Enhanced click handler with keyboard support
  const handleClick = useCallback((event) => {
    if (disabled || loading) {
      event.preventDefault();
      return;
    }

    if (onClick) {
      onClick(event);
    }
  }, [disabled, loading, onClick]);

  // Enhanced keyboard navigation
  const handleKeyDown = useCallback((event) => {
    // Handle Enter and Space for button activation
    if ((event.key === 'Enter' || event.key === ' ') && !disabled && !loading) {
      event.preventDefault();
      handleClick(event);
      return;
    }

    // Call custom onKeyDown if provided
    if (onKeyDown) {
      onKeyDown(event);
    }
  }, [disabled, loading, handleClick, onKeyDown]);

  // Determine button type and accessibility attributes
  const buttonProps = {
    ref,
    className: cn(
      baseClasses,
      variantClasses[variant],
      sizeClasses[size],
      fullWidth && 'w-full',
      rounded && 'rounded-full',
      loading && 'cursor-wait',
      className
    ),
    disabled: disabled || loading,
    onClick: handleClick,
    onKeyDown: handleKeyDown,
    type,
    role: role || (asChild ? undefined : 'button'),
    tabIndex: disabled ? -1 : tabIndex,
    'aria-label': accessibleLabel,
    'aria-describedby': ariaDescribedBy,
    'aria-expanded': ariaExpanded,
    'aria-haspopup': ariaHasPopup,
    'aria-controls': ariaControls,
    'aria-disabled': disabled || loading,
    'aria-busy': loading,
    ...props
  };

  // Add loading state for screen readers
  if (loading) {
    buttonProps.children = (
      <>
        <span className="sr-only">{loadingText}</span>
        <span aria-hidden="true">{children}</span>
      </>
    );
  }

  return (
    <Comp {...buttonProps}>
      {/* Left icon with proper spacing and accessibility */}
      {leftIcon && (
        <span
          className="flex-shrink-0"
          aria-hidden="true"
          role="img"
        >
          {leftIcon}
        </span>
      )}

      {/* Button content */}
      <span className="flex-1 text-center">
        {children}
      </span>

      {/* Right icon with proper spacing and accessibility */}
      {rightIcon && (
        <span
          className="flex-shrink-0"
          aria-hidden="true"
          role="img"
        >
          {rightIcon}
        </span>
      )}

      {/* Loading spinner for visual feedback */}
      {loading && (
        <span
          className="loading loading-spinner loading-xs ml-2"
          aria-hidden="true"
          role="status"
        />
      )}
    </Comp>
  );
});

Button.displayName = 'Button';

// Additional accessible button variants
export const AccessibleButton = React.forwardRef(({
  variant = 'default',
  size = 'default',
  children,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => (
  <Button
    ref={ref}
    variant={variant}
    size={size}
    aria-label={ariaLabel || (typeof children === 'string' ? children : 'Botão')}
    aria-describedby={ariaDescribedBy}
    className={cn('btn-accessible', props.className)}
    {...props}
  >
    {children}
  </Button>
));

AccessibleButton.displayName = 'AccessibleButton';

export default Button;
