import { Component, OnInit } from '@angular/core';
import { Debug } from 'src/libs/debug';

import { InspectionStaticItem } from '../../class/inspection-static-item';

import { BleValidService } from '../../services/ble-valid.service';
import { BleInspectionService } from '../../services/ble-inspection.service';
import { BleStateService } from '../../services/ble-state.service';
import { BleCurrentStateService } from '../../services/ble-current-state.service';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';

@Component({
  selector: 'app-static-inspection',
  templateUrl: './static-inspection.component.html',
  styleUrls: ['./static-inspection.component.scss']
})
export class StaticInspectionComponent implements OnInit {

  constructor(
    private bleValidService: BleValidService,
    private bleInspectionService: BleInspectionService,
    private bleStateService: BleStateService,
    private bleCurrentStateService: BleCurrentStateService,
    private bleInspectionItemService: BleInspectionItemService,
  ) { }

  //电池电压
  public voltageItem: InspectionStaticItem
  public voltageIcon: string = "#icon-dengdaiqueren"

  ngOnInit() {
    this.initInspectionItem()

    this.bleStateService.connectionStatus$.subscribe(connected => {
      if (connected) {
        this.inspectAll()
      } else if (!connected) {
        this.clearInspectionItem()
        this.voltageIcon = "#icon-dengdaiqueren"
      }
    })
  }

  public async inspectAll() {
    await this.inspectVoltage()
  }

  public async inspectVoltage() {
    this.voltageItem.currentState = this.bleCurrentStateService.voltage
    this.voltageItem.validState = this.bleValidService.VOLTAGE_VALID
    this.voltageItem.isInspecting = true
    const { result, description } = this.bleInspectionService.inspectVoltage(
      this.voltageItem.currentState, 
      this.voltageItem.validState
    )
    this.voltageItem.isInspected = true
    this.voltageItem.isInspecting = false
    this.voltageItem.inspectionResult = result
    this.voltageItem.description = description

    if (this.voltageItem.inspectionResult) this.voltageIcon = "#icon-chenggong"
    else this.voltageIcon = "#icon-shibai"

    this.bleInspectionItemService.staticItem$.next(this.voltageItem.id)
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

    this.bleInspectionItemService.staticItem$.next(this.voltageItem.id)
  }

}
