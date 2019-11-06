import { Component, OnInit } from '@angular/core';

import { InspectionStaticItem } from '../../class/inspection-static-item';

import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { BleInspectionService } from '../../services/ble-inspection.service';

@Component({
  selector: 'app-identity-item-inspection',
  templateUrl: './identity-item-inspection.component.html',
  styleUrls: ['./identity-item-inspection.component.scss']
})
export class IdentityItemInspectionComponent implements OnInit {

  constructor(
    private bleInspectionItemService: BleInspectionItemService,
    private bleInspectionService: BleInspectionService,
  ) { }

  public identityItem: InspectionStaticItem

  ngOnInit() {
    this.initInspectionItem()
  }

  //初始化待检测项目信息
  public initInspectionItem() {
    this.identityItem = this.bleInspectionItemService.identityItem
  }

  public async inspectIdentity() {
    this.identityItem.isInspecting = true
    const { result, description } = await this.bleInspectionService.inspectIdentity()
    this.identityItem.isInspected = true
    this.identityItem.isInspecting = false
    this.identityItem.inspectionResult = result
    this.identityItem.description = description

    this.bleInspectionItemService.inspectionItem$.next(this.identityItem.itemId)
  }
  
  //清除当前检查项目的信息
  public clearInspectionItem() {
    this.bleInspectionItemService.identityItem.isInspected = false
    this.bleInspectionItemService.identityItem.inspectionResult = null
    this.bleInspectionItemService.identityItem.description = null

    this.bleInspectionItemService.inspectionItem$.next(this.identityItem.itemId)
  }
}
