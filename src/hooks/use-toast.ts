
import { toast as sonnerToast } from "sonner";
import React from "react";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive" | "success" | "warning" | "info";
  duration?: number;
  action?: React.ReactNode;
};

// Create an adapter that maps our toast interface to Sonner's
function adaptToast(props: ToastProps) {
  const { title, description, variant, ...rest } = props;
  
  // If we have both title and description, join them
  if (title && description) {
    return {
      ...rest,
      // Sonner doesn't have a built-in title/description structure,
      // so we join them with the title in bold
      message: React.createElement("div", null, 
        React.createElement("div", { className: "font-medium" }, title),
        React.createElement("div", { className: "text-sm opacity-90" }, description)
      )
    };
  }
  
  // If we only have a title, use it as the message
  if (title) {
    return { ...rest, message: title };
  }
  
  // If we only have a description, use it as the message
  if (description) {
    return { ...rest, message: description };
  }
  
  return props;
}

// Define a toast function interface that can be called directly
interface ToastFunction {
  (props: ToastProps): void;
  error: (props: ToastProps | string) => void;
  success: (props: ToastProps | string) => void;
  info: (props: ToastProps | string) => void;
  warning: (props: ToastProps | string) => void;
  dismiss: typeof sonnerToast.dismiss;
  promise: typeof sonnerToast.promise;
}

// Create the base toast function
const showToast = (props: ToastProps) => {
  const adaptedProps = adaptToast(props);
  return sonnerToast(adaptedProps.message as string, adaptedProps);
};

// Create and export the toast function with all the methods
export const toast = showToast as unknown as ToastFunction;

// Add methods to the toast function
toast.error = (props: ToastProps | string) => {
  if (typeof props === 'string') {
    return sonnerToast.error(props);
  }
  const adaptedProps = adaptToast(props);
  return sonnerToast.error(adaptedProps.message as string, adaptedProps);
};

toast.success = (props: ToastProps | string) => {
  if (typeof props === 'string') {
    return sonnerToast.success(props);
  }
  const adaptedProps = adaptToast(props);
  return sonnerToast.success(adaptedProps.message as string, adaptedProps);
};

toast.info = (props: ToastProps | string) => {
  if (typeof props === 'string') {
    return sonnerToast(props);
  }
  const adaptedProps = adaptToast(props);
  return sonnerToast(adaptedProps.message as string, adaptedProps);
};

toast.warning = (props: ToastProps | string) => {
  if (typeof props === 'string') {
    return sonnerToast(props);
  }
  const adaptedProps = adaptToast(props);
  return sonnerToast(adaptedProps.message as string, adaptedProps);
};

// Add the other methods directly from sonnerToast
toast.dismiss = sonnerToast.dismiss;
toast.promise = sonnerToast.promise;

// Export the hook
export function useToast() {
  return {
    toast,
    // This is used by the UI components that expect a toasts array
    // But since Sonner manages this internally, we return an empty array
    toasts: []
  };
}
