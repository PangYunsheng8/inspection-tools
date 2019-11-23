import { Component, OnInit, Output, EventEmitter} from '@angular/core';
import { ElNotificationService } from 'element-angular';
import { ElMessageService } from 'element-angular';
import { Subscription } from 'rxjs';
import { InspectionDynamicItem } from '../../class/inspection-dynamic-item';
import { BleCommandService } from '../../services/ble-command.service';
import { BleCurrentStateService } from '../../services/ble-current-state.service';
import { BleStateService } from '../../services/ble-state.service';
import { BleInspectionItemService, InspRes } from '../../services/ble-inspection-item.service';
import { CubeRotateService } from '../../services/cube-rotate.service';

const AXIS_COLOR_MAP = ['黄', '橘', '蓝', '红', '绿', '白']

@Component({
  selector: 'app-axis-item-inspection',
  templateUrl: './axis-item-inspection.component.html',
  styleUrls: ['./axis-item-inspection.component.scss']
})
export class AxisItemInspectionComponent implements OnInit {

  constructor(
    private bleCommandService: BleCommandService,
    private bleCurrentStateService: BleCurrentStateService,
    private bleStateService: BleStateService,
    private bleInspectionItemService: BleInspectionItemService,
    private notify: ElNotificationService,
    private message: ElMessageService,
    private cubeRotateService: CubeRotateService
  ) { }

  @Output() finishedEvent = new EventEmitter<string>();

  //上一步旋转的face, 上一步旋转的方向
  public lastRotateFace: number = 0
  public lastRotateDirection: number = 1  //1代表顺时针,-1代表逆时针

  //滤波器参数
  public coderErrorCount: number
  public axisInterfereCount: number

  //6个轴面的检查项
  public faceItems: Array<InspectionDynamicItem> = new Array<InspectionDynamicItem>()

  //已检查的项目个数
  public hasInspectedItems: number = 0
  //6个面的最终检查结果
  public finalResult: boolean
  //魔方旋转参数订阅
  public rotateParams$Subscription: Subscription

  ngOnInit() {
    this.initInspectionItem()  //初始化6个侧面轴检查项

    this.bleStateService.connectionStatus$.subscribe(connected => {
      if (!connected) {  //若断开连接，清空检查项的内容
        this.clearInspectionItem()
      }
    })

    this.bleInspectionItemService.dynInspStep$.subscribe(dynStep => {
      if (dynStep === 1) {  //如果执行到当前检查项，则开始检查6个侧面轴
        this.coderErrorCount = this.bleCurrentStateService.coderErrorCount
        this.axisInterfereCount = this.bleCurrentStateService.axisInterfereCount
        this.rotateParams$Subscription = this.cubeRotateService.rotate$.subscribe(rotateParams => {
          this.inspect(rotateParams.face, rotateParams.circle)
        }) 
      } else {  //如果未执行到当前检查项，则取消当前的订阅
        if (this.rotateParams$Subscription) this.rotateParams$Subscription.unsubscribe()
      }
    })
  }

  //初始化待检测项目信息
  public initInspectionItem() {
    this.faceItems = [
      this.bleInspectionItemService.faceItem0,
      this.bleInspectionItemService.faceItem1,
      this.bleInspectionItemService.faceItem2,
      this.bleInspectionItemService.faceItem3,
      this.bleInspectionItemService.faceItem4,
      this.bleInspectionItemService.faceItem5
    ]
  }

  //清除当前检查项目的信息
  public clearInspectionItem() {
    for (let i = 0; i < 6; i++) {
      this.faceItems[i].isInspected = false
      this.faceItems[i].inspectionResult = null
      this.faceItems[i].description = null
      this.faceItems[i].ClockwiseAngle = 0
      this.faceItems[i].CounterclockwiseAngle = 0
    }

    this.lastRotateFace = 0
    this.lastRotateDirection = 1
    this.hasInspectedItems = 0
    this.finishedEvent.emit(InspRes[2])
  }

