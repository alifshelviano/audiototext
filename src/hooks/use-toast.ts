// Inspired by react-hot-toast library
import * as React from "react";

// Type definitions
export type ToastActionElement = React.ReactElement<any>;

export interface ToastProps {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: "default" | "destructive";
}

export type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

export type Toast = Omit<ToasterToast, "id">;

export type Action =
  | {
      type: "QUEUE_TOAST";
      toast: Toast;
    }
  | {
      type: "UPDATE_TOAST";
      toast: ToasterToast;
    }
  | {
      type: "DISMISS_TOAST";
      toastId?: string;
    }
  | {
      type: "REMOVE_TOAST";
      toastId?: string;
    };

type ToasterStore = {
  toasts: ToasterToast[];
  queue: (toast: Toast) => void;
  update: (toast: ToasterToast) => void;
  dismiss: (toastId?: string) => void;
  remove: (toastId?: string) => void;
};

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, 1000000);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: ToasterStore, action: Action): ToasterStore => {
  switch (action.type) {
    case "QUEUE_TOAST":
      return {
        ...state,
        toasts: [...state.toasts, { id: new Date().toISOString(), ...action.toast }],
      };

    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map((t) => (t.id === action.toast.id ? { ...t, ...action.toast } : t)),
      };

    case "DISMISS_TOAST": {
      const { toastId } = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t
        ),
      };
    }
    case "REMOVE_TOAST":
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: ToasterStore) => void> = [];

let memoryState: ToasterStore = {
  toasts: [],
  queue: () => {},
  update: () => {},
  dismiss: () => {},
  remove: () => {},
};

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => {
    listener(memoryState);
  });
}

type ToastFunction = {
  (props: Toast): void;
  success: (props: Omit<Toast, "variant">) => void;
  error: (props: Omit<Toast, "variant">) => void;
  warning: (props: Omit<Toast, "variant">) => void;
  info: (props: Omit<Toast, "variant">) => void;
};

const toast: ToastFunction = Object.assign(
  (props: Toast) => {
    dispatch({ type: "QUEUE_TOAST", toast: props });
  },
  {
    success: (props: Omit<Toast, "variant">) => {
      dispatch({ type: "QUEUE_TOAST", toast: { ...props, variant: "default" as const } });
    },
    error: (props: Omit<Toast, "variant">) => {
      dispatch({ type: "QUEUE_TOAST", toast: { ...props, variant: "destructive" as const } });
    },
    warning: (props: Omit<Toast, "variant">) => {
      dispatch({ type: "QUEUE_TOAST", toast: { ...props, variant: "default" as const } });
    },
    info: (props: Omit<Toast, "variant">) => {
      dispatch({ type: "QUEUE_TOAST", toast: { ...props, variant: "default" as const } });
    },
  }
);

function useToast() {
  const [state, setState] = React.useState<ToasterStore>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

export { useToast, toast };
