import { Component, OnInit } from '@angular/core';
import { CalibrationParam } from 'src/libs/sk-protocol-v2';
import { InspectionStaticItem } from '../../class/inspection-static-item';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { BleCurrentStateService } from '../../services/ble-current-state.service';
import { BleCommandService } from '../../services/ble-command.service';

interface InspectResult {
  result: boolean,
  description: string
}

@Component({
  selector: 'app-sensors-item-inspection',
  templateUrl: './sensors-item-inspection.component.html',
  styleUrls: ['./sensors-item-inspection.component.scss']
})
export class SensorsItemInspectionComponent implements OnInit {

  constructor(
    private bleInspectionItemService: BleInspectionItemService,
    private bleCommandService: BleCommandService,
    private bleCurrentStateService: BleCurrentStateService
  ) { }

  //九轴参数检查项
  public sensorsItem: InspectionStaticItem

  ngOnInit() {
    this.initInspectionItem()
  }

  public async inspect() {
    this.sensorsItem.isInspecting = true
    const { result, description } = await this.inspectSensors()
    this.sensorsItem.isInspected = true
    this.sensorsItem.isInspecting = false
    this.sensorsItem.inspectionResult = result
    this.sensorsItem.description = description
  }

  public inspectSensors(): Promise<InspectResult> {
    return new Promise<InspectResult>(async (resolve, reject) => {
      const accelerometerParam = this.bleCurrentStateService.accelerometerParam
      const gyroscopeParam = this.bleCurrentStateService.gyroscopeParam
      const magnetometerParam = this.bleCurrentStateService.magnetometerParam
  
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

  //初始化待检测项目信息
  public initInspectionItem() {
    this.sensorsItem = this.bleInspectionItemService.sensorsItem
  }
  
  //清除当前检查项目的信息
  public clearInspectionItem() {
    this.bleInspectionItemService.sensorsItem.isInspected = false
    this.bleInspectionItemService.sensorsItem.inspectionResult = null
    this.bleInspectionItemService.sensorsItem.description = null
  }
}
