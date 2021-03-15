import { IpcRenderer } from 'electron';
import { BooleanValueNode } from 'graphql';

declare global {
  namespace NodeJS {
    interface Global {
      ipcRenderer: IpcRenderer;
    }
  }
}
