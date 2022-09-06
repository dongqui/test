export default function pause(delay: number) {
  return new Promise<void>((resolve) => {
    setTimeout((_) => {
      resolve();
    }, delay);
  });
}
