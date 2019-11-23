import { Buffer } from 'buffer';
import * as byteData from 'byte-data';
import { CubeState, FaceState, Color } from './cube-state';

export interface SendHeader {
  command: number             // 请求命令
  commandType: string         // 请求类型
  id: number                  // 请求 id
  set: number                 // 是否为set 命令
}
export interface ReceiveHeader {
  command: number             // 请求命令
  commandType: string         // 请求类型
  id: number                  // 请求 id
  success: number             // 请求是否成功
}
export interface Time {
  second: number                // 秒钟，用 RTC 实现秒级计时，溢出重新从 0 开始计时
  counter: number               // 准微秒级时间戳，0-65535 线性表示 0-999999 微秒
}

export class CalibrationParam {
  static fromString(str: string): CalibrationParam {
    const [x0, y0, z0, a, b, c] = str.split(' ').map(i => +i)
    return new CalibrationParam(x0, y0, z0, a, b, c)
  }
  constructor(
    public x0: number = 0, public y0: number = 0, public z0: number = 0,
    public a: number = 1, public b: number = 1, public c: number = 1) { }

  toString() {
    return `${this.x0} ${this.y0} ${this.z0} ${this.a} ${this.b} ${this.c}`
  }
}

export interface MoveData extends Time {
  face: number                  // 所转动的轴编号
  circle: number                // 所转动的步长，所转角度 = 360deg / circle
}

export interface AttitudeData extends Time {
  w: number                    // 姿态四元素w,x,y,z
  x: number
  y: number
  z: number
}

export interface GPIOData extends Time {
  pins: Array<number>           // 48位 pin 的状态
}

export interface AttitudeRawData {
  accelerometer: [number, number, number]         // 三轴加速度计读数，数组第 0, 1, 2 号元素分别为 x y z 轴，单位: g
  gyroscope: [number, number, number]            // 三轴陀螺仪读数，数组第 0, 1, 2 号元素分别为 x y z 轴，单位: r/s
  magnetometer: [number, number, number]              // 三轴磁力计读数，数组第 0, 1, 2 号元素分别为 x y z 轴，单位: G
}

export interface CoderFilterParam {
  plusePerLogicRotate: number   // 烧写时默认值为 9
  rotatePerRound: number        // 烧写时默认值为 4
  adsorbentPulse: number        // 烧写时默认值为 2
  coderErrorCount: number;      // 编码器出错计数，烧写程序时初始化为 0，由我方给出的滤波器回调触发时 + 1(未给出源代码时，先置 0)
  axisInterfereCount: number;   // 相干面算法使用计数，烧写程序时初始化为 0，由我方给出的滤波器回调触发时 + 1(未给出源代码时，先置 0)
  pinMap: Array<Array<number>>; // pin 映射
}
// 当前的电池信息
export interface BatteryInfo {
  voltage: number     // 电池电压 单位:mV
  percentage: number;  // 当前电池剩余电量的百分比 0-100 对应 0% - 100%
}

export interface SleepConfig {
  shallowSleepDelayTime: number;      // 进入浅度休眠的延时时间，默认值为60
  deepSleepDelayTime: number;         // 进入浅度后，再进入深度休眠的延时时间，默认值为1800
  quickBleBroadcastTime: number;      // 进入浅休眠后快速广播持续时间，默认60
}
export interface Version { // 拍平 Version
  major: number            // 主版本号
  minor: number            // 次版本号
  patch: number            // 每次小幅更新此值加一
}
export interface HardwareInfo extends Version {
  pid: Buffer                  // 长度为 8 的小端优先的 Buffer 产品 id
  serial: Buffer               // 长度为 8 的小端优先的 Buffer 序列号
  bootCount: number;           // 设备加电次数，烧写程序时初始化为 0，以后每次开机此值加 1
}
export enum WorkState {
  IDLE_WORK_STATE = 0,
  DEBUG_WORK_STATE = 1,
  NORMAL_WORK_STATE = 2
}
export enum SleepState {
  NORMAL = 0,
  SHALLOW_SLEEP = 1,
  DEEP_SLEEP = 2
}
export interface SensorsCalibrationParam {
  accelerometerParam: CalibrationParam
  gyroscopeParam: CalibrationParam
  magnetometerParam: CalibrationParam
}
export interface AhrsParam {
  beta: number                  // Madgwick 算法中的 beta 参数
  kp: number                    // Mahony 算法中的 kp 参数
  ki: number                    // Mahony 算法中的 ki 参数
  type: number                  // 算法类型 0 = Madgwick 1 = Mahony
  sampleMs: number              // 算法运行的采样间隔毫秒数，频率 = 1000/sampleMs
}
export interface HardwareCubeState {
  state: CubeState
  pause: Array<number>
}
export interface ResolvedCommand extends Partial<Time>,
  Partial<CoderFilterParam>,
  Partial<BatteryInfo>,
  Partial<SleepConfig>,
  Partial<AttitudeRawData>,
  Partial<HardwareInfo>,
  Partial<SensorsCalibrationParam>,
  Partial<HardwareCubeState>,
  Partial<AhrsParam> {

  workState?: WorkState;

  sleepState?: SleepState;

  customData?: Buffer           // 十六进制表示的 客户自定义数据

  header?: ReceiveHeader               // 请求头
  payload?: Buffer              // 有效负载
}


