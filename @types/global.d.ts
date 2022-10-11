declare global {
  interface File extends File {
    path?: string;
  }

  interface Window {
    Rewardful: any;
  }
}

export {};
