import { Component, OnInit, ViewChild } from '@angular/core';
import { ElMessageService } from 'element-angular';
import { BleStateService } from '../../services/ble-state.service';
import { BleInspectionItemService } from '../../services/ble-inspection-item.service';

@Component({
  selector: 'app-inspection-base',
  templateUrl: './inspection-base.component.html',
  styleUrls: ['./inspection-base.component.scss'],
})
export class InspectionBaseComponent implements OnInit {

  constructor(
    private bleStateService: BleStateService,
    private bleInspectionItemService: BleInspectionItemService,
    private message: ElMessageService,
  ) { }

  @ViewChild('stepper')
  private mystepper

  public firstStepComp: boolean = false
  public secondStepComp: boolean = false

  ngOnInit() {
    this.bleStateService.connectionStatus$.subscribe(connected => {
      if (!connected) {  //如果连接断开，重新初始化变量
        this.firstStepComp = false
        this.secondStepComp = false
        this.mystepper.reset()
      }
    })
  }

  public selectionChange(e) {
    if (!this.bleStateService.connectedDevice) {
      this.message.show('未检测到已连接的魔方，请连接！')
    }
    this.bleInspectionItemService.stepInspectItem$.next(e.selectedIndex)
  }

  //静态检测完成后的处理事件，若检测成功，1s后打开动态检测项；若检测失败，停在当前并提示用户魔方不合格
  public doStaInspFinish(e) {
    if (e === true) {
      this.firstStepComp = true
      setTimeout(() =>{
        this.mystepper.next()
      }, 1000)
    } 
  }

  //动态检测完成后的处理事件，若检测成功，1s后打开检测结果项；若检测失败，停在当前并提示用户魔方不合格
  public doDynInspFinish(e) {
    if (e === true) {
      this.secondStepComp = true
      setTimeout(() =>{
        this.mystepper.next()
      }, 1000)
    }
    //测试用
    // this.secondStepComp = true
    // setTimeout(() =>{
    //   this.mystepper.next()
    // }, 1000)
  }

}