  public async inspect(currRotateFace: number, currRotateCircle: number) {
    this.faceItems[currRotateFace].isInspecting = true

    //判断当前旋转轴是否与上次旋转轴相同
    //如果与上次旋转的轴不是同一个轴, 则判断之前的轴是否已经检查完成,如果检查完成,不做处理,如果没检查完,需要重新旋转
    if (this.lastRotateFace != currRotateFace) {  
      this.faceItems[this.lastRotateFace].isInspecting = false
      if (!this.faceItems[this.lastRotateFace].isInspected) {
        this.faceItems[this.lastRotateFace].ClockwiseAngle = 0
        this.faceItems[this.lastRotateFace].CounterclockwiseAngle = 0
      }
    }

    //判断相同轴上,当前旋转方向是否与上次旋转方向相同
    let currRotateDirection = currRotateCircle > 0? 1: -1
    if (this.lastRotateDirection != currRotateDirection && this.lastRotateFace == currRotateFace) {
      if (this.faceItems[this.lastRotateFace].ClockwiseAngle != 360) 
        this.faceItems[this.lastRotateFace].ClockwiseAngle = 0
      if (this.faceItems[this.lastRotateFace].CounterclockwiseAngle != 360) 
        this.faceItems[this.lastRotateFace].CounterclockwiseAngle = 0
    }
    
    //分别记录顺时针和逆时针的旋转角度
    if (currRotateCircle > 0) {
      this.faceItems[currRotateFace].ClockwiseAngle += currRotateCircle/3.6
      if (this.faceItems[currRotateFace].ClockwiseAngle >= 360) 
        this.faceItems[currRotateFace].ClockwiseAngle = 360
    } else {
      this.faceItems[currRotateFace].CounterclockwiseAngle -= currRotateCircle/3.6
      if (this.faceItems[currRotateFace].CounterclockwiseAngle >= 360) 
        this.faceItems[currRotateFace].CounterclockwiseAngle = 360
    }

    //判断当前轴是否已经完成了两次360度旋转(一次顺,一次逆),以及当前轴是否没有被检查过,若是则检查该轴
    if (this.faceItems[currRotateFace].ClockwiseAngle === 360 && 
      this.faceItems[currRotateFace].CounterclockwiseAngle === 360 && 
      !this.faceItems[currRotateFace].isInspected) {
      
      this.faceItems[currRotateFace].isInspected = true //这行代码只能放这里，顺序很重要！！

      //判断该轴是否合格, 如果转动过程中coderErrorCount改变，直接判定为不合格，如果axisInterfereCount改变，提示用户重新检查
      const { coderErrorCount, axisInterfereCount } = await this.bleCommandService.getCoderFilterParam()
      this.inspectAxis(currRotateFace, coderErrorCount, axisInterfereCount)

      this.hasInspectedItems += 1
      if (this.hasInspectedItems === this.faceItems.length) {
        this.finalResult = true
        this.faceItems.forEach(i => {
          let resut = i.inspectionResult
          if (!resut) this.finalResult = false
        })
        this.finishedEvent.emit(this.finalResult? InspRes[0]: InspRes[1])
      }
    }

    this.lastRotateFace = currRotateFace
    this.lastRotateDirection = currRotateDirection
  }

  public inspectAxis(currRotateFace, coderErrorCount, axisInterfereCount) {
    if (coderErrorCount != this.coderErrorCount) {
      this.faceItems[currRotateFace].inspectionResult = false
      this.faceItems[currRotateFace].description = `${AXIS_COLOR_MAP[currRotateFace]}色面不合格`
    } else {
      if (axisInterfereCount != this.axisInterfereCount) {
        this.faceItems[currRotateFace].inspectionResult = false
        this.faceItems[currRotateFace].description = `${AXIS_COLOR_MAP[currRotateFace]}色面疑似不良品，建议重新检查`
        this.notify['warning']('该轴疑似不良品，建议重新检查！')
      } else {
        this.faceItems[currRotateFace].inspectionResult = true
        this.faceItems[currRotateFace].description = "合格"
      }
    }
    this.coderErrorCount = coderErrorCount
    this.axisInterfereCount = axisInterfereCount
  }

  //重新检查所有轴
  public reInspectAll() {
    if (!this.bleStateService.connectedDevice) {
      this.message.show('未检测到已连接的魔方，请连接！')
    } else {
      this.clearInspectionItem()
    }
  }

  //重新检查某一个轴
  public reInspectItem(face) {
    if (!this.bleStateService.connectedDevice) {
      this.message.show('未检测到已连接的魔方，请连接！')
    } else {
      if (this.faceItems[face].isInspected) {
        this.faceItems[face].isInspected = false
        this.faceItems[face].inspectionResult = null
        this.faceItems[face].description = null
        this.faceItems[face].ClockwiseAngle = 0
        this.faceItems[face].CounterclockwiseAngle = 0

        this.hasInspectedItems -= 1
        this.finishedEvent.emit(InspRes[2])
      }
    }
  }

}
