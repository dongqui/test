export = Transform;
export as namespace Transform;

declare namespace Transform {
  interface Normal {
    x: number;
    y: number;
    z: number;
  }

  type Quaternion = Normal & { w: number };
}

export default Transform;
