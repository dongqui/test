import React from 'react';

const getMousePosition = (e: React.MouseEvent) => {
  const pos = { x: 0, y: 0 };

  pos.x = e.clientX;
  pos.y = e.clientY;

  if (!pos.x || pos.x < 0) pos.x = 0;
  if (!pos.y || pos.y < 0) pos.y = 0;

  return pos;
};

export default getMousePosition;
