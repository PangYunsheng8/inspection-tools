import { Debug } from './debug';

const CODER_STATE_COUNT_MAP = {
  0: 0,
  2: 1,
  3: 2,
  1: 3
}

enum RotateDirection {
  ERROR = -2,             // 未知转动，用于初始化
  UNKONWN = -1,           // GPIO 发生两位一起跳动，转动方向未知
  NONE = 0,               // 未转动
  CLOCKWISE = 1,          // 转动方向为 顺时针
  ANTICLOCKWISE = 2       // 转动方向为 逆时针
}

export enum CoderState {
  _00 = 0,
  _01 = 1,
  _10 = 2,
  _11 = 3,
  UNKONWN = -1            // 为未知 GPIO 状态，用于初始化
}

const COMPATIBLE_FACE = [
  // 0
  [5],
  // 1
  [3],
  // 2
  [4],
  // 3
  [1],
  // 4
  [2],
  // 5
  [0]
]

const PIN_MAP = [
  [0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1],
  [3, 0], [3, 1], [4, 0], [4, 1], [5, 0], [5, 1],
]
export function mapPinsStateToCoderState(pins: Array<number>): Array<CoderState> {
  // number[6][2]
  const faces: Array<Array<number>> = new Array(6).fill(i => new Array(2)).map(i => i())
  for (let i = 0; i < 12; i++) {
    faces[PIN_MAP[i][0]][PIN_MAP[i][1]] = pins[i]
  }
  return faces.map(i => i[0] * 2 + i[1] as CoderState)
}
export class RotateCommand {
  /**
   * @param face 旋转轴
   * @param circle 旋转角占圆周的比例，顺时针为正，逆时针为负
   */
  constructor(public face: number, public circle: number) {
  }
}
export class CoderFilter {
  private PULSE_PER_LOGIC_ROTATE: number
  private PULSE_PER_ROUND: number
  private ADSORBENT_PULSE: number

  private displayStates: Array<number>
  private counterStates: Array<number>
  private prevDirections: Array<RotateDirection>

  // GPIO 上一状态存储的数组，没有上一状态时（初始化时）为 UNKONWN
  private prevGPIOs: Array<CoderState>

  // 指令缓冲区
  private cmdQueue: Array<RotateCommand>

