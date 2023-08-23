import { $, useTask$ } from '@builder.io/qwik';
import { dispatch, ActionType, useStore } from './store';
import { toast } from './toast';
import type { DefaultToastOptions, Toast, ToastPosition } from './types';

const updateHeight = (toastId: string, height: number) => {
  dispatch({
    type: ActionType.UPDATE_TOAST,
    toast: {  id: toastId, height },
  });
};
const startPause = $(() => {
  dispatch({
    type: ActionType.START_PAUSE,
    time: Date.now(),
  });
})

export const useToaster = (toastOptions?: DefaultToastOptions) => {
  const { toasts, pausedAt, listeners } = useStore(toastOptions);

//   useEffect(() => {
//     if (pausedAt) {
//       return;
//     }

//     const now = Date.now();
//     const timeouts = toasts.map((t) => {
//       if (t.duration === Infinity) {
//         return;
//       }

//       const durationLeft =
//         (t.duration || 0) + t.pauseDuration - (now - t.createdAt);

//       if (durationLeft < 0) {
//         if (t.visible) {
//           toast.dismiss(t.id);
//         }
//         return;
//       }
//       return setTimeout(() => toast.dismiss(t.id), durationLeft);
//     });

//     return () => {
//       timeouts.forEach((timeout) => timeout && clearTimeout(timeout));
//     };
//   }, [toasts, pausedAt]);
    
    useTask$(({ track, cleanup }) => {
        listeners.forEach(listener => track(listener))
        if (pausedAt) track(pausedAt)
        const now = Date.now()
        const timeouts = toasts.map(t => {
            if (t.duration === Infinity) return
            const durationLeft = (t.duration || 0) + t.pauseDuration - (now - t.createdAt)
            if (durationLeft < 0) {
                if (t.visible) toast.dismiss(t.id)
                return
            }
            return setTimeout(() => toast.dismiss(t.id), durationLeft)
        }
        )
        cleanup(
            () => timeouts.forEach(timeout => timeout && clearTimeout(timeout))
        )
    })    

  const endPause = $(() => {
    if (pausedAt) {
      dispatch({ type: ActionType.END_PAUSE, time: Date.now() });
    }
  })

  const calculateOffset = (
      toast: Toast,
      opts?: {
        reverseOrder?: boolean;
        gutter?: number;
        defaultPosition?: ToastPosition;
      }
    ) => {
      const { reverseOrder = false, gutter = 8, defaultPosition } = opts || {};

      const relevantToasts = toasts.filter(
        (t) =>
          (t.position || defaultPosition) ===
            (toast.position || defaultPosition) && t.height
      );
      const toastIndex = relevantToasts.findIndex((t) => t.id === toast.id);
      const toastsBefore = relevantToasts.filter(
        (toast, i) => i < toastIndex && toast.visible
      ).length;

      const offset = relevantToasts
        .filter((t) => t.visible)
        .slice(...(reverseOrder ? [toastsBefore + 1] : [0, toastsBefore]))
        .reduce((acc, t) => acc + (t.height || 0) + gutter, 0);

      return offset;
    }

  return {
    toasts,
    handlers: {
      updateHeight,
      startPause,
      endPause,
      calculateOffset,
    },
  };
};