import { useEffect, useState } from 'react';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export default function Toast({ message, visible, onHide }: ToastProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const t = setTimeout(() => {
        setShow(false);
        setTimeout(onHide, 300);
      }, 2500);
      return () => clearTimeout(t);
    }
  }, [visible, onHide]);

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-2xl shadow-lg
        bg-brand-600 dark:bg-brand-500 text-white text-sm font-medium
        transition-all duration-300
        ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
    >
      {message}
    </div>
  );
}
