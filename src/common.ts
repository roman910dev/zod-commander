export type BeforeFirstUnderscore<S> = S extends `${infer T}_${infer _}` ? T : S

export type Prettify<T> = { [K in keyof T]: T[K] } & {}
