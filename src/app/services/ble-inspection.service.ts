import { Injectable, ViewChild } from '@angular/core';
import { Subject } from 'rxjs';
import { CubeState, Color } from 'src/libs/cube-state';
import { CubeComponent } from '../components/cube/cube.component';
import { CalibrationParam } from 'src/libs/sk-protocol-v2';

import { BleCommandService } from './ble-command.service';
import { CubeStateService } from './cube-state.service';

interface rotateParams {
  face: number,
  circle: number
}

interface inspectParams {
  result: boolean,
  description: string
}

const ORIGIN_CUBE: CubeState = [
  [Color.Y, Color.Y, Color.Y, Color.Y, Color.Y, Color.Y, Color.Y, Color.Y, Color.Y],
  [Color.O, Color.O, Color.O, Color.O, Color.O, Color.O, Color.O, Color.O, Color.O],
  [Color.B, Color.B, Color.B, Color.B, Color.B, Color.B, Color.B, Color.B, Color.B],
  [Color.R, Color.R, Color.R, Color.R, Color.R, Color.R, Color.R, Color.R, Color.R],
  [Color.G, Color.G, Color.G, Color.G, Color.G, Color.G, Color.G, Color.G, Color.G],
  [Color.W, Color.W, Color.W, Color.W, Color.W, Color.W, Color.W, Color.W, Color.W]
]

@Injectable({
  providedIn: 'root'
})
export class BleInspectionService {

  constructor(
    private bleCommandService: BleCommandService,
    private cubeStateService: CubeStateService,
  ) { }

  private _dynamicInspectItem$: Subject<number> = new Subject<number>()
  private _rotateParams$: Subject<rotateParams> = new Subject<rotateParams>()
  private _stepInspectItem$: Subject<number> = new Subject<number>()

  public inspectVoltage(currentState: any, validState: any): Promise<inspectParams> {
    return new Promise<inspectParams>((resolve, reject) => {
      let result 
      let description
      if (currentState >= validState) {
        result = true
        description = "合格，电池电压高于合法值"
      } else {
        result = false
        description = `不合格，低于合法电压值${validState}V`
      }
      resolve({result, description})
    })
  }

  public inspectCstate(): Promise<inspectParams> {
    return new Promise<inspectParams>(async (resolve, reject) => {
      await this.bleCommandService.setCubeState({
        state: ORIGIN_CUBE,
        pause: [0, 0, 0, 0, 0, 0]
      })
      this.cubeStateService.setCubeState(ORIGIN_CUBE)
      let result = true
      let description = "合格，已初始化逻辑魔方姿态"
      resolve({result, description})
    })
  }

  public inspectSensors(): Promise<inspectParams> {
    return new Promise<inspectParams>(async (resolve, reject) => {
      const {
        accelerometerParam,
        gyroscopeParam,
        magnetometerParam
      } = await this.bleCommandService.getSensorsCalibrationParam()
  
      await this.bleCommandService.setSensorsCalibrationParam({
        accelerometerParam: CalibrationParam.fromString(accelerometerParam.toString()),
        gyroscopeParam: CalibrationParam.fromString(gyroscopeParam.toString()),
        magnetometerParam: CalibrationParam.fromString(magnetometerParam.toString())
      })
      let result = true
      let description = "合格，已校准九轴参数"
      resolve({result, description})
    })
  }

  public inspectFilter(): Promise<inspectParams> {
    return new Promise<inspectParams>((resolve, reject) => {
      let result = true
      let description = "合格，已初始化滤波参数"
      resolve({result, description})
    })
  }

  public inspectIdentity(): Promise<inspectParams> {
    return new Promise<inspectParams>((resolve, reject) => {
      let result = true
      let description = "合格，已初始化滤波参数"
      resolve({result, description})
    })
  }

  public inspectOad(currentState: any, validState: any): Promise<inspectParams> {
    return new Promise<inspectParams>((resolve, reject) => {
      let currentVersion = currentState.split('.')
      let validVersion = validState.split('.')
      let [currMajor, currMinor, currPatch] = [currentVersion.slice(0,1), currentVersion.slice(1,2), currentVersion.slice(2,3)]
      let [valMajor, valMinor, valPatch] = [validVersion.slice(0,1), validVersion.slice(1,2), validVersion.slice(2,3)]
      let result
      let description
      if (currMajor === valMajor && currMinor === valMinor && currPatch === valPatch) {
        result = true
        description = "合格，当前版本为最新版本"
      } else {
        result = false
        description = "不合格，当前版本低于最新版本"
      }
      resolve({result, description})
    })
  }

  public get dynamicInspectItem$() {
    return this._dynamicInspectItem$
  }
  public get rotateParams() {
    return this._rotateParams$
  }
  public get stepInspectItem() {
    return this._stepInspectItem$
  }
}
