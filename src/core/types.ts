import type { JSX } from "@builder.io/qwik/jsx-runtime";
import type { CSSProperties } from "@builder.io/qwik";

export type ToastType = "success" | "error" | "loading" | "blank" | "custom";
export type ToastPosition =
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";

export type Renderable =
    | JSX.Element
    | string
    | number
    | boolean
    | undefined
    | Renderable[];

export interface IconTheme {
    primary: string;
    secondary: string;
}
export interface Toast {
    type: ToastType;
    id: string;
    message: Renderable;
    icon?: Renderable;
    duration?: number;
    pauseDuration: number;
    position?: ToastPosition;

    ariaProps: {
        role: "status" | "alert";
        "aria-live": "assertive" | "off" | "polite";
    };

    style?: CSSProperties;
    className?: string;
    iconTheme?: IconTheme;

    createdAt: number;
    visible: boolean;
    height?: number;
}

export type ToastOptions = Partial<
    Pick<
        Toast,
        | "id"
        | "icon"
        | "duration"
        | "ariaProps"
        | "className"
        | "style"
        | "position"
        | "iconTheme"
    >
>;

export type DefaultToastOptions = ToastOptions & {
    [key in ToastType]?: ToastOptions;
};

export interface ToasterProps {
    position?: ToastPosition;
    toastOptions?: DefaultToastOptions;
    reverseOrder?: boolean;
    gutter?: number;
    containerStyle?: CSSProperties;
    containerClassName?: string;
    children?: (toast: Toast) => JSX.Element;
}

export interface ToastWrapperProps {
    id: string;
    className?: string;
    style?: CSSProperties;
    onHeightUpdate: (id: string, height: number) => void;
    children?: Element;
}
