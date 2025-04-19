
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
      message: (
        <div>
          <div className="font-medium">{title}</div>
          <div className="text-sm opacity-90">{description}</div>
        </div>
      ),
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

// Define the toast function first
function showToast(props: ToastProps) {
  const adaptedProps = adaptToast(props);
  return sonnerToast(adaptedProps.message, adaptedProps);
}

// Export a wrapper around sonner's toast that adapts our interface
export const toast = {
  // Basic toast function that accepts our custom props
  ...showToast,
  
  // Shorthand methods for different toast types
  error(props: ToastProps | string) {
    if (typeof props === 'string') {
      return sonnerToast.error(props);
    }
    const adaptedProps = adaptToast(props);
    return sonnerToast.error(adaptedProps.message, adaptedProps);
  },
  
  success(props: ToastProps | string) {
    if (typeof props === 'string') {
      return sonnerToast.success(props);
    }
    const adaptedProps = adaptToast(props);
    return sonnerToast.success(adaptedProps.message, adaptedProps);
  },
  
  info(props: ToastProps | string) {
    if (typeof props === 'string') {
      return sonnerToast(props);
    }
    const adaptedProps = adaptToast(props);
    return sonnerToast(adaptedProps.message, adaptedProps);
  },
  
  warning(props: ToastProps | string) {
    if (typeof props === 'string') {
      return sonnerToast(props);
    }
    const adaptedProps = adaptToast(props);
    return sonnerToast(adaptedProps.message, adaptedProps);
  },
  
  // Match the old API
  dismiss: sonnerToast.dismiss,
  promise: sonnerToast.promise,
};

// Ensure the toast function can be called directly
Object.setPrototypeOf(toast, Function.prototype);

export function useToast() {
  return {
    toast,
    // This is used by the UI components that expect a toasts array
    // But since Sonner manages this internally, we return an empty array
    toasts: []
  };
}
