import React from 'react';

export const Button = ({
  children,
  className = '',
  variant = 'default',
  size = 'default',
  disabled = false,
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-none font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-container/50 disabled:opacity-50 disabled:pointer-events-none active:scale-95';

  const variants = {
    default: 'bg-primary-container text-white hover:brightness-110 shadow-lg shadow-primary-container/20 crimson-glow',
    secondary: 'bg-secondary text-on-secondary hover:brightness-110 active:scale-95',
    outline: 'border border-white/10 bg-transparent hover:bg-white/5 text-text-primary',
    ghost: 'bg-transparent hover:bg-white/5 text-text-secondary hover:text-text-primary',
    destructive: 'bg-error-container text-white hover:brightness-110',
  };

  const sizes = {
    default: 'px-6 py-2.5 text-sm',
    sm: 'px-4 py-1.5 text-xs',
    lg: 'px-8 py-4 text-base rounded-none',
    icon: 'p-2 rounded-none',
  };

  const variantStyle = variants[variant] || variants.default;
  const sizeStyle = sizes[size] || sizes.default;

  return (
    <button
      type={type}
      className={`${baseStyles} ${variantStyle} ${sizeStyle} ${className}`}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};
