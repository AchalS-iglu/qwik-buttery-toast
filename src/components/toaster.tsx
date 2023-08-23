import { css, setup } from "goober";
import { ToasterProps, ToastPosition, ToastWrapperProps } from "../core/types";
import { useToaster } from "../core/use-toaster";
import { prefersReducedMotion } from "../core/utils";
import { ToastBar } from "./toast-bar";
import {
    CSSProperties,
    Component,
    component$,
    createElement,
    useSignal,
    useTask$,
} from "@builder.io/qwik";

setup(createElement);

const ToastWrapper = component$(
    ({ id, className, style, onHeightUpdate, children }: ToastWrapperProps) => {
        const ref = useSignal<HTMLDivElement>();
        useTask$(({ track }) => {
            track(id);
            track(onHeightUpdate);
            if (ref.value) {
                const updateHeight = () => {
                    if (ref.value) {
                        const height = ref.value.getBoundingClientRect().height;
                        onHeightUpdate(id, height);
                    }
                };
                updateHeight();
                new MutationObserver(updateHeight).observe(ref.value, {
                    subtree: true,
                    childList: true,
                    characterData: true,
                });
            }
        });

        return (
            <div ref={ref} class={className} style={style}>
                {children}
            </div>
        );
    }
);

const getPositionStyle = (
    position: ToastPosition,
    offset: number
): CSSProperties => {
    const top = position.includes("top");
    const verticalStyle: CSSProperties = top ? { top: 0 } : { bottom: 0 };
    const horizontalStyle: CSSProperties = position.includes("center")
        ? {
              justifyContent: "center",
          }
        : position.includes("right")
        ? {
              justifyContent: "flex-end",
          }
        : {};
    return {
        left: 0,
        right: 0,
        display: "flex",
        position: "absolute",
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

export const Toaster: Component<ToasterProps> = component$(
    ({
        reverseOrder,
        position = "top-center",
        toastOptions,
        gutter,
        children,
        containerStyle,
        containerClassName,
    }) => {
        const { state, handlers } = useToaster(toastOptions);

        return (
            <div
                style={{
                    position: "fixed",
                    zIndex: 9999,
                    top: DEFAULT_OFFSET,
                    left: DEFAULT_OFFSET,
                    right: DEFAULT_OFFSET,
                    bottom: DEFAULT_OFFSET,
                    pointerEvents: "none",
                    ...containerStyle,
                }}
                class={containerClassName}
                onMouseEnter$={handlers.startPause}
                onMouseLeave$={handlers.endPause}>
                {state.toasts.map((t) => {
                    const toastPosition = t.position || position;
                    const offset = handlers.calculateOffset(t, {
                        reverseOrder,
                        gutter,
                        defaultPosition: position,
                    });
                    const positionStyle = getPositionStyle(
                        toastPosition,
                        offset
                    );

                    return (
                        <ToastWrapper
                            id={t.id}
                            key={t.id}
                            onHeightUpdate={handlers.updateHeight}
                            className={t.visible ? activeClass : ""}
                            style={positionStyle}>
                            {t.type === "custom" ? (
                                t.message
                            ) : children ? (
                                children(t)
                            ) : (
                                <ToastBar toast={t} position={toastPosition} />
                            )}
                        </ToastWrapper>
                    );
                })}
            </div>
        );
    }
);
