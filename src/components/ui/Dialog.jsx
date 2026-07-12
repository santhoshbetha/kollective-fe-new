import React, { useEffect, createContext, useContext, useState } from 'react';
import ReactDOM from 'react-dom';

const DialogContext = createContext({ isOpen: false, close: () => { } });

export const Dialog = ({ open, onOpenChange, children }) => {
  const [isOpen, setIsOpen] = useState(open);

  useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const close = () => {
    setIsOpen(false);
    if (onOpenChange) onOpenChange(false);
  };

  return (
    <DialogContext.Provider value={{ isOpen, close }}>
      {children}
    </DialogContext.Provider>
  );
};

export const DialogTrigger = ({ children, asChild, ...props }) => {
  return children;
};

export const DialogContent = ({ children, className = '' }) => {
  const { isOpen, close } = useContext(DialogContext);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') close();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300"
        onClick={close}
      />
      {/* Dialog Pane */}
      <div className={`relative w-full bg-surface-container-low border border-white/10 rounded-[16px] shadow-2xl overflow-hidden z-50 max-h-[90vh] overflow-y-auto custom-scrollbar ${className}`}>
        {children}
      </div>
    </div>,
    document.body
  );
};

export const DialogHeader = ({ className = '', children, ...props }) => {
  return (
    <div className={`flex items-center justify-between p-6 border-b border-white/10 bg-surface-bright/5 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const DialogClose = ({ className = '', children, ...props }) => {
  const { close } = useContext(DialogContext);
  return (
    <button
      onClick={close}
      className={`p-2 hover:bg-white/10 rounded-full transition-colors group ${className}`}
      {...props}
    >
      {children || <span className="material-symbols-outlined text-text-secondary group-hover:text-text-primary">close</span>}
    </button>
  );
};

export const DialogTitle = ({ className = '', children, ...props }) => {
  return (
    <h2 className={`font-headline-md text-headline-md text-text-primary tracking-tight ${className}`} {...props}>
      {children}
    </h2>
  );
};

export const DialogDescription = ({ className = '', children, ...props }) => {
  return (
    <p className={`text-sm text-text-secondary ${className}`} {...props}>
      {children}
    </p>
  );
};

export const DialogFooter = ({ className = '', children, ...props }) => {
  return (
    <div className={`flex items-center justify-end gap-3 p-6 pt-0 mt-4 border-t border-white/5 pt-6 ${className}`} {...props}>
      {children}
    </div>
  );
};
