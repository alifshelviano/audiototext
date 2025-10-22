// Inspired by react-hot-toast library
import * as React from 'react';
import type {Action, Toast, ToasterToast} from '@/components/ui/toast';

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
    dispatch({type: 'REMOVE_TOAST', toastId});
  }, 1000000);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: ToasterStore, action: Action): ToasterStore => {
  switch (action.type) {
    case 'QUEUE_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, {id: new Date().toISOString(), ...action.toast}],
      };

    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map(t => (t.id === action.toast.id ? {...t, ...action.toast} : t)),
      };

    case 'DISMISS_TOAST': {
      const {toastId} = action;

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId);
      } else {
        state.toasts.forEach(toast => {
          addToRemoveQueue(toast.id);
        });
      }

      return {
        ...state,
        toasts: state.toasts.map(t =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                open: false,
              }
            : t,
        ),
      };
    }
    case 'REMOVE_TOAST':
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        };
      }
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.toastId),
      };
  }
};

const listeners: Array<(state: ToasterStore) => void> = [];

let memoryState: ToasterStore = {toasts: [], queue: () => {}, update: () => {}, dismiss: () => {}, remove: () => {}};

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach(listener => {
    listener(memoryState);
  });
}

const toast = (toast: Toast) => {
  dispatch({type: 'QUEUE_TOAST', toast});
};

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
    dismiss: (toastId?: string) => dispatch({type: 'DISMISS_TOAST', toastId}),
  };
}

export {useToast, toast};
