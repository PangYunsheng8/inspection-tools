export enum Color {
  UNKNOW = -2,
  Y = 0,
  O = 1,
  B = 2,
  R = 3,
  G = 4,
  W = 5,
}

export enum Axis {
  U = 0,
  L = 1,
  F = 2,
  R = 3,
  B = 4,
  D = 5
}

export type FaceState = [Color, Color, Color, Color, Color, Color, Color, Color, Color]
/** CubeState is
 *
 *             |************|
 *             |*U1**U2**U3*|
 *             |*U4**U5**U6*|
 *             |*U7**U8**U9*|
 *             |************|
 * ************|************|************|************|
 * *L1**L2**L3*|*F1**F2**F3*|*R1**R2**R3*|*B1**B2**B3*|
 * *L4**L5**L6*|*F4**F5**F6*|*R4**R5**R6*|*B4**B5**B6*|
 * *L7**L8**L9*|*F7**F8**F9*|*R7**R8**R9*|*B7**B8**B9*|
 * ************|************|************|************|
 *             |************|
 *             |*D1**D2**D3*|
 *             |*D4**D5**D6*|
 *             |*D7**D8**D9*|
 *             |************|
 *
 * -> [[U1, U2, ..., U9], [L1, U2, ..., L9], ...,[B1, B2, ..., B9], [D1, D2, ..., D9]]
 */
export type CubeState = [FaceState, FaceState, FaceState, FaceState, FaceState, FaceState]
