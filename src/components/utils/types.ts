export type SizeType = 'small' | 'middle' | 'large' | undefined;
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type UnionType<T extends U, U> = T | (U & {});
