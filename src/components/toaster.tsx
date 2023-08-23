import { css, setup } from 'goober';
import {
  type ToasterProps,
  type ToastPosition,
  type ToastWrapperProps,
} from '../core/types';
import { useToaster } from '../core/use-toaster';
import { prefersReducedMotion } from '../core/utils';
import { ToastBar } from './toast-bar';
import { CSSProperties, createElement, component$, h, Component, $ } from '@builder.io/qwik';

setup(createElement);

export const ToasterWrapper: Component<ToastWrapperProps> = ({ children, onHeightUpdate, id, className, style }) => {
  const handleRef = (el: HTMLElement | null) => {
    if (el && el.getBoundingClientRect) {
      const updateHeight = () => {
        const height = el.getBoundingClientRect().height;
        onHeightUpdate(id, height);
      };
      updateHeight();
      new MutationObserver(updateHeight).observe(el, {
        subtree: true,
        childList: true,
        characterData: true,
      });
    }
  };

  const childElements = children && Array.isArray(children) ? children.filter((child) => typeof child !== "string") : [];

  return (
    // @ts-ignore
    <div ref={handleRef} className={className} style={style}>
      {childElements}
    </div>
  );
};

const getPositionStyle = (
  position: ToastPosition,
  offset: number
): CSSProperties => {
  const top = position.includes('top');
  const verticalStyle: CSSProperties = top ? { top: 0 } : { bottom: 0 };
  const horizontalStyle: CSSProperties = position.includes('center')
    ? {
        justifyContent: 'center',
      }
    : position.includes('right')
    ? {
        justifyContent: 'flex-end',
      }
    : {};
  return {
    left: 0,
    right: 0,
    display: 'flex',
    position: 'absolute',
    transition: prefersReducedMotion()
      ? undefined
      : `all 230ms cubic-bezier(.21,1.02,.73,1)`,
    transform: `translateY(${offset * (top ? 1 : -1)}px)`,
    ...verticalStyle,
    ...horizontalStyle,
  };
};

const activeClass = css`
  z-index: 9999;
  > * {
    pointer-events: auto;
  }
`;

const DEFAULT_OFFSET = 16;

export const Toaster = component$<ToasterProps>(({
  reverseOrder,
  position = 'top-center',
  toastOptions,
  gutter,
  children,
  containerStyle,
  containerClassName,
}) => {
  const { toasts, handlers } = useToaster(toastOptions);

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 9999,
        top: DEFAULT_OFFSET,
        left: DEFAULT_OFFSET,
        right: DEFAULT_OFFSET,
        bottom: DEFAULT_OFFSET,
        pointerEvents: 'none',
        ...containerStyle,
      }}
      class={containerClassName}
      onMouseEnter$={handlers.startPause}
      onMouseLeave$={handlers.endPause}
    >
      {toasts.map(async (t) => {
        const toastPosition = t.position || position;
        const offset = handlers.calculateOffset(t, {
          reverseOrder,
          gutter,
          defaultPosition: position,
        });
        const positionStyle = getPositionStyle(toastPosition, offset);

        return (
          <ToasterWrapper
            id={t.id}
            key={t.id}
            onHeightUpdate={handlers.updateHeight}
            className={t.visible ? activeClass : ''}
            style={positionStyle}
          >
            <ToastBar toast={{
              id: "1",
              type: "success",
              message: "Hello World",
              position: "top-center",
              visible: true,
              duration: 5000,
              pauseDuration: 0,
              ariaProps: {
                'aria-live': 'polite',
                role: 'alert',
              },
              createdAt: 0,

            }} position={toastPosition} />
            {/* {t.type === 'custom' ? (
              t.message
            ) : children ? (
              await Promise.resolve(children(t))
            ) : (
              <ToastBar toast={t} position={toastPosition} />
            )} */}
          </ToasterWrapper>
        );
      })}
    </div>
  );
});