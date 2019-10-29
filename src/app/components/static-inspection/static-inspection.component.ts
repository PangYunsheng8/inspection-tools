import { Component, OnInit } from '@angular/core';
import { Debug } from 'src/libs/debug';

import { InspectionStaticItem } from '../../class/inspection-static-item';

import { BleValidService } from '../../services/ble-valid.service';
import { BleInspectionService } from '../../services/ble-inspection.service';
import { BleStateService } from '../../services/ble-state.service';
import { BleCurrentStateService } from '../../services/ble-current-state.service';

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
  ) { }

  //电池电压
  public voltageItem: InspectionStaticItem = new InspectionStaticItem()
  //九轴校准参数
  public accelerometerParam: string
  public gyroscopeParam: string
  public magnetometerParam: string
  //魔方状态
  public cubeState: number

  public voltageIcon: string = "#icon-dengdaiqueren"

  ngOnInit() {
    this.inspectAll()
  }

  public async inspectAll() {
    this.bleStateService.connectionStatus$.subscribe(async connected => {
      if (connected) {
        await this.inspectVoltage()
      }
    })
  }

  public async inspectVoltage() {
    this.voltageItem.itemName = "voltage"
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
  }

}
