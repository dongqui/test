declare module 'react-resizable' {
  type Axis = 'both' | 'x' | 'y' | 'none';
  type ResizeHandle = 's' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne';

  interface ResizableState {
    resizing: boolean;
    width: number;
    height: number;
    slackW: number;
    slackH: number;
  }

  interface DragCallbackData {
    node: HTMLElement;
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
    lastX: number;
    lastY: number;
  }

  interface ResizeCallbackData {
    node: HTMLElement;
    handle: ResizeHandle;
    size: {
      width: number;
      height: number;
    };
  }

  interface ResizableProps {
    className?: string;
    width: number;
    height?: number;
    handle?: React.ReactNode | ((resizeHandle: ResizeHandle) => React.ReactNode);
    handleSize?: [number, number];
    lockAspectRatio?: boolean;
    axis?: Axis;
    minConstraints?: [number, number];
    maxConstraints?: [number, number];
    onResizeStop?: (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
    onResizeStart?: (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
    onResize?: (e: React.SyntheticEvent, data: ResizeCallbackData) => any;
    draggableOpts?: any;
    resizeHandles?: ResizeHandle[];
  }

  class Resizable extends React.Component<ResizableProps, ResizableState> {}

  interface ResizableBoxState {
    height: number;
    width: number;
  }

  type ResizableBoxProps = ResizableProps;

  class ResizableBox extends React.Component<ResizableBoxProps, ResizableBoxState> {}
}
