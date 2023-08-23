# Qwik Buttery Toaster

A simple and customizable toast notification library for Qwik.

## Installation

You can install the `qwik-buttery-toaster` package using npm or Yarn:

```bash
npm install qwik-buttery-toaster
```

```bash
yarn add qwik-buttery-toaster
```

## Usage

To use the `qwik-buttery-toaster` package, you need to import the `Toaster` component and render it in your Qwik app.

Here's an example of how you can use the `Toaster` component:

```typescript
import { h, Component } from "@builder.io/qwik";
import { Toaster } from "qwik-buttery-toaster";

interface Props {}

export const App: Component<Props> = () => {
  return (
    <div>
      <h1>Hello, world!</h1>
      <Toaster />
    </div>
  );
};
```

In this example, we import the `Toaster` component from the `qwik-buttery-toaster` package and render it in our Qwik app.

You can customize the `Toaster` component by passing props to it. Here's an example of how you can customize the `Toaster` component:

```typescript
import { h, Component } from "@builder.io/qwik";
import { Toaster } from "qwik-buttery-toaster";

interface Props {}

export const App: Component<Props> = () => {
  return (
    <div>
      <h1>Hello, world!</h1>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 5000,
          pauseOnHover: true,
        }}
      />
    </div>
  );
};
```

In this example, we pass the `position` and `toastOptions` props to the `Toaster` component to customize its position and toast options.

## API

### `Toaster`

The `Toaster` component is the main component of the `qwik-buttery-toaster` package. It renders toast notifications in your Qwik app.

#### Props

- `position?: string`: The position of the toast notifications. Defaults to `"top-center"`.
- `toastOptions?: ToastOptions`: The options for the toast notifications. See the `ToastOptions` type for more information.
- `gutter?: number`: The space between toast notifications. Defaults to `8`.
- `containerStyle?: Record<string, string>`: The style for the container element of the toast notifications.
- `containerClassName?: string`: The class name for the container element of the toast notifications.

### `useToaster`

The `useToaster` hook is a helper hook that provides the `toasts` and `handlers` objects for the `Toaster` component.

#### Usage

```typescript
import { useToaster } from "qwik-buttery-toaster";

const { toasts, handlers } = useToaster();
```

#### Returns

- `toasts: Toast[]`: An array of toast objects.
- `handlers: ToastHandlers`: An object containing methods for handling toast notifications.

### `Toast`

The `Toast` type is an interface that defines the shape of a toast object.

#### Properties

- `id: string`: The unique ID of the toast.
- `type?: string`: The type of the toast. Defaults to `"default"`.
- `message: string | Element`: The message of the toast.
- `position?: string`: The position of the toast. Defaults to the `position` prop of the `Toaster` component.
- `duration?: number`: The duration of the toast in milliseconds. Defaults to `3000`.
- `visible?: boolean`: Whether the toast is visible. Defaults to `false`.
- `className?: string`: The class name of the toast.
- `style?: React.CSSProperties`: The style of the toast.

### `ToastOptions`

The `ToastOptions` type is an interface that defines the options for toast notifications.

#### Properties

- `duration?: number`: The duration of the toast in milliseconds. Defaults to `3000`.
- `pauseOnHover?: boolean`: Whether to pause the duration of the toast when the mouse is over it. Defaults to `false`.
- `reverseOrder?: boolean`: Whether to reverse the order of the toast notifications. Defaults to `false`.
- `position?: string`: The position of the toast notifications. Defaults to `"top-center"`.

### `ToastHandlers`

The `ToastHandlers` type is an interface that defines the methods for handling toast notifications.

#### Methods

- `addToast(toast: Toast)`: Adds a toast notification to the `toasts` array.
- `removeToast(id: string)`: Removes a toast notification from the `toasts` array.
- `startPause()`: Starts pausing the duration of the toast notifications.
- `endPause()`: Ends pausing the duration of the toast notifications.
- `calculateOffset(toast: Toast, options: ToastOptions)`: Calculates the offset of a toast notification.
- `updateHeight(id: string, height: number)`: Updates the height of a toast notification.

## License

The `qwik-buttery-toaster` package is open source software licensed under the MIT License.