  /**
   * @param plusePerLogicRotate 每个逻辑转动有多少脉冲，目前编码器为 9
   * @param rotatePerRound 特定轴转一个圆周，有多少个逻辑转动，对于正方体魔方此值为 4
   * @param adsorbentPulse 吸附脉冲个数，一般为 1 或者 2
   * @param initGPIOs gpio 的初始化状态
   */
  constructor(
    plusePerLogicRotate: number = 9,
    rotatePerRound: number = 4,
    adsorbentPulse: number = 2,
    initGPIOs: Array<CoderState> = new Array(6).fill(CoderState.UNKONWN)) {
    this.reset(plusePerLogicRotate, rotatePerRound, adsorbentPulse, initGPIOs)
  }
  /**
   * 实现根据参数重置滤波器状态
   * @param plusePerLogicRotate 每个逻辑转动有多少脉冲，目前编码器为 6 或者 9
   * @param rotatePerRound 特定轴转一个圆周，有多少个逻辑转动，对于正方体魔方此值为 4
   * @param adsorbentPulse 吸附脉冲个数，一般为 1 或者 2
   * @param initGPIOs gpio 的初始化状态
   */
  public reset(
    plusePerLogicRotate: number,
    rotatePerRound: number,
    adsorbentPulse: number,
    initGPIOs: Array<CoderState> = new Array(6).fill(CoderState.UNKONWN)): void {
    this.PULSE_PER_LOGIC_ROTATE = plusePerLogicRotate
    this.PULSE_PER_ROUND = plusePerLogicRotate * rotatePerRound
    this.ADSORBENT_PULSE = adsorbentPulse
    // 需要初始化为 PULSE_PER_AROUND 的整数倍
    // 初始状态都需要初始化成一个足够大的正数，以防负数求余出问题
    // 但是这个正数又不能太大，以防溢出，或者因为 double 所导致的不精确
    this.displayStates = new Array(6).fill(this.PULSE_PER_ROUND * 1e10)
    this.counterStates = new Array(6).fill(this.PULSE_PER_ROUND * 1e10)
    this.prevDirections = new Array<RotateDirection>(6).fill(RotateDirection.UNKONWN)
    this.prevGPIOs = [...initGPIOs]
    this.cmdQueue = []
  }
  private inDeadArea(count: number): boolean {
    if (count % this.PULSE_PER_LOGIC_ROTATE <= this.ADSORBENT_PULSE ||
      count % this.PULSE_PER_LOGIC_ROTATE >= this.PULSE_PER_LOGIC_ROTATE - this.ADSORBENT_PULSE) {
      return true
    }
    return false
  }
  private pushCommand(axis: number, from: number, to: number): void {
    if (from < to) {
      for (let i = from; i < to; i++) {
        this.cmdQueue.push(new RotateCommand(axis, this.PULSE_PER_ROUND))
      }
    } else if (from > to) {
      for (let i = to; i < from; i++) {
        this.cmdQueue.push(new RotateCommand(axis, -this.PULSE_PER_ROUND))
      }
    }
  }
  private findNearestLogicCount(count: number): number {
    for (let i = 0; i < this.PULSE_PER_LOGIC_ROTATE / 2; i++) {
      if ((count - i) % this.PULSE_PER_LOGIC_ROTATE === 0) {
        return count - i
      }
      if ((count + i) % this.PULSE_PER_LOGIC_ROTATE === 0) {
        return count + i
      }
    }
  }
  private handleCounterChange(i: number, prevDirection: RotateDirection, currDirection: RotateDirection): void {

    if (currDirection === RotateDirection.CLOCKWISE) {
      this.counterStates[i]++
    } else {
      this.counterStates[i]--
    }

    if (!this.inDeadArea(this.counterStates[i])) {
      // 通过相干面拉回其他面到最接近的合法逻辑状态
      for (let j = 0; j < 6; j++) {
        if (j !== i && !COMPATIBLE_FACE[i].includes(j)) {
          const nearestLogicCount = this.findNearestLogicCount(this.displayStates[j])
          if (nearestLogicCount !== this.displayStates[j]) {
            Debug.warn(`使用相干面校准算法拉回，轴${j} ${this.displayStates[j]} -> ${nearestLogicCount}`)
          }
          this.pushCommand(j, this.displayStates[j], nearestLogicCount)
          this.displayStates[j] = nearestLogicCount
          this.counterStates[j] = nearestLogicCount
        }
      }
      if (prevDirection === currDirection) {
        this.pushCommand(i, this.displayStates[i], this.counterStates[i])
        this.displayStates[i] = this.counterStates[i]
      } else {

      }
    } else {
      const prevDisplayCount = this.displayStates[i]
      if (this.counterStates[i] % this.PULSE_PER_LOGIC_ROTATE < this.PULSE_PER_LOGIC_ROTATE / 2) {
        this.displayStates[i] = this.counterStates[i] - this.counterStates[i] % this.PULSE_PER_LOGIC_ROTATE
        this.pushCommand(i, prevDisplayCount, this.displayStates[i])
      } else {
        this.displayStates[i] = this.counterStates[i] +
          (this.PULSE_PER_LOGIC_ROTATE - this.counterStates[i] % this.PULSE_PER_LOGIC_ROTATE)
        this.pushCommand(i, prevDisplayCount, this.displayStates[i])
      }
    }
  }
  // 00 -> 10 -> 11 -> 01 为 顺时针；逆向为逆时针；未改变为NONE；出现两位 GPIO 变化为 ERROR
  private parseDirection(prev: CoderState, curr: CoderState): RotateDirection {
    if (prev === CoderState.UNKONWN || curr === CoderState.UNKONWN) {
      throw new Error(`GPIOState illegal: prev: ${prev}, curr ${curr}`)
    }
    if (CODER_STATE_COUNT_MAP[curr] - CODER_STATE_COUNT_MAP[prev] === 1
      || (CODER_STATE_COUNT_MAP[curr] === 0 && CODER_STATE_COUNT_MAP[prev] === 3)) {
      return RotateDirection.CLOCKWISE
    } else if (CODER_STATE_COUNT_MAP[curr] - CODER_STATE_COUNT_MAP[prev] === -1
      || (CODER_STATE_COUNT_MAP[curr] === 3 && CODER_STATE_COUNT_MAP[prev] === 0)) {
      return RotateDirection.ANTICLOCKWISE
    } else if (CODER_STATE_COUNT_MAP[curr] === CODER_STATE_COUNT_MAP[prev]) {
      return RotateDirection.NONE
    } else {
      return RotateDirection.ERROR
    }
  }



  public update(currGPIOs: Array<CoderState>): void {
    for (let i = 0; i < currGPIOs.length; i++) {
      // 排除初始化状态
      if (this.prevGPIOs[i] !== CoderState.UNKONWN) {
        const currDirection = this.parseDirection(this.prevGPIOs[i], currGPIOs[i])
        switch (currDirection) {
          case RotateDirection.CLOCKWISE:
          case RotateDirection.ANTICLOCKWISE:
            this.handleCounterChange(i, this.prevDirections[i], currDirection)
            break
          case RotateDirection.NONE:
            break
          case RotateDirection.ERROR:
            // TODO 记录转轴老化程度
            Debug.warn(`axis ${i} error state jump: ${this.prevGPIOs[i]} -> ${currGPIOs[i]}`)
            break
        }
        // 只有当前转动方向合法时，才更新前一次的转动方向
        if (currDirection === RotateDirection.CLOCKWISE || currDirection === RotateDirection.ANTICLOCKWISE) {
          this.prevDirections[i] = currDirection
        }
      }
      this.prevGPIOs[i] = currGPIOs[i]
    }
  }
  getCommands(): Array<RotateCommand> {
    const res = this.cmdQueue
    this.cmdQueue = []
    return res
  }
}