const PIN_MAP = [
  [0, 0], [0, 1], [1, 0], [1, 1], [2, 0], [2, 1],
  [3, 0], [3, 1], [4, 0], [4, 1], [5, 0], [5, 1],
]

export enum Command {
  NOP = 0,
  TIME = 1,
  HARDWARE_INFO = 2,
  BATTERY_INFO = 3,
  WORK_STATE = 4,
  SLEEP_CONFIG = 5,
  SLEEP_STATE = 6,
  CODER_FILTER_PARAM = 7,
  SENSORS_CALIBRATION_PARAM = 8,
  AHRS_PARAM = 9,
  CUBE_STATE = 10,
  CUSTOM_DATA = 11,
  OTA = 15
}


export class SkProtocolV2 {
  private static instance: SkProtocolV2 = null
  private currId = 0

  // 使用单例模式，使用 SkProtocol.getInstance() 获取对象
  private constructor() { }

  static getInstance(): SkProtocolV2 {
    if (!SkProtocolV2.instance) {
      SkProtocolV2.instance = new SkProtocolV2()
    }
    return SkProtocolV2.instance
  }

  private getAndIncId() {
    this.currId = (this.currId + 1) % 8
    return this.currId
  }

  public resolveCommandHeader(buff: Buffer): ReceiveHeader {
    const header = buff[0];
    const command = header & 0x0f;
    const success = (header >> 4) & 0x01;
    const id = (header >> 5) & 0x07;
    return { command, commandType: Command[command], id, success }
  }

