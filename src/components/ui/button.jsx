import React, { forwardRef, useCallback, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Slot } from '@radix-ui/react-slot';

// Variant classes using neutral Tailwind tokens
const variantClasses = {
  default: 'bg-primary text-primary-foreground hover:bg-primary/90',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  outline: 'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground',
  ghost: 'hover:bg-accent hover:text-accent-foreground',
  destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  link: 'text-primary underline-offset-4 hover:underline',
  soft: 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20',
  success: 'bg-green-500 text-white hover:bg-green-600',
  warning: 'bg-yellow-500 text-white hover:bg-yellow-600',
  info: 'bg-blue-500 text-white hover:bg-blue-600',
  loading: 'bg-primary text-primary-foreground opacity-90',
  gradient: 'text-white border-0 shadow-lg hover:shadow-xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700',
  gradientOutline: 'bg-transparent border-2 border-transparent text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-90',
};

const sizeClasses = {
  xs: 'h-8 px-2 text-xs',
  sm: 'h-9 px-3 text-sm',
  default: 'h-10 px-4 py-2',
  lg: 'h-11 px-6 text-base',
  xl: 'h-12 px-8 text-lg',
  icon: 'h-10 w-10',
  'icon-sm': 'h-9 w-9',
  'icon-lg': 'h-11 w-11',
};

const baseClasses = 'inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ring-offset-background disabled:opacity-60 disabled:cursor-not-allowed active:translate-y-px';

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
  responsive = true,
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
      // Make buttons responsive by default: full width on small screens, auto on larger
      responsive && !fullWidth && 'w-full sm:w-auto',
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
      <span className="text-center whitespace-nowrap truncate min-w-0">
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

// Export both named and default
export { Button };
export default Button;
