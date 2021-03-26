import React from "react";

export const ReplaceOnOverflow = ({ short, orientation, children }) => (
  <div className={`overflower overflower_orientation_${orientation}`}>
    <div className="overflower__short">{short}</div>
    <div className="overflower__long">{children}</div>
  </div>
);

const nbsp = "\u00A0";

export const HideOnOverflow = ({ children }) => (
  <ReplaceOnOverflow orientation="horizontal" short={nbsp}>
    <ReplaceOnOverflow orientation="vertical" short={nbsp}>
      {children}
    </ReplaceOnOverflow>
  </ReplaceOnOverflow>
);
