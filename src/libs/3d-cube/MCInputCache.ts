import { Axis } from './GLObject';

export enum RotateAxis {
  Y_AXIS = 0,
  X_AXIS = 1,
  Z_AXIS = 2
}

export enum RotateLayer {
  FIRST_LAYER = 1,
  CENTER_LAYER = 2,
  SECOND_LAYER = 4,
  LAYER_0 = 5,
  LAYER_1 = 6,
  LAYER_2 = 7,
  LAYER_3 = 8,
  LAYER_4 = 9,
  LAYER_5 = 10,
  LAYER_6 = 11,
}

export class MCInputStruct {
  private static COMMAND_TABLE = [
    ['u', 'U'],
    ['B', 'b'],
    ['D', 'd'],
    ['l', 'L'],
    ['f', 'F'],
    ['R', 'r']
  ];

  private static FACE_TABLE = [
    [Axis.D, Axis.C_Y, Axis.U],
    [Axis.R, Axis.C_X, Axis.L],
    [Axis.B, Axis.C_Z, Axis.F]
  ]

  public axis: RotateAxis;     // 旋转轴
  public layer: RotateLayer;   // 旋转层
  public circle: number;			 // 旋转角占圆周的比例
  public angle: number;        // 旋转角度
  public during: number;       // 该旋转耗时


  public static translateToTutorialCommand(face: Axis, circle: number): string {
    const str = this.COMMAND_TABLE[face as number];
    const res = circle > 0 ? str[0] : str[1];
    return res;
  }

  public static getInverseRotateImmediatelyCommand(cmd: string): string {
    let res = '';
    if (cmd.charAt(0) >= 'a' && cmd.charAt(0) <= 'z') {
      res = cmd.toUpperCase();
    } else {
      res = cmd.toLowerCase();
    }
    return res;
  }

  public static inverseRotateCommand(cmd: string): string {
    let res = '';
    if (cmd.charAt(0) >= 'a' && cmd.charAt(0) <= 'z') {
      res = cmd.toUpperCase();
    } else {
      res = cmd.toLowerCase();
    }
    return res;
  }

  public translateRotateData(face: Axis, steps: number, circle: number, during: number): void {
    switch (face) {
      case Axis.R:
        this.axis = RotateAxis.X_AXIS;
        this.layer = steps - 1;
        circle *= -1;
        break;
      case Axis.L:
        this.axis = RotateAxis.X_AXIS;
        this.layer = 0;
        // circle *= -1;
        break;
      case Axis.U:
        this.axis = RotateAxis.Y_AXIS;
        this.layer = steps - 1;
        circle *= -1;
        break;
      case Axis.D:
        this.axis = RotateAxis.Y_AXIS;
        this.layer = 0;
        // circle *= -1
        break;
      case Axis.F:
        this.axis = RotateAxis.Z_AXIS;
        this.layer = steps - 1;
        circle *= -1;
        break;
      case Axis.B:
        this.axis = RotateAxis.Z_AXIS;
        this.layer = 0;
        // circle *= -1
        break;
      case Axis.C_X:
        this.axis = RotateAxis.X_AXIS;
        this.layer = 1;
        break;
      case Axis.C_Y:
        this.axis = RotateAxis.Y_AXIS;
        this.layer = 1;
        break;
      case Axis.C_Z:
        this.axis = RotateAxis.Z_AXIS;
        this.layer = 1;
        break;
    }
    this.circle = circle;
    this.during = Math.max(during, 0.02);
    this.angle = 360.0 / this.circle;
  }

  public translateRotateImmediatlyData(rcmd: string, steps: number): void {
    switch (rcmd) {
      case 'd':
        this.axis = RotateAxis.Y_AXIS;
        this.layer = 0;
        this.circle = 4;
        break;
      case 'D':
        this.axis = RotateAxis.Y_AXIS;
        this.layer = 0;
        this.circle = -4;
        break;
      case 'u':
        this.axis = RotateAxis.Y_AXIS;
        this.layer = steps - 1;
        this.circle = 4;
        break;
      case 'U':
        this.axis = RotateAxis.Y_AXIS;
        this.layer = steps - 1;
        this.circle = -4;
        break;
      case 'l':
        this.axis = RotateAxis.X_AXIS;
        this.layer = steps - 1;
        this.circle = 4;
        break;
      case 'L':
        this.axis = RotateAxis.X_AXIS;
        this.layer = steps - 1;
        this.circle = -4;
        break;
      case 'r':
        this.axis = RotateAxis.X_AXIS;
        this.layer = 0;
        this.circle = 4;
        break;
      case 'R':
        this.axis = RotateAxis.X_AXIS;
        this.layer = 0;
        this.circle = -4;
        break;
      case 'f':
        this.axis = RotateAxis.Z_AXIS;
        this.layer = steps - 1;
        this.circle = 4;
        break;
      case 'F':
        this.axis = RotateAxis.Z_AXIS;
        this.layer = steps - 1;
        this.circle = -4;
        break;
      case 'b':
        this.axis = RotateAxis.Z_AXIS;
        this.layer = 0;
        this.circle = 4;
        break;
      case 'B':
        this.axis = RotateAxis.Z_AXIS;
        this.layer = 0;
        this.circle = -4;
        break;
    }
    this.angle = 360.0 / this.circle;
  }

