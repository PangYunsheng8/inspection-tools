import { Component, OnInit, ViewChild, Output, EventEmitter } from '@angular/core';
import { VoltageItemInspectionComponent } from '../../components/voltage-item-inspection/voltage-item-inspection.component';
import { CstateItemInspectionComponent } from '../../components/cstate-item-inspection/cstate-item-inspection.component';
import { SensorsItemInspectionComponent } from '../../components/sensors-item-inspection/sensors-item-inspection.component';
import { FilterItemInspectionComponent } from '../../components/filter-item-inspection/filter-item-inspection.component';
import { IdentityItemInspectionComponent } from '../../components/identity-item-inspection/identity-item-inspection.component';
import { OadItemInspectionComponent } from '../../components/oad-item-inspection/oad-item-inspection.component';
import { BleStateService } from '../../services/ble-state.service';
import { BleInspectionItemService, InspItemIcon } from '../../services/ble-inspection-item.service';

@Component({
  selector: 'app-static-inspection',
  templateUrl: './static-inspection.component.html',
  styleUrls: ['./static-inspection.component.scss']
})
export class StaticInspectionComponent implements OnInit {

  constructor(
    private bleStateService: BleStateService,
    private bleInspectionItemService: BleInspectionItemService,
  ) { }

  @Output() staInspFinish = new EventEmitter<boolean>();

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
  public voltageIcon: string = InspItemIcon[2]
  public cstateIcon: string = InspItemIcon[2]
  public sensorsIcon: string = InspItemIcon[2]
  public filterIcon: string = InspItemIcon[2]
  public identityIcon: string = InspItemIcon[2]
  public oadIcon: string = InspItemIcon[2]

  //静态检测结果，若静态检测不合格将不会进行到下一步(动态检测)
  public staInspRes: boolean = true

  ngOnInit() {
    this.bleStateService.connectionStatus$.subscribe(connected => {
      if (connected) {  //有设备连接后自动开始检测所有项目
        this.inspectAll()
      }
      else if (!connected) {  //断开连接后清空所有检查项目的内容并复原Icon
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
    //this.staInspRes = true  //待删除，为了测试
    this.staInspFinish.emit(this.staInspRes)
  }

  //清空所有检查项目的内容
  public clearAll() {
    this.voltageItemInspection.clearInspectionItem()
    this.cstateItemInspection.clearInspectionItem()
    this.sensorsItemInspection.clearInspectionItem()
    this.filterItemInspection.clearInspectionItem()
    this.identityItemInspection.clearInspectionItem()
    this.oadItemInspection.clearInspectionItem()
  }

  //恢复所有的Icon
  public recoverIcon() {
    this.voltageIcon = InspItemIcon[2]
    this.cstateIcon = InspItemIcon[2]
    this.sensorsIcon = InspItemIcon[2]
    this.filterIcon = InspItemIcon[2]
    this.identityIcon = InspItemIcon[2]
    this.oadIcon = InspItemIcon[2]
  }

  public async inspectVoltage() {
    await this.voltageItemInspection.inspect()
    if (this.bleInspectionItemService.voltageItem.inspectionResult) this.voltageIcon = "#icon-chenggong"
    else {
      this.voltageIcon = "#icon-shibai"
      this.staInspRes = false
    }
  }

  public async inspectCstate() {
    await this.cstateItemInspection.inspect()
    if (this.bleInspectionItemService.cstateItem.inspectionResult) this.cstateIcon = "#icon-chenggong"
    else {
      this.cstateIcon = "#icon-shibai"
      this.staInspRes = false
    }
  }

  public async inspectSensors() {
    await this.sensorsItemInspection.inspect()
    if (this.bleInspectionItemService.sensorsItem.inspectionResult) this.sensorsIcon = "#icon-chenggong"
    else {
      this.sensorsIcon = "#icon-shibai" 
      this.staInspRes = false
    }
  }

  public async inspectFilter() {
    await this.filterItemInspection.inspect()
    if (this.bleInspectionItemService.filterItem.inspectionResult) this.filterIcon = "#icon-chenggong"
    else {
      this.filterIcon = "#icon-shibai"
      this.staInspRes = false
    }
  }

  public async inspectIdentity() {
    await this.identityItemInspection.inspect()
    if (this.bleInspectionItemService.identityItem.inspectionResult) this.identityIcon = "#icon-chenggong"
    else {
      this.identityIcon = "#icon-shibai"
      this.staInspRes = false
    }
  }

  public async inspectOad() {
    await this.oadItemInspection.inspect()
    if (this.bleInspectionItemService.oadItem.inspectionResult) this.oadIcon = "#icon-chenggong"
    else {
      this.oadIcon = "#icon-shibai"
      this.staInspRes = false
    }
  }

}
