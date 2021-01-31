export type SizeType = 'sm' | 'md' | 'lg' | 'xl' | 'xxl';
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type UnionType<T extends U, U> = T | (U & {});
