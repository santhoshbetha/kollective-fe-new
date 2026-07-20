import React from 'react';
import { cva } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const alertVariants = cva(
  "relative w-full rounded-xl border p-4 [&>span.material-symbols-outlined]:absolute [&>span.material-symbols-outlined]:left-4 [&>span.material-symbols-outlined]:top-4 [&>span.material-symbols-outlined]:text-text-primary [&>span.material-symbols-outlined~*]:pl-9 flex flex-col gap-1 transition-all duration-200",
  {
    variants: {
      variant: {
        default: "bg-surface-container border-white/10 text-text-primary",
        destructive: "bg-error-container/10 border-error-container/30 text-error-container [&>span.material-symbols-outlined]:text-error-container",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const Alert = React.forwardRef(({ className, variant, onClose, children, ...props }, ref) => (
  <div
    ref={ref}
    role="alert"
    className={cn(alertVariants({ variant }), className)}
    {...props}
  >
    {children}
    {onClose && (
      <button
        onClick={onClose}
        type="button"
        className="absolute right-3 top-3 p-1 rounded-lg text-text-secondary hover:text-text-primary hover:bg-white/5 transition-all cursor-pointer border-none bg-transparent outline-none flex items-center justify-center"
        aria-label="Close alert"
      >
        <span className="material-symbols-outlined text-[16px] block">close</span>
      </button>
    )}
  </div>
));
Alert.displayName = "Alert";

export const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("font-bold text-sm tracking-tight leading-none mb-1", className)}
    {...props}
  />
));
AlertTitle.displayName = "AlertTitle";

export const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-xs text-text-secondary leading-relaxed", className)}
    {...props}
  />
));
AlertDescription.displayName = "AlertDescription";
