
import { toast as sonnerToast, Toast } from "sonner";

type ToastProps = React.ComponentProps<typeof Toast>;

// Internal toast state and interface
const TOAST_LIMIT = 20;
const ACTION_TOAST_LIMIT = 10;
let count = 0;
let actionCount = 0;

type ToastData = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  duration?: number;
};

let toasts: ToastData[] = [];

// Use toast function - this can be used by importing `useToast` from this file
export function useToast() {
  return {
    toast,
    toasts,
    dismiss,
  };
}

// Toast functions
export function toast({
  title,
  description,
  action,
  variant = "default",
  duration = 5000,
  ...props
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  duration?: number;
} & Omit<ToastProps, "title" | "description" | "action" | "variant">) {
  const id = String(count++);
  
  // Add the toast to the array
  toasts = [
    {
      id,
      title,
      description,
      action,
      variant,
      duration,
    },
    ...toasts,
  ].slice(0, TOAST_LIMIT);
  
  // Use sonner toast
  sonnerToast[variant === "destructive" ? "error" : variant === "success" ? "success" : "info"](
    title,
    {
      id,
      description,
      duration,
      action,
      ...props,
    }
  );
  
  return id;
}

// Function to dismiss a toast
export function dismiss(toastId?: string) {
  sonnerToast.dismiss(toastId);
}
