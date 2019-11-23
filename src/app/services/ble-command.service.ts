import { Injectable } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { BleService } from './ble.service';
import { Buffer } from 'buffer'
import {
  SkProtocolV2,
  Command,
  Time,
  HardwareInfo,
  BatteryInfo,
  SleepConfig,
  SleepState,
  CoderFilterParam,
  HardwareCubeState,
  SensorsCalibrationParam,
  AhrsParam,
  WorkState
} from 'src/libs/sk-protocol-v2';

@Injectable({
  providedIn: 'root'
})
export class BleCommandService {

  constructor(
    private bleService: BleService,
  ) { }

  public async nop(buff: Buffer): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.NOP, false, { payload: buff })
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommand(i)),
        filter(i => i.header.command === Command.NOP && i.header.id === currId)
      ).subscribe(i => {
        resolve(i.payload)
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async getWorkState(): Promise<WorkState> {
    return new Promise<WorkState>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.WORK_STATE, false)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommand(i)),
        filter(i => i.header.command === Command.WORK_STATE && i.header.id === currId)
      ).subscribe(i => {
        resolve(i.workState)
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async setWorkState(workState: WorkState): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.WORK_STATE, true, { workState })
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommandHeader(i)),
        filter(i => i.command === Command.WORK_STATE && i.id === currId)
      ).subscribe(i => {
        resolve()
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async getTime(): Promise<Time> {
    return new Promise<Time>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.TIME, false)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommand(i)),
        filter(i => i.header.command === Command.TIME && i.header.id === currId)
      ).subscribe(i => {
        resolve(i as Time)
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async getHardwareInfo(): Promise<HardwareInfo> {
    return new Promise<HardwareInfo>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.HARDWARE_INFO, false)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommand(i)),
        filter(i => i.header.command === Command.HARDWARE_INFO && i.header.id === currId)
      ).subscribe(i => {
        resolve(i as HardwareInfo)
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async getBatteryInfo(): Promise<BatteryInfo> {
    return new Promise<BatteryInfo>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.BATTERY_INFO, false)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommand(i)),
        filter(i => i.header.command === Command.BATTERY_INFO && i.header.id === currId)
      ).subscribe(i => {
        resolve(i as BatteryInfo)
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async getCustomData(): Promise<Buffer> {
    return new Promise<Buffer>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.CUSTOM_DATA, false)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommand(i)),
        filter(i => i.header.command === Command.CUSTOM_DATA && i.header.id === currId)
      ).subscribe(i => {
        resolve(i.customData)
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async getSleepConfig(): Promise<SleepConfig> {
    return new Promise<SleepConfig>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.SLEEP_CONFIG, false)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommand(i)),
        filter(i => i.header.command === Command.SLEEP_CONFIG && i.header.id === currId)
      ).subscribe(i => {
        resolve(i as SleepConfig)
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async getSleepState(): Promise<SleepState> {
    return new Promise<SleepState>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.SLEEP_STATE, false)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommand(i)),
        filter(i => i.header.command === Command.SLEEP_STATE && i.header.id === currId)
      ).subscribe(i => {
        resolve(i.sleepState)
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async setSleepState(sleepState: SleepState): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.SLEEP_STATE, true, { sleepState })
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommandHeader(i)),
        filter(i => i.command === Command.SLEEP_STATE && i.id === currId)
      ).subscribe(i => {
        resolve()
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async getCoderFilterParam(): Promise<CoderFilterParam> {
    return new Promise<CoderFilterParam>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.CODER_FILTER_PARAM, false)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommand(i)),
        // filter(i => i.header.command === Command.CODER_FILTER_PARAM && i.header.id === currId)
      ).subscribe(i => {
        resolve(i as CoderFilterParam)
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async getCubeState(): Promise<HardwareCubeState> {
    return new Promise<HardwareCubeState>((resolve, reject) => {
      console.log(Command.CUBE_STATE)
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.CUBE_STATE, false)
      console.log(buffer, currId)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommand(i)),
        filter(i => i.header.command === Command.CUBE_STATE && i.header.id === currId)
      ).subscribe(i => {
        console.log(i)
        resolve(i as HardwareCubeState)
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async setCubeState(cubeState: HardwareCubeState): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.CUBE_STATE, true, cubeState)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommandHeader(i)),
        filter(i => i.command === Command.CUBE_STATE && i.id === currId)
      ).subscribe(i => {
        resolve()
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async getSensorsCalibrationParam(): Promise<SensorsCalibrationParam> {
    return new Promise<SensorsCalibrationParam>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.SENSORS_CALIBRATION_PARAM, false)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommand(i)),
        filter(i => i.header.command === Command.SENSORS_CALIBRATION_PARAM && i.header.id === currId)
      ).subscribe(i => {
        resolve(i as SensorsCalibrationParam)
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async setSensorsCalibrationParam(sensorsCalibrationParam: SensorsCalibrationParam): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.SENSORS_CALIBRATION_PARAM, true, sensorsCalibrationParam)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommandHeader(i)),
        filter(i => i.command === Command.SENSORS_CALIBRATION_PARAM && i.id === currId)
      ).subscribe(i => {
        resolve()
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async getAhrsParam(): Promise<AhrsParam> {
    return new Promise<AhrsParam>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.AHRS_PARAM, false)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommand(i)),
        filter(i => i.header.command === Command.AHRS_PARAM && i.header.id === currId)
      ).subscribe(i => {
        resolve(i as AhrsParam)
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
  public async getOta() {
    return new Promise<void>((resolve, reject) => {
      const skProtocolV2 = SkProtocolV2.getInstance()
      const { buffer, currId } = skProtocolV2.encodeCommand(Command.OTA, false)
      const subscription = this.bleService.command$.pipe(
        map(i => skProtocolV2.resolveCommand(i)),
        filter(i => i.header.command === Command.OTA && i.header.id === currId)
      ).subscribe(i => {
        resolve()
        subscription.unsubscribe()
      })
      this.bleService.send(buffer)
    })
  }
}