  public translateTutorialRotateData(rcmd: string, steps: number) {
    switch (rcmd) {
      case 'd':
        this.axis = RotateAxis.Y_AXIS;
        this.layer = 0;
        this.circle = -4;
        break;
      case 'D':
        this.axis = RotateAxis.Y_AXIS;
        this.layer = 0;
        this.circle = 4;
        break;
      case 'u':
        this.axis = RotateAxis.Y_AXIS;
        this.layer = steps - 1;
        this.circle = 4;
        break;
      case 'U':
        this.axis = RotateAxis.Y_AXIS;
        this.layer = steps - 1;
        this.circle = -4;
        break;
      case 'l':
        this.axis = RotateAxis.X_AXIS;
        this.layer = 0;
        this.circle = -4;
        break;
      case 'L':
        this.axis = RotateAxis.X_AXIS;
        this.layer = 0;
        this.circle = 4;
        break;
      case 'r':
        this.axis = RotateAxis.X_AXIS;
        this.layer = steps - 1;
        this.circle = 4;
        break;
      case 'R':
        this.axis = RotateAxis.X_AXIS;

        this.layer = steps - 1;
        this.circle = -4;
        break;
      case 'f':
        this.axis = RotateAxis.Z_AXIS;
        this.layer = steps - 1;
        this.circle = 4;
        break;
      case 'F':
        this.axis = RotateAxis.Z_AXIS;
        this.layer = steps - 1;
        this.circle = -4;
        break;
      case 'b':
        this.axis = RotateAxis.Z_AXIS;
        this.layer = 0;
        this.circle = -4;
        break;
      case 'B':
        this.axis = RotateAxis.Z_AXIS;
        this.layer = 0;
        this.circle = 4;
        break;
    }
    this.angle = 360.0 / this.circle;
  }

  public asCommand(): string {
    let cmd = '';
    switch (this.axis) {
      case RotateAxis.X_AXIS:
        if (this.layer === 2) {
          //  L or l
          if (this.circle > 0) {
            cmd = 'l';
          } else if (this.circle < 0) {
            cmd = 'L';
          }
        } else if (this.layer === 0) {
          //  R or r
          if (this.circle > 0) {
            cmd = 'R';
          } else {
            cmd = 'r';
          }
        }
        break;
      case RotateAxis.Y_AXIS:
        if (this.layer === 2) {
          //  U or u
          if (this.circle > 0) {
            cmd = 'u';
          } else if (this.circle < 0) {
            cmd = 'U';
          }
        } else if (this.layer === 0) {
          //  D or d
          if (this.circle > 0) {
            cmd = 'D';
          } else {
            cmd = 'd';
          }
        }
        break;
      case RotateAxis.Z_AXIS:
        if (this.layer === 2) {
          //  F or f
          if (this.circle > 0) {
            cmd = 'f';
          } else if (this.circle < 0) {
            cmd = 'F';
          }
        } else if (this.layer === 0) {
          //  B or b
          if (this.circle > 0) {
            cmd = 'B';
          } else {
            cmd = 'b';
          }
        }
        break;
    }
    return cmd;
  }

  private getFace() {
    return MCInputStruct.FACE_TABLE[this.axis][this.layer];
  }


}

export default class MCInputCache {
  private queue: Array<any> = [];

  public Push(input: MCInputStruct): void {
    this.queue.push(input);
  }

  public Pop(): MCInputStruct {
    return this.queue.shift();
  }

  public Count(): number {
    return this.queue.length;
  }

  public Last(): MCInputStruct {
    return this.queue[this.queue.length - 1];
  }

  public Front(): MCInputStruct {
    return this.queue[0];
  }
}