  public resolveCommand(buff: Buffer): ResolvedCommand {
    const header = this.resolveCommandHeader(buff)
    const payload = buff.slice(1);
    const res: ResolvedCommand = {
      header,
      payload
    }
    // 为 set 指令的返回
    if (payload.length === 0) {
      return res
    }
    switch (header.command) {
      case Command.NOP: {
        res.payload = payload
        break
      } case Command.TIME: {
        res.second = payload.readUInt16LE(0);
        res.counter = payload.readUInt16LE(2);
        break;
      } case Command.HARDWARE_INFO: {
        res.pid = payload.slice(0, 8)
        res.serial = payload.slice(8, 16)
        res.bootCount = payload.readUInt32LE(16);
        res.major = payload.readUInt8(20)
        res.minor = payload.readUInt8(21)
        res.patch = payload.readUInt16LE(22)
        break;
      } case Command.BATTERY_INFO: {
        res.voltage = payload.readUInt16LE(0);
        res.percentage = payload.readUInt8(2);
        break;
      } case Command.CUSTOM_DATA: {
        res.customData = payload.slice(0, 128)
        break;
      } case Command.WORK_STATE: {
        res.workState = payload.readUInt8(0);
        break;
      } case Command.SLEEP_CONFIG: {
        res.shallowSleepDelayTime = payload.readInt32LE(0);
        res.deepSleepDelayTime = payload.readInt32LE(4);
        res.quickBleBroadcastTime = payload.readInt32LE(8);
        break;
      } case Command.SLEEP_STATE: {
        res.sleepState = payload.readUInt8(0);
        break;
      } case Command.CODER_FILTER_PARAM: {
        let offset = 0
        res.plusePerLogicRotate = payload.readUInt32LE(offset)
        offset += 4
        res.rotatePerRound = payload.readUInt32LE(offset)
        offset += 4
        res.adsorbentPulse = payload.readUInt32LE(offset)
        offset += 4
        res.coderErrorCount = payload.readUInt32LE(offset)
        offset += 4
        res.axisInterfereCount = payload.readUInt32LE(offset)
        offset += 4
        const pinMap: Array<Array<number>> = new Array(12).fill(i => new Array(2)).map(i => i())
        for (let i = 0; i < 12; i++) {
          for (let j = 0; j < 2; j++) {
            pinMap[i][j] = payload.readUInt8(offset)
            offset += 1
          }
        }
        res.pinMap = pinMap
        break;
      } case Command.SENSORS_CALIBRATION_PARAM: {
        res.accelerometerParam = new CalibrationParam()
        res.accelerometerParam.x0 = payload.readFloatLE(0);
        res.accelerometerParam.y0 = payload.readFloatLE(4);
        res.accelerometerParam.z0 = payload.readFloatLE(8);
        res.accelerometerParam.a = payload.readFloatLE(12);
        res.accelerometerParam.b = payload.readFloatLE(16);
        res.accelerometerParam.c = payload.readFloatLE(20);

        res.gyroscopeParam = new CalibrationParam()
        res.gyroscopeParam.x0 = payload.readFloatLE(24);
        res.gyroscopeParam.y0 = payload.readFloatLE(28);
        res.gyroscopeParam.z0 = payload.readFloatLE(32);
        res.gyroscopeParam.a = payload.readFloatLE(36);
        res.gyroscopeParam.b = payload.readFloatLE(40);
        res.gyroscopeParam.c = payload.readFloatLE(44);

        res.magnetometerParam = new CalibrationParam()
        res.magnetometerParam.x0 = payload.readFloatLE(48);
        res.magnetometerParam.y0 = payload.readFloatLE(52);
        res.magnetometerParam.z0 = payload.readFloatLE(56);
        res.magnetometerParam.a = payload.readFloatLE(60);
        res.magnetometerParam.b = payload.readFloatLE(64);
        res.magnetometerParam.c = payload.readFloatLE(68);
        break;
      } case Command.AHRS_PARAM: {
        res.beta = payload.readFloatLE(0);
        res.kp = payload.readFloatLE(4);
        res.ki = payload.readFloatLE(8);
        res.type = payload.readUInt8(12);
        res.sampleMs = payload.readUInt8(13);
        break;
      } case Command.CUBE_STATE: {
        const cubeState: CubeState = new Array<FaceState>() as CubeState
        for (let i = 0; i < 6; i++) {
          const fs: FaceState = new Array<Color>() as FaceState
          for (let j = 0; j < 9; j++) {
            const val = payload.readUInt8(Math.floor((i * 9 + j) / 2))
            const isEven = (i * 9 + j) % 2 == 0
            fs[j] = (val >> (isEven ? 0 : 4)) & 0x0f
          }
          cubeState.push(fs)
        }
        res.state = cubeState
        const pause = new Array<number>();
        for (let i = 0; i < 6; i++) {
          const val = payload.readUInt8(27 + Math.floor(i / 2))
          const isEven = i % 2 == 0
          pause[i] = (val >> (isEven ? 0 : 4)) & 0x0f
        }
        res.pause = pause;
      }
    }
    return res
  }

  public resovleMoveData(buff: Buffer): Array<MoveData> {
    const count = buff.readUInt8(0)
    const payload = buff.slice(1)
    if (count > 3) {
      throw new Error(`MoveData 解析出错：一个包最多包含 3 个 MoveData，解析出的 count = ${count}`)
    }
    const res = new Array<MoveData>()
    for (let i = 0; i < count; i++) {
      const data: MoveData = {
        second: payload.readUInt16LE(i * 6),
        counter: payload.readUInt16LE(i * 6 + 2),
        face: payload.readUInt8(i * 6 + 4),
        circle: payload.readInt8(i * 6 + 5),
      }
      res.push(data)
    }
    return res
  }

  public resolveAttitudeData(buff: Buffer): AttitudeData {
    const res: AttitudeData = {
      second: buff.readUInt16LE(0),
      counter: buff.readUInt16LE(2),
      w: buff.readFloatLE(4),
      x: buff.readFloatLE(8),
      y: buff.readFloatLE(12),
      z: buff.readFloatLE(16)
    }
    return res
  }

