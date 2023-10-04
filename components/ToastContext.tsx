import React, {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react';
import { View } from 'react-native';

import { Toast } from './Toast';

export type ToastVariants = 'default' | 'success' | 'destructive' | 'info';

interface ToastMessage {
  id: number;
  text: string;
  variant: ToastVariants;
  duration?: number;
  showProgress?: boolean;
}
interface ToastContextProps {
  toast: (
    message: string,
    variant?: ToastVariants,
    duration?: number,
    position?: 'top' | 'bottom',
    showProgress?: boolean
  ) => void;
  removeToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export function ToastProvider({
  children,
  position = 'top',
}: {
  children: ReactNode;
  position?: 'top' | 'bottom';
}) {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback(
    (
      message: string,
      variant: ToastVariants = 'default',
      duration: number = 3000,
      position: 'top' | 'bottom' = 'top', // Assuming you want to handle position here too
      showProgress: boolean = true // Default is true, change as needed
    ) => {
      setMessages(prev => [
        ...prev,
        { id: Date.now(), text: message, variant, duration, showProgress },
      ]);
    },
    []
  );

  const removeToast = useCallback((id: number) => {
    setMessages(prev => prev.filter(message => message.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <View
        className={`absolute ${
          position === 'top' ? 'top-[45px]' : 'bottom-0'
        } left-0 right-0`}
      >
        {messages.map(message => (
          <Toast
            key={message.id}
            id={message.id}
            message={message.text}
            variant={message.variant}
            duration={message.duration}
            showProgress={message.showProgress} // Pass it down here
            onHide={removeToast}
          />
        ))}
      </View>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}