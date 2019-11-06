import { Component, OnInit, ViewChild } from '@angular/core';
import { VoltageItemInspectionComponent } from '../../components/voltage-item-inspection/voltage-item-inspection.component';
import { CstateItemInspectionComponent } from '../../components/cstate-item-inspection/cstate-item-inspection.component';
import { SensorsItemInspectionComponent } from '../../components/sensors-item-inspection/sensors-item-inspection.component';
import { FilterItemInspectionComponent } from '../../components/filter-item-inspection/filter-item-inspection.component';
import { IdentityItemInspectionComponent } from '../../components/identity-item-inspection/identity-item-inspection.component';
import { OadItemInspectionComponent } from '../../components/oad-item-inspection/oad-item-inspection.component';

import { BleStateService } from '../../services/ble-state.service';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';
import { BleInspectionService } from '../../services/ble-inspection.service';

@Component({
  selector: 'app-static-inspection',
  templateUrl: './static-inspection.component.html',
  styleUrls: ['./static-inspection.component.scss']
})
export class StaticInspectionComponent implements OnInit {

  constructor(
    private bleStateService: BleStateService,
    private bleInspectionItemService: BleInspectionItemService,
    private bleInspectionService: BleInspectionService
  ) { }

  @ViewChild('voltageItemInspection')
  voltageItemInspection: VoltageItemInspectionComponent

  @ViewChild('cstateItemInspection')
  cstateItemInspection: CstateItemInspectionComponent

  @ViewChild('sensorsItemInspection')
  sensorsItemInspection: SensorsItemInspectionComponent

  @ViewChild('filterItemInspection')
  filterItemInspection: FilterItemInspectionComponent

  @ViewChild('identityItemInspection')
  identityItemInspection: IdentityItemInspectionComponent

  @ViewChild('oadItemInspection')
  oadItemInspection: OadItemInspectionComponent

  //icon
  public voltageIcon: string = "#icon-dengdaiqueren"
  public cstateIcon: string = "#icon-dengdaiqueren"
  public sensorsIcon: string = "#icon-dengdaiqueren"
  public filterIcon: string = "#icon-dengdaiqueren"
  public identityIcon: string = "#icon-dengdaiqueren"
  public oadIcon: string = "#icon-dengdaiqueren"

  ngOnInit() {
    this.bleStateService.connectionStatus$.subscribe(connected => {
      if (connected) this.inspectAll()
      else if (!connected) {
        this.recoverIcon() 
        this.clearAll()
      }
    })
  }

  public async inspectAll() {
    await this.inspectVoltage()
    await this.inspectCstate()
    await this.inspectSensors()
    await this.inspectFilter()
    await this.inspectIdentity()
    await this.inspectOad()
  }

  public clearAll() {
    this.voltageItemInspection.clearInspectionItem()
    this.cstateItemInspection.clearInspectionItem()
    this.sensorsItemInspection.clearInspectionItem()
    this.filterItemInspection.clearInspectionItem()
    this.identityItemInspection.clearInspectionItem()
    this.oadItemInspection.clearInspectionItem()
  }

  public recoverIcon() {
    this.voltageIcon = "#icon-dengdaiqueren"
    this.cstateIcon = "#icon-dengdaiqueren"
    this.sensorsIcon = "#icon-dengdaiqueren"
    this.filterIcon = "#icon-dengdaiqueren"
    this.identityIcon = "#icon-dengdaiqueren"
    this.oadIcon = "#icon-dengdaiqueren"
  }

  public async inspectVoltage() {
    await this.voltageItemInspection.inspectVoltage()
    if (this.bleInspectionItemService.voltageItem.inspectionResult) this.voltageIcon = "#icon-chenggong"
    else this.voltageIcon = "#icon-shibai"
  }

  public async inspectCstate() {
    await this.cstateItemInspection.inspectCstate()
    if (this.bleInspectionItemService.cstateItem.inspectionResult) this.cstateIcon = "#icon-chenggong"
    else this.cstateIcon = "#icon-shibai"
  }

  public async inspectSensors() {
    await this.sensorsItemInspection.inspectSensors()
    if (this.bleInspectionItemService.sensorsItem.inspectionResult) this.sensorsIcon = "#icon-chenggong"
    else this.sensorsIcon = "#icon-shibai"
  }

  public async inspectFilter() {
    await this.filterItemInspection.inspectFilter()
    if (this.bleInspectionItemService.filterItem.inspectionResult) this.filterIcon = "#icon-chenggong"
    else this.filterIcon = "#icon-shibai"
  }

  public async inspectIdentity() {
    await this.identityItemInspection.inspectIdentity()
    if (this.bleInspectionItemService.identityItem.inspectionResult) this.identityIcon = "#icon-chenggong"
    else this.identityIcon = "#icon-shibai"
  }

  public async inspectOad() {
    await this.oadItemInspection.inspectOad()
    if (this.bleInspectionItemService.oadItem.inspectionResult) this.oadIcon = "#icon-chenggong"
    else this.oadIcon = "#icon-shibai"
  }

}
