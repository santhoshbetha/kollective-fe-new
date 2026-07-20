import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Alert, AlertTitle, AlertDescription } from '../components/ui/Alert';
import { Dialog, DialogContent } from '../components/ui/Dialog';

const AlertContext = createContext(null);

export const AlertProvider = ({ children }) => {
  const [alertState, setAlertState] = useState(null);

  const showAlert = useCallback((message, title = 'Notification', variant = 'default') => {
    return new Promise((resolve) => {
      setAlertState({
        message,
        title,
        variant,
        resolve: () => {
          setAlertState(null);
          resolve();
        }
      });
    });
  }, []);

  // Override window.alert with custom alert modal
  useEffect(() => {
    const nativeAlert = window.alert;
    window.alert = (msg) => {
      showAlert(msg, 'Alert', 'default');
    };
    return () => {
      window.alert = nativeAlert;
    };
  }, [showAlert]);

  return (
    <AlertContext.Provider value={{ showAlert }}>
      {children}
      {alertState && (
        <Dialog open={true} onOpenChange={() => alertState.resolve()}>
          <DialogContent className="max-w-[450px] !p-6 border border-white/10 bg-surface-container-low rounded-2xl">
            <Alert variant={alertState.variant === 'destructive' ? 'destructive' : 'default'} className="mb-4">
              <span className="material-symbols-outlined">
                {alertState.variant === 'destructive' ? 'error' : 'info'}
              </span>
              <AlertTitle>{alertState.title}</AlertTitle>
              <AlertDescription>{alertState.message}</AlertDescription>
            </Alert>
            <div className="flex justify-end mt-4">
              <button
                onClick={() => alertState.resolve()}
                className="px-6 py-2 bg-primary-container text-white font-bold rounded-xl text-sm hover:brightness-110 active:scale-95 transition-all outline-none border-none cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};
