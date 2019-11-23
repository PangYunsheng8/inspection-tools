import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

import { BleInspectionItemService, InspRes, InspItemIcon } from '../../services/ble-inspection-item.service';
import { BleStateService } from '../../services/ble-state.service';

@Component({
  selector: 'app-dynamic-inspection',
  templateUrl: './dynamic-inspection.component.html',
  styleUrls: ['./dynamic-inspection.component.scss']
})
export class DynamicInspectionComponent implements OnInit {

  constructor(
    private bleInspectionItemService: BleInspectionItemService,
    private bleStateService: BleStateService,
  ) { }

  @Output() dynInspFinish = new EventEmitter<boolean>();
  
  //姿态检测和轴检测的图标
  public axisIcon: string = InspItemIcon[2]
  public attitudeIcon: string = InspItemIcon[2]

  //动态检测结果，若动态检测不合格将不会进行到下一步
  public dynInspRes: boolean = true

  //动态检测折叠面板的初始值
  public currStep = ['0']

  ngOnInit() {
    this.bleStateService.connectionStatus$.subscribe(connected => {
      if (!connected) {  //若断开连接，则恢复变量初始值
        this.dynInspRes = true
        this.currStep = ['0']
      }
    })

    this.bleInspectionItemService.stepInspectItem$.subscribe(step => {
      if (step === 1) {  //当进行到动态检测时，打开第一个折叠面板
        this.bleInspectionItemService.dynInspStep$.next(0)
      }
    })
  }

  public attitudeInspFinished(data) {
    if (data === InspRes[2]) this.attitudeIcon = InspItemIcon[2]
    else {
      if (data === InspRes[0]) this.attitudeIcon = InspItemIcon[0]
      else if (data === InspRes[1]) {
        this.attitudeIcon = InspItemIcon[1]
        this.dynInspRes = false
      }
      this.currStep = ['1']
      this.bleInspectionItemService.dynInspStep$.next(1)
    }
  }

  public axisInspFinished(data) {
    if (data === InspRes[2]) this.axisIcon = InspItemIcon[2]
    else {
      if (data === InspRes[0]) {
        this.axisIcon = InspItemIcon[0]
      }
      else if (data === InspRes[1]) {
        this.axisIcon = InspItemIcon[1]
        this.dynInspRes = false
      }
      this.dynInspFinish.emit(this.dynInspRes)
    }
  }

}