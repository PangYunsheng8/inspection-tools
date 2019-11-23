import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { filter, map, tap, pairwise, sampleTime } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { InspectionDynamicItem } from '../../class/inspection-dynamic-item';
import { BleInspectionItemService, InspRes } from '../../services/ble-inspection-item.service';
import { BleStateService } from '../../services/ble-state.service';
import { AttitudeService } from '../../services/attitude.service';
import { AttitudeData } from '../../../libs/sk-protocol-v2'

@Component({
  selector: 'app-attitude-item-inspection',
  templateUrl: './attitude-item-inspection.component.html',
  styleUrls: ['./attitude-item-inspection.component.scss']
})
export class AttitudeItemInspectionComponent implements OnInit {

  constructor(
    private bleInspectionItemService: BleInspectionItemService,
    private bleStateService: BleStateService,
    private ahrsService: AttitudeService
  ) { }

  @Output() finishedEvent = new EventEmitter<string>()

  //姿态检查项
  public attitudeItem: InspectionDynamicItem

  //魔方姿态订阅
  public attitude$Subscription: Subscription

  ngOnInit() {
    this.initInspectionItem()  //初始化姿态检查项

    this.bleStateService.connectionStatus$.subscribe(connected => {
      if (!connected) {  //如果断开连接，则清空当前姿态检查项的内容。为防止万一，取消订阅魔方姿态
        this.clearInspectionItem()
        if (this.attitude$Subscription) this.attitude$Subscription.unsubscribe()
      }
    })

    this.bleInspectionItemService.dynInspStep$.subscribe(async dynStep => {
      if (dynStep === 0) {  //如果执行到当前检查项，则开始检查姿态
        this.attitude$Subscription = this.ahrsService.attitude$.pipe(
          sampleTime(1000),
          pairwise(),
        ).subscribe(i => {
          this.inspect(i[0], i[1])
          this.attitude$Subscription.unsubscribe() 
        })
      } else {  //如果未执行到当前检查项，则取消当前的订阅
        if (this.attitude$Subscription) this.attitude$Subscription.unsubscribe()
      }
    })
  }

  //初始化待检测项目信息
  public initInspectionItem() {
    this.attitudeItem = this.bleInspectionItemService.attitudeItem
  }
  
  //清除当前检查项目的信息
  public clearInspectionItem() {
    this.bleInspectionItemService.attitudeItem.isInspected = false
    this.bleInspectionItemService.attitudeItem.inspectionResult = null
    this.bleInspectionItemService.attitudeItem.description = null

    this.finishedEvent.emit(InspRes[2])
  }

  public async inspect(attBefore: AttitudeData, attAfter: AttitudeData) {
    this.attitudeItem.isInspecting = true
    const { result, description } = await this.inspectAttitude(attBefore, attAfter)
    this.attitudeItem.isInspected = true
    this.attitudeItem.isInspecting = false
    this.attitudeItem.inspectionResult = result
    this.attitudeItem.description = description

    this.finishedEvent.emit(this.attitudeItem.inspectionResult? InspRes[0]: InspRes[1])
  }

  public inspectAttitude(attBefore: AttitudeData, attAfter: AttitudeData){
    let result
    let description
    if (attBefore.x != attAfter.x && attBefore.y != attAfter.y && attBefore.z != attAfter.z && attBefore.w != attAfter.w) {
      result = true
      description = "姿态检测合格!"
    } else {
      result = false
      description = "姿态检测不合格!"
    }
    return ({result, description})
  }

}
