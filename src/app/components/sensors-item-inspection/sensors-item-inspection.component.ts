import { Component, OnInit } from '@angular/core';

import { InspectionStaticItem } from '../../class/inspection-static-item';

import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { BleInspectionService } from '../../services/ble-inspection.service';

@Component({
  selector: 'app-sensors-item-inspection',
  templateUrl: './sensors-item-inspection.component.html',
  styleUrls: ['./sensors-item-inspection.component.scss']
})
export class SensorsItemInspectionComponent implements OnInit {

  constructor(
    private bleInspectionItemService: BleInspectionItemService,
    private bleInspectionService: BleInspectionService,
  ) { }

  public sensorsItem: InspectionStaticItem

  ngOnInit() {
    this.initInspectionItem()
  }

  //初始化待检测项目信息
  public initInspectionItem() {
    this.sensorsItem = this.bleInspectionItemService.sensorsItem
  }

  public async inspectSensors() {
    this.sensorsItem.isInspecting = true
    const { result, description } = await this.bleInspectionService.inspectSensors()
    this.sensorsItem.isInspected = true
    this.sensorsItem.isInspecting = false
    this.sensorsItem.inspectionResult = result
    this.sensorsItem.description = description

    this.bleInspectionItemService.inspectionItem$.next(this.sensorsItem.itemId)
  }
  
  //清除当前检查项目的信息
  public clearInspectionItem() {
    this.bleInspectionItemService.sensorsItem.isInspected = false
    this.bleInspectionItemService.sensorsItem.inspectionResult = null
    this.bleInspectionItemService.sensorsItem.description = null

    this.bleInspectionItemService.inspectionItem$.next(this.sensorsItem.itemId)
  }
}
