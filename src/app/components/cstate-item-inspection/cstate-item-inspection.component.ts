import { Component, OnInit } from '@angular/core';

import { InspectionStaticItem } from '../../class/inspection-static-item';

import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { BleInspectionService } from '../../services/ble-inspection.service';

@Component({
  selector: 'app-cstate-item-inspection',
  templateUrl: './cstate-item-inspection.component.html',
  styleUrls: ['./cstate-item-inspection.component.scss']
})
export class CstateItemInspectionComponent implements OnInit {

  constructor(
    private bleInspectionItemService: BleInspectionItemService,
    private bleInspectionService: BleInspectionService,
  ) { }

  public cstateItem: InspectionStaticItem

  ngOnInit() {
    this.initInspectionItem()
  }

  //初始化待检测项目信息
  public initInspectionItem() {
    this.cstateItem = this.bleInspectionItemService.cstateItem
  }

  public async inspectCstate() {
    this.cstateItem.isInspecting = true
    const { result, description } = await this.bleInspectionService.inspectCstate()
    this.cstateItem.isInspected = true
    this.cstateItem.isInspecting = false
    this.cstateItem.inspectionResult = result
    this.cstateItem.description = description
    this.bleInspectionItemService.inspectionItem$.next(this.cstateItem.itemId)
  }
  
  //清除当前检查项目的信息
  public clearInspectionItem() {
    this.bleInspectionItemService.cstateItem.isInspected = false
    this.bleInspectionItemService.cstateItem.inspectionResult = null
    this.bleInspectionItemService.cstateItem.description = null

    this.bleInspectionItemService.inspectionItem$.next(this.cstateItem.itemId)
  }
}
