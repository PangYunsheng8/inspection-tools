import { Component, OnInit } from '@angular/core';
import { InspectionStaticItem } from '../../class/inspection-static-item';
import { BleCurrentStateService } from '../../services/ble-current-state.service';
import { BleValidService } from '../../services/ble-valid.service';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';

@Component({
  selector: 'app-voltage-item-inspection',
  templateUrl: './voltage-item-inspection.component.html',
  styleUrls: ['./voltage-item-inspection.component.scss']
})
export class VoltageItemInspectionComponent implements OnInit {

  constructor(
    private bleCurrentStateService: BleCurrentStateService,
    private bleValidService: BleValidService,
    private bleInspectionItemService: BleInspectionItemService,
  ) { }

  //电压检查项
  public voltageItem: InspectionStaticItem

  ngOnInit() {
    this.initInspectionItem()
  }

  public async inspect() {
    this.voltageItem.isInspecting = true
    this.voltageItem.currentState = this.bleCurrentStateService.voltage
    this.voltageItem.validState = this.bleValidService.VOLTAGE_VALID
    const { result, description } = this.inspectVoltage(
      this.voltageItem.currentState, 
      this.voltageItem.validState
    )
    this.voltageItem.isInspected = true
    this.voltageItem.isInspecting = false
    this.voltageItem.inspectionResult = result
    this.voltageItem.description = description
  }

  public inspectVoltage(currentVoltage: number, validVoltage: number) {
    if (currentVoltage >= validVoltage) {
      return {
        result: true,
        description: "合格，电池电压高于合法值"
      }
    } else {
      return {
        result: false,
        description: `不合格，低于合法电压值${validVoltage}V`
      }
    }
  }

  //初始化待检测项目信息
  public initInspectionItem() {
    this.voltageItem = this.bleInspectionItemService.voltageItem
  }

  //清除当前检查项目的信息
  public clearInspectionItem() {
    this.bleInspectionItemService.voltageItem.isInspected = false
    this.bleInspectionItemService.voltageItem.inspectionResult = null
    this.bleInspectionItemService.voltageItem.description = null
    this.bleInspectionItemService.voltageItem.currentState = null
    this.bleInspectionItemService.voltageItem.validState = null
  }
}
