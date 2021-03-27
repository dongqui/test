import { Component, SyntheticEvent } from 'react';
import { ResizableBoxProps, ResizeCallbackData } from 'react-resizable';
import Resizable from './Resizable';

type ResizableBoxState = {
  width?: number;
  height?: number;
  propsWidth?: number;
  propsHeight?: number;
};

class ResizableBox extends Component<ResizableBoxProps, ResizableBoxState> {
  constructor(props: ResizableBoxProps) {
    super(props);

    this.state = {
      width: this.props.width,
      height: this.props.height,
      propsWidth: this.props.width,
      propsHeight: this.props.height,
    };
  }

  static getDerivedStateFromProps(props: ResizableBoxProps, state: ResizableBoxState) {
    if (state.propsWidth !== props.width || state.propsHeight !== props.height) {
      return {
        width: props.width,
        height: props.height,
        propsWidth: props.width,
        propsHeight: props.height,
      };
    }
    return null;
  }

  onResize = (e: SyntheticEvent, data: ResizeCallbackData) => {
    const { size } = data;
    console.log('size');
    console.log(size);
    if (this.props.onResize) {
      e.persist && e.persist();
      this.setState(size, () => this.props.onResize && this.props.onResize(e, data));
    } else {
      this.setState(size);
    }
  };

  render() {
    const {
      handle,
      handleSize,
      onResize,
      onResizeStart,
      onResizeStop,
      draggableOpts,
      minConstraints,
      maxConstraints,
      lockAspectRatio,
      axis,
      width,
      height,
      resizeHandles,
      style,
      transformScale,
      ...props
    } = this.props;

    const size = {
      width: this.state.width || '100%',
      height: this.state.height || '100%',
    };

    return (
      <Resizable
        axis={axis}
        draggableOpts={draggableOpts}
        handle={handle}
        handleSize={handleSize}
        width={this.state.width}
        height={this.state.height}
        lockAspectRatio={lockAspectRatio}
        maxConstraints={maxConstraints}
        minConstraints={minConstraints}
        onResizeStart={onResizeStart}
        onResize={this.onResize}
        onResizeStop={onResizeStop}
        resizeHandles={resizeHandles}
        transformScale={transformScale}
      >
        <div {...props} style={{ ...style, ...size }} />
      </Resizable>
    );
  }
}

export default ResizableBox;
