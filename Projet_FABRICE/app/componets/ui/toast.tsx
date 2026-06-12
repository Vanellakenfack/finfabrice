'use client';

export { default as toast } from 'react-hot-toast';
export { Toaster } from 'react-hot-toast';

// Backward-compat shim for components still using useToast/addToast
import toast from 'react-hot-toast';
import { useCallback } from 'react';

export function useToast() {
  const addToast = useCallback(
    (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
      if (type === 'success') toast.success(message);
      else if (type === 'error') toast.error(message);
      else toast(message);
    },
    []
  );
  return { addToast };
}
