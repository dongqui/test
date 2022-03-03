import { PlaskEngine } from '3d/PlaskEngine';
import { createContext, PropsWithChildren } from 'react';

export interface BabylonContextType {
  plaskEngine: PlaskEngine;
}

export const BabylonContext = createContext<BabylonContextType>({} as any);

export const BabylonProvider = (props: PropsWithChildren<{ plaskEngine: PlaskEngine }>) => {
  const { plaskEngine } = props;
  return plaskEngine ? <BabylonContext.Provider value={{ plaskEngine }}>{props.children}</BabylonContext.Provider> : null;
};
