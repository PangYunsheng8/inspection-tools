import { Component, OnInit } from '@angular/core';

import { InspectionStaticItem } from '../../class/inspection-static-item';

import { BleCurrentStateService } from '../../services/ble-current-state.service';
import { BleValidService } from '../../services/ble-valid.service';
import { BleInspectionService } from '../../services/ble-inspection.service';
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
    private bleInspectionService: BleInspectionService,
    private bleInspectionItemService: BleInspectionItemService,
  ) { }

  public voltageItem: InspectionStaticItem

  ngOnInit() {
    this.initInspectionItem()
  }

  public async inspectVoltage() {
    this.voltageItem.currentState = this.bleCurrentStateService.voltage
    this.voltageItem.validState = this.bleValidService.VOLTAGE_VALID
    this.voltageItem.isInspecting = true
    const { result, description } = await this.bleInspectionService.inspectVoltage(
      this.voltageItem.currentState, 
      this.voltageItem.validState
    )
    this.voltageItem.isInspected = true
    this.voltageItem.isInspecting = false
    this.voltageItem.inspectionResult = result
    this.voltageItem.description = description

    this.bleInspectionItemService.inspectionItem$.next(this.voltageItem.itemId)
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

    this.bleInspectionItemService.inspectionItem$.next(this.voltageItem.itemId)
  }
}
