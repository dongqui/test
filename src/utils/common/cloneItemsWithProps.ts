import { Children, cloneElement, ReactNode, ReactElement } from 'react';

export default function cloneItemsWithProps(children: ReactNode, props: { propsFromTrigger?: object }) {
  return Children.map(
    // null 제거
    Children.toArray(children).filter(Boolean),
    (item) => cloneElement(item as ReactElement<any>, props),
  );
}
