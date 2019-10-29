export enum ColorOptions {
    UNKNOWN = -2,
    R = 3,
    G = 4,
    B = 2,
    Y = 0,
    O = 1,
    W = 5,
}

export interface ColorOptionInspector {
    GetColorOption(): ColorOptions;
}
