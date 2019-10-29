import { Quaternion, Matrix4, Object3D, Group } from 'three';
import * as THREE from 'three';

export class UTIL {
  public static AddChild(scene: THREE.Scene, dst: THREE.Object3D, child: THREE.Object3D) {
    if (child.parent === undefined || child.parent === null) {
      scene.add(child);
    }
    // child.parent.updateMatrixWorld(true);
    // dst.updateMatrixWorld(true);
    //  detach
    child.applyMatrix(child.parent.matrixWorld);
    child.parent.remove(child);
    scene.add(child);
    //  attach
    child.applyMatrix(new THREE.Matrix4().getInverse(dst.matrixWorld));
    scene.remove(child);
    dst.add(child);
  }
}

export class Global {
  public static scene: THREE.Scene;  // 场景
}

export interface SceneContainer {
  SetScene(scene: THREE.Scene): void;

  GetScene(): THREE.Scene;
}

export interface GLBase {
  /**
   * 当容器大小发生变化是会调用此方法
   * @param width 变化后的窗口宽度
   * @param height 变化后的窗口高度
   */
  resize(width: number, height: number): void;
  /**
   * 解除当前场景，释放资源时调用
   */
  dispose(): void;
}

export interface CubeBase extends GLBase {

  /**
   * 调用此函数使魔方转动
   * @param axis 旋转轴
   * @param layer 旋转的层编号
   * @param circle 旋转角占圆周的比例，顺时针为正，逆时针为负
   * @param during 动画持续时间，单位毫秒，为 0 或负代表立即变化而无动画
   */
  rotateFace(face: Axis, circle: number, during: number): void
  /**
   * 调用此函数设置魔方的姿态
   * @param Quaternion Three.js中的四元数
   * @param scale 插值步长
   */
  updateAttitude(rot: Quaternion, scale: number): void
  /**
   * 调用此函数设置摄像机状态
   * @param state 需要设置摄像机的状态
   */
  setCameraState(state: CameraState): void
}

export enum CameraState {
  // 摄像机为初始状态，即固定在(1,1,1)
  INIT = 0,
  // 摄像机为当前固定位置，即不随物体转动而转动
  LOCKED = 1,
  // 摄像机跟随魔方姿态变化而变化
  MOVE_WITH_CUBE = 2
}

export enum FaceName {
  R,
  L,
  U,
  D,
  F,
  B,
}

// // !! 此处颜色（）和轴编号对应关系已经调对，如有换面功能，需要调整这里的数值
// export class Axis {
//   // tslint:disable-next-line:no-inferrable-types
//   public static R: number = 3 // R -> 橘
//   // tslint:disable-next-line:no-inferrable-types
//   public static L: number = 1 // L -> 红
//   // tslint:disable-next-line:no-inferrable-types
//   public static U: number = 0 // U -> 黄
//   // tslint:disable-next-line:no-inferrable-types
//   public static D: number = 5 // D -> 白
//   // tslint:disable-next-line:no-inferrable-types
//   public static F: number = 2 // F -> 蓝
//   // tslint:disable-next-line:no-inferrable-types
//   public static B: number = 4 // B -> 绿
//   // tslint:disable-next-line:no-inferrable-types
//   public static C_X: number = 6
//   // tslint:disable-next-line:no-inferrable-types
//   public static C_Y: number = 7
//   // tslint:disable-next-line:no-inferrable-types
//   public static C_Z: number = 8

//   public static SetFaceMapping(name: FaceName, num: number) {
//     switch (name) {
//       case FaceName.R:
//         Axis.R = num;
//         break;
//       case FaceName.L:
//         Axis.L = num;
//         break;
//       case FaceName.U:
//         Axis.U = num;
//         break;
//       case FaceName.D:
//         Axis.D = num;
//         break;
//       case FaceName.F:
//         Axis.F = num;
//         break;
//       case FaceName.B:
//         Axis.B = num;
//         break;
//     }
//   }
// }

export enum Axis {
  U = 0,
  L = 1,
  F = 2,
  R = 3,
  B = 4,
  D = 5,
  C_X = 6,
  C_Y = 7,
  C_Z = 8
}
