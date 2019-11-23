import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { InspectionStaticItem } from '../../class/inspection-static-item';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { BleCurrentStateService } from '../../services/ble-current-state.service';
import { StaticService } from '../../services/static.service';

@Component({
  selector: 'app-identity-item-inspection',
  templateUrl: './identity-item-inspection.component.html',
  styleUrls: ['./identity-item-inspection.component.scss']
})
export class IdentityItemInspectionComponent implements OnInit {

  constructor(
    private http: HttpClient,
    private bleInspectionItemService: BleInspectionItemService,
    private bleCurrentStateService: BleCurrentStateService,
    private staticService: StaticService
  ) { }

  public identityItem: InspectionStaticItem

  ngOnInit() {
    this.initInspectionItem()
  }

  public async inspect() {
    this.identityItem.isInspecting = true
    let mgcId = this.bleCurrentStateService.pid.split(' ').reverse().join('')
    let currSerial = this.bleCurrentStateService.serial.split(' ').reverse().join('')
    const { checkResult, message } = await this.staticService.checkIdSerial(mgcId, currSerial) 
    this.identityItem.isInspected = true
    this.identityItem.isInspecting = false
    this.identityItem.inspectionResult = checkResult
    this.identityItem.description = message
  }

  //初始化待检测项目信息
  public initInspectionItem() {
    this.identityItem = this.bleInspectionItemService.identityItem
  }
  
  //清除当前检查项目的信息
  public clearInspectionItem() {
    this.bleInspectionItemService.identityItem.isInspected = false
    this.bleInspectionItemService.identityItem.inspectionResult = null
    this.bleInspectionItemService.identityItem.description = null
  }
}
