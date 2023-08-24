import { useStore, useTask$ } from "@builder.io/qwik";
import { DefaultToastOptions, Toast, ToastType } from "./types";

const TOAST_LIMIT = 20;

export enum ActionType {
    ADD_TOAST,
    UPDATE_TOAST,
    UPSERT_TOAST,
    DISMISS_TOAST,
    REMOVE_TOAST,
    START_PAUSE,
    END_PAUSE,
}

type Action =
    | {
          type: ActionType.ADD_TOAST;
          toast: Toast;
      }
    | {
          type: ActionType.UPSERT_TOAST;
          toast: Toast;
      }
    | {
          type: ActionType.UPDATE_TOAST;
          toast: Partial<Toast>;
      }
    | {
          type: ActionType.DISMISS_TOAST;
          toastId?: string;
      }
    | {
          type: ActionType.REMOVE_TOAST;
          toastId?: string;
      }
    | {
          type: ActionType.START_PAUSE;
          time: number;
      }
    | {
          type: ActionType.END_PAUSE;
          time: number;
      };

export interface State {
    toasts: Toast[];
    pausedAt?: number;
}

const toastTimeouts = new Map<Toast["id"], ReturnType<typeof setTimeout>>();

export const TOAST_EXPIRE_DISMISS_DELAY = 1000;

const addToRemoveQueue = (toastId: string) => {
    if (toastTimeouts.has(toastId)) {
        return;
    }

    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId);
        dispatch({
            type: ActionType.REMOVE_TOAST,
            toastId: toastId,
        });
    }, TOAST_EXPIRE_DISMISS_DELAY);

    toastTimeouts.set(toastId, timeout);
};

const clearFromRemoveQueue = (toastId: string) => {
    const timeout = toastTimeouts.get(toastId);
    if (timeout) {
        clearTimeout(timeout);
    }
};

export const reducer = (state: State, action: Action) => {
    switch (action.type) {
        case ActionType.ADD_TOAST: {
            const { toast } = action;
            const toasts = [...state.toasts];
            if (toasts.length >= TOAST_LIMIT) {
                toasts.pop();
            }
            toasts.unshift(toast);
            addToRemoveQueue(toast.id);
            return {
                ...state,
                toasts,
            };
        }
        case ActionType.UPSERT_TOAST: {
            const { toast } = action;
            const toasts = [...state.toasts];
            const index = toasts.findIndex((t) => t.id === toast.id);
            if (index > -1) {
                toasts[index] = toast;
            } else {
                if (toasts.length >= TOAST_LIMIT) {
                    toasts.pop();
                }
                toasts.unshift(toast);
            }
            addToRemoveQueue(toast.id);
            return {
                ...state,
                toasts,
            };
        }
        case ActionType.UPDATE_TOAST: {
            const { toast } = action;
            const toasts = [...state.toasts];
            const index = toasts.findIndex((t) => t.id === toast.id);
            if (index > -1) {
                toasts[index] = {
                    ...toasts[index],
                    ...toast,
                };
            }
            return {
                ...state,
                toasts,
            };
        }
        case ActionType.DISMISS_TOAST: {
            const { toastId } = action;
            const toasts = [...state.toasts];
            const index = toasts.findIndex((t) => t.id === toastId);
            if (index > -1) {
                toasts[index] = {
                    ...toasts[index],
                    visible: false,
                };
                clearFromRemoveQueue(toasts[index].id);
            }
            return {
                ...state,
                toasts,
            };
        }
        case ActionType.REMOVE_TOAST: {
            const { toastId } = action;
            const toasts = [...state.toasts];
            const index = toasts.findIndex((t) => t.id === toastId);
            if (index > -1) {
                toasts.splice(index, 1);
            }
            return {
                ...state,
                toasts,
            };
        }
        case ActionType.START_PAUSE: {
            return {
                ...state,
                pausedAt: action.time,
            };
        }
        case ActionType.END_PAUSE: {
            const { pausedAt } = state;
            if (pausedAt) {
                const diff = action.time - pausedAt;
                const toasts = [...state.toasts];
                toasts.forEach((t) => {
                    t.pauseDuration += diff;
                });
                return {
                    ...state,
                    pausedAt: undefined,
                    toasts,
                };
            }
            return state;
        }
        default:
            return state;
    }
};

const listeners = new Array<State>();

let memoryState: State = {
    toasts: [],
    pausedAt: undefined,
};

export const dispatch = (action: Action) => {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener) => {
        useTask$(() => {
            listener.toasts = memoryState.toasts;
            listener.pausedAt = memoryState.pausedAt;
        });
    });
};

export const defaultTimeouts: {
    [key in ToastType]: number;
} = {
    blank: 4000,
    error: 4000,
    success: 2000,
    loading: Infinity,
    custom: 4000,
};

export const useToastStore = (
    toastOptions: DefaultToastOptions = {}
): State => {
    const signal = useStore<State>({
        toasts: [],
        pausedAt: undefined,
    });
    useTask$(({ track, cleanup }) => {
        track(signal);
        listeners.push(signal);

        cleanup(() => {
            const index = listeners.indexOf(signal);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        });
    });

    signal.toasts = signal.toasts.map((t) => ({
        ...toastOptions,
        ...toastOptions[t.type],
        ...t,
        duration:
            t.duration ||
            toastOptions[t.type]?.duration ||
            toastOptions.duration ||
            defaultTimeouts[t.type],
        style: {
            ...toastOptions.style,
            ...toastOptions[t.type]?.style,
            ...t.style,
        },
    }));

    return signal;
};
