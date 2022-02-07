import React from 'react';

function isDroppedOnRP(e: DragEvent | React.DragEvent) {
  const dropZone = document.getElementById('RP');
  const dropPointElement = document.elementFromPoint(e.clientX, e.clientY);
  const isRPContains = dropZone?.contains(dropPointElement);

  return isRPContains;
}

export default isDroppedOnRP;
