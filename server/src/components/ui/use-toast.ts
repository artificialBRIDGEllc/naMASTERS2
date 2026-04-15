import { useState, useEffect } from "react";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success";
};

let memoryState: ToastProps[] = [];
let listeners: Function[] = [];

function notify() {
  listeners.forEach((listener) => listener([...memoryState]));
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastProps[]>(memoryState);

  useEffect(() => {
    listeners.push(setToasts);
    return () => {
      listeners = listeners.filter((l) => l !== setToasts);
    };
  }, []);

  const toast = (props: ToastProps) => {
    memoryState = [...memoryState, props];
    notify();
    setTimeout(() => {
      memoryState = memoryState.slice(1);
      notify();
    }, 4000);
  };

  return { toast, toasts };
}
