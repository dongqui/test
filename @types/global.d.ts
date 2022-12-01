import { IpcRenderer } from 'electron';
declare global {
  interface File extends File {
    path?: string;
  }

  interface Window {
    Rewardful: any;
  }

  namespace NodeJS {
    interface Global {
      ipcRenderer: IpcRenderer;
    }
  }
}

export {};
