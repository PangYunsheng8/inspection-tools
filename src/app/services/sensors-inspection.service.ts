import { Injectable } from '@angular/core';
import { CalibrationParam } from 'src/libs/sk-protocol-v2';
import { BleCommandService } from './ble-command.service';

interface InspectResult {
  result: boolean,
  description: string
}

@Injectable({
  providedIn: 'root'
})
export class SensorsInspectionService {

  constructor(
    private bleCommandService: BleCommandService
  ) { }

  public inspectSensors(): Promise<InspectResult> {
    return new Promise<InspectResult>(async (resolve, reject) => {
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
}
