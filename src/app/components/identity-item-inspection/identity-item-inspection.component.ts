import { Component, OnInit } from '@angular/core';
import { InspectionStaticItem } from '../../class/inspection-static-item';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { IdentityInspectionService } from '../../services/identity-inspection.service';
import { BleCurrentStateService } from '../../services/ble-current-state.service';

@Component({
  selector: 'app-identity-item-inspection',
  templateUrl: './identity-item-inspection.component.html',
  styleUrls: ['./identity-item-inspection.component.scss']
})
export class IdentityItemInspectionComponent implements OnInit {

  constructor(
    private bleInspectionItemService: BleInspectionItemService,
    private identityInspectionService: IdentityInspectionService,
    private bleCurrentStateService: BleCurrentStateService,
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
    let mgcId = this.bleCurrentStateService.pid
    let currSerial = this.bleCurrentStateService.serial
    this.identityItem.isInspecting = true
    const { checkResult, message } = await this.identityInspectionService.inspectIdentity(mgcId, currSerial)
    this.identityItem.isInspected = true
    this.identityItem.isInspecting = false
    this.identityItem.inspectionResult = checkResult
    this.identityItem.description = message

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