  public resolveGPIOData(buff: Buffer): Array<GPIOData> {
    const res = new Array<GPIOData>()
    for (let k = 0; k < 2; k++) {
      const second = buff.readUInt16LE(k * 10 + 0)
      const counter = buff.readUInt16LE(k * 10 + 2)
      const pins = new Array<number>(48)
      for (let i = 0; i < 6; i++) {
        const byte = buff.readUInt8(k * 10 + 4 + i)
        for (let j = 0; j < 8; j++) {
          pins[i * 8 + j] = (byte >> j) & 0x01
        }
      }
      res.push({ second, counter, pins })
    }

    return res
  }

  public resolveAttitudeRawData(buff: Buffer): AttitudeRawData {
    let offset = 0
    const accelerometer: [number, number, number] = [0, 0, 0]
    const gyroscope: [number, number, number] = [0, 0, 0]
    const magnetometer: [number, number, number] = [0, 0, 0]
    for (let i = 0; i < 3; i++) {
      accelerometer[i] = byteData.unpack(buff, { bits: 16, fp: true }, offset + i * 2)
    }
    offset += 6
    for (let i = 0; i < 3; i++) {
      gyroscope[i] = byteData.unpack(buff, { bits: 16, fp: true }, offset + i * 2)
    }
    offset += 6
    for (let i = 0; i < 3; i++) {
      magnetometer[i] = byteData.unpack(buff, { bits: 16, fp: true }, offset + i * 2)
    }
    return {
      accelerometer,
      gyroscope,
      magnetometer
    }
  }

