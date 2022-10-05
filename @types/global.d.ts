declare global {
  interface File extends File {
    path?: string;
  }
}

export {};