  public encodeCommand(cmd: number, isSet: boolean, body: ResolvedCommand = {}): { buffer: Buffer, currId: number } {
    const headerBuff = Buffer.alloc(1);
    const command = cmd
    const id = this.getAndIncId()
    const set = isSet ? 1 : 0;
    let header = 0
    header |= command
    header |= set << 4
    header |= id << 5

    headerBuff.writeUInt8(header, 0)
    let payloadBuff: Buffer = Buffer.alloc(0);
    if (isSet) {
      switch (cmd) {
        // 重置 RTC
        case Command.NOP: {
          payloadBuff = body.payload;
          break;
        }
        case Command.TIME: {
          payloadBuff = Buffer.alloc(4);
          payloadBuff.writeUInt16LE(body.second, 0);
          payloadBuff.writeUInt16LE(body.counter, 2);
          break;
        } case Command.HARDWARE_INFO: {
          payloadBuff = Buffer.alloc(20);
          body.pid.copy(payloadBuff, 0)
          body.serial.copy(payloadBuff, 8);
          payloadBuff.writeUInt32LE(body.bootCount, 16);
          payloadBuff.writeUInt8(body.major, 20);
          payloadBuff.writeUInt8(body.minor, 21);
          payloadBuff.writeUInt16LE(body.patch, 22)
          break;
        } case Command.BATTERY_INFO: {
          payloadBuff = Buffer.alloc(3);
          payloadBuff.writeUInt8(body.voltage, 0);
          payloadBuff.writeUInt8(body.percentage, 2);
          break;
        } case Command.CUSTOM_DATA: {
          payloadBuff = body.customData
          break;
        } case Command.WORK_STATE: {
          payloadBuff = Buffer.alloc(1);
          payloadBuff.writeUInt8(body.workState, 0);
          break;
        } case Command.SLEEP_CONFIG: {
          payloadBuff = Buffer.alloc(12);
          payloadBuff.writeInt32LE(body.shallowSleepDelayTime, 0);
          payloadBuff.writeInt32LE(body.deepSleepDelayTime, 4);
          payloadBuff.writeInt32LE(body.quickBleBroadcastTime, 8)
          break;
        } case Command.SLEEP_STATE: {
          payloadBuff = Buffer.alloc(1);
          payloadBuff.writeUInt8(body.sleepState, 0);
          break;
        } case Command.CODER_FILTER_PARAM: {
          payloadBuff = Buffer.alloc(44);
          let offset = 0
          payloadBuff.writeUInt32LE(body.plusePerLogicRotate, offset)
          offset += 4
          payloadBuff.writeUInt32LE(body.rotatePerRound, offset)
          offset += 4
          payloadBuff.writeUInt32LE(body.adsorbentPulse, offset)
          offset += 4
          payloadBuff.writeUInt32LE(body.coderErrorCount, offset);
          offset += 4
          payloadBuff.writeUInt32LE(body.axisInterfereCount, offset);
          offset += 4
          for (let i = 0; i < 12; i++) {
            for (let j = 0; j < 2; j++) {
              payloadBuff.writeUInt8(body.pinMap[i][j], offset)
              offset += 1
            }
          }
          break;
        } case Command.SENSORS_CALIBRATION_PARAM: {
          payloadBuff = Buffer.alloc(72);
          let offset = 0
          payloadBuff.writeFloatLE(body.accelerometerParam.x0, offset);
          payloadBuff.writeFloatLE(body.accelerometerParam.y0, offset += 4);
          payloadBuff.writeFloatLE(body.accelerometerParam.z0, offset += 4);
          payloadBuff.writeFloatLE(body.accelerometerParam.a, offset += 4);
          payloadBuff.writeFloatLE(body.accelerometerParam.b, offset += 4);
          payloadBuff.writeFloatLE(body.accelerometerParam.c, offset += 4);

          payloadBuff.writeFloatLE(body.gyroscopeParam.x0, offset += 4);
          payloadBuff.writeFloatLE(body.gyroscopeParam.y0, offset += 4);
          payloadBuff.writeFloatLE(body.gyroscopeParam.z0, offset += 4);
          payloadBuff.writeFloatLE(body.gyroscopeParam.a, offset += 4);
          payloadBuff.writeFloatLE(body.gyroscopeParam.b, offset += 4);
          payloadBuff.writeFloatLE(body.gyroscopeParam.c, offset += 4);

          payloadBuff.writeFloatLE(body.magnetometerParam.x0, offset += 4);
          payloadBuff.writeFloatLE(body.magnetometerParam.y0, offset += 4);
          payloadBuff.writeFloatLE(body.magnetometerParam.z0, offset += 4);
          payloadBuff.writeFloatLE(body.magnetometerParam.a, offset += 4);
          payloadBuff.writeFloatLE(body.magnetometerParam.b, offset += 4);
          payloadBuff.writeFloatLE(body.magnetometerParam.c, offset += 4);
          break;
        } case Command.AHRS_PARAM: {
          payloadBuff = Buffer.alloc(14);
          payloadBuff.writeFloatLE(body.beta, 0);
          payloadBuff.writeFloatLE(body.kp, 4);
          payloadBuff.writeFloatLE(body.ki, 8);
          payloadBuff.writeUInt8(body.type, 12);
          payloadBuff.writeUInt8(body.sampleMs, 13);
          break;
        } case Command.CUBE_STATE: {
          payloadBuff = Buffer.alloc(27 + 3);
          for (let i = 0; i < 6; i++) {
            for (let j = 0; j < 9; j++) {
              const isEven = (i * 9 + j) % 2 == 0
              payloadBuff[Math.floor((i * 9 + j) / 2)] |= (body.state[i][j] & 0x0f) << (isEven ? 0 : 4)
            }
          }
          for (let i = 0; i < 6; i++) {
            const isEven = i % 2 == 0
            payloadBuff[Math.floor(i / 2)] |= (body.pause[i] & 0x0f) << (isEven ? 0 : 4)
          }
          break;
        } case Command.OTA: {
          payloadBuff = Buffer.alloc(0)
        }
      }
    }
    const buff = Buffer.concat([headerBuff, payloadBuff]);
    return { buffer: buff, currId: id }
  }
}

function test() {
  const skProtocolV2 = SkProtocolV2.getInstance()
  console.log(skProtocolV2.resolveCommand(new Buffer([0, 0])))
  const { buffer, currId } = skProtocolV2.encodeCommand(Command.TIME, false, { counter: 10, second: 30 })
  console.log(buffer, currId)
  console.log(skProtocolV2.resolveCommand(buffer))
  console.log(skProtocolV2.resovleMoveData(new Buffer([1, 0, 2, 0, 1, 4, 0, 0, 0, 0, 1, 4])));
  console.log(skProtocolV2.resolveAttitudeData(new Buffer([0, 0, 0, 0, 1, 4, 0, 0, 0, 0, 1, 4, 0, 0, 1, 4, 0, 0, 1, 4])));
}

// test()
